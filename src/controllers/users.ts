import { z } from "zod";
import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { ZodIssue } from "zod";

import client from "../db/connect";
import userSchema from "../models/user";
import paginate from "../utils/pagination";
import generate_token from "../utils/generate_token";
import { sendApprovalEmail, sendNotificationEmail } from "../utils/mail_send";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter: Record<string, any> = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.approved) filter.approved = req.query.approved === "true";

    const documents = await paginate(page, limit, "users", filter, {
      password: 0,
    });

    const totalDocuments = await client
      .collection("users")
      .countDocuments(filter);

    res.status(200).send({
      documents,
      total: totalDocuments,
      page,
      totalPages: Math.ceil(totalDocuments / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error reading from users" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    if (req.body.password) {
      res
        .status(400)
        .send({ message: "Passwords can't be modified through this route" });
      return;
    }
    req.body.approved = req.body.type !== "organizer";


    ["tags", "events", "notifications", "rating"].forEach((el) => {
      if (typeof req.body[el] === "string") {
        try {
          req.body[el] = JSON.parse(req.body[el]);
        } catch (error) {
          console.error(`Error parsing ${el}:`, error);
          res.status(400).json({ message: `Invalid format for ${el}` });
          return;
        }
      }
    });

    const validationResult: any = userSchema
      .omit({ password: true })
      .partial()
      .safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: validationResult.error.errors.map((err: ZodIssue) => ({
          message: err.message,
          path: err.path.join("."),
          type: err.code,
        })),
      });
      return;
    }

    // if (req.query.profile_picture && validationResult.data.media.length > 0) {
    //   validationResult.data.media.splice(0, 1);
    //   validationResult.data.media.unshift(
    //     validationResult.data.media[validationResult.data.media.length - 1]
    //   );
    //   validationResult.data.media.pop();
    // }

    const documentId = req.params.id;
    if (!ObjectId.isValid(documentId)) {
      res.status(400).send({ message: "Invalid ID format" });
      return;
    }

    const result = await client
      .collection("users")
      .updateOne(
        { _id: new ObjectId(documentId) },
        { $set: { ...validationResult.data } }
      );

    if (result.matchedCount === 0) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    if (result.modifiedCount === 0) {
      console.log("No data has been modified");
    }

    if (validationResult.data.notifications && validationResult.data.notifications.length > 0) {
      const user = await client
        .collection("users")
        .findOne(
          { _id: new ObjectId(documentId) }
        );

      if (user) sendNotificationEmail(user.email, req.body.notifications[req.body.notifications.length - 1]);
    }

    if (req.body.approved) {
      const user = await client
        .collection("users")
        .findOne(
          { _id: new ObjectId(documentId) }
        );

      sendApprovalEmail(user.email);
    }

    res.status(200).send({
      message: "User updated",
      id: documentId,
      ...(req.body.type === "organizer" && { token: generate_token(documentId, "organizer") }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error updating user" });
  }
};

import { ZodSchema } from "zod";
import { Request, Response } from "express";

import client from "../../db/connect";
import generate_token from "../../utils/generate_token";

export const createDoc = async (
  req: Request,
  res: Response,
  collection: string,
  schema: ZodSchema,
  role?: string
) => {
  try {
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: validationResult.error.errors.map((err) => ({
          message: err.message,
          path: err.path?.join(".") || "unknown",
          type: err.code,
        })),
      });
      return;
    }

    const value = await client
      .collection(collection)
      .insertOne({ ...validationResult.data });

    res.status(200).send({
      message: `${
        collection[0].toUpperCase() + collection.slice(1, -1)
      } created successfully`,
      id: value.insertedId,
      ...(role && { token: generate_token(value.insertedId, role) }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Error creating ${collection}` });
  }
};

import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { Request, Response } from "express";

import client from "../db/connect";
import generate_token from "../utils/generate_token";
import { sendOtpEmail } from "../utils/mail_send";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, collection } = req.query;
    const documentId = req.params.id;

    if (!email && !documentId) {
      res.status(400).json({ message: "Email or ID is required" });
      return;
    }

    if (!collection) {
      res.status(400).json({ message: "Collection is required" });
      return;
    }

    const filter = email
      ? { email: email as string }
      : { _id: new ObjectId(documentId) };

    const user = await client.collection(collection).findOne(filter);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.password) {
      res.status(404).json({ message: "User password is missing" });
      return;
    }

    if (user.type !== "admin" && !user.approved) {
      res.status(404).json({ message: "Please wait until you are approved before attempting to access the system" });
      return;
    }

    const passwordMatch = await bcrypt.compare(
      password as string,
      user.password
    );
    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      user_id: user._id,
      token: generate_token(user._id, user.type as string),
      role: user.type
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error logging in" });
  }
};

export const generateOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, collection } = req.query;
    const documentId = req.params.id;

    if (!email && !ObjectId.isValid(documentId)) {
      res.status(400).send({ message: "Invalid ID format or email required" });
      return;
    }

    if (!collection) {
      res.status(400).json({ message: "Collection is required" });
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const filter = email
      ? { email: email as string }
      : { _id: new ObjectId(documentId) };

    const result = await client.collection(collection).updateOne(filter, {
      $set: { otp },
    });

    if (result.matchedCount === 0) {
      res.status(404).send({ message: "Document not found" });
      return;
    }

    await sendOtpEmail(email as string, otp);
    res.status(200).send("Otp generated and sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error generating otp" });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, delete: deleteOtp, collection } = req.query;
    const documentId = req.params.id;

    if (!email && !ObjectId.isValid(documentId)) {
      res.status(400).send({ message: "Invalid ID format or email required" });
      return;
    }

    if (!collection) {
      res.status(400).json({ message: "Collection is required" });
      return;
    }

    const filter = email
      ? { email: email as string }
      : { _id: new ObjectId(documentId) };

    const document = await client.collection(collection).findOne(filter);

    if (!document) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    if (document.otp === parseInt(otp as string, 10)) {
      if (deleteOtp) {
        await client
          .collection(collection)
          .updateOne(filter, { $unset: { otp: "" } });
      }
      res.status(200).send({ message: "OTP verified successfully" });
    } else {
      res.status(400).send({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error verifying otp" });
  }
};

// export const modifyPassword = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { email, otp, password, collection } = req.query;

//     const filter = email
//       ? { email: email as string }
//       : { _id: new ObjectId(req.params.id) };

//     if (!collection) {
//       res.status(400).json({ message: "Collection is required" });
//       return;
//     }

//     const document = await client.collection(collection).findOne(filter);
//     if (!document) {
//       res.status(400).send({ message: "Document not found" });
//       return;
//     }

//     if (document.otp !== parseInt(otp as string, 10)) {
//       res.status(400).send({ message: "Invalid OTP" });
//       return;
//     }

//     await client.collection(collection).updateOne(filter, {
//       $set: { password: await bcrypt.hash(password as string, 10) },
//       $unset: { otp: "" },
//     });

//     res.status(200).send({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Error modifying password" });
//   }
// };

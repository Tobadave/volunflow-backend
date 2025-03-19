import { ObjectId } from "mongodb";
import { z, ZodSchema, ZodIssue } from "zod";
import { Request, Response } from "express";
import client from "../../db/connect";


export const updateDoc = async (
  req: Request,
  res: Response,
  collection: string,
  schema: ZodSchema<any>
) => {
  try {

    if (!(schema instanceof z.ZodObject)) {
      throw new Error("Schema must be a Zod object");
    }

    const validationResult: any = schema
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

    const documentId = req.params.id;
    
    if (!ObjectId.isValid(documentId)) {
      res.status(400).send({ message: "Invalid ID format" });
      return;
    }

    const result = await client
      .collection(collection)
      .updateOne(
        { _id: new ObjectId(documentId) },
        { $set: { ...validationResult.data } }
      );

    if (result.matchedCount === 0) {
      res.status(404).send({ message: "Document not found" });
      return;
    }

    res.status(200).send({
      message: `${collection[0].toUpperCase() + collection.slice(1, -1)} updated`,
      id: documentId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Error updating ${collection}` });
  }
};

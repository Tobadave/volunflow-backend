import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import client from "../../db/connect";

export const deleteDoc = async (
  req: Request,
  res: Response,
  collection: string
) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).send({ message: "Invalid ID format" });
      return;
    }

    const result = await client
      .collection(collection)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res
        .status(404)
        .send({
          message: `${
            collection[0].toUpperCase() + collection.slice(1, -1)
          } not found`,
        });
    } else {
      res
        .status(200)
        .send({
          message: `${
            collection[0].toUpperCase() + collection.slice(1, -1)
          } deleted`,
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Error deleting from ${collection}` });
  }
};

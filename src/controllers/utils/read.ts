import { Request, Response } from "express";

import client from "../../db/connect";
import paginate from "../../utils/pagination";

export const readDoc = async (
  req: Request,
  res: Response,
  collection: string,
  filter: object = {},
  project: object = {}
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const documents = await paginate(page, limit, collection, filter, project);
    const totalDocuments = await client.collection(collection).countDocuments();

    res.status(200).send({
      documents,
      total: totalDocuments,
      page,
      totalPages: Math.ceil(totalDocuments / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Error reading from ${collection}` });
  }
};

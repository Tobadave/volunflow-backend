import client from "../db/connect";

export default async (page: number, limit: number, collection: string, filter: object = {}, project: object = {}) => {
    const skip = (page - 1) * limit;
    return await client
        .collection(collection)
        .find(filter)
        .project(project)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
};
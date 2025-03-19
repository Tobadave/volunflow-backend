import express from "express";
import { ObjectId } from "mongodb";
const router = express.Router();
import { readDoc } from "../controllers/utils/read";
import auth from "../middleware/auth";

/**
 * @swagger
 * /admin/{id}:
 *   get:
 *     summary: Retrieve an admin document by ID
 *     description: Fetches an admin document from the database using the provided ID.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin document to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the admin document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Document not found
 */
router
    .route("/:id")
    .get(auth(["admin"]), (req, res) => readDoc(req, res, "admin", { _id: new ObjectId(req.params.id) }));

export default router;

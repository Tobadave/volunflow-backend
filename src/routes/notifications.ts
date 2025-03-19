import { z } from "zod";
import multer from "multer";
import express from "express";
const router = express.Router();
import { ObjectId } from "mongodb";

import client from "../db/connect";
import auth from "../middleware/auth";
import notificationSchema from "../models/notification";

const upload = multer();

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Retrieve user notifications
 *     description: Fetches notifications for a specific user by ID.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose notifications are being retrieved.
 *       - in: query
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the collection to fetch data from.
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully.
 *       400:
 *         description: Missing or invalid parameters.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 *
 *   patch:
 *     summary: Update user notifications
 *     description: Updates notifications for a specific user.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose notifications are being updated.
 *       - in: query
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the collection to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notifications
 *             properties:
 *               notifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: List of notification objects.
 *     responses:
 *       200:
 *         description: Notifications updated successfully.
 *       400:
 *         description: Invalid request format.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

router
  .route("/:id")
  .get(auth(["admin", "volunteer", "organizer"]), async (req, res) => {
    try {
      const data = await client
        .collection(req.query.collection)
        .findOne({ _id: new ObjectId(req.params.id) });

      if (!data) {
        res.status(404).send({ message: "User not found" });
        return;
      }

      res.status(200).send(data.notifications);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: `Error reading from ${req.query.collection}` });
    }
  })
  .patch(auth(["admin", "volunteer", "organizer"]), upload.none(), async (req, res) => {
    try {
      if (!req.body.notifications) {
        res.status(400).send({ message: "No notifications provided" });
        return;
      }

      const validationResult = z.array(notificationSchema).safeParse(req.body.notifications);
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

      const data = await client
        .collection(req.query.collection)
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { notifications: validationResult.data } });

      res.status(200).send(data.notifications);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: `Error updating document` });
    }
  });

export default router;
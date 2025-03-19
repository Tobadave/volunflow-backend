import multer from "multer";
import express from "express";
import { ObjectId } from "mongodb";
const router = express.Router();

import auth from "../middleware/auth";
import eventSchema from "../models/event";
import { readDoc } from "../controllers/utils/read";
import { createDoc } from "../controllers/utils/create";
import { updateDoc } from "../controllers/utils/update";
import { deleteDoc } from "../controllers/utils/delete";
import media_handler from "../middleware/media_handler";

const upload = multer();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 *     description: Fetches a list of events, optionally filtered by tags.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter events by tags
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *       500:
 *         description: Error retrieving events
 *
 *   post:
 *     summary: Create a new event
 *     description: Allows admins and organizers to create an event.
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the event
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the event
 *               location:
 *                 type: string
 *                 description: Event location
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for categorization
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Media URLs
 *               volunteers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Volunteer IDs associated with the event
 *               approved:
 *                 type: boolean
 *                 description: Event approval status
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid request format
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */

router
  .route("/")
  .get((req, res) =>
    readDoc(
      req,
      res,
      "events",
      req.query.tags ? { tags: { $in: req.query.tags } } : {}
    )
  )
  .post(auth(["admin", "organizer"]), media_handler, (req, res) => {
    ["tags", "media", "volunteers", "approved"].forEach((el) => {
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

    createDoc(req, res, "events", eventSchema);
  });

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retrieve an event by ID
 *     description: Fetches an event using its unique identifier.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 *
 *   patch:
 *     summary: Update an event
 *     description: Allows admins, organizers, and volunteers to update an event.
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated event name
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Updated event date
 *               location:
 *                 type: string
 *                 description: Updated event location
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated event tags
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated media URLs
 *               volunteers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated volunteer IDs
 *               approved:
 *                 type: boolean
 *                 description: Updated approval status
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid request format
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete an event
 *     description: Allows admins and organizers to delete an event.
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to delete
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */

router
  .route("/:id")
  .get((req, res) =>
    readDoc(req, res, "events", { _id: new ObjectId(req.params.id) })
  )
  .patch(auth(["admin", "organizer", "volunteer"]), upload.none(), (req, res) => {
    ["tags", "media", "volunteers", "approved"].forEach((el) => {
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

    updateDoc(req, res, "events", eventSchema);
  })
  .delete(auth(["admin", "organizer"]), (req, res) =>
    deleteDoc(req, res, "events")
  );

export default router;
import express from "express";
import bcrypt from "bcryptjs";
const router = express.Router();
import client from "../db/connect";
import { ObjectId } from "mongodb";

import auth from "../middleware/auth";
import userSchema from "../models/user";
import media_handler from "../middleware/media_handler";

import { readDoc } from "../controllers/utils/read";
import { createDoc } from "../controllers/utils/create";
import { deleteDoc } from "../controllers/utils/delete";
import { getUsers, updateUser } from "../controllers/users";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 *
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Fetches all users from the database.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
 *       500:
 *         description: Server error.
 *
 *   post:
 *     summary: Create a new user
 *     description: Registers a new user, hashing their password and checking for duplicates.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 description: User's password (will be hashed before storage).
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: User already exists or invalid data.
 *       500:
 *         description: Internal server error.
 *
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Fetches a specific user by their unique identifier.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch.
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       400:
 *         description: Invalid ID format.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 *
 *   patch:
 *     summary: Update user information
 *     description: Allows an admin, volunteer, or organizer to update user details.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update.
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400:
 *         description: Invalid input data.
 *       403:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 *
 *   delete:
 *     summary: Delete a user
 *     description: Allows an admin to remove a user.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       403:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */

router
  .route("/")
  .get(getUsers)
  .post(media_handler, async (req, res) => {
    req.body.password = await bcrypt.hash(
      req.body.password,
      await bcrypt.genSalt(10)
    );

    try {
      if (await client.collection("users").findOne({ email: req.body.email })) {
        res
          .status(400)
          .send({ message: "User with the same email already exists" });
        return;
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
      res.status(500).send({ message: "Internal server error" });
      return;
    }

    createDoc(req, res, "users", userSchema, "volunteer");
  });

router
  .route("/:id")
  .get((req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: "Invalid ID format" });
      return;
    }

    readDoc(
      req,
      res,
      "users",
      { _id: new ObjectId(req.params.id) },
      { password: 0 }
    );
  })
  .patch(auth(["admin", "volunteer", "organizer"]), media_handler, updateUser)
  .delete(auth(["admin"]), (req, res) => deleteDoc(req, res, "users"));

export default router;
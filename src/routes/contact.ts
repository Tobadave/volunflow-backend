import express from "express";
const router = express.Router();

import { sendContactUsEmail } from "../utils/mail_send";
import multer from "multer";

const upload = multer();

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Send a contact message
 *     description: Sends a contact message via email.
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - number
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Sender's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Sender's email address
 *               number:
 *                 type: string
 *                 description: Sender's phone number
 *               message:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       500:
 *         description: Error sending contact mail
 */

router.route("/").post(upload.none(), async (req, res) => {
  try {
    const { name, email, number, message } = req.body;
    await sendContactUsEmail(name, email, number, message).then(() =>
      res.status(200).send({ message: "Your message has been sent successfully" })
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error sending contact mail" });
  }
});

export default router;
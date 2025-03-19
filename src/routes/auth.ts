import express from "express";
const router = express.Router();

import { login } from "../controllers/auth";
import { generateOtp, verifyOtp } from "../controllers/auth";

/**
 * @swagger
 * /auth/login:
 *   get:
 *     summary: User login
 *     description: Authenticates a user and returns a session or token.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/login/{id}:
 *   get:
 *     summary: User login with ID
 *     description: Authenticates a user by ID and returns a session or token.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for login
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/generate_otp:
 *   get:
 *     summary: Generate OTP
 *     description: Generates a one-time password (OTP) for authentication.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: OTP generated successfully
 *       400:
 *         description: OTP generation failed
 */

/**
 * @swagger
 * /auth/generate_otp/{id}:
 *   get:
 *     summary: Generate OTP for a user
 *     description: Generates an OTP for a specific user.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for OTP generation
 *     responses:
 *       200:
 *         description: OTP generated successfully
 *       400:
 *         description: OTP generation failed
 */

/**
 * @swagger
 * /auth/verify_otp:
 *   get:
 *     summary: Verify OTP
 *     description: Verifies a one-time password (OTP) for authentication.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: OTP verification failed
 */

/**
 * @swagger
 * /auth/verify_otp/{id}:
 *   get:
 *     summary: Verify OTP for a user
 *     description: Verifies an OTP for a specific user.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for OTP verification
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: OTP verification failed
 */

router.route("/login").get(login);
router.route("/login/:id").get(login);
router.route("/generate_otp").get(generateOtp);
router.route("/generate_otp/:id").get(generateOtp);
router.route("/verify_otp").get(verifyOtp);
router.route("/verify_otp/:id").get(verifyOtp);

export default router;
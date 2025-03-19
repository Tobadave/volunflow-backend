import fs from "fs";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "media");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File must be an image (JPEG, PNG, or GIF)"));
    }
  },
}).array("media");

export default (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });

    if (typeof req.body.media === "string") {
      try {
        req.body.media = JSON.parse(req.body.media);
      } catch (error) {
        console.error("Error parsing media:", error);
        res.status(400).json({ message: "Invalid format for media" });
        return;
      }
    }

    // req.body.media = req.body.media || [];

    (req.files as unknown as Express.Multer.File[])?.forEach((file) =>
      req.body.media.push(file.filename)
    );

    next();
  });
};

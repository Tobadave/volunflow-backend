import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  user?: JwtPayload | string;
}

export default (roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).send({ message: "Access Denied. No token provided." });
      return;
    }

    if (!/^Bearer /.test(authHeader || "")) {
      res.status(400).send({ message: "Token format is incorrect." });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = decoded;

      if (!roles.includes((req.user as JwtPayload).role as string)) {
        res.status(403).send({ message: "Access Denied. Insufficient Permissions" });
        return;
      }

      next();
    } catch (err) {
      let errorMessage = "Invalid token.";
      if (err instanceof jwt.TokenExpiredError) {
        errorMessage = "Token has expired.";
      }

      res.status(400).send({ message: errorMessage });
    }
  };
};

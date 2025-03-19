import jwt from "jsonwebtoken";

export default (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: "1h" });
};
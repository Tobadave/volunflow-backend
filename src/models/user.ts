import { z } from "zod";
import notification from "./notification";

export default z.object({
  name: z.string().default(""),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine(
      (value) =>
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value) &&
        /[@$!%.*?&\-_=+#^]/.test(value),
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
  desc: z.string().default(""),
  tags: z.array(z.string()).default([]),
  notifications: z.array(notification).default([]),
  type: z.enum(["organizer", "volunteer"]).default("volunteer"),
  media: z.array(z.string()).default([]),
  rating: z
  .object({
    value: z.number(),
    count: z.number(),
  })
  .default({ value: 0, count: 0 }),
  joined: z.string().refine(
    (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date format",
    }
  ),
  approved: z.boolean().default(true)
});

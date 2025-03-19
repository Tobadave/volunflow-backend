import { z } from "zod";

export default z.object({
  title: z.string(),
  tags: z.array(z.string()).default([]),
  media: z.array(z.string()).default([]),
  desc: z.string(),
  date: z.string().refine(
    (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date format",
    }
  ),
  pricing: z.string().default("Free"),
  location: z.string(),
  organizer_id: z.string(),
  volunteers: z.array(z.string()).default([]),
  approved: z.array(z.string()).default([]),
});

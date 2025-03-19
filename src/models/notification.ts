import { z } from "zod";

export default z.object({
  title:  z.string().min(1),
  date: z.string().refine(
    (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date format",
    }
  ),
  desc: z.string().min(1)
});

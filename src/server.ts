import cors from "cors";
import path from "path";
import morgan from "morgan";
import express from "express";
import swaggerSpec from "./swagger";
import swaggerUi from "swagger-ui-express";

import auth from "./routes/auth";
import users from "./routes/users";
import admin from "./routes/admin";
import events from "./routes/events";
import contact from "./routes/contact";
import notifications from "./routes/notifications";

const app = express();


app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
// app.use(cors({ origin: "http://localhost:5173" }));


app.use("/", express.static(path.join(__dirname, "public")));
app.use("/media", express.static(path.join(__dirname, "media")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use("/api/v1/auth", auth);
app.use("/api/v1/admin", admin);
app.use("/api/v1/users", users);
app.use("/api/v1/events", events);
app.use("/api/v1/contact", contact);
app.use("/api/v1/notifications", notifications);


app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

export default app;
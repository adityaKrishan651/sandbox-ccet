import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import matchRoutes from "./routes/match.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

app.get("/health", (_req, res) => res.json({ ok: true, name: "skillbridge-backend" }));

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/match", matchRoutes);
app.use("/profile", profileRoutes);

app.use((err, _req, res, _next) => {
  const status = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SkillBridge backend running on http://localhost:${port}`);
});


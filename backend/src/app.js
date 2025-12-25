import os from "os";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import requestLogger from "./middlewares/requestLogger.js";

const app = express();

app.use(
  cors({
    origin: "https://taplop.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

// routes
app.get("/api/test", (req, res) => {
  res.json({ message: "CORS working" });
});
const swaggerPath = path.join(process.cwd(), "src/docs/swagger.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(morgan("dev"));
app.use("/api", routes);

export default app;

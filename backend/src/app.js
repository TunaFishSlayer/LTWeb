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
    origin: [
      process.env.FRONTEND_URL || "https://taplop.vercel.app", 
      "http://localhost:3000"         
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

app.get("/api/test", (req, res) => {
  res.json({ message: "CORS working" });
});

const swaggerPath = path.join(process.cwd(), "src/docs/swagger.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(morgan("dev"));
app.use("/api", routes);

export default app;

import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import userRouter from "./src/user/user.route.js";
import helmet from "helmet";

const app = express();
try {
  connectDB().then(() => console.log("Connected to database"));
} catch (error) {
  console.log(error);
  process.exit(1);
}

app.use("/static", express.static("public"));
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(reqLogger);

function reqLogger(req, res, next) {
  console.log(
    `Request made to ${req.url} by ${req.method} with  body ${JSON.stringify(
      req.body
    )} `
  );
  next();
}

app.use("/api/users", userRouter);

app.use((err, req, res, next) => {
  console.log(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

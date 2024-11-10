import express from "express";
import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = new Error("Please provide all required fields");
    error.statusCode = 400;
    next(error);
    // return res
    //   .status(400)
    //   .json({ message: "Please provide all required fields" });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const result = await User.create({ name, email, password: hash });

    res
      .status(201)
      .json({ message: "User created successfully", id: result._id });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Please provide all required fields");
    error.statusCode = 400;
    next(error);
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    next(error);
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    next(error);
  }

  console.log(process.env.JWT_SECRET);
  // json token
  const token = jwt.sign({ id: user._id }, process.env.MONGODB_URI, {
    expiresIn: "7d",
  });

  res.json({ token });
});

router.get("/:userId", auth, async (req, res, next) => {
  const requestUserId = req.params.userId;
  const tokenUserId = req.user;

  console.log(requestUserId, tokenUserId);

  if (requestUserId !== tokenUserId) {
    const error = new Error("Not authorized to access this user");
    error.statusCode = 403;
    next(error);
    return;
  }

  const user = await User.findById(
    { _id: requestUserId },
    {
      password: 0,
      __v: 0,
    }
  );

  res.json({ user });
});

export default router;

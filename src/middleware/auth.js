import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.MONGODB_URI);

    req.user = decoded.id;

    next();
  } catch (error) {
    next(error);
  }
};

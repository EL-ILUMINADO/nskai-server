import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded)
      return res.status(401).json({ success: false, message: "Invalid token" });

    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.log("Error in verifying token", verifyToken);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

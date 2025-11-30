import { getAuth } from "@clerk/express";

const authMiddleware = (req, res, next) => {
  const auth = getAuth(req);
  console.log(auth);
  if (!auth?.isAuthenticated)
    return res.status(401).json({ message: "Unauthorized" });
//   if (auth.sessionClaims.metadata.role !== "user") {
//     return res.status(401).json({ message: "you are not user" });
//   }
  req.clerkId = auth.userId;
  next();
};

export default authMiddleware;
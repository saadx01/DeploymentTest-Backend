// Check if user owns the resource OR is admin
export const canAccessUser = (req, res, next) => {
  const { id: userIdFromToken, role } = req.user;
  const userIdFromParams = req.params.id;

  console.log("User ID from token:", userIdFromToken);
  console.log("User ID from params:", userIdFromParams);

  if (userIdFromToken === userIdFromParams) {
    return next();
  }

  return res.status(403).json({ message: "You are not allowed to access this resource" });
};

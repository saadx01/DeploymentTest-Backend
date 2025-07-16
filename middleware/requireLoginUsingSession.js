
export const requireLoginUsingSession = (req, res, next) => {
    console.log("Session-based authentication middleware triggered");
    console.log("Session Data:", req.session);
  if (!req.session.user) {
    return res.status(401).json({ message: "Please log in to access this route" });
  }
  
  // Attach user info to request object
  req.user = {
    id: req.session.user.id,
    email: req.session.user.email,
    role: req.session.user.role,
  };
  
  next();
};
export const requireAdmin = (req, res, next) => {
  // First check if user exists on the request
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }
  // Then check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Admin access required"
    });
  }
  // If we get here, user is authenticated and is an admin
  next();
};


export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Access denied" });
        }
    
        if (roles.includes(req.user.role)) {
            next();
        }
        else{
            return res.status(403).json({ message: "You do not have permission to access this resource" });
        }
    
    };
}
import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
    console.log("Checking authentication...");
    console.log("Headers:", req.headers);
    console.log("Authorization:", req.headers.authorization);
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    console.log("Token received:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}
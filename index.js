// const express = require('express');
import express from "express";
import { connectToDatabase } from "./connections/db.js";
// import {isAuthenticated} from "./middleware/authMiddleware.js";
// import {authorizeRoles} from "./middleware/authorizeRoles.js";
// import {canAccessUser} from "./middleware/attributeBaseAccessControl.js";
// import { requireLoginUsingSession} from "./middleware/requireLoginUsingSession.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import logger from "./utils/logger.js";
import path from "path";
import cors from "cors";
import redisClient from "./utils/redisClient.js"; // Import redis client to ensure it's initialized

import { config } from "dotenv";
const app = express();
// configuring environment variables
config();
// config({path: './.env'});

// console.log('PORT', process.env.PORT);
const PORT = process.env.PORT || 3000;
// process.env.PORT

app.use(express.json());
// connectToDatabase();
// Connect to DB ONLY if not in test environment
if (process.env.NODE_ENV !== "test") {
 connectToDatabase();
}



// redisClient.connect()
//   .then(() => {
//     console.log("✅ Redis connected (without await)");
//   })
//   .catch((err) => {
//     console.error("❌ Redis connection error:", err);
//   });

// Logs requests using morgan + winston
// app.use(morgan("dev"));
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://mernb-2-frontend.vercel.app"
    ],
    //  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    // exposedHeaders: ["Content-Length", "Authorization"],
    credentials: true,
  })
);

// MUST be after DB connection
app.use(
  session({
    name: process.env.SESSION_NAME, // Cookie name
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 60 * 1, // 1 hour
      httpOnly: true,
      secure: false, // true if using HTTPS
      sameSite: "lax",
    },
  })
);

import userRoute from "./routes/userRoute.js";
import validationRoute from "./routes/validationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
app.use("/api/v1/user", userRoute);
app.use("/api/v1/validation", validationRoute);
app.use(errorHandler); // Add at the end after routes



// Make upload folder statis
app.use("/uploads", express.static("uploads"));



// default route
// app.get("/session",requireLoginUsingSession, (req, res) => {
//     res.send("Welcome to the Practice App");
// });

// app.get("/:id",isAuthenticated, authorizeRoles("user"),canAccessUser, (req, res) => {
//     res.send("Welcome to the Practice App");
// });



// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// ✅ Export only the Express app (important for Supertest)
export default app;

// ✅ Start the server only if not testing
if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
  });
}
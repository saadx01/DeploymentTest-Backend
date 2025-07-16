// middlewares/errorHandler.js
import multer from "multer";
import { AppError } from "../utils/AppError.js";

// Optional: You can use Winston or console as your logger
const logger = console;

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // console.error("❌ ERROR:", err.stack);
  // logger.error(`${req?.method} ${req?.url} - ${err?.message}`);

  // // Handle Multer file upload errors
  // if (err instanceof multer.MulterError) {
  //   // Multer-specific error (e.g. limit exceeded)
  //   return res.status(400).json({
  //     success: false,
  //     message: "Upload error: " + err.message
  //   });
  // }

  // // Handle file type errors from fileFilter
  // if (err.message.includes("Only image files")) {
  //   return res.status(400).json({
  //     success: false,
  //     message: err.message
  //   });
  // }

  logger.error(`success:${err.success}, message:${err.message}, stack:${err.stack}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack:  err.stack 
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

import request from "supertest";
import app from "../index.js"; // 👈 Make sure `index.js` exports `app`
import { connect, clear, close } from "./setup.js";
import path from "path";


beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clear();
});

afterAll(async () => {
  await close();
});



describe(" User Login Tests", () => {
  it(" should login successfully with correct credentials", async () => {
    const registerRes = await request(app).post("/api/v1/user/new")
      .field("name", "Login User")
      .field("email", "login@example.com")
      .field("password", "123456")
      .attach("image", "__tests__/files/sample.jpg")

    const User = (await import("../models/userModel.js")).default;
    const user = await User.findOne({ email: "login@example.com" });
    // user.isVerified = true;
    // await user.save();

    const res = await request(app)
      .post("/api/v1/user/login")
      .send({
        email: "login@example.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.message).toMatch(/login successful/i);
  });

  it("❌ should not login with wrong password", async () => {
    await request(app)
      .post("/api/v1/user/new")
      .field("name", "Wrong Pass")
      .field("email", "wrongpass@example.com")
      .field("password", "correct123")
      .attach("image", "__tests__/files/sample.jpg")

    const User = (await import("../models/userModel.js")).default;
    const user = await User.findOne({ email: "wrongpass@example.com" });
    // user.isVerified = true;
    await user.save();

    const res = await request(app)
      .post("/api/v1/user/login")
      .send({
        email: "wrongpass@example.com",
        password: "wrong123"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("❌ should return 404 if user is not found", async () => {
    const res = await request(app)
      .post("/api/v1/user/login")
      .send({
        email: "notfound@example.com",
        password: "any123"
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch();
  });
});













// describe("🧪 User Registration API Tests", () => {
//   it("✅ should register a user successfully", async () => {
//     const res = await request(app/user not found/i)
//       .post("/api/v1/user/register")
//       .send({
//         name: "Test User",
//         email: "test@example.com",
//         password: "123456"
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.message).toMatch(/registered/i);
//   });

//   it("❌ should not allow duplicate email registration", async () => {
//     // First registration
//     await request(app)
//       .post("/api/v1/user/register")
//       .send({
//         name: "User One",
//         email: "duplicate@example.com",
//         password: "123456"
//       });

//     // Try registering again with same email
//     const res = await request(app)
//       .post("/api/v1/user/register")
//       .send({
//         name: "User Two",
//         email: "duplicate@example.com",
//         password: "abcdef"
//       });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.message).toMatch(/already exists/i);
//   });
// });
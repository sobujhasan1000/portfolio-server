const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("protfolio");
    const collection = db.collection("users");
    const skillcollection = db.collection("skill");
    const blogcollection = db.collection("blog");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ========================== add skill ====================================
    app.post("/api/addSkill", async (req, res) => {
      const skill = req.body;

      // Insert donation data into the database
      await skillcollection.insertOne(skill);

      res.status(201).json({
        success: true,
        message: "skill posted successfully",
      });
    });

    app.get("/api/skill", async (req, res) => {
      try {
        const getskill = await skillcollection.find({}).toArray();

        res.json({
          success: true,
          skill: getskill,
        });
      } catch (error) {
        console.error("Error fetching donations:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });
    // ========================== add blog ====================================
    app.post("/api/addblog", async (req, res) => {
      const blog = req.body;

      // Insert donation data into the database
      await blogcollection.insertOne(blog);

      res.status(201).json({
        success: true,
        message: "skill posted successfully",
      });
    });
    // ==============================================================

    // ========================get skill========================
    app.get("/api/blog", async (req, res) => {
      try {
        const getblog = await blogcollection.find({}).toArray();

        res.json({
          success: true,
          blog: getblog,
        });
      } catch (error) {
        console.error("Error fetching donations:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});

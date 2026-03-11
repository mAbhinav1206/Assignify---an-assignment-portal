const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* MongoDB Connection */
mongoose.connect("mongodb://127.0.0.1:27017/assignify")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB error:", err));

/* User Model */
const User = mongoose.model("User", {
    email: String,
    password: String
});

/* Test Route */
app.get("/", (req, res) => {
    res.send("Assignify API running 🚀");
});

/* Signup Route */
app.post("/signup", async (req, res) => {

    try {


        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ message: "Please fill all fields" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({ message: "User created" });


    } catch (error) {
        console.log("Signup error:", error);
        res.status(500).json({ message: "Server not responding" });
    }

});

/* Login Route */
app.post("/login", async (req, res) => {

    try {


        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ message: "Please enter email and password" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({ message: "Login successful" });
        } else {
            res.json({ message: "Invalid password" });
        }


    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }

});

/* Start Server */
app.listen(8000, () => {
    console.log("Server running on port 8000");
});

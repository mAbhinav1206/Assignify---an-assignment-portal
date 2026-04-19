const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();

const loadEnvFile = () => {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return;
      }

      const [key, ...valueParts] = trimmedLine.split("=");

      if (key && process.env[key] === undefined) {
        process.env[key] = valueParts.join("=");
      }
    });
};

loadEnvFile();

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assignify";
const JWT_SECRET = process.env.JWT_SECRET || "assignify-dev-secret";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err.message));

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      avatar: String,
      fullName: String,
      username: String,
      university: String,
      course: String,
      year: String,
      phone: String,
      major: String,
      studentId: String,
      favoriteSubject: String,
      studyTime: String,
      reminder: String,
      subjects: [String],
      completed: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: String,
    fileSize: Number,
    status: {
      type: String,
      enum: ["submitted"],
      default: "submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, assignment: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Assignment = mongoose.model("Assignment", assignmentSchema);
const Submission = mongoose.model("Submission", submissionSchema);

const defaultAssignments = [
  {
    title: "Math Homework",
    course: "Mathematics",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    description: "Complete the worksheet and upload your solution file.",
  },
  {
    title: "Physics Lab Report",
    course: "Physics",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    description: "Submit your final lab report as a PDF or document.",
  },
  {
    title: "Computer Science Project",
    course: "Computer Science",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    description: "Attach your project archive or report.",
  },
];

const uploadDir = path.join(__dirname, "uploads");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  profile: user.profile || {},
});

const safeFileName = (fileName) => fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

const deleteSubmissionForUser = async (userId, assignmentId) => {
  const submission = await Submission.findOneAndDelete({
    user: userId,
    assignment: assignmentId,
  });

  if (!submission) {
    return false;
  }

  if (submission.filePath && fs.existsSync(submission.filePath)) {
    fs.unlinkSync(submission.filePath);
  }

  return true;
};

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
});

const seedAssignments = async () => {
  const count = await Assignment.countDocuments();

  if (count === 0) {
    await Assignment.insertMany(defaultAssignments);
  }
};

mongoose.connection.once("open", () => {
  seedAssignments().catch((error) => {
    console.error("Assignment seed error:", error.message);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Assignify API running" });
});

app.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({
      message: "User created",
      token: createToken(user),
      user: publicUser(user),
    });
  })
);

app.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      token: createToken(user),
      user: publicUser(user),
    });
  })
);

app.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: publicUser(req.user) });
  })
);

app.put(
  "/profile",
  authenticate,
  asyncHandler(async (req, res) => {
    const allowedFields = [
      "avatar",
      "fullName",
      "username",
      "university",
      "course",
      "year",
      "phone",
      "major",
      "studentId",
      "favoriteSubject",
      "studyTime",
      "reminder",
      "subjects",
      "completed",
    ];

    const nextProfile = { ...(req.user.profile?.toObject?.() || req.user.profile || {}) };

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        nextProfile[field] = req.body[field];
      }
    });

    req.user.profile = nextProfile;
    await req.user.save();

    res.json({
      message: "Profile saved",
      user: publicUser(req.user),
    });
  })
);

app.get(
  "/assignments",
  authenticate,
  asyncHandler(async (req, res) => {
    const [assignments, submissions] = await Promise.all([
      Assignment.find().sort({ dueDate: 1 }),
      Submission.find({ user: req.user._id }),
    ]);

    const submissionsByAssignment = new Map(
      submissions.map((submission) => [submission.assignment.toString(), submission])
    );

    res.json({
      assignments: assignments.map((assignment) => {
        const submission = submissionsByAssignment.get(assignment._id.toString());

        return {
          id: assignment._id,
          title: assignment.title,
          course: assignment.course,
          dueDate: assignment.dueDate,
          description: assignment.description,
          submission: submission
            ? {
                fileName: submission.fileName,
                status: submission.status,
                submittedAt: submission.submittedAt,
              }
            : null,
        };
      }),
    });
  })
);

app.post(
  "/assignments/:assignmentId/submit",
  authenticate,
  asyncHandler(async (req, res) => {
    const fileName = String(req.body.fileName || "").trim();
    const fileData = String(req.body.fileData || "");

    if (!fileName || !fileData) {
      return res.status(400).json({ message: "Attach a file first" });
    }

    const dataUrlMatch = fileData.match(/^data:(.+);base64,(.+)$/);

    if (!dataUrlMatch) {
      return res.status(400).json({ message: "Invalid file upload" });
    }

    const mimeType = dataUrlMatch[1];
    const buffer = Buffer.from(dataUrlMatch[2], "base64");

    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ message: "File must be 8 MB or smaller" });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    fs.mkdirSync(uploadDir, { recursive: true });

    const storedFileName = [
      req.user._id.toString(),
      assignment._id.toString(),
      Date.now(),
      safeFileName(fileName),
    ].join("-");
    const filePath = path.join(uploadDir, storedFileName);

    fs.writeFileSync(filePath, buffer);

    const submission = await Submission.findOneAndUpdate(
      {
        user: req.user._id,
        assignment: assignment._id,
      },
      {
        fileName,
        filePath,
        mimeType,
        fileSize: buffer.length,
        status: "submitted",
        submittedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: "Assignment submitted",
      submission: {
        fileName: submission.fileName,
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
    });
  })
);

app.get(
  "/assignments/:assignmentId/submission",
  authenticate,
  asyncHandler(async (req, res) => {
    const submission = await Submission.findOne({
      user: req.user._id,
      assignment: req.params.assignmentId,
    });

    if (!submission || !fs.existsSync(submission.filePath)) {
      return res.status(404).json({ message: "Submission file not found" });
    }

    res.setHeader("Content-Type", submission.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName(submission.fileName)}"`
    );
    res.sendFile(submission.filePath);
  })
);

app.delete(
  "/assignments/:assignmentId/submission",
  authenticate,
  asyncHandler(async (req, res) => {
    const deleted = await deleteSubmissionForUser(req.user._id, req.params.assignmentId);

    if (!deleted) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ message: "Submission deleted" });
  })
);

app.post(
  "/assignments/:assignmentId/submission/delete",
  authenticate,
  asyncHandler(async (req, res) => {
    const deleted = await deleteSubmissionForUser(req.user._id, req.params.assignmentId);

    if (!deleted) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ message: "Submission deleted" });
  })
);

app.get(
  "/dashboard",
  authenticate,
  asyncHandler(async (req, res) => {
    const [assignmentCount, submissions] = await Promise.all([
      Assignment.countDocuments(),
      Submission.find({ user: req.user._id }).populate("assignment"),
    ]);

    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const submittedIds = new Set(submissions.map((item) => item.assignment?._id.toString()));
    const assignments = await Assignment.find();
    const pendingAssignments = assignments.filter(
      (assignment) => !submittedIds.has(assignment._id.toString())
    );
    const dueThisWeek = pendingAssignments.filter(
      (assignment) => assignment.dueDate >= now && assignment.dueDate <= weekEnd
    );
    const completionRate =
      assignmentCount === 0 ? 0 : Math.round((submissions.length / assignmentCount) * 100);

    res.json({
      stats: {
        coursesEnrolled: new Set(assignments.map((assignment) => assignment.course)).size,
        pendingAssignments: pendingAssignments.length,
        dueThisWeek: dueThisWeek.length,
        completionRate,
      },
    });
  })
);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

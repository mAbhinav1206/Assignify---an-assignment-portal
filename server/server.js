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
const allowedOrigins = CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("This origin is not allowed"));
    },
  })
);
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
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
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
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    submitFileType: {
      type: String,
      default: "PDF",
    },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "/curriculum.png",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    archived: {
      type: Boolean,
      default: false,
    },
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
const Course = mongoose.model("Course", courseSchema);
const Submission = mongoose.model("Submission", submissionSchema);

const defaultAssignments = [
  {
    title: "Math Homework",
    course: "Mathematics",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    description: "Complete the worksheet and upload your solution file.",
    visibility: "public",
    submitFileType: "PDF",
  },
  {
    title: "Physics Lab Report",
    course: "Physics",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    description: "Submit your final lab report as a PDF or document.",
    visibility: "private",
    submitFileType: "DOCX",
  },
  {
    title: "Computer Science Project",
    course: "Computer Science",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    description: "Attach your project archive or report.",
    visibility: "public",
    submitFileType: "ZIP",
  },
];

const courseCatalog = {
  Mathematics: {
    description: "Strengthen problem-solving with weekly practice sets, proofs, and guided revision.",
    thumbnail: "/curriculum.png",
  },
  Physics: {
    description: "Explore concepts, lab reports, and applied reasoning through structured assignments.",
    thumbnail: "/pendingTasks.png",
  },
  "Computer Science": {
    description: "Build coding fluency, project discipline, and technical writing through practical tasks.",
    thumbnail: "/search.png",
  },
};

const uploadDir = path.join(__dirname, "uploads");

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  profile: user.profile || {},
});

const safeFileName = (fileName) => fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

const assignmentFileRules = {
  PDF: {
    label: "PDF",
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
  },
  DOCX: {
    label: "DOCX",
    extensions: [".docx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
  PPTX: {
    label: "PPTX",
    extensions: [".pptx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  },
  ZIP: {
    label: "ZIP",
    extensions: [".zip"],
    mimeTypes: ["application/zip", "application/x-zip-compressed", "multipart/x-zip"],
  },
  Image: {
    label: "image",
    extensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"],
    mimeTypes: ["image/"],
  },
};

const matchesAssignmentFileRule = (fileName, mimeType, submitFileType) => {
  const rule = assignmentFileRules[submitFileType];

  if (!rule) {
    return true;
  }

  const normalizedFileName = String(fileName || "").trim().toLowerCase();
  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  const extensionMatches = rule.extensions.some((extension) => normalizedFileName.endsWith(extension));
  const mimeMatches = rule.mimeTypes.some((type) =>
    type.endsWith("/") ? normalizedMimeType.startsWith(type) : normalizedMimeType === type
  );

  return extensionMatches && mimeMatches;
};

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

const getCourseMeta = (courseName) => ({
  description:
    courseCatalog[courseName]?.description ||
    `Join ${courseName} to receive assignments, track submissions, and stay aligned with your class schedule.`,
  thumbnail: courseCatalog[courseName]?.thumbnail || "/curriculum.png",
});

const decodeCourseValue = (value) => decodeURIComponent(String(value || "").trim());

const ensureCourseRecord = async (courseName, overrides = {}) => {
  const trimmedCourseName = String(courseName || "").trim();

  if (!trimmedCourseName) {
    return null;
  }

  const defaultMeta = getCourseMeta(trimmedCourseName);

  return Course.findOneAndUpdate(
    { name: trimmedCourseName },
    {
      $setOnInsert: {
        name: trimmedCourseName,
        description: defaultMeta.description,
        thumbnail: defaultMeta.thumbnail,
        visibility: "public",
      },
      $set: Object.fromEntries(
        Object.entries(overrides).filter(([, value]) => value !== undefined)
      ),
    },
    {
      upsert: true,
      new: true,
    }
  );
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

const requireRole = (role) =>
  asyncHandler(async (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "You do not have access to this area" });
    }

    next();
  });

const seedAssignments = async () => {
  const count = await Assignment.countDocuments();

  if (count === 0) {
    await Assignment.insertMany(defaultAssignments);
  }
};

const seedCourses = async () => {
  const courseNames = Array.from(
    new Set([...Object.keys(courseCatalog), ...defaultAssignments.map((assignment) => assignment.course)])
  );

  await Promise.all(
    courseNames.map((courseName) =>
      ensureCourseRecord(courseName, {
        description: getCourseMeta(courseName).description,
        thumbnail: getCourseMeta(courseName).thumbnail,
      })
    )
  );
};

const seedTeacherAccount = async () => {
  const teacherEmail = "teacher@assignify.com";
  const existingTeacher = await User.findOne({ email: teacherEmail });

  if (!existingTeacher) {
    const hashedPassword = await bcrypt.hash("teach1234", 10);
    await User.create({
      email: teacherEmail,
      password: hashedPassword,
      role: "teacher",
      profile: {
        fullName: "Assignify Teacher",
        username: "assignify-teacher",
        completed: true,
      },
    });
  }
};

mongoose.connection.once("open", () => {
  Promise.all([seedAssignments(), seedCourses(), seedTeacherAccount()]).catch((error) => {
    console.error("Seed error:", error.message);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Assignify API running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "assignify-api" });
});

app.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = req.body.role === "teacher" ? "teacher" : "student";

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
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      profile: {
        completed: role === "teacher",
      },
    });

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
    const role = req.body.role ? String(req.body.role) : "";

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

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not registered as a ${role}` });
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
    const now = new Date();
    const [assignments, submissions] = await Promise.all([
      Assignment.find({ dueDate: { $gte: now } }).sort({ dueDate: 1 }),
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
          visibility: assignment.visibility,
          submitFileType: assignment.submitFileType,
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

    if (!matchesAssignmentFileRule(fileName, mimeType, assignment.submitFileType)) {
      return res.status(400).json({
        message: `Only ${assignment.submitFileType} files can be submitted for this assignment`,
      });
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

app.get(
  "/teacher/overview",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const [students, assignments, submissions] = await Promise.all([
      User.find({ role: "student" }),
      Assignment.find().sort({ createdAt: -1 }),
      Submission.find().populate("user assignment"),
    ]);

    const averageCompletion =
      students.length === 0 || assignments.length === 0
        ? 0
        : Math.round((submissions.length / (students.length * assignments.length)) * 100);

    res.json({
      stats: {
        totalStudents: students.length,
        activeAssignments: assignments.length,
        totalSubmissions: submissions.length,
        averageCompletion,
      },
      teacher: publicUser(req.user),
    });
  })
);

app.get(
  "/teacher/students",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const [students, assignments, submissions] = await Promise.all([
      User.find({ role: "student" }).sort({ createdAt: -1 }),
      Assignment.find(),
      Submission.find().populate("assignment"),
    ]);

    const submissionsByStudent = new Map();

    submissions.forEach((submission) => {
      const studentId = submission.user.toString();
      const current = submissionsByStudent.get(studentId) || [];
      current.push(submission);
      submissionsByStudent.set(studentId, current);
    });

    res.json({
      students: students.map((student) => {
        const studentSubmissions = submissionsByStudent.get(student._id.toString()) || [];
        const completionRate =
          assignments.length === 0
            ? 0
            : Math.round((studentSubmissions.length / assignments.length) * 100);

        return {
          id: student._id,
          email: student.email,
          profile: student.profile || {},
          completionRate,
          submittedCount: studentSubmissions.length,
          pendingCount: Math.max(assignments.length - studentSubmissions.length, 0),
          recentSubmission: studentSubmissions
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
            ? {
                assignmentTitle: studentSubmissions
                  .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
                  .assignment?.title,
                submittedAt: studentSubmissions
                  .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
                  .submittedAt,
              }
            : null,
        };
      }),
    });
  })
);

app.get(
  "/teacher/courses",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const [students, assignments, existingCourses] = await Promise.all([
      User.find({ role: "student" }),
      Assignment.find(),
      Course.find({ archived: false }).sort({ name: 1 }),
    ]);

    const courseNames = new Set(existingCourses.map((course) => course.name));

    students.forEach((student) => {
      if (student.profile?.course) {
        courseNames.add(student.profile.course);
      }
    });

    assignments.forEach((assignment) => {
      if (assignment.course) {
        courseNames.add(assignment.course);
      }
    });

    const courses = await Promise.all(
      Array.from(courseNames)
        .sort((a, b) => a.localeCompare(b))
        .map(async (courseName) => {
          const courseRecord =
            existingCourses.find((course) => course.name === courseName) ||
            (await ensureCourseRecord(courseName));

          return {
            name: courseName,
            description: courseRecord?.description || getCourseMeta(courseName).description,
            thumbnail: courseRecord?.thumbnail || getCourseMeta(courseName).thumbnail,
            visibility: courseRecord?.visibility || "public",
            enrolledCount: students.filter((student) => student.profile?.course === courseName).length,
            assignmentCount: assignments.filter((assignment) => assignment.course === courseName).length,
          };
        })
    );

    res.json({ courses });
  })
);

app.post(
  "/teacher/courses",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const thumbnail = String(req.body.thumbnail || "").trim();
    const visibility = String(req.body.visibility || "public").toLowerCase();

    if (!name) {
      return res.status(400).json({ message: "Course name is required" });
    }

    if (!["public", "private"].includes(visibility)) {
      return res.status(400).json({ message: "Visibility must be public or private" });
    }

    const course = await ensureCourseRecord(name, {
      description: description || getCourseMeta(name).description,
      thumbnail: thumbnail || getCourseMeta(name).thumbnail,
      visibility,
      archived: false,
    });

    res.status(201).json({
      message: "Course saved",
      course,
    });
  })
);

app.get(
  "/teacher/courses/:courseName/students",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const courseName = decodeCourseValue(req.params.courseName);
    const [students, submissions] = await Promise.all([
      User.find({ role: "student", "profile.course": courseName }).sort({ createdAt: -1 }),
      Submission.find().populate("assignment"),
    ]);

    const studentPayload = students.map((student) => {
      const studentSubmissions = submissions
        .filter(
          (submission) =>
            submission.user.toString() === student._id.toString() &&
            submission.assignment?.course === courseName
        )
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      return {
        id: student._id,
        email: student.email,
        profile: student.profile || {},
        submissions: studentSubmissions.map((submission) => ({
          id: submission._id,
          assignmentTitle: submission.assignment?.title,
          fileName: submission.fileName,
          submittedAt: submission.submittedAt,
        })),
      };
    });

    res.json({
      course: courseName,
      students: studentPayload,
    });
  })
);

app.delete(
  "/teacher/courses/:courseName/students/:studentId",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const courseName = decodeCourseValue(req.params.courseName);
    const student = await User.findOne({
      _id: req.params.studentId,
      role: "student",
      "profile.course": courseName,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found in this course" });
    }

    student.profile = {
      ...(student.profile?.toObject?.() || student.profile || {}),
      course: "",
    };

    await student.save();

    res.json({ message: "Student removed from course" });
  })
);

app.post(
  "/courses/join",
  authenticate,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const courseName = String(req.body.course || "").trim();

    if (!courseName) {
      return res.status(400).json({ message: "Course name is required" });
    }

    req.user.profile = {
      ...(req.user.profile?.toObject?.() || req.user.profile || {}),
      course: courseName,
    };

    await req.user.save();

    res.json({
      message: "Course joined",
      user: publicUser(req.user),
    });
  })
);

app.get(
  "/courses/:courseName/details",
  authenticate,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const courseName = decodeCourseValue(req.params.courseName);
    const courseRecord = await Course.findOne({ name: courseName, archived: false });
    const courseMeta = {
      description: courseRecord?.description || getCourseMeta(courseName).description,
      thumbnail: courseRecord?.thumbnail || getCourseMeta(courseName).thumbnail,
      visibility: courseRecord?.visibility || "public",
    };
    const assignmentCount = await Assignment.countDocuments({ course: courseName });
    const isEnrolled = req.user.profile?.course === courseName;

    res.json({
      course: {
        name: courseName,
        description: courseMeta.description,
        thumbnail: courseMeta.thumbnail,
        assignmentCount,
        isEnrolled,
        visibility: courseMeta.visibility,
      },
    });
  })
);

app.get(
  "/teacher/assignments",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const [assignments, students, submissions] = await Promise.all([
      Assignment.find().sort({ dueDate: 1 }),
      User.find({ role: "student" }),
      Submission.find().populate("user"),
    ]);

    const submissionsByAssignment = new Map();

    submissions.forEach((submission) => {
      const assignmentId = submission.assignment.toString();
      const current = submissionsByAssignment.get(assignmentId) || [];
      current.push(submission);
      submissionsByAssignment.set(assignmentId, current);
    });

    const now = new Date();
    const mappedAssignments = assignments.map((assignment) => {
      const assignmentSubmissions = submissionsByAssignment.get(assignment._id.toString()) || [];

      return {
        id: assignment._id,
        title: assignment.title,
        course: assignment.course,
        dueDate: assignment.dueDate,
        description: assignment.description,
        visibility: assignment.visibility,
        submitFileType: assignment.submitFileType,
        submissionsCount: assignmentSubmissions.length,
        pendingCount: Math.max(students.length - assignmentSubmissions.length, 0),
        students: assignmentSubmissions.map((submission) => ({
          id: submission.user?._id,
          name:
            submission.user?.profile?.fullName ||
            submission.user?.profile?.username ||
            submission.user?.email,
          email: submission.user?.email,
          fileName: submission.fileName,
          submittedAt: submission.submittedAt,
        })),
      };
    });

    res.json({
      activeAssignments: mappedAssignments.filter(
        (assignment) => new Date(assignment.dueDate) >= now
      ),
      pastAssignments: mappedAssignments.filter(
        (assignment) => new Date(assignment.dueDate) < now
      ),
    });
  })
);

app.post(
  "/teacher/assignments",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const title = String(req.body.title || "").trim();
    const course = String(req.body.course || "").trim();
    const dueDate = req.body.dueDate;
    const description = String(req.body.description || "").trim();
    const visibility = String(req.body.visibility || "public").toLowerCase();
    const submitFileType = String(req.body.submitFileType || "PDF").trim();

    if (!title || !course || !dueDate) {
      return res.status(400).json({ message: "Title, course, and due date are required" });
    }

    if (!["public", "private"].includes(visibility)) {
      return res.status(400).json({ message: "Visibility must be public or private" });
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ message: "Enter a valid due date" });
    }

    const assignment = await Assignment.create({
      title,
      course,
      dueDate: parsedDueDate,
      description,
      visibility,
      submitFileType,
    });

    try {
      await ensureCourseRecord(course, {
        visibility,
        description: description || undefined,
      });
    } catch (courseError) {
      console.error("Course sync error:", courseError.message);
    }

    res.status(201).json({
      message: "Assignment created",
      assignment,
    });
  })
);

app.delete(
  "/teacher/assignments/:assignmentId",
  authenticate,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const relatedSubmissions = await Submission.find({ assignment: assignment._id });

    relatedSubmissions.forEach((submission) => {
      if (submission.filePath && fs.existsSync(submission.filePath)) {
        fs.unlinkSync(submission.filePath);
      }
    });

    await Submission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();

    res.json({ message: "Assignment deleted" });
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

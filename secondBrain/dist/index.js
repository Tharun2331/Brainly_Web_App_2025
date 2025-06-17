"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const port = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
dotenv_1.default.config();
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = zod_1.z.object({
            username: zod_1.z.string().min(3).max(10),
            password: zod_1.z.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
                message: "Password must contain lowercase, uppercase, and special character",
            }),
        });
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(411).json({
                message: "Invalid request body",
                errors: result.error.errors,
            });
        }
        const { username, password } = result.data;
        const existingUser = yield db_1.userModel.findOne({ username });
        if (existingUser) {
            return res.status(403).json({ message: "Username already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 5);
        yield db_1.userModel.create({ username, password: hashedPassword });
        return res.status(200).json({ message: "User Signed up!" });
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield db_1.userModel.findOne({
            username
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({
                message: "Invalid password",
            });
        }
        else {
            const token = jsonwebtoken_1.default.sign({
                id: user._id,
            }, USER_JWT_SECRET);
            return res.status(200).json({
                message: "User signed in Successfully",
                token
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title } = req.body;
    yield db_1.contentModel.create({
        link,
        title,
        type,
        userId: req.userId,
        tags: []
    });
    return res.status(200).json({
        message: "content added"
    });
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const content = yield db_1.contentModel.find({
        userId: userId
    }).populate("userId", "username");
    return res.status(200).json({
        content
    });
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield db_1.contentModel.deleteMany({
        _id: contentId,
        userId: req.userId
    });
    return res.status(200).json({
        message: "content deleted"
    });
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const share = req.body.share;
        const userId = req.userId;
        const hash = (0, utils_1.Random)(10);
        if (share === true || share === undefined) {
            const existingLink = yield db_1.linkModel.findOne({
                userId: req.userId
            });
            if (existingLink) {
                return res.json({
                    hash: existingLink.hash
                });
            }
            yield db_1.linkModel.create({
                userId: userId,
                hash: hash
            });
            res.status(200).json({
                message: `/share/${hash}`
            });
        }
        else {
            yield db_1.linkModel.deleteOne({
                userId: userId
            });
            res.status(403).json({
                message: "Removed Link!"
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            message: "Could not generate share link",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shareLink } = req.params;
        const link = yield db_1.linkModel.findOne({
            hash: shareLink
        });
        if (!link) {
            return res.status(404).json({
                message: "Share link not found!"
            });
        }
        // userId
        const content = yield db_1.contentModel.find({
            userId: link.userId
        });
        const user = yield db_1.userModel.findOne({
            _id: link.userId
        });
        console.log(link);
        if (!user) {
            return res.status(411).json({
                message: "User not found!"
            });
        }
        return res.status(200).json({
            message: "Content fetched Successfully!",
            username: user.username,
            content: content
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Failed to fetch shared content",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
app.listen(port, () => {
    console.log(`Running on Port ${port}`);
});

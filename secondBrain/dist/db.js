"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.tagModel = exports.contentModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.MONGODBURI) {
    throw new Error("MONGOURI environment variable is not defined");
}
mongoose_1.default.connect(process.env.MONGODBURI);
// Add these connection handlers
mongoose_1.default.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
const tagSchema = new Schema({
    title: { type: String, required: true, unique: true },
});
const contentTypes = ['image', 'video', 'article', 'audio', 'youtube', 'twitter'];
const contentSchema = new Schema({
    link: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    title: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tags' }],
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }
});
const linkSchema = new Schema({
    hash: String,
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true, unique: true }
});
exports.userModel = mongoose_1.default.model('Users', userSchema);
exports.contentModel = mongoose_1.default.model('Contents', contentSchema);
exports.tagModel = mongoose_1.default.model('Tags', tagSchema);
exports.linkModel = mongoose_1.default.model('Links', linkSchema);

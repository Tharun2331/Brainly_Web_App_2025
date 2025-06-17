"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = Random;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = process.env.RANDOM_STRING;
function Random(len) {
    const length = options.length;
    let result = "";
    for (let i = 0; i < len; i++) {
        result += options[Math.floor((Math.random() * length))];
    }
    return result;
}

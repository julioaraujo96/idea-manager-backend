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
exports.getUserById = exports.getUserByUsername = exports.createUser = void 0;
const db_server_1 = require("../../utils/db.server");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = user;
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    return db_server_1.db.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });
});
exports.createUser = createUser;
const getUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return db_server_1.db.user.findUnique({
        where: { username }
    });
});
exports.getUserByUsername = getUserByUsername;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_server_1.db.user.findUnique({ where: { id } });
});
exports.getUserById = getUserById;

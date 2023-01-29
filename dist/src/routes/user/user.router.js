"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserService = __importStar(require("./user.service"));
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
console.log('working');
if (!process.env.JWT_SECRET) {
    process.exit(1);
}
console.log('jwt');
const JWT_SECRET = process.env.JWT_SECRET;
userRouter.get('/tou', (req, res) => {
    console.log('???????');
    res.send('TOU');
});
userRouter.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('registering');
    const user = req.body;
    const { username } = user;
    try {
        const existingUser = yield UserService.getUserByUsername(username);
        if (existingUser) {
            return res.json({ error: 'Username already exists' });
        }
        // Create a new user in the database
        const newUser = yield UserService.createUser(user);
        const { password } = newUser, userInfo = __rest(newUser, ["password"]);
        // Create and sign a JWT
        const token = jsonwebtoken_1.default.sign({ userId: userInfo.id }, JWT_SECRET, { expiresIn: '1d' });
        // Send the JWT in the response
        return res.status(201).json({ userInfo, token });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error registering user' });
    }
}));
userRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const loggeduser = yield UserService.getUserByUsername(username);
    if (!loggeduser) {
        return res.status(404).json({ error: 'User not found' });
    }
    const { password: _ } = loggeduser, user = __rest(loggeduser, ["password"]);
    const isPasswordMatch = yield bcryptjs_1.default.compare(password, loggeduser.password);
    const token = jsonwebtoken_1.default.sign({ userId: loggeduser.id }, JWT_SECRET, { expiresIn: '1d' });
    if (isPasswordMatch) {
        return res.status(200).json({ user, token });
    }
    return res.status(404).json({ error: 'Password does not match with provided username.' });
}));

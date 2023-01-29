"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
let db;
exports.db = db;
//if there is no instance of PrismaClient running then we create one 
if (!global.__db) {
    global.__db = new client_1.PrismaClient();
}
//export our database instance to use on other files
exports.db = db = global.__db;

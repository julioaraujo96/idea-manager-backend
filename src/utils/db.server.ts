import { PrismaClient } from '@prisma/client';

let db : PrismaClient;

//to prevent more than one connection to the same database when our server reloads 
declare global {
    var __db : PrismaClient | undefined;
}

//if there is no instance of PrismaClient running then we create one 
if (!global.__db) {
    global.__db = new PrismaClient();
}

//export our database instance to use on other files
db = global.__db;

export { db };
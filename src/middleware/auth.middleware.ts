import express, {Request, Response, NextFunction} from 'express'
import * as UserService from '../routes/user/user.service';

import jwt from 'jsonwebtoken';

type JwtPayload = {
    userId:number
}

export const authMiddleware = async (req : Request, res : Response, next: NextFunction) => {
    try {
        
        //Get th e JWT from headers 
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.json({ error: 'Access denied. No token provided.'});
        }

        //verify jwt and get payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        //find user by id 
        const user = await UserService.getUserById(decoded.userId); 

        //if no user is found return error 
        if(!user){
            return res.json({ error: 'User not found.'});
        }
    
        //attach user object ot the request
        const { password: _, ...loggedUser } = user

        req.user = loggedUser;

        next();
    } catch (error) {
        return res.status(400).send({ error: "Invalid token." });
    }
};
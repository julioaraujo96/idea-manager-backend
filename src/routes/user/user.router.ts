import express, {Request, Response} from 'express'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'

import * as UserService from './user.service';

const userRouter = express.Router();

console.log('working')

if(!process.env.JWT_SECRET) {
    process.exit(1);
}

console.log('jwt')

const JWT_SECRET : string = process.env.JWT_SECRET;

userRouter.get('/tou', (req, res) => {
    console.log('???????')
    res.send('TOU')
})

userRouter.post('/register' , async ( req : Request, res :Response) => {

    console.log('registering')

    const userToRegister  = req.body;
    const {username} = userToRegister;

    try {

        const existingUser = await UserService.getUserByUsername(username);

        if(existingUser){
            return res.json({error:'Username already exists'});
        }
        // Create a new user in the database
        const newUser = await UserService.createUser(userToRegister);

        const { password, ...user } = newUser;
        
        // Create and sign a JWT
        const token = jwt.sign({ userId: user.id }, JWT_SECRET , { expiresIn: '1d' });

        // Send the JWT in the response
        return res.status(201).json({user, token});

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error registering user' });
    } 
});

userRouter.post('/login', async (req:Request, res : Response) => {

    const {username, password} = req.body;

    const loggeduser  = await UserService.getUserByUsername(username)

    if(!loggeduser){
        return res.status(404).json({error: 'User not found'});
    }

    const { password:_, ...user} = loggeduser;

    const isPasswordMatch = await bcrypt.compare(password, loggeduser.password);

    const token = jwt.sign({ userId: loggeduser.id }, JWT_SECRET , { expiresIn: '1d' });


    if(isPasswordMatch){
        return res.status(200).json({user, token})
    }

    return res.status(404).json({error: 'Password does not match with provided username.'});
    
})

export { userRouter };

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import * as UserService from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';

import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  verifyRefreshToken,
} from '../services/auth.service';

const userRouter = express.Router();

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  process.exit(1);
}

// Endpoints ----> /api/users/XXXXX

userRouter.post('/register', async (req: Request, res: Response) => {
  const userToRegister = req.body;
  const { username } = userToRegister;

  try {
    const existingUser = await UserService.getUserByUsername(username);

    if (existingUser) {
      return res.json({ error: 'Username already exists' });
    }

    const newUser = await UserService.createUser(userToRegister);
    const { password, ...user } = newUser;

    const token = generateAccessToken(user.id.toString());
    const refreshToken = generateRefreshToken(user.id.toString());

    await storeRefreshToken(user.id.toString(), refreshToken);

    return res.status(201).json({ user, token, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error registering user' });
  }
});

userRouter.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const loggedUser = await UserService.getUserByUsername(username);

  if (!loggedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...user } = loggedUser;

  const isPasswordMatch = await bcrypt.compare(password, loggedUser.password);

  if (isPasswordMatch) {
    const token = generateAccessToken(loggedUser.id.toString());
    const refreshToken = generateRefreshToken(loggedUser.id.toString());

    await storeRefreshToken(loggedUser.id.toString(), refreshToken);

    return res.status(200).json({ user, token, refreshToken });
  }

  return res.status(404).json({ error: 'Password does not match with the provided username' });
});

userRouter.post('/refresh-token', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const storedRefreshToken = await getRefreshToken(decoded.userId);

    if (refreshToken !== storedRefreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const token = generateAccessToken(decoded.userId);

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

userRouter.post('/logout', async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await deleteRefreshToken(userId);
    return res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

userRouter.get('/profile/:userId', authMiddleware, async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _,  ...profileData } = user;

    return res.status(200).json({ profileData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

userRouter.get('/all', authMiddleware, async (req : Request, res : Response) => {
  try {
    const users = await UserService.getAllUsers();

    if(!users){
      return res.status(404).json({ error: 'No users found' });
    }

    const sanitizedUsers = users.map((user) =>{
      const { password, ...userData } = user;
      return userData;
    })

    return res.status(200).json({ users: sanitizedUsers });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

export { userRouter };

import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';

import * as UserService from './user.service';

const userRouter = express.Router();

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  process.exit(1);
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET;

const redisClient = new Redis();

redisClient.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

// Function to generate an access token
const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
};

// Function to generate a refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Function to store a refresh token in Redis

const storeRefreshToken = (userId: string, refreshToken: string): void => {
  const key = `refreshToken:${userId}`;
  const duration = 7 * 24 * 60 * 60; // 7 days in seconds

  redisClient.setex(key, duration, refreshToken);
};

// Function to retrieve a refresh token from Redis
const getRefreshToken = async (userId: string): Promise<string | null> => {
    try {
      const refreshToken = await redisClient.get(`refreshToken:${userId}`);
      return refreshToken;
    } catch (err) {
      throw err;
    }
  };

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
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };

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
    await redisClient.del(`refreshToken:${userId}`);
    return res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { userRouter };

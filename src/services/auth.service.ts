import jwt from 'jsonwebtoken';
import Redis from 'ioredis';

const JWT_SECRET: string = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET!;

const redisClient = new Redis();

redisClient.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const storeRefreshToken = (userId: string, refreshToken: string): void => {
  const key = `refreshToken:${userId}`;
  const duration = 7 * 24 * 60 * 60; // 7 days in seconds

  redisClient.setex(key, duration, refreshToken);
};

export const getRefreshToken = async (userId: string): Promise<string | null> => {
  try {
    const refreshToken = await redisClient.get(`refreshToken:${userId}`);
    return refreshToken;
  } catch (err) {
    throw err;
  }
};

// Function to delete a refresh token from Redis
export const deleteRefreshToken = async (userId: string): Promise<number> => {
    try {
      return await redisClient.del(`refreshToken:${userId}`);
    } catch (err) {
      throw err;
    }
  };
  
  // Function to verify a token
  export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  };

  export const verifyRefreshToken = (refreshToken: string): { userId: string } => {
    return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };
  };

import { db } from "../utils/db.server";
import bcrypt from 'bcryptjs';
import { User } from '../entities/User'

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const { username, password, name, bio, profilePicture } = user;

  const hashedPassword = await bcrypt.hash(password, 10);

  return db.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
      bio,
      profilePicture,
    },
  });
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  return db.user.findUnique({
    where: { username },
  });
};

export const getUserById = async (id: number | string): Promise<User | null> => {
  try {
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const user = await db.user.findUnique({ where: { id: userId } });

    return user;

  } catch (error) {
    // Handle any errors that occur during the query
    console.log(error);

    throw new Error('Error retrieving user by ID');
  }
};

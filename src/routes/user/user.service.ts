import { db } from "../../utils/db.server";
import bcrypt from 'bcryptjs';
import { User } from '../../entities/User'


export const createUser = async (
    user: Omit<User, "id">
  ): Promise<User> => {
    
    const { username, password } = user;

    const hashedPassword = await bcrypt.hash(password, 10);

    return db.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
  };

export const getUserByUsername = async (
    username: string
  ): Promise<User | null> => {
  
    return db.user.findUnique({
      where:{username}
    })
  };


  export const getUserById = async(id:number) : Promise<User | null> => {

    return db.user.findUnique({where:{id}})

  }





  


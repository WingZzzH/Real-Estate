import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, deleteUserByID, User} from '../models/modelUsers';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (userID: number) => {
  return jwt.sign({ userID }, process.env.JWT_SECRET as string);
};

const register = async (req: Request, res: Response) => {
  try {
    const { userName, email, password, image, phone } = req.body;

    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      userName,
      email,
      password: hashedPassword,
      image,
      phone,
      userID: 0,
      UserID: function (UserID: any): unknown {
        throw new Error('Function not implemented.');
      }
    };

    const createdUser = await createUser(newUser);

    res.status(201).json({ success: true, message: 'User registered successfully', createdUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.userID);
    res.json({ success: true, token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.userId); // Assuming userId is passed as a route parameter

  try {
    await deleteUserByID(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};



export { register, login, deleteUser };

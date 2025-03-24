import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import * as bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { firstName, lastName, username, email, password, zipCode } = req.body;

    if (!email || !password || !zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and zipCode are required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if username is taken
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken'
        });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default empty preferences
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      zipCode,
      preferences: {
        food: [],
        activities: [],
        places: [],
        custom: []
      }
    });

    // Remove password from response
    const newUser = user.toObject();
    delete newUser.password;

    res.status(201).json({
      success: true,
      message: 'User successfully registered',
      data: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
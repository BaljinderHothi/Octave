//API endpoint to handle user profile picture upload

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import formidable, { Fields, Files } from 'formidable';
import { createWriteStream } from 'fs';
import path from 'path';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    //create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    });
    //parses form data
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    //gets and validates that a file was uploaded
    const file = files.profilePicture?.[0];
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ext = path.extname(file.originalFilename || '');
    const filename = `${req.user._id}-${Date.now()}${ext}`;
    const finalPath = path.join(uploadsDir, filename);

    await fs.rename(file.filepath, finalPath);

    const pictureUrl = `/uploads/${filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture: pictureUrl } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: pictureUrl
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withAuth(handler); 
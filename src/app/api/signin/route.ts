import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import { connectToDatabase } from "../../lib/mongodb";

// Ensure you have a JWT secret in your .env file
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in your .env file");
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET!, 
      { expiresIn: "1h" }
    );


    const res = NextResponse.json(
      {
        success: true,
        user: {
          email: user.email,
          zipCode: user.zipCode,
        },
      },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true, // not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // use secure flag in production
      maxAge: 3600, // cookie expires in 1 hour
      path: "/", // available on all routes
      sameSite: "strict",
    });

    return res;
  } catch (error) {
    console.error("Error signing in:", error);
    return NextResponse.json(
      { success: false, message: "Sign in failed" },
      { status: 500 }
    );
  }
}

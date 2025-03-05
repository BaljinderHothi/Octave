import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../models/User";
import { connectToDatabase } from "../../lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, password, zipCode, preferences } = await req.json();
    //const { email, password, dob, zipCode, preferences } = await req.json();


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      zipCode,
      preferences,
      createdAt: new Date(),
    });
    
    // const newUser = await User.create({
    //   email,
    //   password: hashedPassword,
    //   dob,
    //   zipCode,
    //   preferences,
    //   createdAt: new Date(),
    // });
    

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
  }
}

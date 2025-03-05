import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../models/User";
import { connectToDatabase } from "../../lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, password, dob, zipCode, preferences } = await req.json();
    console.log("Received registration payload:", { email, password, dob, zipCode, preferences });


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const convertedDOB = {
      day: Number(dob.day),
      month: Number(dob.month),
      year: Number(dob.year),
    };
    console.log("Converted DOB:", convertedDOB);


    const newUser = await User.create({
      email,
      password: hashedPassword,
      dob: convertedDOB,
      zipCode,
      preferences,
      createdAt: new Date(),
    });
    

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
  }
}

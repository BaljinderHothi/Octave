import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const imagesDir = path.join(process.cwd(), "public/ui-images/food");

  let files: string[] = [];

  try {
    files = fs.readdirSync(imagesDir);
  } catch (error) {
    console.error("Error reading images directory:", error);
  }

  const imageFiles = files.filter((file) =>
    file.match(/\.(png|jpe?g|gif|webp|avif)$/i)
  );

  return NextResponse.json(imageFiles);
}

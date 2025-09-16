
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import User from "@/lib/database/models/user.model";
import { createUser, validateUserType } from "@/lib/actions/user.action";
import jwt from "jsonwebtoken";

interface RegisterRequestBody {
  email: string;
  fullName: string;
  photo?: string;
  password: string;
  userType: "teacher" | "student";
  teacherId?: string; // Added for student creation
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body: RegisterRequestBody = await request.json();

    // Check required fields
    if (!body.email || !body.fullName || !body.password || !body.userType) {
      return NextResponse.json(
        {
          status: "error",
          message: "email, fullName, password, and userType are required",
        },
        { status: 400 }
      );
    }

    // Normalize email
    body.email = body.email.toLowerCase();

    // Validate userType
    validateUserType(body.userType);

    // If creating a student, ensure teacherId is provided and valid
    if (body.userType === "student") {
      if (!body.teacherId) {
        return NextResponse.json(
          { status: "error", message: "teacherId is required for students" },
          { status: 400 }
        );
      }
      const teacher = await User.findOne({
        userId: body.teacherId,
        userType: "teacher",
      });
      if (!teacher) {
        return NextResponse.json(
          { status: "error", message: "Invalid teacherId" },
          { status: 400 }
        );
      }
    }

    //console.log("Register input:", body);

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      email: body.email,
      fullName: body.fullName,
      photo: body.photo,
      password: body.password,
      userType: body.userType,
      teacherId: body.userType === "student" ? body.teacherId : undefined,
    });

    if (!newUser) {
      return NextResponse.json(
        { status: "error", message: `Failed to create ${body.userType}` },
        { status: 500 }
      );
    }
    
    const response = NextResponse.json(
      {
        status: "success",
        message: `${
          body.userType.charAt(0).toUpperCase() + body.userType.slice(1)
        } registered successfully`,
        data: {
          user: {
            _id: newUser._id,
            userId: newUser.userId,
            email: newUser.email,
            fullName: newUser.fullName,
            userType: newUser.userType,
            photo: newUser.photo,
            teacherId: newUser.teacherId, // Include teacherId in response
          },
        },
      },
      { status: 201 }
    );
    
    return response;
  } catch (error: any) {
    handleError(error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

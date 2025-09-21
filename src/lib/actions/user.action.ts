
"use server";

import { revalidatePath } from "next/cache";
import User, { IUser } from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==== CREATE
export type CreateUserParams = {
  email: string;
  fullName: string;
  photo?: string;
  password: string;
  userType: "student" | "teacher";
  teacherId?: string; // Added for student creation
};

export async function validateUserType(userType: string) {
  if (!["teacher", "student"].includes(userType)) {
    throw new Error("Invalid userType. Must be 'teacher' or 'student'");
  }
}

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const newUser = await User.create({
      email: user.email,
      fullName: user.fullName,
      photo: user.photo,
      password: hashedPassword,
      userType: user.userType,
      teacherId: user.userType === 'student' ? user.teacherId : undefined,
    });

    const userObject = newUser.toObject();
    delete userObject.password; // Ensure password is not returned
    
    return userObject;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// ==== READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ userId }).lean<IUser>();

    if (!user) throw new Error("User not found");
    
    return user;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email }).lean<IUser>();
    if (!user) return null;
    return user;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// ==== UPDATE
export type UpdateUserParams = {
  fullName?: string;
  photo?: string;
};

export async function updateUser(userId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ userId }, user, {
      new: true,
    }).lean<IUser>();

    if (!updatedUser) throw new Error("User update failed");

    return updatedUser;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// ==== DELETE
export async function deleteUser(userId: string) {
  try {
    await connectToDatabase();

    const userToDelete = await User.findOne({ userId }).lean<IUser>();

    if (!userToDelete) {
      throw new Error("User not found");
    }
    
    const deletedUser = await User.findByIdAndDelete(userToDelete._id).lean<IUser>();
    
    revalidatePath("/");

    return deletedUser;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

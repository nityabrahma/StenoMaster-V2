"use server";

import { revalidatePath } from "next/cache";
import User, { IUser } from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export type CreateUserParams = {
  email: string;
  fullName: string;
  photo?: string;
  password: string;
  userType: "student" | "teacher";
  teacherId?: string; // Added for student creation
};

export type UpdateUserParams = {
  fullName?: string;
  username?: string;
  photo?: string;
};

export async function validateUserType(userType: string) {
  if (!["teacher", "student"].includes(userType)) {
    throw new Error("Invalid userType. Must be 'teacher' or 'student'");
  }
}

// user.actions.ts (partial, unchanged)
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userData = {
      email: user.email,
      fullName: user.fullName,
      photo: user.photo,
      password: hashedPassword,
      userType: user.userType,
      teacherId: user.userType === "student" ? user.teacherId : undefined,
    };
    //console.log("User data to create:", userData);
    const newUser = await User.create(userData);
    const userObject = newUser.toObject();
    //console.log("Created user:", userObject);
    return userObject;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

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

export async function validateSessionToken(token: string) {
  try {
    await connectToDatabase();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
      userId: string;
      userType: string;
    };
    const user = await User.findOne({
      userId: decoded.userId,
      sessionToken: token,
    }).lean<IUser>();
    if (!user) throw new Error("Invalid or expired session token");
    return user;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

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

export async function deleteUser(userId: string) {
  try {
    await connectToDatabase();
    const userToDelete = await User.findOne({ userId }).lean<IUser>();
    if (!userToDelete) {
      throw new Error("User not found");
    }
    const deletedUser = await User.findByIdAndDelete(
      userToDelete._id
    ).lean<IUser>();
    revalidatePath("/");
    return deletedUser;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();
    const updatedUserCredits = await User.findOneAndUpdate(
      { userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    ).lean<IUser>();
    if (!updatedUserCredits) throw new Error("User credits update failed");
    return updatedUserCredits;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    await connectToDatabase();
    const users = await User.find({}).lean<IUser[]>();
    return users;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getUsersByType(userType: "teacher" | "student") {
  try {
    await connectToDatabase();
    const users = await User.find({ userType }).lean<IUser[]>();
    return users;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getStudentsByTeacherId(teacherId: string) {
  try {
    await connectToDatabase();
    const users = await User.find({ userType: "student", teacherId }).lean<
      IUser[]
    >();
    return users;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ username }).lean<IUser>();
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        $set: { password: hashedPassword },
        $unset: { sessionToken: "" },
      },
      { new: true }
    ).lean<IUser>();
    if (!updatedUser) throw new Error("User password update failed");
    return updatedUser;
  } catch (error) {
    handleError(error);
    throw error;
  }
}


import { Schema, model, models, Document } from "mongoose";
import { nanoid } from "nanoid";

export interface IUser extends Document {
  userId: string;
  email: string;
  photo?: string;
  fullName: string;
  password?: string;
  userType: "student" | "teacher";
  sessionToken?: string;
  teacherId?: string; // For students, the ID of their teacher
}

const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(),
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false, // Not required for OAuth, but required for email/pass
    select: false, // Do not return password by default
  },
  userType: {
    type: String,
    enum: ["student", "teacher"],
    required: true,
  },
  sessionToken: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  teacherId: {
    type: String,
    // This field is only required if the userType is 'student'
    required: function (this: IUser) {
      return this.userType === "student";
    },
  },
});

const User = models?.User || model<IUser>("User", UserSchema);

export default User;

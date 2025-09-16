import { Schema, model, models, Document } from "mongoose";
import { nanoid } from "nanoid";

export interface IUser extends Document {
  userId: string;
  email: string;
  name: string;
  password?: string;
  role: "student" | "teacher";
  classIds: string[];
}

const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(10),
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Hide by default
  },
  role: {
    type: String,
    enum: ["student", "teacher"],
    required: true,
  },
  classIds: {
    type: [String],
    default: [],
  },
});

const UserModel = models.User || model<IUser>("User", UserSchema);

export default UserModel;

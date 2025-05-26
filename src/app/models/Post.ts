import mongoose, { Schema } from 'mongoose';

interface IComment {
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: Date;
}

interface IPost {
  userId: string;
  username: string;
  avatar: string;
  image: string;
  title: string;
  description: string;
  likes: string[];
  comments: IComment[];
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new Schema<IPost>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, required: true },
  image: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  likes: [{ type: String }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);
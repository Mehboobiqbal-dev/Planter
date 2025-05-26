export interface Comment {
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  userId: string;
  username: string;
  avatar: string;
  image: string;
  title: string;
  description: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
}
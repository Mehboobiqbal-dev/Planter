import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/app/lib/mongodb-client';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

// Define custom user interface
interface CustomUser extends User {
  id: string;
  email: string;
  name?: string | null;
  provider: string;
}

// Define custom session interface
interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    provider: string;
  };
}

// Define MongoDB user document interface
interface UserDocument {
  _id: ObjectId;
  email: string;
  name?: string;
  password?: string;
  provider?: string;
  [key: string]: any;
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        try {
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection<UserDocument>('users').findOne({ email: credentials.email });
          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid email or password');
          }
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            provider: 'credentials',
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  pages: { signIn: '/authmodel' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.email = customUser.email;
        token.name = customUser.name;
        token.provider = customUser.provider;
        token.sub = customUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id || token.sub || '',
        email: token.email || '',
        name: token.name || null,
        provider: token.provider || 'unknown',
      };
      return session as CustomSession;
    },
  },
};

export default NextAuth(authOptions);
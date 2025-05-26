import NextAuth, { NextAuthOptions, Session, User, JWT } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/app/lib/mongodb-client';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Define custom user interface
interface CustomUser extends User {
  id: string;
  email: string;
  name?: string | null;
  provider: string;
}

// Define custom session interface
interface CustomSession extends Session {
  accessToken?: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    provider: string;
  };
}

// Define custom JWT interface
interface CustomJWT extends JWT {
  id: string;
  email: string;
  name?: string | null;
  provider: string;
  accessToken?: string;
  sub: string;
  expiresAt?: number;
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

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          console.error('JWT_SECRET is not defined');
          throw new Error('JWT_SECRET is not defined');
        }
        const accessToken = jwt.sign(
          {
            id: customUser.id,
            email: customUser.email,
            name: customUser.name,
            provider: customUser.provider,
          },
          secret,
          { expiresIn: '1h' }
        );
        token.accessToken = accessToken;
        token.expiresAt = Math.floor(Date.now() / 1000) + 3600;
        console.log('auth.ts - JWT callback - Generated accessToken:', accessToken);
      } else if (typeof token.expiresAt === 'number' && token.expiresAt < Math.floor(Date.now() / 1000)) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          console.error('JWT_SECRET is not defined');
          throw new Error('JWT_SECRET is not defined');
        }
        if (token.id && token.email && token.provider) {
          const accessToken = jwt.sign(
            {
              id: token.id,
              email: token.email,
              name: token.name,
              provider: token.provider,
            },
            secret,
            { expiresIn: '1h' }
          );
          token.accessToken = accessToken;
          token.expiresAt = Math.floor(Date.now() / 1000) + 3600;
          console.log('auth.ts - JWT callback - Refreshed accessToken:', accessToken);
        } else {
          console.error('JWT refresh failed: Missing required token fields', { token });
        }
      }
      return token;
    },
    async session({ session, token }) {
      const customToken = token as unknown as CustomJWT;
      console.log('auth.ts - Session callback - token:', customToken);
      session.user = {
        id: customToken.id || customToken.sub,
        email: customToken.email || '',
        name: customToken.name || null,
        provider: customToken.provider || 'unknown',
      };
      session.accessToken = customToken.accessToken;
      console.log('auth.ts - Session callback - session.accessToken:', session.accessToken);
      return session as CustomSession;
    },
  },
};

export default NextAuth(authOptions);
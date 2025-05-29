// File: app/lib/auth.ts
import { NextAuthOptions, Session as NextAuthSession } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';    // ← import JWT from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/app/lib/mongodb-client'; // Ensure this path is correct
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Critical: JWT_SECRET environment variable is not set for auth.ts.");
}

// Define our application's User structure
export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
  provider: string;
  image?: string | null;
}

// Define our custom Session, ensuring user is not undefined and matches AppUser
export interface CustomSession extends NextAuthSession {
  user: AppUser;
  apiAccessToken?: string;
}

// Define the MongoDB user document structure
interface UserDocument {
  _id: ObjectId;
  email: string;
  name?: string;
  password?: string;
  provider?: string;
  image?: string;
  emailVerified?: Date | null;
  [key: string]: any;
}

// Define our custom JWT payload
export interface CustomJWT extends NextAuthJWT {
  id: string;
  email: string;
  name?: string | null;
  provider: string;
  picture?: string | null;
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
        email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.');
        }
        const { email, password } = credentials;
        try {
          const client = await clientPromise;
          const db = client.db();
          const userDoc = await db.collection<UserDocument>('users').findOne({ email });
          if (!userDoc || !userDoc.password) {
            console.log(`Authorize: No user found or no password for email: ${email}`);
            return null;
          }
          const isValid = await bcrypt.compare(password, userDoc.password);
          if (!isValid) {
            console.log(`Authorize: Invalid password for email: ${email}`);
            return null;
          }
          return {
            id: userDoc._id.toString(),
            name: userDoc.name || null,
            email: userDoc.email,
            provider: userDoc.provider || 'credentials',
            image: userDoc.image || null,
          };
        } catch (error: any) {
          console.error('Authorize error:', error.message);
          throw new Error(error.message || 'Authentication failed due to a server error.');
        }
      },
    }),
  ],
  pages: {
    signIn: '/authmodel',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    // ───────────────────────────
    //   JWT CALLBACK
    // ───────────────────────────
    async jwt(params: any): Promise<any> {
      const { token, user, account } = params;

      // When a new user signs in (via credentials or OAuth), 'user' will be populated.
      if (user) {
        // Cast to our AppUser interface
        const appUser = user as AppUser;
        token.id = appUser.id;
        token.email = appUser.email;
        token.name = appUser.name;
        token.provider = account?.provider || appUser.provider;
        token.picture = appUser.image || token.picture;
      }

      // If we already have a token from a previous call, ensure required fields are set
      if (!token.id && token.sub) {
        token.id = token.sub as string;
      }
      if (!token.email) {
        token.email = 'unknown@example.com';
      }
      if (!token.provider) {
        token.provider = 'unknown';
      }

      // Return the token object (NextAuthJWT is a Record<string, unknown>, so adding arbitrary fields is allowed)
      return token;
    },

    // ───────────────────────────
    //   SESSION CALLBACK
    // ───────────────────────────
    async session(params: any): Promise<any> {
      const { session, token } = params;
      // We know that 'token' now has id, email, name, provider, picture
      const jwtToken = token as any;
      const newSession = session as any;

      // Overwrite session.user with our AppUser shape
      newSession.user = {
        id: jwtToken.id as string,
        email: jwtToken.email as string,
        name: jwtToken.name as string | null,
        provider: jwtToken.provider as string,
        image: jwtToken.picture as string | null,
      };

      // Create a short-lived API access token using our JWT_SECRET
      if (jwtToken.id && JWT_SECRET) {
        const apiTokenPayload = {
          userId: jwtToken.id,
          email: jwtToken.email,
        };
        newSession.apiAccessToken = jwt.sign(apiTokenPayload, JWT_SECRET, {
          expiresIn: '15m',
        });
      }

      return newSession;
    },
  },
};

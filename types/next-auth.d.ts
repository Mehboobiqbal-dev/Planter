// File: types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    /** The fields you added in `callbacks.session` */
    user: {
      id: string;
      email: string;
      name?: string | null;
      provider: string;
      image?: string | null;
    } & DefaultSession['user'];
    apiAccessToken?: string;
  }

  interface User {
    /** NextAuth will put these fields into `token` in your `jwt` callback */
    id: string;
  }
}

// If you ever use `next-auth/jwt`, also augment that:
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    provider: string;
    picture?: string | null;
  }
}

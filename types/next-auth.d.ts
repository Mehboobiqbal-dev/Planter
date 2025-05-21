import { Session, JWT } from 'next-auth';

// Extend the Session type to include accessToken
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      provider: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    provider: string;
    accessToken?: string;
  }
}
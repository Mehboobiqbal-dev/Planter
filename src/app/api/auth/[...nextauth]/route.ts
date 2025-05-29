import NextAuth from 'next-auth';
import { authOptions } from '@/app/lib/auth'; // Correctly imports authOptions

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export for GET and POST HTTP methods
export { handler as GET, handler as POST };
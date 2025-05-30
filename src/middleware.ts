import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow unauthenticated access to NextAuth routes
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Protect internal API routes with INTERNAL_API_TOKEN
  if (path.startsWith('/api/internal')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token || token !== process.env.INTERNAL_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Public API routes handle their own JWT auth
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/internal/:path*', '/api/auth/:path*'],
};
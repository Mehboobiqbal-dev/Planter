
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  provider?: string;
}

export function verifyToken(request: Request): DecodedToken | NextResponse {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Unauthorized: Missing or invalid bearer token' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }
}

export function withAuth(handler: (request: Request, decoded: DecodedToken) => Promise<NextResponse>) {
  return async (request: Request) => {
    const result = verifyToken(request);

    if (result instanceof NextResponse) {
      return result;
    }

    const decoded = result as DecodedToken;
    return handler(request, decoded);
  };
}

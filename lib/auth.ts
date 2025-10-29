import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  adminId?: string;
  username?: string;
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random',
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}

export async function getAdminFromSession(): Promise<{ adminId: string; username: string } | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.adminId || !session.username) {
    return null;
  }
  return {
    adminId: session.adminId,
    username: session.username,
  };
}

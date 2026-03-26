import { Router, Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../config/prisma';
import { generateToken, verifyToken } from '../services/auth.service';
import { env } from '../config/env';

const router = Router();

// Set up Google Strategy only if credentials are configured
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value ?? '';
          const user = await prisma.user.upsert({
            where: { googleId: profile.id },
            update: {
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            },
            create: {
              googleId: profile.id,
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            },
          });
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

// Google OAuth initiation
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const redirectUrl = `${env.WEB_URL}/auth/callback?token=${token}`;
    res.redirect(redirectUrl);
  }
);

// Email + password login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dev login (disabled in production)
router.post('/dev-login', async (req: Request, res: Response) => {
  if (env.NODE_ENV === 'production') {
    res.status(404).send();
    return;
  }
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

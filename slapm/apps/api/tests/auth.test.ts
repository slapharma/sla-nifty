import { generateToken, verifyToken } from '../src/services/auth.service';

describe('Auth Service', () => {
  const payload = { userId: 'cuid123', email: 'test@test.com', role: 'MEMBER' as const };

  it('generates a JWT string with 3 parts', () => {
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifies a valid token and returns the payload', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('throws JsonWebTokenError on invalid token', () => {
    expect(() => verifyToken('invalid.token.string')).toThrow();
  });

  it('throws TokenExpiredError on expired token', () => {
    // Sign with -1s expiry (already expired)
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET ?? 'dev_jwt_secret_change_in_production';
    const expired = jwt.sign(payload, secret, { expiresIn: -1 });
    expect(() => verifyToken(expired)).toThrow();
  });
});

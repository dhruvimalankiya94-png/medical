const { app, request, createUser, auth, DEFAULT_PASSWORD } = require('./helpers');
const User = require('../models/User');
const crypto = require('crypto');

jest.mock('../services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue({
    messageId: 'test-message-id',
    mode: 'ethereal',
    previewUrl: 'https://ethereal.email/message/test',
  }),
  sendMail: jest.fn(),
  hasSmtpConfig: jest.fn().mockReturnValue(false),
}));

const { sendPasswordResetEmail } = require('../services/emailService');

describe('POST /api/auth/register', () => {
  it('creates an account and returns a JWT', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'new.user@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('new.user@example.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', email: 'short@example.com', password: 'abc123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 8 characters/i);
  });

  it('rejects a duplicate email', async () => {
    await createUser({ email: 'dupe@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dupe', email: 'dupe@example.com', password: 'Password123!' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('rejects a malformed email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad', email: 'not-an-email', password: 'Password123!' });

    expect(res.status).toBe(400);
  });

  it('stores the password as a bcrypt hash, never in plain text', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Hashed',
      email: 'hashed@example.com',
      password: 'Password123!',
    });

    const stored = await User.findOne({ email: 'hashed@example.com' }).select('+password');
    expect(stored.password).not.toBe('Password123!');
    expect(stored.password).toMatch(/^\$2[aby]\$/);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const { email } = await createUser();
    const res = await request(app).post('/api/auth/login').send({ email, password: DEFAULT_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects a wrong password with 401', async () => {
    const { email } = await createUser();
    const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('rejects an unknown email with 401 and the same message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});

describe('Protected route access', () => {
  it('denies access with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token');
  });

  it('denies access with a tampered token', async () => {
    const { token } = await createUser();
    const tampered = `${token.slice(0, -3)}xyz`;
    const res = await auth(request(app).get('/api/auth/me'), tampered);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, token failed');
  });

  it('allows access with a valid token', async () => {
    const { token, email } = await createUser();
    const res = await auth(request(app).get('/api/auth/me'), token);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 401, not 500, when the account behind a valid token is gone', async () => {
    const { token, user } = await createUser();
    await User.findByIdAndDelete(user._id);

    const res = await auth(request(app).get('/api/auth/me'), token);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no longer exists/i);
  });

  it('blocks a deactivated account with 403', async () => {
    const { token, user } = await createUser();
    await User.findByIdAndUpdate(user._id, { isActive: false });

    const res = await auth(request(app).get('/api/auth/me'), token);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/deactivated/i);
  });
});

describe('Password reset flow', () => {
  beforeEach(() => {
    sendPasswordResetEmail.mockClear();
  });

  it('emails a reset link and never returns the raw token', async () => {
    const { email } = await createUser();
    const res = await request(app).post('/api/auth/forgot-password').send({ email });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('resetToken');
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(sendPasswordResetEmail.mock.calls[0][0].to).toBe(email);
  });

  it('stores only the SHA-256 digest of the token', async () => {
    const { email } = await createUser();
    await request(app).post('/api/auth/forgot-password').send({ email });

    const rawToken = new URL(sendPasswordResetEmail.mock.calls[0][0].resetUrl).searchParams.get('token');
    const stored = await User.findOne({ email }).select('+resetPasswordToken');

    expect(rawToken).toHaveLength(64);
    expect(stored.resetPasswordToken).not.toBe(rawToken);
    expect(stored.resetPasswordToken).toBe(crypto.createHash('sha256').update(rawToken).digest('hex'));
  });

  it('answers identically for an unregistered email and sends nothing', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account exists/i);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('resets the password with a valid token and invalidates the old one', async () => {
    const { email } = await createUser();
    await request(app).post('/api/auth/forgot-password').send({ email });
    const rawToken = new URL(sendPasswordResetEmail.mock.calls[0][0].resetUrl).searchParams.get('token');

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ resetToken: rawToken, newPassword: 'BrandNew123!' });
    expect(reset.status).toBe(200);

    const newLogin = await request(app).post('/api/auth/login').send({ email, password: 'BrandNew123!' });
    expect(newLogin.status).toBe(200);

    const oldLogin = await request(app).post('/api/auth/login').send({ email, password: DEFAULT_PASSWORD });
    expect(oldLogin.status).toBe(401);
  });

  it('refuses to reuse a reset token', async () => {
    const { email } = await createUser();
    await request(app).post('/api/auth/forgot-password').send({ email });
    const rawToken = new URL(sendPasswordResetEmail.mock.calls[0][0].resetUrl).searchParams.get('token');

    await request(app).post('/api/auth/reset-password').send({ resetToken: rawToken, newPassword: 'FirstUse123!' });
    const second = await request(app)
      .post('/api/auth/reset-password')
      .send({ resetToken: rawToken, newPassword: 'SecondUse123!' });

    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/invalid or expired/i);
  });

  it('rejects an expired reset token', async () => {
    const { email } = await createUser();
    await request(app).post('/api/auth/forgot-password').send({ email });
    const rawToken = new URL(sendPasswordResetEmail.mock.calls[0][0].resetUrl).searchParams.get('token');

    await User.findOneAndUpdate({ email }, { resetPasswordExpire: Date.now() - 1000 });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ resetToken: rawToken, newPassword: 'TooLate123!' });

    expect(res.status).toBe(400);
  });

  it('clears the stored token when the email fails to send', async () => {
    const { email } = await createUser();
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('SMTP down'));

    const res = await request(app).post('/api/auth/forgot-password').send({ email });

    expect(res.status).toBe(502);
    const stored = await User.findOne({ email }).select('+resetPasswordToken');
    expect(stored.resetPasswordToken).toBeNull();
  });
});

describe('PUT /api/auth/change-password', () => {
  it('changes the password with the correct current password', async () => {
    const { token, email } = await createUser();

    const res = await auth(request(app).put('/api/auth/change-password'), token)
      .send({ currentPassword: DEFAULT_PASSWORD, newPassword: 'Changed123!' });

    expect(res.status).toBe(200);
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Changed123!' });
    expect(login.status).toBe(200);
  });

  it('rejects an incorrect current password', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).put('/api/auth/change-password'), token)
      .send({ currentPassword: 'Nope123456!', newPassword: 'Changed123!' });

    expect(res.status).toBe(401);
  });

  it('rejects a new password shorter than 8 characters', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).put('/api/auth/change-password'), token)
      .send({ currentPassword: DEFAULT_PASSWORD, newPassword: 'short' });

    expect(res.status).toBe(400);
  });

  it('rejects reusing the current password', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).put('/api/auth/change-password'), token)
      .send({ currentPassword: DEFAULT_PASSWORD, newPassword: DEFAULT_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/different/i);
  });

  it('requires authentication', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .send({ currentPassword: DEFAULT_PASSWORD, newPassword: 'Changed123!' });

    expect(res.status).toBe(401);
  });
});

describe('Account preferences', () => {
  it('returns schema defaults for a new account', async () => {
    const { token } = await createUser();
    const res = await auth(request(app).get('/api/auth/preferences'), token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      emailAlerts: true,
      weeklyReportEmail: true,
      criticalAlertEmail: true,
      anonymizeData: false,
      shareWithPhysician: false,
    });
  });

  it('persists updated preferences', async () => {
    const { token } = await createUser();
    await auth(request(app).put('/api/auth/preferences'), token)
      .send({ emailAlerts: false, shareWithPhysician: true });

    const res = await auth(request(app).get('/api/auth/preferences'), token);
    expect(res.body.emailAlerts).toBe(false);
    expect(res.body.shareWithPhysician).toBe(true);
    expect(res.body.weeklyReportEmail).toBe(true);
  });

  it('ignores fields outside the preference whitelist', async () => {
    const { token, user } = await createUser();
    await auth(request(app).put('/api/auth/preferences'), token)
      .send({ emailAlerts: false, role: 'admin', password: 'hacked' });

    const me = await auth(request(app).get('/api/auth/me'), token);
    expect(me.body.role).toBe('patient');

    const stored = await User.findById(user._id).select('+password');
    const stillValid = await stored.matchPassword(DEFAULT_PASSWORD);
    expect(stillValid).toBe(true);
  });
});

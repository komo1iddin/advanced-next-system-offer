# Password Migration Scripts

This directory contains scripts to handle the migration from bcrypt to Node.js crypto module for password hashing.

## Migration Strategy

We've migrated from using `bcrypt` to Node.js native `crypto` module for password hashing. The new password format is: `salt:hash` where:
- `salt` is a random 16-byte hex string
- `hash` is a 64-byte scrypt-derived key

## Migration Scripts

### 1. Test Migration (For Development Only)

The `migratePasswords.ts` script attempts to migrate passwords automatically, but requires access to plaintext passwords for testing. This is typically only useful in development environments where test passwords are known.

```bash
npm run migrate:passwords
```

**Warning**: This approach has limitations in production since plaintext passwords are not normally stored or accessible.

### 2. Force Password Reset (Recommended for Production)

The `forceResetPasswords.ts` script is the recommended approach for production systems:

1. It sends password reset emails to all active users
2. When users reset their passwords, they will automatically use the new crypto-based hashing

```bash
npm run reset:passwords
```

## Migration Workflow

1. **Preparation**:
   - Back up your database before migration
   - Update environment variables in `.env`:
     ```
     # Email settings for password reset
     EMAIL_HOST=smtp.example.com
     EMAIL_PORT=587
     EMAIL_SECURE=false
     EMAIL_USER=username
     EMAIL_PASS=password
     EMAIL_FROM=no-reply@example.com
     FRONTEND_URL=https://yourdomain.com
     ```

2. **Code Migration**:
   - Deploy the application with the updated crypto-based password hashing code
   - The system can handle both bcrypt and crypto formats during the transition

3. **Force Password Reset**:
   - Run the reset script: `npm run reset:passwords`
   - Users will receive password reset emails
   - As users reset their passwords, they'll automatically use the new format

4. **Monitor Progress**:
   - The script outputs logs and statistics
   - Implement additional monitoring if needed

## Notes on Security

1. Password Strength: scrypt with these parameters (N=16384, r=8, p=1, keyLength=64) provides strong security
2. Salt: Each password uses a unique 16-byte random salt
3. Timing Attacks: We use `timingSafeEqual` to prevent timing-based attacks

## Troubleshooting

- If emails aren't sending, check your SMTP settings
- If users report issues, you can manually reset their password tokens
- For further assistance, contact the development team 
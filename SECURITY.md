# Security Guidelines

## Environment Variables

This application uses environment variables to manage sensitive configuration. Never commit real API keys, passwords, or tokens to version control.

### Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in the `.env` file

3. Never commit `.env` to version control (it's already in `.gitignore`)

### Required Environment Variables

- `SESSION_SECRET` - Generate a strong secret with: `openssl rand -base64 32`
- `DATABASE_URL` - Your PostgreSQL connection string
- `VITE_MAPBOX_TOKEN` - Your Mapbox public token for the client

### Security Best Practices

1. **API Keys**: Always use environment variables for API keys
2. **Session Secrets**: Use strong, randomly generated secrets in production
3. **HTTPS**: Always use HTTPS in production
4. **Database**: Use strong passwords and SSL connections for databases
5. **File Uploads**: Validate and sanitize all file uploads
6. **Input Validation**: Always validate user input on both client and server
7. **Dependencies**: Keep all dependencies up to date

### Generating Secure Secrets

Generate secure random strings for production:

```bash
# For session secrets
openssl rand -base64 32

# For JWT secrets
openssl rand -base64 64

# For general API keys
openssl rand -hex 32
```

### Security Headers

The application includes security headers for:
- CORS protection
- XSS prevention
- Content Security Policy
- HTTPS enforcement (in production)

### Reporting Security Issues

If you discover a security vulnerability, please email security@internetprovideranalytics.com instead of using the issue tracker.

## Deployment Security Checklist

- [ ] All environment variables are set with secure values
- [ ] `.env` file is not included in deployment
- [ ] HTTPS is enabled
- [ ] Database uses SSL connections
- [ ] All dependencies are up to date
- [ ] Rate limiting is configured
- [ ] Error messages don't expose sensitive information
- [ ] Logging doesn't include sensitive data
- [ ] File upload restrictions are in place
- [ ] Input validation is implemented
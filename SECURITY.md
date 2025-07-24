# Security Configuration

## Required Steps to Fix Browser Security Warnings

### 1. Install Security Dependencies
```bash
cd backend
npm install helmet express-rate-limit
```

### 2. Environment Variables
Create a `.env` file in the backend directory with:
```
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-strong-jwt-secret
ADMIN_SECRET_KEY=your-admin-secret
```

### 3. SSL Certificate
- Use a valid SSL certificate (Let's Encrypt, Cloudflare, etc.)
- Ensure your domain has HTTPS enabled

### 4. Domain Configuration
- Use a proper domain name (not IP address)
- Configure DNS properly
- Ensure domain is not flagged by security services

### 5. Deployment Platform Security
If using Vercel/Netlify:
- Enable security headers in platform settings
- Configure custom domain with SSL
- Set proper environment variables

### 6. Content Security Policy
The app includes CSP headers to prevent XSS attacks:
- Only allows resources from same origin
- Allows specific external resources (fonts, images)
- Blocks inline scripts (except where necessary)

### 7. Rate Limiting
- Limits requests to 100 per 15 minutes per IP
- Prevents DDoS and brute force attacks

### 8. Additional Security Measures
- Use strong JWT secrets
- Implement proper authentication
- Validate all user inputs
- Use HTTPS everywhere
- Keep dependencies updated

## Common Issues and Solutions

### "Dangerous Site" Warning
This usually occurs due to:
1. Missing SSL certificate
2. Self-signed certificate
3. Domain flagged by Google Safe Browsing
4. Mixed content (HTTP resources on HTTPS site)

### Solutions:
1. Get a valid SSL certificate
2. Use a proper domain name
3. Check Google Search Console for security issues
4. Ensure all resources use HTTPS
5. Submit site for review if falsely flagged
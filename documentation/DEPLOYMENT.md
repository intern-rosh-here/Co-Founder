# Deployment Guide

## Production Deployment

### Frontend Deployment (Vercel)

```bash
cd frontend
npm run build
vercel deploy --prod
```

### Backend Deployment (AWS/Heroku)

```bash
cd backend
git push heroku main
```

### Docker Deployment

```bash
docker-compose -f docker-compose.yml up -d
```

## Environment Setup

Ensure all environment variables are set in production:
- MONGODB_URI
- JWT_SECRET
- All third-party API keys

## Monitoring

- Set up error tracking (Sentry)
- Configure logging
- Set up monitoring dashboard

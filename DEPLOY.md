# Deploying Running Events Hub to Render

This guide explains how to deploy the Running Events Hub application to Render for free.

## Prerequisites

1. A [Render account](https://render.com/) (free signup)
2. Your code hosted on GitHub

## Deployment Steps

### Method 1: Deploy using Blueprint (Easiest)

1. Push all your code changes to GitHub
2. Log in to your Render account
3. Go to the Dashboard and click "New" > "Blueprint"
4. Connect your GitHub repository
5. Select the repository containing Running Events Hub
6. Render will automatically detect the `render.yaml` file and configure your services
7. Click "Apply" to start the deployment

### Method 2: Manual Deployment

If the Blueprint method doesn't work for some reason, you can manually deploy each component:

#### 1. Deploy the PostgreSQL Database

1. In your Render dashboard, click "New" > "PostgreSQL"
2. Set the name to "running-events-db" 
3. Choose the Free plan
4. Set region to Ohio (or your preferred region)
5. Click "Create Database"
6. Save the connection string for the next step

#### 2. Deploy the Backend API

1. Click "New" > "Web Service"
2. Connect to your GitHub repository
3. Select the repository
4. Use the following settings:
   - Name: running-events-hub-api
   - Environment: Python 3
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && ./render_start.sh`
5. Add the following environment variables:
   - DATABASE_URL: (paste the connection string from step 1)
   - ALLOW_ALL_ORIGINS: true
6. Click "Create Web Service"

#### 3. Deploy the Frontend

1. Click "New" > "Static Site"
2. Select your GitHub repository
3. Use the following settings:
   - Name: running-events-hub-frontend
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Add the environment variable:
   - VITE_API_URL: (your backend API URL from step 2) + "/api"
5. Click "Create Static Site"

## Setting Up Scheduled Scraping (Optional)

To run the scraper on a schedule in production:

1. In your Render dashboard, click "New" > "Background Worker"
2. Connect to your GitHub repository
3. Use the following settings:
   - Name: running-events-scraper
   - Environment: Python 3
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python -m app.scripts.scheduler`
4. Add the same environment variables as the backend
5. Click "Create Background Worker"

## Troubleshooting

- **CORS Issues**: If you experience CORS issues, check that the frontend is making requests to the correct API URL.
- **Database Connection Errors**: Verify that the DATABASE_URL environment variable is correct.
- **Build Failures**: Check the build logs in Render dashboard for specific errors.

## Note about Free Tier Limitations

Render's free tier has some limitations:
- PostgreSQL databases are deleted after 90 days of inactivity
- Free web services are spun down after 15 minutes of inactivity and can take a few seconds to spin back up
- Limited resources might affect your app's performance

For a production application with higher reliability, consider upgrading to Render's paid plans. 
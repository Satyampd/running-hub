# Running Events Hub - Setup Guide

This guide provides detailed instructions for setting up and running the Running Events Hub application locally for development or testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.9+**
   - Check with: `python --version` or `python3 --version`
   - Download from: [python.org](https://www.python.org/downloads/)

2. **Node.js 16+**
   - Check with: `node --version`
   - Download from: [nodejs.org](https://nodejs.org/)

3. **PostgreSQL 13+**
   - Check with: `psql --version`
   - Download from: [postgresql.org](https://www.postgresql.org/download/)

4. **Git**
   - Check with: `git --version`
   - Download from: [git-scm.com](https://git-scm.com/downloads)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/running-hub.git
cd running-hub
```

## Step 2: Set Up the Backend

### Create and Activate a Virtual Environment

#### On macOS/Linux:
```bash
cd backend
python -m venv venv
source venv/bin/activate
```

#### On Windows:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Set Up PostgreSQL Database

1. Create a new PostgreSQL database:
```bash
psql -U postgres
```

2. In the PostgreSQL shell:
```sql
CREATE DATABASE running_events;
\q
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/running_events
```

Adjust the username, password, and database name if necessary.

### Initialize the Database

```bash
python app/scripts/create_db.py
```

### Run the Backend Server

```bash
uvicorn app.main:app --reload --port 8001
```

The backend API will be available at http://localhost:8001

## Step 3: Set Up the Frontend

### Install Frontend Dependencies

Open a new terminal window:

```bash
cd running-hub/frontend
npm install
```

### Configure Environment Variables

Create a `.env` file in the `frontend` directory with the following content:

```
VITE_API_URL=http://localhost:8001/api
```

### Start the Development Server

```bash
npm run dev
```

The frontend application will be available at http://localhost:5173

## Step 4: Populate the Database with Events

To scrape events and populate the database:

```bash
# In the backend directory, with the virtual environment activated
python -m app.scripts.smart_scraper
```

This will run the scrapers and populate your database with running events.

## Testing the Application

1. Open your browser and navigate to http://localhost:5173
2. Browse the events, use filters, and test the functionality
3. Check the API directly at http://localhost:8001/docs to explore available endpoints

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
   - On macOS/Linux: `sudo service postgresql status` or `pg_ctl status`
   - On Windows: Check Services app

2. Verify connection string in `.env` file:
   - Format: `postgresql://username:password@host:port/database_name`
   - Default local connection: `postgresql://postgres:postgres@localhost:5432/running_events`

3. Test database connection:
   ```bash
   psql -U postgres -d running_events
   ```

### Backend Server Issues

1. Check for errors in the terminal where the backend is running
2. Verify Python dependencies are installed correctly:
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

3. Ensure the virtual environment is activated (you should see `(venv)` in your terminal)

### Frontend Issues

1. Check for errors in the browser console (F12 > Console)
2. Verify Node.js dependencies are installed:
   ```bash
   npm install --force
   ```

3. Make sure the backend API is running and accessible
4. Check that the `VITE_API_URL` environment variable is set correctly

### Scraper Issues

1. Some websites may block scraping attempts. Try running with the debug flag:
   ```bash
   python -m app.scripts.smart_scraper --debug
   ```

2. Check network connectivity to the source websites
3. Source websites may have changed their structure, requiring scraper updates

## Running in Production Mode

### Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
npm run build
```

Serve the built files from the `dist` directory using a static file server like nginx or:
```bash
npm install -g serve
serve -s dist
```

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Next Steps

After setting up the application, you might want to:

1. Explore the code to understand how it works
2. Add more scrapers for additional event sources
3. Implement new features
4. Contribute improvements back to the project

For more detailed technical information, refer to the [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) file. 
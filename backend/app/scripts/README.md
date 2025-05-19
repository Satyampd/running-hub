# Smart Event Scraper

This directory contains scripts for efficiently scraping running event data while avoiding duplicates and unnecessary re-scraping.

## Features

- Avoids scraping URLs that are already in the database
- Detects and handles duplicates before database insertion
- Updates events only when necessary (title, date, or price changes)
- Provides detailed statistics about scraping operations
- Includes CLI with various options for different use cases

## Usage

### Basic Usage

Run the smart scraper to process all configured sources:

```bash
python -m app.scripts.scrape_cli --all
```

### List Available Sources

To see all available scraper sources:

```bash
python -m app.scripts.scrape_cli --list
```

### Scrape a Specific Source

To scrape events from a specific source (e.g., BhaagoIndia):

```bash
python -m app.scripts.scrape_cli --source BhaagoIndia
```

### Verbose Mode

For more detailed logging:

```bash
python -m app.scripts.scrape_cli --all --verbose
```

## Integration with Cron

You can set up a cron job to run the scraper automatically. For example, to run it daily at midnight:

```bash
0 0 * * * cd /path/to/running-events-hub && /path/to/python -m backend.app.scripts.scrape_cli --all > /path/to/logs/daily_scrape.log 2>&1
```

## How It Works

1. The smart scraper first retrieves all existing URLs from the database
2. It then runs the scrapers to collect event data
3. For each event:
   - If the URL is already in the database, it checks if anything has changed
   - If changes are detected, it updates the database entry
   - If the URL is new, it adds a new entry
4. It keeps track of duplicates within the current scraping batch
5. Finally, it provides statistics about what was done

This approach minimizes database operations and avoids redundant scraping work.

## Development

To modify or extend the scrapers:

1. Add new scrapers to the `backend/app/scrapers` directory
2. Register them in the `ScraperManager` class
3. Run the script with the `--list` option to verify they appear 
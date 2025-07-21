#!/usr/bin/env python3
"""
Polymarket Trade Data Scraper - Scheduled Version
Can be run with environment variables to control behavior
"""

import requests
import psycopg2
import psycopg2.extras
import time
import logging
import os
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Only console logging for Railway
    ]
)
logger = logging.getLogger(__name__)

# Database connection - Railway automatically provides DATABASE_URL environment variable
DATABASE_URL = os.getenv('DATABASE_URL')

# API configuration - can be overridden with environment variables
API_BASE_URL = 'https://data-api.polymarket.com/trades'
RECORDS_PER_PAGE = int(os.getenv('RECORDS_PER_PAGE', '500'))
TOTAL_PAGES = int(os.getenv('TOTAL_PAGES', '4000'))
REQUEST_DELAY = int(os.getenv('REQUEST_DELAY', '5'))  # seconds between requests
RETRY_DELAY = int(os.getenv('RETRY_DELAY', '20'))   # seconds to wait before retry
MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))

class PolymarketScraper:
    def __init__(self):
        self.conn = None
        self.cursor = None
        self.total_new_records = 0
        self.total_duplicates = 0
        self.total_errors = 0

    def connect_db(self):
        """Establish database connection"""
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")
        
        try:
            self.conn = psycopg2.connect(DATABASE_URL)
            self.cursor = self.conn.cursor()
            logger.info("Successfully connected to PostgreSQL database")
        except psycopg2.Error as e:
            logger.error(f"Error connecting to database: {e}")
            raise

    def create_table(self):
        """Create trades_data table with proper schema and indexes"""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS trades_data (
            proxyWallet TEXT,
            side TEXT,
            asset TEXT,
            conditionId TEXT,
            size REAL,
            price REAL,
            timestamp INTEGER,
            title TEXT,
            slug TEXT,
            icon TEXT,
            eventSlug TEXT,
            outcome TEXT,
            outcomeIndex INTEGER,
            name TEXT,
            pseudonym TEXT,
            bio TEXT,
            profileImage TEXT,
            profileImageOptimized TEXT,
            transactionHash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """

        # Create unique constraint
        unique_constraint_sql = """
        CREATE UNIQUE INDEX IF NOT EXISTS unique_trade_record 
        ON trades_data (transactionHash, proxyWallet, asset, timestamp);
        """

        # Create other indexes
        indexes_sql = [
            "CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades_data (timestamp);",
            "CREATE INDEX IF NOT EXISTS idx_trades_asset_timestamp_size_price ON trades_data (asset, timestamp, size, price);",
            "CREATE INDEX IF NOT EXISTS idx_trades_asset ON trades_data (asset);",
            "CREATE INDEX IF NOT EXISTS idx_trades_asset_timestamp ON trades_data (asset, timestamp);",
            "CREATE INDEX IF NOT EXISTS idx_trades_size ON trades_data (size);",
            "CREATE INDEX IF NOT EXISTS idx_trades_side ON trades_data (side);",
            "CREATE INDEX IF NOT EXISTS idx_trades_price ON trades_data (price);",
            "CREATE INDEX IF NOT EXISTS idx_trades_conditionId ON trades_data (conditionId);"
        ]

        try:
            # Create table
            self.cursor.execute(create_table_sql)
            logger.info("Created/verified trades_data table")

            # Create unique constraint
            self.cursor.execute(unique_constraint_sql)
            logger.info("Created/verified unique constraint")

            # Create indexes
            for index_sql in indexes_sql:
                self.cursor.execute(index_sql)
            logger.info("Created/verified all indexes")

            self.conn.commit()
        except psycopg2.Error as e:
            logger.error(f"Error creating table/indexes: {e}")
            self.conn.rollback()
            raise

    def fetch_page(self, offset: int) -> List[Dict[str, Any]]:
        """Fetch a single page of data from the API with retry logic"""
        url = f"{API_BASE_URL}?limit={RECORDS_PER_PAGE}&offset={offset}"
        
        for attempt in range(MAX_RETRIES + 1):
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                data = response.json()
                logger.debug(f"Successfully fetched page at offset {offset}, got {len(data)} records")
                return data
            except requests.exceptions.RequestException as e:
                if attempt < MAX_RETRIES:
                    logger.warning(f"API request failed (attempt {attempt + 1}/{MAX_RETRIES + 1}): {e}")
                    logger.info(f"Waiting {RETRY_DELAY} seconds before retry...")
                    time.sleep(RETRY_DELAY)
                else:
                    logger.error(f"API request failed after {MAX_RETRIES + 1} attempts: {e}")
                    raise

    def insert_records(self, records: List[Dict[str, Any]]) -> tuple:
        """Insert records into database, handling duplicates"""
        if not records:
            return 0, 0, 0

        insert_sql = """
        INSERT INTO trades_data (
            proxyWallet, side, asset, conditionId, size, price, timestamp,
            title, slug, icon, eventSlug, outcome, outcomeIndex, name,
            pseudonym, bio, profileImage, profileImageOptimized, transactionHash
        ) VALUES (
            %(proxyWallet)s, %(side)s, %(asset)s, %(conditionId)s, %(size)s, 
            %(price)s, %(timestamp)s, %(title)s, %(slug)s, %(icon)s, 
            %(eventSlug)s, %(outcome)s, %(outcomeIndex)s, %(name)s, 
            %(pseudonym)s, %(bio)s, %(profileImage)s, %(profileImageOptimized)s, 
            %(transactionHash)s
        )
        """

        new_count = 0
        duplicate_count = 0
        error_count = 0

        for record in records:
            try:
                # Clean the record (convert None to empty string for text fields)
                cleaned_record = {}
                for key, value in record.items():
                    if key in ['bio', 'profileImage', 'profileImageOptimized', 'name', 'pseudonym'] and value is None:
                        cleaned_record[key] = ''
                    else:
                        cleaned_record[key] = value

                self.cursor.execute(insert_sql, cleaned_record)
                new_count += 1
            except psycopg2.IntegrityError as e:
                if 'unique_trade_record' in str(e):
                    duplicate_count += 1
                    logger.debug(f"Duplicate record skipped: {record.get('transactionHash', 'unknown')}")
                else:
                    error_count += 1
                    logger.warning(f"Integrity error inserting record: {e}")
                self.conn.rollback()
            except psycopg2.Error as e:
                error_count += 1
                logger.error(f"Database error inserting record: {e}")
                self.conn.rollback()

        # Commit successful insertions
        try:
            self.conn.commit()
        except psycopg2.Error as e:
            logger.error(f"Error committing transaction: {e}")
            self.conn.rollback()

        return new_count, duplicate_count, error_count

    def run_scraper(self):
        """Main scraping loop"""
        logger.info(f"Starting Polymarket scraper - fetching {TOTAL_PAGES} pages")
        logger.info(f"Configuration: {RECORDS_PER_PAGE} records/page, {REQUEST_DELAY}s delay, {MAX_RETRIES} retries")
        
        try:
            self.connect_db()
            self.create_table()
            
            for page in range(TOTAL_PAGES):
                offset = page * RECORDS_PER_PAGE
                
                try:
                    # Fetch data
                    logger.info(f"Processing page {page + 1}/{TOTAL_PAGES} (offset: {offset})")
                    records = self.fetch_page(offset)
                    
                    if not records:
                        logger.warning(f"No records returned for page {page + 1}")
                        continue
                    
                    # Insert data
                    new_count, duplicate_count, error_count = self.insert_records(records)
                    
                    # Update totals
                    self.total_new_records += new_count
                    self.total_duplicates += duplicate_count
                    self.total_errors += error_count
                    
                    # Log progress
                    logger.info(f"Page {page + 1} complete: {new_count} new, {duplicate_count} duplicates, {error_count} errors")
                    logger.info(f"Total so far: {self.total_new_records} new, {self.total_duplicates} duplicates, {self.total_errors} errors")
                    
                    # Wait before next request (except for last page)
                    if page < TOTAL_PAGES - 1:
                        time.sleep(REQUEST_DELAY)
                        
                except Exception as e:
                    logger.error(f"Error processing page {page + 1}: {e}")
                    self.total_errors += 1
                    continue
            
            # Final summary
            logger.info("=" * 50)
            logger.info("SCRAPING COMPLETE")
            logger.info(f"Total new records inserted: {self.total_new_records}")
            logger.info(f"Total duplicates skipped: {self.total_duplicates}")
            logger.info(f"Total errors: {self.total_errors}")
            logger.info("=" * 50)
            
        except Exception as e:
            logger.error(f"Fatal error in scraper: {e}")
            raise
        finally:
            if self.cursor:
                self.cursor.close()
            if self.conn:
                self.conn.close()
            logger.info("Database connection closed")

def main():
    """Main entry point"""
    scraper = PolymarketScraper()
    scraper.run_scraper()

if __name__ == "__main__":
    main()
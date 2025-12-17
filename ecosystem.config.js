/**
 * PM2 Ecosystem Configuration
 * 
 * This file manages both the Next.js app and Python scraper services
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'python-scraper',
      script: 'venv/bin/uvicorn',
      args: 'api_wrapper:app --host 0.0.0.0 --port 8000',
      cwd: './app/admin/Scrape_Master',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2/python-scraper-error.log',
      out_file: './logs/pm2/python-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'zaytoonz-ngo',
      script: 'npm',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2/zaytoonz-ngo-error.log',
      out_file: './logs/pm2/zaytoonz-ngo-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '2G',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};


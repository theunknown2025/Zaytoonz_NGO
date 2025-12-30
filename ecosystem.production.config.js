module.exports = {
  apps: [
    {
      name: 'zaytoonz-ngo',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/zaytoonz-ngo',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/zaytoonz-ngo-error.log',
      out_file: '/var/log/pm2/zaytoonz-ngo-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'python-scraper',
      script: 'venv/bin/uvicorn',
      args: 'api_wrapper:app --host 0.0.0.0 --port 8000 --workers 2',
      cwd: '/var/www/zaytoonz-ngo/python_scraper',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      },
      error_file: '/var/log/pm2/python-scraper-error.log',
      out_file: '/var/log/pm2/python-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};


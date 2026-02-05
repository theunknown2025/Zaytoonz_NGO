module.exports = {
  apps: [
    {
      name: 'zaytoonz-test',
      script: 'server.js',
      cwd: '/var/www/zaytoonz-ngo',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: 'localhost',
        NEXT_PUBLIC_BASE_PATH: '/beta',
        // Add your other environment variables here
        // NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
        // NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_key',
      },
      error_file: '/var/log/pm2/zaytoonz-test-error.log',
      out_file: '/var/log/pm2/zaytoonz-test-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
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
    }
  ]
};


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
        NEXT_PUBLIC_BASE_PATH: '/test',
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
    }
  ]
};


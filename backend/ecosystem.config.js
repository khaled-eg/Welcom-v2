module.exports = {
  apps: [
    {
      name: 'dolphin-api',
      script: 'src/server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        USE_CLUSTER: 'true'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        USE_CLUSTER: 'false'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'output'],
      kill_timeout: 5000
    }
  ]
};

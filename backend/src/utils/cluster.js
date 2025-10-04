const cluster = require('cluster');
const os = require('os');
const logger = require('./logger');

/**
 * Cluster manager for multi-core processing
 */
class ClusterManager {
  constructor() {
    this.numWorkers = process.env.CLUSTER_WORKERS || os.cpus().length;
  }

  /**
   * Start cluster
   */
  start(workerFunction) {
    if (cluster.isMaster) {
      this.startMaster();
    } else {
      workerFunction();
    }
  }

  /**
   * Start master process
   */
  startMaster() {
    logger.info('='.repeat(50));
    logger.info(`🚀 Master process ${process.pid} is running`);
    logger.info(`🔧 Starting ${this.numWorkers} workers...`);
    logger.info('='.repeat(50));

    // Fork workers
    for (let i = 0; i < this.numWorkers; i++) {
      this.forkWorker();
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      logger.warn(`⚠️ Worker ${worker.process.pid} died (${signal || code})`);
      logger.info('🔄 Starting new worker...');

      // Restart worker
      setTimeout(() => {
        this.forkWorker();
      }, 1000);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...');

      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }

      setTimeout(() => {
        process.exit(0);
      }, 10000);
    });
  }

  /**
   * Fork a new worker
   */
  forkWorker() {
    const worker = cluster.fork();

    worker.on('online', () => {
      logger.info(`✅ Worker ${worker.process.pid} started`);
    });

    worker.on('message', (msg) => {
      logger.debug(`Message from worker ${worker.process.pid}:`, msg);
    });

    return worker;
  }

  /**
   * Get cluster stats
   */
  getStats() {
    if (!cluster.isMaster) {
      return null;
    }

    const workers = Object.values(cluster.workers || {});

    return {
      master: process.pid,
      workers: workers.length,
      workerPids: workers.map(w => w.process.pid),
      cpus: os.cpus().length,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}

module.exports = new ClusterManager();

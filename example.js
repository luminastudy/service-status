import { ServicesStatus } from './dist/index.js';

async function main() {
  console.log('Creating ServicesStatus instance...\n');

  // Create an instance with required configuration
  // You must provide URLs for all required services
  const servicesStatus = new ServicesStatus({
    serviceUrls: {
      'knowledge-base': 'http://localhost:4200/health',
      'auth-service': 'http://localhost:2500/health',
    },
    checkInterval: 30000, // Check every 30 seconds
    defaultTimeout: 3000,
    retryAttempts: 2,
    retryDelay: 500,
  });

  console.log('Checking all services...\n');

  // Perform a manual check of all services
  const results = await servicesStatus.checkAllServices();

  console.log('Service Health Check Results:');
  console.log('=============================\n');

  for (const [serviceName, status] of results.entries()) {
    console.log(`Service: ${serviceName}`);
    console.log(`  Status: ${status.status}`);
    console.log(`  URL: ${status.url}`);
    console.log(`  Last Checked: ${status.lastChecked || 'Never'}`);

    if (status.error) {
      console.log(`  Error: ${status.error}`);
    }

    if (status.details) {
      console.log(`  Response Time: ${status.details.responseTime || 'N/A'}ms`);
    }

    console.log('');
  }

  // Get summary
  const summary = servicesStatus.getSummary();
  console.log('Summary:');
  console.log(`  Total Services: ${summary.total}`);
  console.log(`  Healthy: ${summary.healthy}`);
  console.log(`  Unhealthy: ${summary.unhealthy}`);
  console.log(`  Unknown: ${summary.unknown}`);
  console.log('');

  // Check system health
  const isHealthy = servicesStatus.isAllHealthy();
  console.log(`System Health: ${isHealthy ? '✅ All services healthy' : '⚠️ Some services are not healthy'}\n`);

  // List unhealthy services if any
  const unhealthyServices = servicesStatus.getUnhealthyServices();
  if (unhealthyServices.length > 0) {
    console.log('Unhealthy Services:');
    for (const service of unhealthyServices) {
      console.log(`  - ${service.name}: ${service.error || 'Service not responding'}`);
    }
    console.log('');
  }

  // Start periodic checks (optional)
  console.log('Starting periodic health checks (every 30 seconds)...');
  await servicesStatus.start();

  // Keep the process running for demonstration
  console.log('Press Ctrl+C to stop\n');

  // Gracefully shutdown on SIGINT
  process.on('SIGINT', () => {
    console.log('\nStopping health checks...');
    servicesStatus.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
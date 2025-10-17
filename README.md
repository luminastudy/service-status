# @lumina-study/services-status

Service health check monitoring for Lumina microservices. This package provides a unified way to monitor the health status of all services in the Lumina platform.

## Features

- Automatic health check monitoring for Lumina services
- Monitors knowledge-base, auth-service, and recommendation-service
- **Type-safe service names** - Full TypeScript support with ServiceName type
- Requires health check URLs for all predefined services
- Configurable retry logic
- Periodic health checks with customizable intervals
- Detailed health status reporting
- Concurrent health checks for better performance
- Timeout handling for unresponsive services
- Strict validation of configuration parameters

## Installation

```bash
pnpm add @lumina-study/services-status
```

## Usage

### Configuration Requirements

**IMPORTANT**: The package knows about all required Lumina services but you MUST provide the health check URLs for each service. All services and configuration parameters are required and validated.

### Basic Usage

```typescript
import { ServicesStatus } from '@lumina-study/services-status';

// Create an instance with required service URLs and timing configuration
// You must provide URLs for ALL required services
const servicesStatus = new ServicesStatus({
  serviceUrls: {
    'knowledge-base': 'http://localhost:4200/health',
    'auth-service': 'http://localhost:2500/health',
    'recommendation-service': 'http://localhost:3500/health',
  },
  defaultTimeout: 5000,       // Required: Default timeout for health checks (ms)
  checkInterval: 30000,       // Required: Interval between checks (ms)
  retryAttempts: 3,          // Required: Number of retry attempts
  retryDelay: 1000,          // Required: Delay between retries (ms)
});

// Start periodic health checks
await servicesStatus.start();

// Get status of a specific service
const knowledgeBaseStatus = servicesStatus.getStatus('knowledge-base');
console.log(knowledgeBaseStatus);

// Get all service statuses
const allStatuses = servicesStatus.getAllStatuses();

// Check if all services are healthy
const isSystemHealthy = servicesStatus.isAllHealthy();

// Get summary
const summary = servicesStatus.getSummary();
console.log(summary); // { total: 3, healthy: 2, unhealthy: 1, unknown: 0 }

// Stop health checks when done
servicesStatus.stop();
```

### Full Configuration Example

```typescript
import { ServicesStatus, ServicesStatusConfig, ServiceUrls, ServiceName } from '@lumina-study/services-status';

// Define service URLs - ALL are required
const serviceUrls: ServiceUrls = {
  'knowledge-base': process.env.KNOWLEDGE_BASE_URL || 'http://localhost:4200/health',
  'auth-service': process.env.AUTH_SERVICE_URL || 'http://localhost:2500/health',
  'recommendation-service': process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:3500/health',
};

// Full configuration with service URLs and timing settings
const config: ServicesStatusConfig = {
  serviceUrls,              // Required: All service URLs must be provided
  defaultTimeout: 5000,     // Required: Must be positive number
  checkInterval: 30000,     // Required: Must be positive number
  retryAttempts: 3,        // Required: Must be non-negative number
  retryDelay: 1000,        // Required: Must be non-negative number
};

const servicesStatus = new ServicesStatus(config);

// Type-safe service name usage
const serviceName: ServiceName = 'knowledge-base'; // TypeScript will ensure this is valid
const status = await servicesStatus.checkService(serviceName);
```

### Manual Health Checks

```typescript
// Check a specific service manually (type-safe)
const status = await servicesStatus.checkService('auth-service');

// Check all services manually
const allStatuses = await servicesStatus.checkAllServices();
```

### Type-Safe Service Names

All methods that accept service names use the `ServiceName` type, which ensures you can only pass valid service names:

```typescript
import { ServiceName } from '@lumina-study/services-status';

// ✅ Valid - TypeScript knows these are the only allowed values
const validName: ServiceName = 'knowledge-base';
const status = await servicesStatus.checkService('auth-service');
const kbStatus = servicesStatus.getStatus('knowledge-base');

// ❌ Invalid - TypeScript will show an error at compile time
const invalidName: ServiceName = 'unknown-service'; // Type error!
await servicesStatus.checkService('invalid-service'); // Type error!
```

This prevents runtime errors from typos or invalid service names, making your code more robust and maintainable.

### Getting Service Lists

```typescript
// Get healthy services
const healthyServices = servicesStatus.getHealthyServices();

// Get unhealthy services
const unhealthyServices = servicesStatus.getUnhealthyServices();

// Get services with unknown status
const unknownServices = servicesStatus.getUnknownServices();
```

## Required Services

The package requires health check URLs for all of the following Lumina services:

- **knowledge-base** - Knowledge management service
- **auth-service** - Authentication and authorization service
- **recommendation-service** - Learning recommendations service

All service URLs must be provided when creating a ServicesStatus instance. The package will validate that URLs are provided for all required services.

## Validation

The package performs strict validation on configuration parameters:

- **Service URLs**: Must be provided for ALL required services
- **URL format**: Each service URL must be a valid URL
- **Default timeout**: Must be a positive number
- **Check interval**: Must be a positive number
- **Retry attempts**: Must be a non-negative number
- **Retry delay**: Must be a non-negative number

Any invalid configuration will throw an error with a descriptive message indicating what needs to be fixed. Common errors include:
- `URL is required for service: {service-name}` - Missing URL for a required service
- `Invalid URL for service {service-name}: {url}` - Invalid URL format
- `Valid defaultTimeout (positive number) is required` - Invalid timeout value

## Health Check Response Format

Each health check returns a `ServiceHealthCheck` object:

```typescript
interface ServiceHealthCheck {
  url: string;                              // Health check URL
  name: string;                             // Service name
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: Date | null;                // Last check timestamp
  details: unknown;                         // Response details from the service
  error: string | null;                    // Error message if check failed
}
```

## Configuration Options

```typescript
interface ServicesStatusConfig {
  serviceUrls: ServiceUrls;      // Required URLs for all services
  defaultTimeout: number;        // Default timeout in milliseconds
  checkInterval: number;         // Interval between checks in milliseconds
  retryAttempts: number;         // Number of retry attempts
  retryDelay: number;           // Delay between retries in milliseconds
}

type ServiceUrls = {
  'knowledge-base': string;
  'auth-service': string;
  'recommendation-service': string;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm type-check

# Lint
pnpm lint

# Format code
pnpm format
```

## Testing

The package includes comprehensive unit tests using Vitest. Tests cover:

- Service health check logic
- Retry mechanisms
- Timeout handling
- Service management operations
- Periodic health checks
- Status aggregation

Run tests with:

```bash
pnpm test
```

## License

Private - Part of the Lumina platform
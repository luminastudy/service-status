# Changelog

## [1.0.2](https://github.com/luminastudy/service-status/compare/v1.0.1...v1.0.2) (2025-10-15)

### Bug Fixes

* update ci:publish scripts to use root directory for npm publish ([e67f2e0](https://github.com/luminastudy/service-status/commit/e67f2e0476edb865115c33c703486974a62bfcd9))

## 1.0.1 (2025-10-15)

### Features

* add CI scripts for testing, building, and releasing with release-it ([8dff5cc](https://github.com/luminastudy/service-status/commit/8dff5cccd2bca4650035e828efc1ed568bfe0acd))
* add initial changelog documenting project changes and features ([ec6cc54](https://github.com/luminastudy/service-status/commit/ec6cc54141382a6e1c020be5a6c14c65ee798e02))
* add pnpm workspace configuration for only built dependencies ([86ff317](https://github.com/luminastudy/service-status/commit/86ff317ec20157bef35dee41714fedd0671b133d))
* add release-it configuration and update package scripts for versioning ([8571647](https://github.com/luminastudy/service-status/commit/85716470bc940944a247a7f745e082fa26b8871a))
* add ServicesStatus class for monitoring service health ([8762a09](https://github.com/luminastudy/service-status/commit/8762a09b3843af9f9726f58cf7c09e9a7bc0429b))
* add unit tests for HealthChecker, ServiceManager, StatusQuery, CustomError, TimeoutError, ValidationError, ServiceUrlExtractor, and ConfigValidator ([3f04de0](https://github.com/luminastudy/service-status/commit/3f04de0f089570011edeca34a25bd5c13f8aa645))
* implement service health monitoring with ConfigValidator, HealthChecker, ServiceManager, and StatusQuery classes ([3056496](https://github.com/luminastudy/service-status/commit/305649622735db6a6cb4a5286fb6ba5cc056195c))

### Code Refactoring

* standardize string quotes and improve error message formatting in ServicesStatus tests ([939264c](https://github.com/luminastudy/service-status/commit/939264c5c0e1defc0548fad06ae7a288bae9f900))

### Tests

* enhance unit tests for HealthChecker, ServiceManager, StatusQuery, CustomError, TimeoutError, ValidationError, and ServiceUrlExtractor with additional scenarios and validations ([b5f3c92](https://github.com/luminastudy/service-status/commit/b5f3c92278b436e19387f4864a8abff9f7d14abf))

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of @lumina-study/services-status
- Service health monitoring capabilities
- ConfigValidator for service configuration validation
- HealthChecker for service health checks
- ServiceManager for managing multiple services
- StatusQuery for querying service status

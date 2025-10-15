import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ServicesStatus } from "./ServicesStatus";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ServicesStatus", () => {
  let servicesStatus: ServicesStatus;

  const mockServiceUrls = {
    "knowledge-base": "http://localhost:4200/health",
    "auth-service": "http://localhost:2500/health",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (servicesStatus) {
      servicesStatus.stop();
    }
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should throw error when no configuration is provided", () => {
      // @ts-expect-error Testing invalid input
      expect(() => new ServicesStatus()).toThrow(
        "ServicesStatus configuration is required"
      );

      // @ts-expect-error Testing invalid input
      expect(() => new ServicesStatus(null)).toThrow(
        "ServicesStatus configuration is required"
      );

      // @ts-expect-error Testing invalid input
      expect(() => new ServicesStatus(undefined)).toThrow(
        "ServicesStatus configuration is required"
      );
    });

    it("should throw error when service URLs are missing", () => {
      expect(
        () =>
          new ServicesStatus({
            // @ts-expect-error Testing invalid input
            serviceUrls: null,
            defaultTimeout: 5000,
            checkInterval: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
          })
      ).toThrow("Service URLs are required");
    });

    it("should throw error when a required service URL is missing", () => {
      const incompleteUrls = { ...mockServiceUrls };
      delete incompleteUrls["knowledge-base"];

      expect(
        () =>
          new ServicesStatus({
            // @ts-expect-error Testing invalid input
            serviceUrls: incompleteUrls,
            defaultTimeout: 5000,
            checkInterval: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
          })
      ).toThrow("URL is required for service: knowledge-base");
    });

    it("should throw error when service URL is invalid", () => {
      const invalidUrls = { ...mockServiceUrls };
      invalidUrls["knowledge-base"] = "not-a-valid-url";

      expect(
        () =>
          new ServicesStatus({
            // @ts-expect-error Testing invalid input
            serviceUrls: invalidUrls,
            defaultTimeout: 5000,
            checkInterval: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
          })
      ).toThrow("Invalid URL for service knowledge-base: not-a-valid-url");
    });

    it("should throw error when required parameters are missing", () => {
      expect(
        () =>
          new ServicesStatus({
            serviceUrls: mockServiceUrls,
            // @ts-expect-error Testing invalid input
            defaultTimeout: null,
            checkInterval: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
          })
      ).toThrow("Valid defaultTimeout (positive number) is required");

      expect(
        () =>
          new ServicesStatus({
            serviceUrls: mockServiceUrls,
            defaultTimeout: 5000,
            // @ts-expect-error Testing invalid input
            checkInterval: null,
            retryAttempts: 3,
            retryDelay: 1000,
          })
      ).toThrow("Valid checkInterval (positive number) is required");
    });

    it("should initialize with valid configuration and all pre-configured services", () => {
      servicesStatus = new ServicesStatus({
        serviceUrls: mockServiceUrls,
        defaultTimeout: 5000,
        checkInterval: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      });

      const summary = servicesStatus.getSummary();

      // Should have 2 pre-configured services
      expect(summary.total).toBe(2);
      expect(summary.unknown).toBe(2); // All services start as unknown
      expect(summary.healthy).toBe(0);
      expect(summary.unhealthy).toBe(0);

      // Check that specific services exist
      expect(servicesStatus.getStatus("knowledge-base")).toBeTruthy();
      expect(servicesStatus.getStatus("auth-service")).toBeTruthy();
    });
  });

  describe("checkService", () => {
    beforeEach(() => {
      servicesStatus = new ServicesStatus({
        serviceUrls: mockServiceUrls,
        defaultTimeout: 5000,
        checkInterval: 30000,
        retryAttempts: 2,
        retryDelay: 100,
      });
    });

    it("should mark service as healthy when health check succeeds", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: "ok", uptime: 12345 }),
      });

      const result = await servicesStatus.checkService("knowledge-base");

      expect(result).toBeTruthy();
      expect(result.status).toBe("healthy");
      expect(result.error).toBeNull();
      expect(result.details).toBeTruthy();
    });

    it("should mark service as unhealthy when health check fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal Server Error" }),
      });

      const result = await servicesStatus.checkService("auth-service");

      expect(result).toBeTruthy();
      if (result) {
        expect(result.status).toBe("unhealthy");
        expect(result.error).toBeNull();
      }
    });

    it("should retry on failure and succeed on retry", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        });

      const resultPromise = servicesStatus.checkService("knowledge-base");

      // Advance timers for the retry delay
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      if (result) {
        expect(result.status).toBe("healthy");
      }
    });

    it("should return null for non-existent service", async () => {
      const result = await servicesStatus.checkService("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("checkAllServices", () => {
    beforeEach(() => {
      servicesStatus = new ServicesStatus({
        serviceUrls: mockServiceUrls,
        defaultTimeout: 5000,
        checkInterval: 30000,
        retryAttempts: 1, // Set to 1 to avoid retries consuming mocks out of order
        retryDelay: 100,
      });
    });

    it("should check all 2 pre-configured services concurrently", async () => {
      // Mock responses for all 2 services
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        }) // knowledge-base
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: "Error" }),
        }); // auth-service

      const results = await servicesStatus.checkAllServices();

      expect(results.size).toBe(2);

      // Check individual service statuses
      const knowledgeBaseResult = results.get("knowledge-base");
      const authServiceResult = results.get("auth-service");
      if (knowledgeBaseResult) {
        expect(knowledgeBaseResult.status).toBe("healthy");
      }
      if (authServiceResult) {
        expect(authServiceResult.status).toBe("unhealthy");
      }

      // Check summary
      const summary = servicesStatus.getSummary();
      expect(summary.total).toBe(2);
      expect(summary.healthy).toBe(1);
      expect(summary.unhealthy).toBe(1);
      expect(summary.unknown).toBe(0);
    });
  });

  describe("status getters", () => {
    beforeEach(() => {
      servicesStatus = new ServicesStatus({
        serviceUrls: mockServiceUrls,
        defaultTimeout: 5000,
        checkInterval: 30000,
        retryAttempts: 2,
        retryDelay: 100,
      });
    });

    it("should get healthy services", async () => {
      // Mock some services as healthy, some as unhealthy
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: "Error" }),
        });

      // Check both services
      await servicesStatus.checkService("knowledge-base");
      await servicesStatus.checkService("auth-service");

      const healthyServices = servicesStatus.getHealthyServices();
      expect(healthyServices).toHaveLength(1);
      expect(healthyServices[0].name).toBe("knowledge-base");
    });

    it("should check if all services are healthy", async () => {
      // Mock all services as healthy
      for (let i = 0; i < 2; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        });
      }

      const checkPromise = servicesStatus.checkAllServices();

      // No need to advance timers since all services succeed on first attempt
      const result = await checkPromise;

      expect(servicesStatus.isAllHealthy()).toBe(true);
    });
  });

  describe("periodic checks", () => {
    beforeEach(() => {
      servicesStatus = new ServicesStatus({
        serviceUrls: mockServiceUrls,
        defaultTimeout: 5000,
        checkInterval: 1000,
        retryAttempts: 2,
        retryDelay: 100,
      });
    });

    it("should perform initial check on start", async () => {
      // Mock responses for all 2 services
      for (let i = 0; i < 2; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        });
      }

      await servicesStatus.start();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should perform periodic checks", async () => {
      // Mock responses for initial check (2 services)
      for (let i = 0; i < 2; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        });
      }

      // Mock responses for periodic check (2 services)
      for (let i = 0; i < 2; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        });
      }

      await servicesStatus.start();

      // Initial check
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Advance timer to trigger periodic check
      await vi.advanceTimersByTimeAsync(1000);

      // Should have made another check for all 2 services
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it("should stop periodic checks when stop() is called", async () => {
      // Mock responses for all 2 services
      for (let i = 0; i < 2; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        });
      }

      await servicesStatus.start();
      expect(mockFetch).toHaveBeenCalledTimes(2);

      servicesStatus.stop();

      // Advance timer - no new checks should be made
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("getSummary", () => {
    it("should return correct summary", async () => {
      servicesStatus = new ServicesStatus({
        serviceUrls: mockServiceUrls,
        defaultTimeout: 5000,
        checkInterval: 30000,
        retryAttempts: 2,
        retryDelay: 100,
      });

      // Initially all services are unknown
      let summary = servicesStatus.getSummary();
      expect(summary.total).toBe(2);
      expect(summary.unknown).toBe(2);

      // Mock mixed responses for all services
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: "ok" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: "Error" }),
        });

      const checkPromise = servicesStatus.checkAllServices();

      await checkPromise;

      summary = servicesStatus.getSummary();
      expect(summary.total).toBe(2);
      expect(summary.healthy).toBe(1);
      expect(summary.unhealthy).toBe(1);
      expect(summary.unknown).toBe(0);
    });
  });
});

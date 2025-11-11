import type { ServiceUrls } from './ServiceUrls.js'

export interface ServicesStatusConfig {
  serviceUrls: ServiceUrls
  defaultTimeout: number
  checkInterval: number
  retryAttempts: number
  retryDelay: number
}

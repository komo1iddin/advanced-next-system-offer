import { AppError } from '@/lib/utils/error';

// Simple console logger for Edge Runtime
const edgeLogger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
  }
};

class LogService {
  private logger: typeof edgeLogger;
  private static instance: LogService;

  private constructor() {
    // Use edge logger for all environments since we're in Edge Runtime
    this.logger = edgeLogger;
  }

  public static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  logError(error: Error | AppError): void {
    if (error instanceof AppError) {
      this.error(error.message, {
        statusCode: error.statusCode,
        stack: error.stack
      });
    } else {
      this.error(error.message, {
        stack: error.stack
      });
    }
  }

  logRequest(req: any): void {
    this.info('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  }

  logResponse(req: any, res: any, responseTime: number): void {
    this.info('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime
    });
  }
}

export const logService = LogService.getInstance(); 
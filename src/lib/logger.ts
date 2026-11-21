type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: string;
  correlationId?: string;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Redact sensitive patterns to prevent credentials leakage
const SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "authorization",
  "database_url",
  "direct_url",
  "api_key",
  "apikey",
];

function sanitize(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitize(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

class Logger {
  private format(
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, any>,
    error?: Error
  ): LogPayload {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data: data ? sanitize(data) : undefined,
    };

    if (error) {
      payload.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      };
    }

    return payload;
  }

  public debug(message: string, context?: string, data?: Record<string, any>) {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.debug(JSON.stringify(this.format("debug", message, context, data)));
    }
  }

  public info(message: string, context?: string, data?: Record<string, any>) {
    console.info(JSON.stringify(this.format("info", message, context, data)));
  }

  public warn(message: string, context?: string, data?: Record<string, any>) {
    console.warn(JSON.stringify(this.format("warn", message, context, data)));
  }

  public error(message: string, error?: Error, context?: string, data?: Record<string, any>) {
    console.error(JSON.stringify(this.format("error", message, context, data, error)));
  }
}

export const logger = new Logger();

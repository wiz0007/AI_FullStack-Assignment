import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { logger } from "./logger";

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  meta: Record<string, any> | null;
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export function successResponse<T>(
  data: T,
  meta: Record<string, any> | null = null,
  status = 200,
  requestId?: string
) {
  const payload: ApiResponseSuccess<T> = {
    success: true,
    data,
    meta,
  };
  const headers = new Headers();
  if (requestId) {
    headers.set("x-request-id", requestId);
  }
  return NextResponse.json(payload, { status, headers });
}

export function errorResponse(error: unknown, requestId?: string) {
  const headers = new Headers();
  if (requestId) {
    headers.set("x-request-id", requestId);
  }

  if (error instanceof AppError) {
    const payload: ApiResponseError = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    logger.warn(`Handled application error: ${error.message}`, error.name, {
      code: error.code,
      details: error.details,
      correlationId: requestId,
    });
    return NextResponse.json(payload, { status: error.statusCode, headers });
  }

  // Unhandled / system errors: log full stack but return safe response
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error("Unhandled server exception", err, "errorResponse", {
    correlationId: requestId,
  });

  const payload: ApiResponseError = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please try again later.",
    },
  };
  return NextResponse.json(payload, { status: 500, headers });
}

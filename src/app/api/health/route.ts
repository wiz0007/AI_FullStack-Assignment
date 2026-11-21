import { successResponse } from "@/lib/api-response";

export async function GET() {
  return successResponse({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "oneatlas-web",
    version: "0.1.0",
    uptime: process.uptime(),
  });
}

import { NextRequest } from "next/server";
import { benchmarkService } from "@/server/services/benchmark.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const benchmark = await benchmarkService.getBenchmarkBySlug(params.slug);
    return successResponse(benchmark);
  } catch (error) {
    return errorResponse(error);
  }
}

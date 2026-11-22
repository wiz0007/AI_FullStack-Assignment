import { NextRequest } from "next/server";
import { benchmarkService } from "@/server/services/benchmark.service";
import { benchmarkListQuerySchema } from "@/server/validators/benchmark.validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = benchmarkListQuerySchema.safeParse(searchParams);

    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid benchmark query parameters",
        parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const benchmarks = await benchmarkService.listBenchmarks(parseResult.data.category);
    return successResponse(benchmarks);
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest } from "next/server";
import { benchmarkService } from "@/server/services/benchmark.service";
import { rankingsQuerySchema } from "@/server/validators/benchmark.validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = rankingsQuerySchema.safeParse(searchParams);

    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid rankings query parameters",
        parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const result = await benchmarkService.getRankings(parseResult.data);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

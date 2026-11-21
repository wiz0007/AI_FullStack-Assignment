import { NextRequest } from "next/server";
import { modelService } from "@/server/services/model.service";
import { globalSearchQuerySchema } from "@/server/validators/model.validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const scope = searchParams.get("scope") || "all";
    const limit = searchParams.get("limit") || "5";

    const parseResult = globalSearchQuerySchema.safeParse({ q, scope, limit });
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid search parameters",
        parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const results = await modelService.globalSearch(parseResult.data);
    return successResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}

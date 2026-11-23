import { NextRequest } from "next/server";
import { modelService } from "@/server/services/model.service";
import { modelQuerySchema } from "@/server/validators/model.validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      // Support repeated parameters or comma-separated
      if (key in rawParams) {
        if (Array.isArray(rawParams[key])) {
          rawParams[key].push(value);
        } else {
          rawParams[key] = [rawParams[key], value];
        }
      } else {
        rawParams[key] = value;
      }
    });

    const parseResult = modelQuerySchema.safeParse(rawParams);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const { items, pagination } = await modelService.listModels(parseResult.data);
    return successResponse(items, pagination);
  } catch (error) {
    return errorResponse(error);
  }
}

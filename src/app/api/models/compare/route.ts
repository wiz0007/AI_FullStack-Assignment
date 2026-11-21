import { NextRequest } from "next/server";
import { modelService } from "@/server/services/model.service";
import { compareModelsQuerySchema } from "@/server/validators/model.validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids") || undefined;
    const models = searchParams.get("models") || undefined;

    const parseResult = compareModelsQuerySchema.safeParse({ ids, models });
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid comparison request parameters",
        parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const result = await modelService.compareModels(parseResult.data.ids);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

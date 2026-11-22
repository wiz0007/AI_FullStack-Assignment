import { NextRequest } from "next/server";
import { providerService } from "@/server/services/provider.service";
import { providerQuerySchema } from "@/server/validators/provider.validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = providerQuerySchema.safeParse(searchParams);

    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid provider query parameters",
        parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const result = await providerService.listProviders(parseResult.data);
    return successResponse(result.items, result.pagination);
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest } from "next/server";
import { companyService } from "@/server/services/company.service";
import { companyQuerySchema } from "@/server/validators/company.validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = companyQuerySchema.safeParse(searchParams);

    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid company query parameters",
        parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const result = await companyService.listCompanies(parseResult.data);
    return successResponse(result.items, result.pagination);
  } catch (error) {
    return errorResponse(error);
  }
}

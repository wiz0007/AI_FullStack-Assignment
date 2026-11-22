import { NextRequest } from "next/server";
import { companyService } from "@/server/services/company.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const company = await companyService.getCompanyBySlug(params.slug);
    return successResponse(company);
  } catch (error) {
    return errorResponse(error);
  }
}

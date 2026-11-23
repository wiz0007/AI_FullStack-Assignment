import { NextRequest } from "next/server";
import { providerService } from "@/server/services/provider.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const provider = await providerService.getProviderBySlug(params.slug, {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 50),
    });
    return successResponse(provider);
  } catch (error) {
    return errorResponse(error);
  }
}

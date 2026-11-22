import { NextRequest } from "next/server";
import { providerService } from "@/server/services/provider.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const provider = await providerService.getProviderBySlug(params.slug);
    return successResponse(provider);
  } catch (error) {
    return errorResponse(error);
  }
}

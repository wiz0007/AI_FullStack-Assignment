import { NextRequest } from "next/server";
import { modelService } from "@/server/services/model.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const model = await modelService.getModelBySlugOrId(params.id);
    return successResponse(model);
  } catch (error) {
    return errorResponse(error);
  }
}

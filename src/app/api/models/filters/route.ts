import { successResponse, errorResponse } from "@/lib/api-response";
import { modelService } from "@/server/services/model.service";

export async function GET() {
  try {
    const filters = await modelService.getFilterMetadata();
    return successResponse(filters);
  } catch (error) {
    return errorResponse(error);
  }
}

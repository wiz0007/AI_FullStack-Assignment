import { NextRequest } from "next/server";
import { GET as getCompare } from "@/app/api/models/compare/route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return getCompare(request);
}

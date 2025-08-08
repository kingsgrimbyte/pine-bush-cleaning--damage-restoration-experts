import { NextRequest } from "next/server";
import { generateRobotsTxt } from "../../robots.txt/route";

export async function GET(req: NextRequest) {
  return generateRobotsTxt(req);
}

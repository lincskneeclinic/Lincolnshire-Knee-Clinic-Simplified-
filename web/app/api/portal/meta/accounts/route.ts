import { NextResponse } from "next/server";
import { getConnectedAccountStatuses } from "@/lib/metaAccounts";

export async function GET() {
  const accounts = await getConnectedAccountStatuses();
  return NextResponse.json({ success: true, accounts });
}

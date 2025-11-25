import { getPresignedUrl } from "@/lib/r2";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileKey = searchParams.get('fileKey');

  if (!fileKey) {
    return NextResponse.json({ error: 'File key is required' }, { status: 400 });
  }

  const presignedUrl = await getPresignedUrl(fileKey);

  return NextResponse.json({ presignedUrl });
}


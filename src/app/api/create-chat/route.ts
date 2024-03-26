import { db } from "@/lib/db";
import { loadS3IntoPinecone } from "@/lib/db/pinecone";
import { chats } from "@/lib/db/schema";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_name, file_key } = body;
    await loadS3IntoPinecone(file_key);
    const chatId = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_name),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });
    return NextResponse.json(
      { chat_id: chatId[0].insertedId },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

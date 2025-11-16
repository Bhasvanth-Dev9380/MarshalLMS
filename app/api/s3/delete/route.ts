import { requireAdmin } from "@/app/data/admin/require-Admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { auth } from "@/lib/auth";

import { s3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { NextResponse } from "next/server";



const aj = arcjet.withRule(
  detectBot({
    mode: "LIVE",
    allow: [],
  })
)
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );



export async function DELETE(request: Request) {

  const session = await requireAdmin();
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });





  try {
    const decision = await aj.protect(request, {
      Fingerprint: session?.user.id as string,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "dudde not good" }, { status: 429 });
    }
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "Missing or invalid object key" },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES!,  // FIXED HERE
      Key: key,
    });

    console.log("Deleting S3 file:", key);

    await s3.send(command);

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
function requrideAdmin() {
  throw new Error("Function not implemented.");
}


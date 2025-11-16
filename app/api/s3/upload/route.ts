
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@/lib/S3Client';
import { env } from '@/lib/env';
import arcjet, { detectBot, fixedWindow } from '@/lib/arcjet';
import { User } from 'lucide-react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { error } from 'console';
import { requireAdmin } from '@/app/data/admin/require-Admin';

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "fileName is requried" }),
  contentType: z.string().min(1, { message: "Content type is requried" }),
  size: z.number().min(1, { message: "size is requried" }),
  isImage: z.boolean(),

});

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



export async function POST(request: Request) {
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

    const body = await request.json();

    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {

      return NextResponse.json({ error: "Invalid Request Bodt" },
        { status: 400 }
      )
    }

    const { fileName, contentType, size } = validation.data
    const uniqueKey = `${uuidv4()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey
    });
    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 360,
    });

    const Response = {
      presignedUrl,
      key: uniqueKey,
    };

    return NextResponse.json(Response);

  } catch {
    return NextResponse.json(
      { error: 'Failed to generate presigned URL ' },
      { status: 500 }
    );

  }

}
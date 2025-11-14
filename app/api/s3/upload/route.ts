
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@/lib/S3Client';
import { env } from '@/lib/env';

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "fileName is requried" }),
  contentType: z.string().min(1, { message: "Content type is requried" }),
  size: z.number().min(1, { message: "size is requried" }),
  isImage: z.boolean(),

});


export async function POST(request: Request) {
  try {
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
//  import { createEnv } from "@t3-oss/env-nextjs";
//  import { z } from "zod";

//  export const env = createEnv({
//    server: {
//      DATABASE_URL: z.url(),
//      BETTER_AUTH_SECRET: z.string().min(1),
//      BETTER_AUTH_URL: z.string().url(),
//      AUTH_GITHUB_CLIENT_id: z.string().min(1),
//      AUTH_GITHUB_SECRET: z.string().min(1),
//    },



//     // For Next.js >= 13.4.4, you only need to destructure client variables:
//     experimental__runtimeEnv: {

//     },


//  });

// lib/env.ts
// import "server-only";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),

    // Github OAuth envs (correct names & casing)
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_ENDPOINT_URL_S3: z.string().min(1),
    AWS_ENDPOINT_URL_IAM: z.string().min(1),
    AWS_REGION: z.string().min(1),






  },
  client: {
    NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES: z.string().min(1)
  },
  // For Next.js >= 13.4.4, client side vars would go here - keep empty if none
  experimental__runtimeEnv: {
    NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES: process.env.
      NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES
  },
});

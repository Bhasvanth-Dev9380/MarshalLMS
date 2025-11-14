import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // ✅ Send OTP email via Resend
        await resend.emails.send({
          from: "MarshalLMS <onboarding@resend.dev>",
          to: [email], // ✅ Correct variable usage
          subject: "MarshalLMS - Verify Your Email",
          html: `<p>Your OTP is <strong>${otp}</strong></p>`, // ✅ Proper template literal
        });

        // ✅ Log OTP for local testing
        console.log(`Verification code sent to ${email}: ${otp}`);
      },
    }),
  ],
});


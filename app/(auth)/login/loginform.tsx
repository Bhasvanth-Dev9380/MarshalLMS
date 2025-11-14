


"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { GithubIcon, Loader, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function Loginform() {
  const router = useRouter();
  const [githubPending, startGithubTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");

  // ✅ GitHub Login
  async function signInWithGithub() {
    startGithubTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: "github",
          callbackURL: "/",
        });
        toast.success("Signed in with GitHub, redirecting...");
      } catch (error) {
        toast.error("GitHub Sign-in failed");
      }
    });
  }

  // ✅ Email OTP Login
  async function signInWithEmail() {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    startEmailTransition(async () => {
      try {
        await authClient.emailOtp.sendVerificationOtp({
          email: email,
          type: "sign-in", // ✅ correct spelling
          fetchOptions: {
            onSuccess: () => {
              toast.success("Email sent");
              router.push(`/verify-request?email=${email}`);
            },
            onError: () => {
              toast.error("Error sending email");
            },
          },
        });
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>
          Login with your GitHub or Email Account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* GitHub Login Button */}
        <Button
          disabled={githubPending}
          onClick={signInWithGithub}
          className="w-full"
          variant="outline"
        >
          {githubPending ? (
            <>
              <Loader className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <GithubIcon className="size-4" />
              <span>Sign in with Github</span>
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        {/* Email Login */}
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="m@example.com"
              required
            />

            <Button onClick={signInWithEmail} disabled={emailPending}>
              {emailPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Continue with Email</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

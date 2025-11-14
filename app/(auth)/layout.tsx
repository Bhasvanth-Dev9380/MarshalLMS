
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

import Image from "next/image";

import Logo from "@/public/logo.svg"
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={
          buttonVariants({ variant: "outline" }) + " absolute top-4 left-4"
        }
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          {/* logo / title */}

          <Image src={Logo} alt="Logo" width={32} height={32 } />


          MarshalLMS
        </Link>

        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our {" "}
          <span className="hover:text-primary hover:underline">
            Terms of services</span>
          {" "}
          and <span className="hover:text-primary hover:underline">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}

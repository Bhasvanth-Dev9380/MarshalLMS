

// import { headers } from "next/headers";
// import { Loginform } from "./loginform";
// import { auth } from "@/lib/auth";
// import { redirect } from "next/navigation";

// export default async function LoginPage() {
//     const session = await auth.api.getSession({
//         headers: await headers(),
//     });

//     if (session) {
//         return redirect("/");
//     }

//     return (
//         <Loginform />
//     );


// }


import { headers } from "next/headers";
import { Loginform } from "./loginform";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    // ✅ Get current session from Better Auth
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // ✅ If already logged in, redirect to home page
    if (session) {
        redirect("/");
    }

    // ✅ Otherwise, render the login form
    return <Loginform />;
}




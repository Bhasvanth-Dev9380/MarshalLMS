import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShieldX } from "lucide-react"
import Link from "next/link"
import { adminGetCourses } from "../data/admin/admin-get-courses"



export default function NotAdminRoute() {


  return <div className="min-h-screen flex items-center justify-center">
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <div className="bg-destructive/10 round-full p-4 w-fit mx-auto">
          <ShieldX className="size-16 text-destructive" />
        </div>
        <CardTitle>Access Restricted</CardTitle>
        <CardDescription className="max-w-xs mx-auto">
          Hey! You are not an admin, which means you cannot create any courses or stuff like that...</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/" className={buttonVariants({
          className: "w-full",
        })}>
          <ArrowLeft className="mr-1 size-4" />
          Back to home
        </Link>
      </CardContent>

    </Card>
  </div>
}
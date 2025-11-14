"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchema";
import { headers } from "next/headers";

export async function CreateCourse(values: CourseSchemaType): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    const validation = courseSchema.safeParse(values);

    // FIXED → fail when validation FAILS
    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid Form Data",
      };
    }

    // validation.data is SAFE here
    const data = await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id as string,
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch {
    console.log("Incoming course values:", values);


    return {
      status: "error",
      message: "Failed to create course",
    };
  }
}

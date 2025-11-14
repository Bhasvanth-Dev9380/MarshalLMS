"use server";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchema";

export async function CreateCourse(values: CourseSchemaType): Promise<ApiResponse> {
  try {
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
        userId: "sam",
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch (error) {
    console.error("Error creating course", error);
    return {
      status: "error",
      message: "Failed to create course",
    };
  }
}

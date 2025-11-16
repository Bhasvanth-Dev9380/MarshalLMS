
"use server";

import { requireAdmin } from "@/app/data/admin/require-Admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchema";

export async function editCourse(data: CourseSchemaType, courseId: string): Promise<ApiResponse> {
  const user = await requireAdmin();

  try {
    const result = courseSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.user.id,
      },
      data: {
        ...result.data,
      }
    });

    return {
      status: "success",
      message: "course update successfully",
    }

  } catch {
    return {
      status: "error",
      message: "Faild to update Course",
    }
  }
}
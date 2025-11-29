"use server";

import { requireAdmin } from "@/app/data/admin/require-Admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { chapterSchema, ChapterSchemaType, courseSchema, CourseSchemaType, lessonSchema, LessonSchemaType } from "@/lib/zodSchema";
import arcjet, { detectBot, fixedWindow, request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const ajClient = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [],
});

const aj = ajClient
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    }),
  );

export async function editCourse(
  data: CourseSchemaType,
  courseId: string,
): Promise<ApiResponse> {
  const user = await requireAdmin();

  try {
    const req = await request();

    // 🔧 FIXED: aj.protect now only takes `req`
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "You have been blocked due to rate limiting",
        };
      } else {
        return {
          status: "error",
          message: "You are a boy! if this is a mistake contact our support",
        };
      }
    }

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
      },
    });

    return {
      status: "success",
      message: "course update successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Faild to update Course",
    };
  }
}

export async function reorderLesson(
chapterId:string,
lessons:{
  position: any;id:string;order:number
}[],
courseId:string
):Promise<ApiResponse>{
  try{
if(!lessons||lessons.length===0){
return{
  status:"error",
  message:"No lessons provided for reorder"
};
}
const updates=lessons.map((lesson)=>prisma.lesson.update({
  where:{id:lesson.id,chapterId:chapterId},
  data:{
    position:lesson.position,
  },
})
);
await prisma.$transaction(updates);
revalidatePath('/admin/courses/[courseId]/edit');

return{
  status:"success",
  message:"Lessons reordered successfully",
}
  } catch{
return{
  status: "error",
  message: "Failed to reorder lessons",
}
  }
}

export async function reorderChapter(courseId:string, chapter:{id:string; position: number}[]
)

:Promise<ApiResponse>{
  await requireAdmin();
  try{
    if(!chapter||chapter.length===0){
      return{
        status:"error",
        message:"No chapters provided for reorder"
      };
    }
      
   const updates=chapter.map((chapter)=>
    prisma.chapter.update({
    where:{id:chapter.id,courseId:courseId},
    data:{
      position:chapter.position,
    }
   }) ) ;

    await prisma.$transaction(updates);

    revalidatePath('/admin/courses/[courseId]/edit');

    return{
      status:"success",
      message:"Chapters reordered successfully",
    };
  }catch{
    return{
      status: "error",
      message: "Failed to reorder chapters",
    }
  }
}


export async function createChapter(value: ChapterSchemaType): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = chapterSchema.safeParse(value);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxpos = await tx.chapter.findFirst({
        where: { courseId: result.data.courseId },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxpos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Chapter created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create chapter",
    };
  }
}

 
export async function createLesson(value: LessonSchemaType): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = lessonSchema.safeParse(value);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.lesson.create({
      data: {
        ...result.data,
      },
    });

    revalidatePath('/admin/courses/[courseId]/edit');

    return {
      status: "success",
      message: "Lesson created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create lesson",
    };
  }
}

export async function deleteLesson(lessonId: string, chapterId: string, courseId: string): Promise<ApiResponse> {
  await requireAdmin();
  try {

const chapterWithLesson = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        Lesson: {
          orderBy: {
            position: 'asc',
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });
    if (!chapterWithLesson) {
      return {
        status: "error",
        message: "Chapter not found",
      };
    }

    const lessons = chapterWithLesson.Lesson;
    
    const lessonToDelete = lessons.find((l) => l.id === lessonId);
    if (!lessonToDelete) {
      return {
        status: "error",
        message: "Lesson not found in the specified chapter",
      };
    }

  const remainingLessons = lessons.filter((l) => l.id !== lessonId);
  const updates = remainingLessons.map((lesson, index) =>
    prisma.lesson.update({
      where: { id: lesson.id },
      data: { position: index + 1},
    }),
  );

    revalidatePath('/admin/courses/[courseId]/edit');


     await prisma.$transaction(updates);

    await prisma.lesson.delete({
      where: {
        id: lessonId,
        chapterId: chapterId,
      },
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);
    return{
      status: "success",
      message: "Lesson deleted successfully",
    }

    return {
      status: "success",
      message: "Lesson deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete lesson",
    };
  }
}
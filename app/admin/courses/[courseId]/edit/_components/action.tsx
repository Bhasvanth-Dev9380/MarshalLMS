"use server";

import { requireAdmin } from "@/app/data/admin/require-Admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchema";
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





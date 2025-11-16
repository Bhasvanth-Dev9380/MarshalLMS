import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-Admin";

export async function adminGetCourses() {
  await requireAdmin();

  const data = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
    },
  });

  return data;
}


export type AdminCourseTypeSingularType = Awaited<ReturnType<typeof adminGetCourses>>[0];



import { description } from "@/components/sidebar/chart-area-interactive";
import z from "zod";
import { th } from "zod/v4/locales";

export const courseLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const courseStatus = ['Draft', 'Published', 'Archived'] as const;
export const courseCategories = [
  "Development",
  "Busincess",
  "Finance",
  "It & Software",
  "Office productifyty",
  "Desigen",
  "Markiting",
  "Health & fitness",
  "Music",
  "Teaching & Academics",

] as const;

export const courseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be atleast 3 characters long' }).max(100, { message: 'Title must be most 100 characters long' }),
  description: z.string().min(3, { message: 'Description must be atleast 3 characters long' }),
  fileKey: z.string().min(1, { message: 'File is required' }),
  price: z.coerce.number().min(1, { message: 'Price must be a positive number' }),
  duration: z.coerce.number().min(1, { message: 'Duration must be atleast 1 hour' }).max(500, { message: 'Duration must be atmost 500 hours' }),

  level: z.enum(courseLevels, { message: 'Level is required' }),
  category: z.enum(courseCategories, {
    message: "Category is requried"
  }),
  smallDescription: z.string().min(3, { message: 'Small Description must be atleast 3 characters long' }).max(200, { message: 'Small Description must be atmost 200 characters long' }),
  slug: z.string().min(3, { message: 'Slug must be atleast 3 characters long' }),
  status: z.enum(courseStatus, { message: 'Status is required' }),
});

 
export const chapterSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" }),
});
export const lessonSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" }),
  chapterId: z.string().uuid({ message: "Invalid chapter id" }),
  description: z.string().min(3, { message: "Description must be at least 3 characters long" }).optional(),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional(),
});


export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
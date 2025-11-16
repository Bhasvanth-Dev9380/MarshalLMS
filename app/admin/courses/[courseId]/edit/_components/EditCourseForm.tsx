"use client";
import { Button } from "@/components/ui/button";
import { courseCategories, courseLevels, courseSchema, CourseSchemaType, courseStatus } from "@/lib/zodSchema";
import { Loader2, PlusIcon, SparkleIcon } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/app/(public)/_components/file-uploder/uploder";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
// import { CreateCourse } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { editCourse } from "../action";
import { AdminCourseTypeSingularType } from "@/app/data/admin/admin-get-courses";


interface iApprops {
  data: AdminCourseTypeSingularType
}

export function EditCourseForm({ data }: iApprops) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: data.title,
      description: data.description,
      fileKey: data.fileKey,
      price: data.price,
      duration: data.duration,
      level: data.level,
      category: data.category as CourseSchemaType["category"],
      smallDescription: data.smallDescription,
      slug: data.slug,
      status: "Draft",
    }
  });

  function onSubmit(values: CourseSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(editCourse(values, data.id));

      if (error) {
        toast.error("An unexpected error occurred. PLese try again");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        form.reset()
        router.push("/admin/courses")

      } else if (result.status === "error") {
        toast.success(result.message);
      }
    });

    console.log(values);

  }


  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>

        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Title
            </FormLabel>
            <FormControl>
              <Input placeholder="Title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-4 items-end">
          <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Slug
              </FormLabel>
              <FormControl>
                <Input placeholder="Slug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="button" className="w-fit" onClick={() => {
            const titleValue = form.getValues("title")

            const slug = slugify(titleValue);

            form.setValue('slug', slug, { shouldValidate: true })


          }}>
            generate Slug <SparkleIcon className="ml-1" size={16} />
          </Button>
        </div>
        <FormField control={form.control} name="smallDescription" render={({ field }) => (
          <FormItem>
            <FormLabel>
              smallDescription
            </FormLabel>
            <FormControl>
              <Textarea placeholder="small Description" className="min-h-[120px]"{...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor field={field}
                />

              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField control={form.control} name="fileKey" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Thumbnail image
            </FormLabel>
            <FormControl>
              <Uploader onChange={field.onChange} value={field.value} />
              {/* <Input placeholder="Thumbnail url" {...field} /> */}
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>
                category
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="select Category" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {courseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}

                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>

              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="level" render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                level
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="select Value" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {courseLevels.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}

                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>

              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>
                Duration (hours)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Duration"
                  value={field.value?.toString() ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>
                pricr ($)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Price"
                  value={field.value?.toString() ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

        </div>
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>
              status
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="select status" />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                {courseStatus.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}

                  </SelectItem>
                ))}
              </SelectContent>

            </Select>

            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={pending}>
          {pending ? (
            <div className="flex items-center">
              Updating...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </div>
          ) : (
            <div className="flex items-center">
              Update Course
              <PlusIcon className="ml-2 h-4 w-4" />
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}

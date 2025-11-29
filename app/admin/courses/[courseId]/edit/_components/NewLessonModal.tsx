import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChapterSchemaType, LessonSchemaType, chapterSchema, lessonSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Plus, PlusCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { Form, useForm } from "react-hook-form";
import { createChapter, createLesson } from "./action";
import { tryCatch } from "@/hooks/try-catch";

export function NewLessonModal({courseId,chapterId}: {
    courseId: string;
    chapterId: string;

}) {
  const [isOpen, setIsOpen] = useState(false);
  const[pending,startTransition]=useTransition()

    const form = useForm<LessonSchemaType>({
          resolver: zodResolver(lessonSchema),
          defaultValues: {
           name: "",
           courseId: courseId,
           chapterId: chapterId,
          },
        });

    async function onSubmit(values: LessonSchemaType) {
            startTransition(async () => {
                const { data: result, error } = (await tryCatch(createLesson(values))) as {
                  data?: { status: "success" | "error"; message: string };
                  error?: any;
                };
               if(error){
               toast.error("An unexpected error occurred. Please try again");
                return;
               } 
                if(result?.status==="success"){    
                    toast.success(result.message);
                    setIsOpen(false);
                    form.reset();
                } else if(result?.status==="error"){
                    toast.error(result.message);
                }
        })
    }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline"className="w-full justify-center gap-1" >
         <Plus className="size-4"/> New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Create New lesson</DialogTitle>
            <DialogDescription>
                what would you like to name your new lesson?
            </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} name="name" render={({field}) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Lesson Name"{...field}/>
                            </FormControl>
                           <FormMessage/> 
                    </FormItem>
                )} />

               <DialogFooter>
                <Button disabled={pending}type="submit" >
                   {pending ? "Saving..." : "Sava Chapter"}
                </Button>
               </DialogFooter> 
            </form>

        </Form>
        </DialogContent>
    </Dialog>
  );
}

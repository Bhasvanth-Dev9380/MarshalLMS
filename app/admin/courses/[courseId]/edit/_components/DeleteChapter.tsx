import { AlertDialog, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteLesson } from "./action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

export function DeleteChapter
({ chapterId, courseId, lessonId }: { chapterId: string; courseId: string; lessonId: string; }) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    async function onSubmit() {
        startTransition(async () => {
            try {
                const { data: result } = await tryCatch(deleteLesson(lessonId, chapterId, courseId));
                if (!result) {
                    toast.error("An unexpected error occurred. Please try again.");
                    return;
                }

                if (result.status === "success") {
                    toast.success(result.message);
                    setOpen(false);
                } else {
                    toast.error(result.message);
                }
            } catch (err) {
                toast.error("An unexpected error occurred. Please try again.");
            }
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this lesson?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the lesson from the course.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={onSubmit} disabled={pending}>
                        {pending ? "Deleting..." : "Delete Lesson"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
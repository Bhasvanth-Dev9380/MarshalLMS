"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ReactNode, useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { AdminCourseTypeSingularType } from "@/app/data/admin/admin-get-courses";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { reorderLesson, reorderChapter } from "./_components/action";
import { NewChapterModal } from "./_components/NewChapterModal";
import { NewLessonModal } from "./_components/NewLessonModal";
import { DeleteLesson } from "./_components/DeleteLesson";

interface SortableItemProps {
  id: string | number;
  children: (listeners: DraggableSyntheticListeners) => ReactNode;
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string | number; // only relevant for lesson
  };
}

interface iAppProps {
  data: AdminCourseTypeSingularType;
}

interface LessonItem {
  id: string | number;
  title: string;
  order: number;
}

interface ChapterItem {
  id: string | number;
  title: string;
  order: number;
  isOpen: boolean;
  Lesson: LessonItem[];
}

export function CourseStructure({ data }: iAppProps) {
  const initialItems: ChapterItem[] =
    ((data as any).Chapter ?? []).map((chapter: any) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true,
      Lesson: ((chapter as any).Lesson ?? []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
      })) as LessonItem[],
    })) as ChapterItem[];

  const [items, setItems] = useState<ChapterItem[]>(initialItems);
   console.log(items);

   useEffect(() => {
    setItems((prevItems) => {
      const updatedItems = ((data as any).Chapter ?? []).map((chapter: any, index: number) => {
        const existingChapter = prevItems.find(
          (item) => String(item.id) === String(chapter.id)
        );

        const lessons = ((chapter as any).Lesson ?? []).map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          order: lesson.position,
        })) as LessonItem[];

        return {
          id: chapter.id,
          title: chapter.title,
          order: chapter.position ?? index + 1,
          isOpen: existingChapter ? existingChapter.isOpen : true,
          Lesson: lessons,
        } as ChapterItem;
      });

      return updatedItems;
    });
  }, [data]);
  
  // Assuming courseId is data.id
  const courseId = String((data as any).id);

  function SortableItem({
    children,
    id,
    className,
    data,
  }: SortableItemProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id, data });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "touch-none",
          className,
          isDragging ? "z-10 shadow-lg" : ""
        )}
      >
        {children(listeners)}
      </div>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type as
      | "chapter"
      | "lesson"
      | undefined;
    const overType = over.data.current?.type as
      | "chapter"
      | "lesson"
      | undefined;

    if (!activeType || !overType) return;

    // ==== REORDER CHAPTERS ====
    if (activeType === "chapter" && overType === "chapter") {
      setItems((prev) => {
        const oldIndex = prev.findIndex(
          (item) => String(item.id) === String(active.id)
        );
        const newIndex = prev.findIndex(
          (item) => String(item.id) === String(over.id)
        );

        if (oldIndex === -1 || newIndex === -1) {
          toast.error(
            "Could not find chapter old/new index for reordering."
          );
          return prev;
        }

        const reordered = arrayMove(prev, oldIndex, newIndex).map(
          (chapter, index) => ({
            ...chapter,
            order: index + 1,
          })
        );

        // build payload for server
        const chaptersToUpdate = reordered.map((chapter) => ({
          id: String(chapter.id),
          position: chapter.order,
          order: chapter.order,
        }));

        const reorderPromise = () =>
          reorderChapter(courseId, chaptersToUpdate);

        toast.promise(reorderPromise(), {
          loading: "Reordering chapters...",
          success: (result: any) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: (err) =>
            (err as Error)?.message || "Failed to reorder chapters",
        });

        return reordered;
      });

      return;
    }

    // ==== REORDER LESSONS (WITHIN SAME CHAPTER ONLY) ====
    if (activeType === "lesson" && overType === "lesson") {
      const fromChapterId = active.data.current
        ?.chapterId as string | number | undefined;
      const toChapterId = over.data.current
        ?.chapterId as string | number | undefined;

      if (
        !fromChapterId ||
        !toChapterId ||
        String(fromChapterId) !== String(toChapterId)
      ) {
        toast.error(
          "Moving lessons between different chapters is not supported yet."
        );
        return;
      }

      setItems((prev) => {
        const chapterIndex = prev.findIndex(
          (chapter) => String(chapter.id) === String(fromChapterId)
        );
        if (chapterIndex === -1) {
          toast.error("Could not find chapter for lesson reordering.");
          return prev;
        }

        const chapterToUpdate = prev[chapterIndex];

        const oldLessonIndex = chapterToUpdate.Lesson.findIndex(
          (lesson) => String(lesson.id) === String(active.id)
        );
        const newLessonIndex = chapterToUpdate.Lesson.findIndex(
          (lesson) => String(lesson.id) === String(over.id)
        );

        if (oldLessonIndex === -1 || newLessonIndex === -1) {
          toast.error("Could not find lesson for reordering.");
          return prev;
        }

        const reorderedLessons = arrayMove(
          chapterToUpdate.Lesson,
          oldLessonIndex,
          newLessonIndex
        ).map((lesson, index) => ({
          ...lesson,
          order: index + 1,
        }));

        const newItems = [...prev];
        newItems[chapterIndex] = {
          ...chapterToUpdate,
          Lesson: reorderedLessons,
        };

        // Call server action to persist order
        if (courseId) {
          const payload = reorderedLessons.map((lesson) => ({
            id: String(lesson.id),
            position: lesson.order,
            order: lesson.order,
          }));

          const chapterId = String(fromChapterId);

          const reorderPromise = () =>
            reorderLesson(chapterId, payload, courseId);

          toast.promise(reorderPromise(), {
            loading: "Reordering lessons...",
            success: (result: any) => {
              if (result.status === "success") return result.message;
              throw new Error(result.message);
            },
            error: (err) =>
              (err as Error)?.message || "Failed to reorder lessons",
          });
        }

        return newItems;
      });

      return;
    }
  }

  function toggleChapter(chapterId: string | number) {
    setItems((items) =>
      items.map((chapter) =>
        String(chapter.id) === String(chapterId)
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter
      )
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chapters</CardTitle>
          <NewChapterModal  courseId={data.id}/>
        </CardHeader>
        <CardContent className="space-y-8">
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                data={{ type: "chapter" }}
                className="mb-2"
              >
                {(listeners) => (
                  <Card>
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapter(item.id)}
                    >
                      {/* CHAPTER HEADER ROW */}
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-grab opacity-60 hover:opacity-100"
                            {...listeners}
                          >
                            <GripVertical className="size-4" />
                          </Button>

                          <CollapsibleTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex items-center"
                            >
                              {item.isOpen ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <p className="cursor-pointer hover:text-primary">
                            {item.title}
                          </p>
                        </div>

                        {/* DELETE BUTTON AT RIGHT END */}
                        <Button size="icon" variant="outline">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <CollapsibleContent>
                        {/* LESSON LIST (INDENTED) */}
                        <div className="pl-10 pb-3 space-y-1">
                          <SortableContext
                            items={item.Lesson.map((lesson) => lesson.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {item.Lesson.map((lesson) => (
                              <SortableItem
                                key={lesson.id}
                                id={lesson.id}
                                data={{
                                  type: "lesson",
                                  chapterId: item.id,
                                }}
                              >
                                {(lessonListeners) => (
                                  <div className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        {...lessonListeners}
                                      >
                                        <GripVertical className="size-4" />
                                      </Button>
                                    <FileText className="size-4" />
                                    <Link
                                      href={`/admin/courses/${data.id}/${item.id}/${lesson.id}`}
                                      className="flex items-center gap-1 hover:text-primary"
                                    >
                                      <LinkIcon className="size-3" />
                                      <span>{lesson.title}</span>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        DeleteLesson({
                                          chapterId: String(item.id),
                                          courseId: String(data.id),
                                          lessonId: String(lesson.id),
                                        })
                                      }
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                    </div>
                                    <Button variant="outline" size="icon">
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>
                        </div>

                        {/* FULL-WIDTH CREATE BUTTON AT BOTTOM */}
                        <div className="border-t">
                          <NewLessonModal chapterId={String(item.id)} courseId={String(data.id)}/>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
}

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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ReactNode, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { AdminCourseTypeSingularType } from "@/app/data/admin/admin-get-courses";
import { cn } from "@/lib/utils";
import { Collapsible } from "@radix-ui/react-collapsible";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string | number;
  children: (listeners: DraggableSyntheticListeners) => ReactNode;
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string; // only relevant for lesson
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

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setItems((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  // 👇 FIX: accept the same type as ChapterItem["id"]
  function toggleChapter(chapterId: ChapterItem["id"]) {
    setItems((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
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
        </CardHeader>
        <CardContent>
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
                      onOpenChange={() => toggleChapter(item.id)} // ✅ now OK
                    >
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="cursor-grab opacity-60 hover:opacity-100"
                            {...listeners}
                          >
                            <GripVertical className="size-4" />
                          </button>
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </div>
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
  

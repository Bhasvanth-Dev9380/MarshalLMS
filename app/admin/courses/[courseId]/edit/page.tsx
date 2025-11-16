import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@radix-ui/react-tabs";
import { EditCourseForm } from "./_components/EditCourseForm";
import { CourseStructure } from "./CourseSturecture";

type Params = Promise<{ courseId: string }>;

export default async function EditRoute({ params }: { params: Params }) {
  const { courseId } = await params;
  const data = await adminGetCourse(courseId);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Edit Course: {" "}
        <span className="text-primary underline">{data.title}</span>
      </h1>
      <Tabs defaultValue=" basic-info" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="Course-Structure">Course Structure</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Basic info</CardTitle>
              <CardDescription>Provide basic information about the course</CardDescription>
            </CardHeader>
            <CardContent>
              <EditCourseForm data={data} />
            </CardContent>

          </Card>
        </TabsContent>
        <TabsContent value="Course-Structure">
          <Card>
            <CardHeader>
              <CardTitle>Course-Structure</CardTitle>
              <CardDescription>Hear you can update your course Structure</CardDescription>
            </CardHeader>
            <CardContent>
              <CourseStructure />
            </CardContent>

          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
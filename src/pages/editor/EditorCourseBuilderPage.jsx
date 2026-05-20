import CourseBuilderRoutePage from '../../components/common/CourseBuilderRoutePage.jsx';

export default function EditorCourseBuilderPage() {
  return (
    <CourseBuilderRoutePage
      scope="editor"
      title="Biên tập nội dung"
      backPath="/editor/dashboard"
      builderBasePath="/editor/courses"
    />
  );
}

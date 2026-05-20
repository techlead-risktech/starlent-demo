import CourseBuilderRoutePage from '../../components/common/CourseBuilderRoutePage.jsx';

export default function AdminCourseBuilderPage() {
  return (
    <CourseBuilderRoutePage
      scope="admin"
      title="Quản trị hệ thống"
      backPath="/admin/dashboard"
      builderBasePath="/admin/courses"
    />
  );
}

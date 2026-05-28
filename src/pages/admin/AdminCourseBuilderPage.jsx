import CourseBuilderRoutePage from '../../components/common/CourseBuilderRoutePage.jsx';
import { useI18n } from '../../i18n/index.jsx';

export default function AdminCourseBuilderPage() {
  const { t } = useI18n();
  return (
    <CourseBuilderRoutePage
      scope="admin"
      title={t('learnerPages.adminPages.courseBuilderTitle')}
      backPath="/admin/dashboard"
      builderBasePath="/admin/courses"
    />
  );
}

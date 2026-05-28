import CourseBuilderRoutePage from '../../components/common/CourseBuilderRoutePage.jsx';
import { useI18n } from '../../i18n/index.jsx';

export default function EditorCourseBuilderPage() {
  const { t } = useI18n();
  return (
    <CourseBuilderRoutePage
      scope="editor"
      title={t('learnerPages.editorPages.courseBuilderTitle')}
      backPath="/editor/dashboard"
      builderBasePath="/editor/courses"
    />
  );
}

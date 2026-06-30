import { useParams, Navigate } from 'react-router-dom';
import { getModule, getLesson, getAdjacentLessons } from '../content/curriculum';
import { LessonTemplate } from '../components/lesson/LessonTemplate';
import { Layout } from '../components/layout/Layout';
import { RequireAuth } from '../components/auth/RequireAuth';

export function LessonPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const mod    = getModule(moduleId!);
  const lesson = getLesson(moduleId!, lessonId!);

  if (!mod || !lesson) return <Navigate to="/modules" replace />;

  const { prev, next } = getAdjacentLessons(moduleId!, lessonId!);

  return (
    <Layout>
      <RequireAuth>
        <LessonTemplate module={mod} lesson={lesson} prevLesson={prev} nextLesson={next} />
      </RequireAuth>
    </Layout>
  );
}

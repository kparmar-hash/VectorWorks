import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Modules } from './pages/Modules';
import { ModuleOverview } from './pages/ModuleOverview';
import { LessonPage } from './pages/LessonPage';
import { SimulationsGallery } from './pages/SimulationsGallery';
import { Reference } from './pages/Reference';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route path="/modules" element={<Modules />} />
      <Route path="/modules/:moduleId" element={<ModuleOverview />} />
      <Route path="/modules/:moduleId/:lessonId" element={<LessonPage />} />
      <Route path="/simulations" element={<SimulationsGallery />} />
      <Route path="/reference" element={<Reference />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

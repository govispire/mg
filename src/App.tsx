import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import StudentRoutes from '@/routes/StudentRoutes';
import MentorRoutes from '@/routes/MentorRoutes';
import AdminRoutes from '@/routes/AdminRoutes';
import EmployeeRoutes from '@/routes/EmployeeRoutes';
import SuperAdminRoutes from '@/routes/SuperAdminRoutes';
import OwnerRoutes from '@/routes/OwnerRoutes';
import Index from '@/pages/Index';
import Pricing from '@/pages/Pricing';
import Blog from '@/pages/Blog';
import BlogArticle from '@/pages/BlogArticle';
import CurrentAffairs from '@/pages/CurrentAffairs';
import CurrentAffairsReader from '@/pages/CurrentAffairsReader';
import TopicArticlesPage from '@/pages/student/TopicArticlesPage';
import DailyNewsPage from '@/pages/student/DailyNewsPage';
import Downloads from '@/pages/Downloads';
import ExamNotifications from '@/pages/ExamNotifications';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/current-affairs" element={<CurrentAffairs />} />
        <Route path="/current-affairs/:id" element={<CurrentAffairsReader />} />
        <Route path="/current-affairs/topic/:topic" element={<TopicArticlesPage />} />
        <Route path="/current-affairs/date/:date" element={<DailyNewsPage />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/exam-notifications" element={<ExamNotifications />} />
        <Route path="/student/*" element={<StudentRoutes />} />
        <Route path="/mentor/*" element={<MentorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/employee/*" element={<EmployeeRoutes />} />
        <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
        <Route path="/owner/*" element={<OwnerRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;

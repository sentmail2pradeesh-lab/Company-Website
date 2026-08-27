import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { JobProvider } from './context/JobContext';

import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import LoginPopup from './components/LoginPopup';
import ContactPopup from './components/ContactPopup';

import Home from './pages/Home';
import PhotoEditing from './pages/PhotoEditing';
import VideoEditing from './pages/VideoEditing';
import DigitalMarketing from './pages/DigitalMarketing';
import SoftwareDevelopment from './pages/SoftwareDevelopment';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';

// Dashboard Imports (Hidden for public website deployment)
// import DashboardLayout from './components/dashboard/DashboardLayout';
// import DashboardOverview from './pages/dashboard/DashboardOverview';
// import TodaysJobsPage from './pages/dashboard/TodaysJobsPage';
// import QCPendingPage from './pages/dashboard/QCPendingPage';
// import AssignmentsPage from './pages/dashboard/AssignmentsPage';
// import ProductionSheetsPage from './pages/dashboard/ProductionSheetsPage';
// import ClientHistorySummaryPage from './pages/dashboard/ClientHistorySummaryPage';

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <JobProvider>
          <BrowserRouter>
            <SmoothScroll>
              <ScrollToTop />
              <Routes>
                {/* Main Website Landing Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/photo-editing" element={<PhotoEditing />} />
                <Route path="/video-editing" element={<VideoEditing />} />
                <Route path="/digital-marketing" element={<DigitalMarketing />} />
                <Route path="/software-development" element={<SoftwareDevelopment />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetail />} />
                <Route path="/contact" element={<Contact />} />

                {/* Employee & Admin Dashboard System Routes (Hidden for deployment) */}
                {/*
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="jobs" element={<TodaysJobsPage />} />
                  <Route path="qc-pending" element={<QCPendingPage />} />
                  <Route path="assignments" element={<AssignmentsPage />} />
                  <Route path="production-sheets" element={<ProductionSheetsPage />} />
                  <Route path="client-summary" element={<ClientHistorySummaryPage />} />
                </Route>
                */}
              </Routes>
              <LoginPopup />
              <ContactPopup />
            </SmoothScroll>
          </BrowserRouter>
        </JobProvider>
      </UIProvider>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import LoginPopup from './components/LoginPopup';
import ContactPopup from './components/ContactPopup';
import Home from './pages/Home';
import PhotoEditing from './pages/PhotoEditing';
import VideoEditing from './pages/VideoEditing';
import DigitalMarketing from './pages/DigitalMarketing';
import SoftwareDevelopment from './pages/SoftwareDevelopment';
import Blogs from './pages/Blogs';

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/photo-editing" element={<PhotoEditing />} />
            <Route path="/video-editing" element={<VideoEditing />} />
            <Route path="/digital-marketing" element={<DigitalMarketing />} />
            <Route path="/software-development" element={<SoftwareDevelopment />} />
            <Route path="/blogs" element={<Blogs />} />
          </Routes>
          <LoginPopup />
          <ContactPopup />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}

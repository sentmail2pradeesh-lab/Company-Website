import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPopup from './components/LoginPopup';
import Home from './pages/Home';
import PhotoEditing from './pages/PhotoEditing';
import VideoEditing from './pages/VideoEditing';
import Blogs from './pages/Blogs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/photo-editing" element={<PhotoEditing />} />
          <Route path="/video-editing" element={<VideoEditing />} />
          <Route path="/blogs" element={<Blogs />} />
        </Routes>
        <LoginPopup />
      </BrowserRouter>
    </AuthProvider>
  );
}

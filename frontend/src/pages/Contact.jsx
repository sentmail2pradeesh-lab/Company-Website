import Navbar from '../components/Navbar';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-[72px]">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

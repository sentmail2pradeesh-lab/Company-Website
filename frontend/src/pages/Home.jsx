import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
//import TrustedClients from '../components/TrustedClients';
import ServicesSection from '../components/ServicesSection';
import WhyVista from '../components/WhyVista';
import Workflow from '../components/Workflow';
//import PortfolioSection from '../components/PortfolioSection';
//import Testimonials from '../components/Testimonials';
import StatsSection from '../components/StatsSection';
import LatestBlogs from '../components/LatestBlogs';
//import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { STATS } from '../lib/data';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      {/* <TrustedClients /> */}
      <ServicesSection />
      <WhyVista />
      <Workflow />
      {/* <PortfolioSection /> */}
      <StatsSection
        stats={STATS}
        intro="Numbers don't lie — here's the impact we've delivered for brands around the world."
      />
      {/* <Testimonials /> */}
      <LatestBlogs />
      {/* <FAQ /> */}
      <Footer />
    </>
  );
}

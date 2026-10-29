import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroForm from '@/components/sections/HeroForm';
import ROICalculator from '@/components/sections/ROICalculator';
import IntegrationBanner from '@/components/sections/IntegrationBanner';
import '@/styles/globals.css';

function App() {
  return (
    <>
      <a
        href="#lead-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="pt-16">
        {/* P0 sections */}
        <HeroForm />
        <IntegrationBanner />
        <ROICalculator />
      </main>

      <Footer />
    </>
  );
}

export default App;

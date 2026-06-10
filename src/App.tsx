import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from '@/hooks/use-lang';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/sonner';
import Preloader from '@/components/Preloader';
import { ScrollProgress } from '@/components/ScrollProgress';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import { Premiere } from '@/components/Premiere';
import Portfolio from '@/components/Portfolio';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

// Админка грузится отдельным чанком — публичные посетители её код не качают.
const AdminPage = lazy(() => import('@/components/AdminPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      <div className="text-accent text-lg animate-pulse">Loading...</div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Premiere />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <div className="min-h-screen bg-background text-foreground grain-overlay">
            <ScrollProgress />
            <Preloader />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <AdminPage />
                  </Suspense>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

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
import AdminPage from '@/components/AdminPage';

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
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
            <Toaster />
          </div>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

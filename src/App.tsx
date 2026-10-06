import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TrailerModal } from './components/TrailerModal';
import { SearchModal } from './components/SearchModal';

import { AppLoader } from './components/AppLoader';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { SeriesPage } from './pages/SeriesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { PeoplePage } from './pages/PeoplePage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export function App() {
  const [booting, setBooting] = React.useState(true);
  const [progress, setProgress] = React.useState(12);
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  useEffect(() => {
    // Stage 1: Document and router runtime readiness
    const step1 = setTimeout(() => {
      setProgress(38);
    }, 50);

    // Stage 2: Theme tokens and fonts readiness
    const step2 = setTimeout(() => {
      setProgress(72);
    }, 140);

    // Stage 3: Critical UI context setup
    const step3 = setTimeout(() => {
      setProgress(94);
    }, 230);

    // Stage 4: Application initialization complete (100%)
    let finishTimer: ReturnType<typeof setTimeout>;
    let exitTimer: ReturnType<typeof setTimeout>;

    const step4 = setTimeout(() => {
      setProgress(100);

      // Brief hold at 100% before smooth fade-out (70ms)
      finishTimer = setTimeout(() => {
        setIsFadingOut(true);

        // Complete unmount after 200ms fade-out transition
        exitTimer = setTimeout(() => {
          setBooting(false);
        }, 200);
      }, 70);
    }, 320);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
      clearTimeout(finishTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <AppProvider>
      {booting && <AppLoader progress={progress} isFadingOut={isFadingOut} />}
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-[#0B0B0D] text-[#F2F0EC] selection:bg-[#E43D3D] selection:text-white font-sans antialiased">
          <Header />

          <main className="flex-grow">
            <Routes>
              {/* Product Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/movie" element={<MoviesPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/movie/category/:name" element={<MoviesPage />} />
              <Route path="/movies/category/:name" element={<MoviesPage />} />
              
              <Route path="/tv" element={<SeriesPage />} />
              <Route path="/series" element={<SeriesPage />} />
              <Route path="/tv/:id" element={<SeriesDetailPage />} />
              <Route path="/series/:id" element={<SeriesDetailPage />} />
              <Route path="/tv/category/:name" element={<SeriesPage />} />
              <Route path="/series/category/:name" element={<SeriesPage />} />
              
              <Route path="/person/:id" element={<PersonDetailPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/person" element={<PeoplePage />} />

              <Route path="/genre/:id/movie" element={<MoviesPage />} />
              <Route path="/genre/:id/tv" element={<SeriesPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/search" element={<DiscoverPage />} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />

          {/* Interactive Modals */}
          <TrailerModal />
          <SearchModal />
        </div>
      </Router>
    </AppProvider>
  );
}
export default App;

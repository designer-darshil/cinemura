import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TrailerModal } from './components/TrailerModal';
import { VidLinkModal } from './components/VidLinkModal';
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
import { WatchlistPage } from './pages/WatchlistPage';
import { EditorialIndexPage } from './pages/EditorialIndexPage';
import { EditorialArticlePage } from './pages/EditorialArticlePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
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
  return (
    <AppProvider>
      <WatchlistProvider>
        <AppLoader />
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
                
                {/* Watchlist & Editorial Routes */}
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/editorial" element={<EditorialIndexPage />} />
                <Route path="/editorial/:slug" element={<EditorialArticlePage />} />

                {/* About & Contact Routes */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />

            {/* Interactive Modals */}
            <TrailerModal />
            <VidLinkModal />
            <SearchModal />
          </div>
        </Router>
      </WatchlistProvider>
    </AppProvider>
  );
}

export default App;

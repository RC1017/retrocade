import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Gamepad2, X, Maximize2, ExternalLink, ArrowLeft } from 'lucide-react';
import gamesData from './games.json';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleFullScreen = () => {
    const element = gameContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement && !isFullScreen) {
      // Try native fullscreen first
      const requestMethod = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
      if (requestMethod) {
        requestMethod.call(element).catch(() => {
          // Fallback to CSS-only fullscreen if native is blocked
          setIsFullScreen(true);
        });
      } else {
        // Fallback to CSS-only fullscreen if native is unsupported
        setIsFullScreen(true);
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement) {
        const exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exitMethod) exitMethod.call(document);
      }
      setIsFullScreen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Marquee */}
      <header className="border-b-2 border-black overflow-hidden bg-black text-white py-2">
        <div className="marquee-track whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-display text-2xl uppercase mx-8">
              Arcade Unblocked • Play Anywhere • No Limits • 
            </span>
          ))}
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="border-b-2 border-black p-6 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-3 rotate-[-3deg] font-display text-4xl uppercase tracking-tighter">
            Arcade
          </div>
          <div className="font-display text-4xl uppercase tracking-tighter">
            Unblocked
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
          <input
            type="text"
            placeholder="SEARCH GAMES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:bg-yellow-100 transition-colors"
          />
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-12">
        {selectedGame ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <button 
              onClick={() => setSelectedGame(null)}
              className="flex items-center gap-2 font-mono text-sm mb-8 hover:underline group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              BACK TO GAMES
            </button>

            <div className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
              <div className="border-b-4 border-black p-4 flex justify-between items-center bg-yellow-400">
                <h2 className="font-display text-3xl uppercase tracking-tight">{selectedGame.title}</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={toggleFullScreen}
                    className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <a 
                    href={selectedGame.iframeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div 
                ref={gameContainerRef}
                className={`relative bg-black transition-all ${isFullScreen ? 'fixed inset-0 z-[100] w-screen h-screen' : 'aspect-video'}`}
              >
                {isFullScreen && (
                  <button 
                    onClick={toggleFullScreen}
                    className="absolute top-4 right-4 z-[110] p-2 bg-white border-2 border-black hover:bg-yellow-400 transition-colors"
                    title="Exit Fullscreen"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
                <iframe
                  src={selectedGame.iframeUrl}
                  className="w-full h-full border-none"
                  allow="autoplay; fullscreen; keyboard-lock; pointer-lock; gamepad"
                  allowFullScreen
                  title={selectedGame.title}
                />
              </div>

              <div className="p-8 border-t-4 border-black">
                <p className="font-mono text-lg leading-relaxed">{selectedGame.description}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedGame(game)}
                  className="group cursor-pointer border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden"
                >
                  <div className="aspect-video overflow-hidden border-b-2 border-black">
                    <img 
                      src={game.thumbnail} 
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-2xl uppercase tracking-tight group-hover:text-yellow-600 transition-colors">
                        {game.title}
                      </h3>
                      <span className="font-mono text-xs border border-black px-2 py-1">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-black/60 line-clamp-2 font-mono">
                      {game.description}
                    </p>
                  </div>
                  <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Gamepad2 className="w-8 h-8" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-4xl uppercase opacity-20">No Games Found</p>
          </div>
        )}
      </main>

      <footer className="border-t-2 border-black p-12 bg-black text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h4 className="font-display text-3xl uppercase mb-4">Arcade Unblocked</h4>
            <p className="font-mono text-sm opacity-60">
              A curated collection of web-based games designed to be played anywhere. 
              No downloads, no installs, just fun.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-center">
            <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-2">Built for Speed</p>
            <div className="font-display text-xl">© 2026 ARCADE SYSTEM</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

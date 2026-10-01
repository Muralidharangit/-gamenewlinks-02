import React, { useState, useMemo } from "react";
import { games } from "../../constants/machine";
import type { GameItem } from "../../types";
import { GameCard } from "./GameCard";
import { Modal } from "../common/Modal";

interface GameGridProps {
  balance: number;
  onBalanceChange?: (newBalance: number) => void;
  showToast?: (message: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Games", icon: "fa-solid fa-table-cells-large" },
  { id: "slots", label: "Slots", icon: "fa-solid fa-gem text-info" },
  { id: "crash", label: "Crash", icon: "fa-solid fa-rocket text-warning", isHot: true },
  { id: "table", label: "Table Games", icon: "fa-solid fa-dice text-light" },
  { id: "live", label: "Live Casino", icon: "fa-solid fa-video text-danger" },
  { id: "sports", label: "Sports", icon: "fa-solid fa-futbol text-success" },
  { id: "instant", label: "Instant", icon: "fa-solid fa-bolt text-warning" },
];

const POPULAR_GAMES = [
  {
    id: "pop-aviator",
    name: "aviator",
    title: "AVIATOR",
    subtitle: "FLY HIGH • 10,000X MAX",
    category: "crash",
    categories: ["popular", "crash"],
    theme: "theme-red" as const,
    badge: { text: "HOT", type: "hot" as const, icon: "fa-solid fa-fire" },
    image: "/assets/games/1.png",
    actionText: "PLAY NOW",
  },
  {
    id: "pop-mines",
    name: "mines",
    title: "MINES",
    subtitle: "AVOID MINES • CASH OUT",
    category: "table",
    categories: ["popular", "table"],
    theme: "theme-green" as const,
    badge: { text: "VIP", type: "green" as const, icon: "fa-solid fa-shield-halved" },
    image: "/assets/games/4.png",
    actionText: "PLAY NOW",
  },
  {
    id: "pop-plinko",
    name: "plinko",
    title: "PLINKO",
    subtitle: "DROP BALL • 1,000X MULTI",
    category: "instant",
    categories: ["popular", "instant"],
    theme: "theme-magenta" as const,
    badge: { text: "HOT", type: "hot" as const, icon: "fa-solid fa-bullseye" },
    image: "/assets/games/3.png",
    actionText: "DROP NOW",
  },
  {
    id: "pop-dice",
    name: "dice",
    title: "DICE",
    subtitle: "ROLL & WIN • 98.6% RTP",
    category: "table",
    categories: ["popular", "table"],
    theme: "theme-purple" as const,
    badge: { text: "TOP", type: "cyan" as const, icon: "fa-solid fa-dice" },
    image: "/assets/games/2.png",
    actionText: "ROLL NOW",
  },
  {
    id: "pop-hilo",
    name: "hilo",
    title: "HILO",
    subtitle: "GUESS NEXT CARD",
    category: "table",
    categories: ["popular", "table"],
    theme: "theme-blue" as const,
    badge: { text: "NEW", type: "cyan" as const, icon: "fa-solid fa-diamond" },
    image: "/assets/games/5.png",
    actionText: "PLAY NOW",
  },
  {
    id: "pop-goal",
    name: "goal",
    title: "GOAL",
    subtitle: "SCORE BIG",
    category: "sports",
    categories: ["popular", "sports"],
    theme: "theme-gold" as const,
    badge: { text: "POPULAR", type: "cyan" as const, icon: "fa-solid fa-futbol" },
    image: "/assets/games/6.png",
    actionText: "KICK NOW",
  },
  {
    id: "pop-hotline",
    name: "hotline",
    title: "HOTLINE",
    subtitle: "FAST ACTION",
    category: "instant",
    categories: ["popular", "instant"],
    theme: "theme-red" as const,
    badge: { text: "HOT", type: "hot" as const, icon: "fa-solid fa-fire" },
    image: "/assets/games/1.png",
    actionText: "PLAY NOW",
  },
  {
    id: "pop-keno",
    name: "keno",
    title: "KENO",
    subtitle: "LOTTERY GAME",
    category: "table",
    categories: ["popular", "table"],
    theme: "theme-purple" as const,
    badge: { text: "CLASSIC", type: "cyan" as const, icon: "fa-solid fa-list-ol" },
    image: "/assets/games/2.png",
    actionText: "PLAY NOW",
  },
  {
    id: "pop-multi-keno",
    name: "multi keno",
    title: "KENO 80 / MULTI KENO",
    subtitle: "80 BALLS • BIG WINS",
    category: "table",
    categories: ["popular", "table"],
    theme: "theme-magenta" as const,
    badge: { text: "VIP", type: "green" as const, icon: "fa-solid fa-gem" },
    image: "/assets/games/3.png",
    actionText: "PLAY NOW",
  },
  {
    id: "pop-mini-roulette",
    name: "mini roulette",
    title: "MINI ROULETTE",
    subtitle: "QUICK SPINS",
    category: "table",
    categories: ["popular", "table"],
    theme: "theme-blue" as const,
    badge: { text: "HOT", type: "hot" as const, icon: "fa-solid fa-circle" },
    image: "/assets/games/4.png",
    actionText: "SPIN NOW",
  },
  {
    id: "pop-balloon",
    name: "balloon",
    title: "BALLOON",
    subtitle: "DON'T LET IT POP",
    category: "crash",
    categories: ["popular", "crash"],
    theme: "theme-gold" as const,
    badge: { text: "FUN", type: "gold" as const, icon: "fa-solid fa-wind" },
    image: "/assets/games/5.png",
    actionText: "PLAY NOW",
  },
  {
    id: "pop-trader",
    name: "trader",
    title: "TRADER",
    subtitle: "MARKET CRASH",
    category: "crash",
    categories: ["popular", "crash"],
    theme: "theme-green" as const,
    badge: { text: "NEW", type: "cyan" as const, icon: "fa-solid fa-chart-line" },
    image: "/assets/games/6.png",
    actionText: "TRADE NOW",
  },
  {
    id: "pop-pilot-chicken",
    name: "pilot chicken",
    title: "PILOT CHICKEN",
    subtitle: "FLYING HIGH",
    category: "crash",
    categories: ["popular", "crash"],
    theme: "theme-red" as const,
    badge: { text: "FUN", type: "hot" as const, icon: "fa-solid fa-kiwi-bird" },
    image: "/assets/games/avi.png",
    actionText: "FLY NOW",
  },
];

const SLOT_SYMBOLS = ["🍒", "🍋", "🍇", "💎", "👑", "⚡", "7️⃣"];

export const GameGrid: React.FC<GameGridProps> = ({
  balance,
  onBalanceChange,
  showToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Interactive Slot Game Theater Modal State
  const [activeTheaterGame, setActiveTheaterGame] = useState<{ title: string } | null>(null);
  const [currentBet, setCurrentBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(["💎", "7️⃣", "👑"]);
  const [winAmount, setWinAmount] = useState<number | null>(null);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory =
        selectedCategory === "all" || game.categories.includes(selectedCategory);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.name.toLowerCase().includes(q) ||
        game.categories.some((c) => c.includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleLaunchGame = (game: { title: string }) => {
    setActiveTheaterGame(game);
    setWinAmount(null);
  };

  const handleCloseTheater = () => {
    setActiveTheaterGame(null);
    setIsSpinning(false);
    setWinAmount(null);
  };

  const handleSpinReels = () => {
    if (isSpinning) return;
    if (balance < currentBet) {
      showToast?.("Insufficient Balance! Please adjust bet.");
      return;
    }

    if (onBalanceChange) {
      onBalanceChange(balance - currentBet);
    }

    setIsSpinning(true);
    setWinAmount(null);

    // Reel 1
    setTimeout(() => {
      setReels((prev) => [
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        prev[1],
        prev[2],
      ]);
    }, 450);

    // Reel 2
    setTimeout(() => {
      setReels((prev) => [
        prev[0],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        prev[2],
      ]);
    }, 750);

    // Reel 3 & Win Calculation
    setTimeout(() => {
      const sym1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      const sym2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      const sym3 =
        Math.random() < 0.4
          ? sym2
          : SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];

      setReels([sym1, sym2, sym3]);

      const isThreeMatch = sym1 === sym2 && sym2 === sym3;
      const isTwoMatch = sym1 === sym2 || sym2 === sym3;

      if (isThreeMatch) {
        const winVal = currentBet * 10;
        if (onBalanceChange) onBalanceChange(balance - currentBet + winVal);
        setWinAmount(winVal);
        showToast?.(`🎉 Jackpot Win! N$ ${winVal.toFixed(2)}`);
      } else if (isTwoMatch) {
        const winVal = currentBet * 2.5;
        if (onBalanceChange) onBalanceChange(balance - currentBet + winVal);
        setWinAmount(winVal);
        showToast?.(`🎉 Winner! N$ ${winVal.toFixed(2)}`);
      }

      setIsSpinning(false);
    }, 1100);
  };

  return (
    <>
      {/* ==============================================================
           SECTION 1: CATEGORY FILTER SECTION (GAMES BY CATEGORY)
      =============================================================== */}
      {false && (
      <section id="categorySection" className="mb-5 showcase-block-panel">
        <div className="section-header-bar">
          <h2 className="section-header-title">
            <i className="fa-solid fa-layer-group text-info"></i> Games by Category
          </h2>
          <div className="d-none d-sm-flex align-items-center gap-2">
            <button
              type="button"
              className="btn-view-all"
              onClick={() => setSelectedCategory("all")}
            >
              <span>View All</span> <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Category Navigation Bar & Search */}
        <div className="category-nav-bar">
          <div className="category-scroll-container" id="categoryTabs">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`cat-pill ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery("");
                }}
              >
                <i className={cat.icon}></i>
                <span>{cat.label}</span>
                {cat.isHot && (
                  <span className="hot-tag">
                    <i className="fa-solid fa-fire"></i> HOT
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar & Count */}
          <div className="d-flex align-items-center gap-3 ms-auto mt-2 mt-md-0">
            <div className="search-box-station">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                id="gameSearchInput"
                placeholder="Search games by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="game-count-hud d-none d-sm-inline-flex">
              <span id="gameCountBadge" className="count-num">
                {filteredGames.length}
              </span>
              <span>Games Available</span>
            </div>
          </div>
        </div>

        {/* Filtered Games Grid */}
        <div className="games-grid" id="categoryGamesGridContainer">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onPlay={handleLaunchGame} />
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div id="noGamesFoundState" className="text-center py-5">
            <div className="mb-3" style={{ fontSize: "3rem", color: "#a855f7" }}>
              <i className="fa-solid fa-gamepad"></i>
            </div>
            <h3 className="fw-bold text-light mb-2">No Games Found</h3>
            <p className="text-secondary small mb-4">
              No matching games in this category. Try another filter or search term.
            </p>
            <button
              className="btn btn-outline-warning rounded-pill px-4 py-2"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
      )}

      {/* ==============================================================
           SECTION 2: FEATURED GAMES
      =============================================================== */}
      {/* <section id="featuredSection" className="mb-5 showcase-block-panel">
        <div className="section-header-bar" id="featuredHeader">
          <h2 className="section-header-title">
            <i className="fa-solid fa-star text-warning"></i> Featured Games
          </h2>
          <a href="#categorySection" className="btn-view-all">
            <span>View All</span> <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        <div className="games-grid" id="gamesGridContainer">
          {FEATURED_GAMES.map((game) => (
            <GameCard key={`featured-${game.id}`} game={game} onPlay={handleLaunchGame} />
          ))}
        </div>
      </section> */}

      {/* ==============================================================
           SECTION 3: POPULAR GAMES (8 CARDS WITH PLAYERS COUNT)
      =============================================================== */}
      <section id="popularSection" className="mb-5 showcase-block-panel">
        <div className="section-header-bar" id="popularHeader">
          <h2 className="section-header-title">
            <i className="fa-solid fa-fire text-danger"></i> Popular Games
          </h2>
          <a href="#categorySection" className="btn-view-all">
            <span>View All</span> <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        <div className="games-grid" id="popularGamesGridContainer">
          {POPULAR_GAMES.map((game) => (
            <GameCard key={`popular-${game.id}`} game={game as unknown as GameItem} onPlay={handleLaunchGame} />
          ))}
        </div>
      </section>

      {/* ==============================================================
           SECTION 4: 3-COLUMN SHOWCASE (NEW & HOT, LIVE CASINO, SPORTS)
      =============================================================== */}
      <div className="tri-showcase-grid mb-5">
        {/* Block 1: New & Hot */}
        <div className="showcase-block-panel">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="fw-bold text-light text-uppercase d-flex align-items-center gap-2"
              style={{ fontSize: "0.88rem", fontFamily: "'Rajdhani', sans-serif" }}
            >
              <i className="fa-solid fa-fire text-danger"></i> New & Hot
            </span>
            <a href="javascript:void(0)" className="btn-view-all py-1 px-2" style={{ fontSize: "0.72rem" }}>
              View All <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div className="mini-showcase-grid">
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Sugar Rush" })}
            >
              <span className="mini-badge mini-badge-new">NEW</span>
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/4.png"
                  alt="Sugar Rush"
                  onError={(e) => { e.currentTarget.src = "/assets/games/1.png"; }}
                />
              </div>
              <div className="mini-game-label">Sugar Rush</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Bigger Bass Bonanza" })}
            >
              <span className="mini-badge mini-badge-hot">HOT</span>
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/2250e474-e3ef-4219-b65d-6770ccf51551.png"
                  alt="Bigger Bass"
                  onError={(e) => { e.currentTarget.src = "/assets/games/2.png"; }}
                />
              </div>
              <div className="mini-game-label">Bigger Bass</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Fortune Tiger" })}
            >
              <span className="mini-badge mini-badge-new">NEW</span>
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/ec848250-71ad-4cdb-8fac-5da20a956833.png"
                  alt="Fortune Tiger"
                  onError={(e) => { e.currentTarget.src = "/assets/games/3.png"; }}
                />
              </div>
              <div className="mini-game-label">Fortune Tiger</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Zeus vs Hades" })}
            >
              <span className="mini-badge mini-badge-hot">HOT</span>
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/3.png"
                  alt="Zeus vs Hades"
                  onError={(e) => { e.currentTarget.src = "/assets/games/6.png"; }}
                />
              </div>
              <div className="mini-game-label">Zeus vs Hades</div>
            </div>
          </div>
        </div>

        {/* Block 2: Live Casino */}
        <div className="showcase-block-panel">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="fw-bold text-light text-uppercase d-flex align-items-center gap-2"
              style={{ fontSize: "0.88rem", fontFamily: "'Rajdhani', sans-serif" }}
            >
              <i className="fa-solid fa-user-tie text-warning"></i> Live Casino
            </span>
            <a href="javascript:void(0)" className="btn-view-all py-1 px-2" style={{ fontSize: "0.72rem" }}>
              View All <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div className="mini-showcase-grid">
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Live Roulette" })}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/5.png"
                  alt="Roulette"
                  onError={(e) => { e.currentTarget.src = "/assets/games/1.png"; }}
                />
              </div>
              <div className="mini-game-label">Roulette</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Live Blackjack" })}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/6.png"
                  alt="Blackjack"
                  onError={(e) => { e.currentTarget.src = "/assets/games/2.png"; }}
                />
              </div>
              <div className="mini-game-label">Blackjack</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Live Baccarat" })}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/2.png"
                  alt="Baccarat"
                  onError={(e) => { e.currentTarget.src = "/assets/games/3.png"; }}
                />
              </div>
              <div className="mini-game-label">Baccarat</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => handleLaunchGame({ title: "Live Dragon Tiger" })}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/ede12845-5bed-410c-adc3-148d0d0abe79.png"
                  alt="Dragon Tiger"
                  onError={(e) => { e.currentTarget.src = "/assets/games/4.png"; }}
                />
              </div>
              <div className="mini-game-label">Dragon Tiger</div>
            </div>
          </div>
        </div>

        {/* Block 3: Sports & Virtual */}
        <div className="showcase-block-panel">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="fw-bold text-light text-uppercase d-flex align-items-center gap-2"
              style={{ fontSize: "0.88rem", fontFamily: "'Rajdhani', sans-serif" }}
            >
              <i className="fa-solid fa-futbol text-info"></i> Sports & Virtual
            </span>
            <a href="javascript:void(0)" className="btn-view-all py-1 px-2" style={{ fontSize: "0.72rem" }}>
              View All <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div className="mini-showcase-grid">
            <div
              className="mini-game-card"
              onClick={() => showToast?.("Live Sports Portal Loaded")}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/5.png"
                  alt="Live Sports"
                  onError={(e) => { e.currentTarget.src = "/assets/games/1.png"; }}
                />
              </div>
              <div className="mini-game-label">Live Sports</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => showToast?.("Virtual Sports Loaded")}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/fb642974-1bf3-4ae6-949e-8990bce5d661.png"
                  alt="Virtual Sports"
                  onError={(e) => { e.currentTarget.src = "/assets/games/2.png"; }}
                />
              </div>
              <div className="mini-game-label">Virtual Sports</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => showToast?.("Esports Hub Loaded")}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/4.png"
                  alt="Esports"
                  onError={(e) => { e.currentTarget.src = "/assets/games/3.png"; }}
                />
              </div>
              <div className="mini-game-label">Esports</div>
            </div>
            <div
              className="mini-game-card"
              onClick={() => showToast?.("Virtual Racing Loaded")}
            >
              <div className="mini-art-thumb">
                <img
                  src="/assets/games/6.png"
                  alt="Virtual Racing"
                  onError={(e) => { e.currentTarget.src = "/assets/games/1.png"; }}
                />
              </div>
              <div className="mini-game-label">Virtual Racing</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
           SECTION 5: PROMOTIONS & JACKPOTS BANNER (REMOVED)
      =============================================================== */}

      {/* Interactive Slot Theater Modal */}
      <Modal isOpen={!!activeTheaterGame} onClose={handleCloseTheater} maxWidth="480px">
        <div className="modal-body p-4 text-center">
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3" style={{ borderColor: "rgba(139, 92, 246, 0.3)" }}>
            <div className="text-start pe-4">
              <h3 className="fw-bold text-warning mb-1" id="theaterGameTitle" style={{ textShadow: "0 0 12px rgba(245, 179, 0, 0.5)", fontSize: "1.5rem", letterSpacing: "1px", textTransform: "uppercase" }}>
                {activeTheaterGame?.title}
              </h3>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span
                  className="badge"
                  style={{ fontSize: "0.65rem", background: "linear-gradient(90deg, #3b0764, #1b0c38)", border: "1px solid #7c3aed", color: "#e9d5ff", letterSpacing: "0.5px", padding: "4px 8px" }}
                >
                  <i className="fa-solid fa-gamepad me-1 text-purple-400"></i> WINBET ARCADE
                </span>
                <span className="badge px-2 py-1" style={{ fontSize: "0.65rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#34d399", letterSpacing: "0.5px" }}>
                  <i className="fa-solid fa-circle text-success" style={{ fontSize: "0.4rem", verticalAlign: "middle", marginRight: "4px", filter: "drop-shadow(0 0 4px #34d399)" }}></i>
                  ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Slot Reels Machine Window */}
          <div 
            className="reels-container p-4 mb-4 rounded-4"
            style={{ 
              background: "radial-gradient(circle at 50% 50%, #150630 0%, #080214 100%)",
              border: "3px solid #6d28d9", 
              boxShadow: "0 0 25px rgba(109, 40, 217, 0.4), inset 0 15px 30px rgba(0,0,0,0.9)",
              position: "relative"
            }}
          >
            {/* Glossy overlay effect for screen */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)", borderRadius: "12px 12px 0 0", pointerEvents: "none" }}></div>
            
            <div className="d-flex justify-content-center gap-3">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className={`reel-window ${isSpinning ? "reel-spinning" : ""}`}
                  style={{
                    width: "85px",
                    height: "105px",
                    background: "linear-gradient(180deg, #f1f5f9 0%, #ffffff 40%, #e2e8f0 100%)",
                    border: "2px solid #94a3b8",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3.5rem",
                    boxShadow: "0 8px 15px rgba(0,0,0,0.6), inset 0 2px 8px rgba(255,255,255,0.9)",
                    color: "#0f172a",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <span style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>{reels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Win Banner */}
          {winAmount !== null && (
            <div 
              className="alert py-3 mb-4 rounded-4 text-center border-0" 
              style={{ 
                background: "linear-gradient(135deg, #f5b300 0%, #d97706 100%)", 
                boxShadow: "0 0 30px rgba(245, 179, 0, 0.6), inset 0 2px 10px rgba(255,255,255,0.5)",
                animation: "pulse3DGlow 1.5s infinite alternate ease-in-out" 
              }}
            >
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="fa-solid fa-trophy text-dark fs-2"></i>
                <div style={{ lineHeight: "1.2" }}>
                  <div className="text-dark fw-bold fs-6 text-uppercase" style={{ letterSpacing: "1px" }}>BIG WIN! YOU WON</div>
                  <strong className="text-dark fw-bold" style={{ fontSize: "2.2rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>N$ {winAmount.toFixed(2)}</strong>
                </div>
                <i className="fa-solid fa-trophy text-dark fs-2"></i>
              </div>
            </div>
          )}

          {/* Bet Controls */}
          <div
            className="d-flex align-items-center justify-content-between p-3 rounded-4 mb-4"
            style={{ background: "rgba(0, 0, 0, 0.4)", border: "1.5px solid rgba(139, 92, 246, 0.3)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.6)" }}
          >
            <span className="text-secondary small fw-bold text-uppercase ms-2" style={{ letterSpacing: "1px" }}>Bet Per Spin</span>
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-sm text-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px", background: "linear-gradient(180deg, #3b0764 0%, #1b0c38 100%)", border: "1px solid #7c3aed", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                onClick={() => setCurrentBet((prev) => Math.max(5, prev - 5))}
                disabled={isSpinning}
              >
                <i className="fa-solid fa-minus text-purple-300"></i>
              </button>
              <div className="fw-bold text-warning fs-4 text-center" style={{ minWidth: "100px", textShadow: "0 0 10px rgba(245,179,0,0.4)" }}>
                N$ {currentBet.toFixed(2)}
              </div>
              <button
                type="button"
                className="btn btn-sm text-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px", background: "linear-gradient(180deg, #3b0764 0%, #1b0c38 100%)", border: "1px solid #7c3aed", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                onClick={() => setCurrentBet((prev) => Math.min(200, prev + 5))}
                disabled={isSpinning}
              >
                <i className="fa-solid fa-plus text-purple-300"></i>
              </button>
            </div>
          </div>

          {/* Spin Button */}
          <button
            type="button"
            className="btn-gold-action w-100 py-3 fw-bold rounded-4 d-flex justify-content-center align-items-center gap-2"
            onClick={handleSpinReels}
            disabled={isSpinning}
            style={{ fontSize: "1.2rem", letterSpacing: "1.5px" }}
          >
            {isSpinning ? (
              <><i className="fa-solid fa-arrows-rotate fa-spin text-dark"></i><span>SPINNING...</span></>
            ) : (
              <><i className="fa-solid fa-bolt text-dark"></i><span>SPIN REELS</span></>
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};

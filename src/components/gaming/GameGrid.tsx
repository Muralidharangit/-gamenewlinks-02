import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { games as initialGames } from "../../constants/machine";
import type { GameItem, MachineType } from "../../types";
import { api } from "../../services/api";
import { GameCard } from "./GameCard";
import { LiveWinnersTicker } from "./LiveWinnersTicker";
import { TournamentSection } from "./TournamentSection";
import { VipPromotionsSection } from "./VipPromotionsSection";
import { SmartPCHelpBar } from "./SmartPCHelpBar";
import { GameLauncherModal } from "./GameLauncherModal";

interface GameGridProps {
  balance: number;
  machineType?: MachineType;
  onBalanceChange?: (newBalance: number) => void;
  showToast?: (message: string) => void;
  onOpenCashout?: () => void;
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

const FEATURED_GAMES: GameItem[] = [
  {
    id: 101,
    name: "aviator",
    title: "AVIATOR HIGH ROLLER",
    subtitle: "10,000X MAX WIN • 97.0% RTP",
    category: "crash",
    categories: ["crash", "featured", "spribe"],
    theme: "theme-red",
    badge: { text: "TOP CHOICE", type: "hot", icon: "fa-solid fa-crown" },
    image: "/assets/games/SPRIBE/AVIATOR.png",
    actionText: "PLAY NOW",
  },
  {
    id: 102,
    name: "mines",
    title: "MINES VIP DIAMOND",
    subtitle: "HIGH VOLATILITY • CUSTOM GRIDS",
    category: "table",
    categories: ["table", "instant", "featured", "spribe"],
    theme: "theme-green",
    badge: { text: "VIP PICK", type: "green", icon: "fa-solid fa-gem" },
    image: "/assets/games/SPRIBE/MINES.png",
    actionText: "PLAY NOW",
  },
  {
    id: 103,
    name: "plinko",
    title: "PLINKO 1000X",
    subtitle: "16 PIN ROWS • 99.0% RTP",
    category: "instant",
    categories: ["instant", "featured", "spribe"],
    theme: "theme-magenta",
    badge: { text: "HOT MULTI", type: "gold", icon: "fa-solid fa-bolt" },
    image: "/assets/games/SPRIBE/PLINKO.png",
    actionText: "PLAY NOW",
  },
  {
    id: 104,
    name: "balloon",
    title: "BALLOON MULTIPLIER",
    subtitle: "HOLD TO INFLATE • INSTANT WIN",
    category: "crash",
    categories: ["crash", "featured", "spribe"],
    theme: "theme-gold",
    badge: { text: "NEW", type: "hot", icon: "fa-solid fa-fire" },
    image: "/assets/games/SPRIBE/BALLON.png",
    actionText: "PLAY NOW",
  },
  {
    id: 105,
    name: "dice",
    title: "DICE ULTRA",
    subtitle: "ROLL & WIN • 98.6% RTP",
    category: "table",
    categories: ["table", "featured", "spribe"],
    theme: "theme-purple",
    badge: { text: "TOP RTP", type: "cyan", icon: "fa-solid fa-dice" },
    image: "/assets/games/SPRIBE/DICE.png",
    actionText: "ROLL NOW",
  },
  {
    id: 106,
    name: "mini roulette",
    title: "GOLDEN ROULETTE",
    subtitle: "12 NUMBERS • HIGH PAYOUT",
    category: "table",
    categories: ["table", "featured", "spribe"],
    theme: "theme-blue",
    badge: { text: "HOT", type: "hot", icon: "fa-solid fa-circle" },
    image: "/assets/games/SPRIBE/MINIROULETTE.png",
    actionText: "SPIN NOW",
  },
  {
    id: 107,
    name: "goal soccer",
    title: "GOAL CHAMPIONS",
    subtitle: "PENALTY RUN • SCORE BIG",
    category: "sports",
    categories: ["sports", "featured", "spribe"],
    theme: "theme-gold",
    badge: { text: "POPULAR", type: "cyan", icon: "fa-solid fa-futbol" },
    image: "/assets/games/SPRIBE/SOCCER.png",
    actionText: "KICK NOW",
  },
  {
    id: 108,
    name: "hotline",
    title: "HOTLINE MULTIPLIER",
    subtitle: "FAST ACTION • HIGH PAY",
    category: "instant",
    categories: ["instant", "featured", "spribe"],
    theme: "theme-red",
    badge: { text: "HOT", type: "hot", icon: "fa-solid fa-fire" },
    image: "/assets/games/SPRIBE/HOTLINE.png",
    actionText: "PLAY NOW",
  },
];

const POPULAR_GAMES: GameItem[] = [
  {
    id: 201,
    name: "aviator",
    title: "AVIATOR",
    subtitle: "FLY HIGH • 10,000X MAX",
    category: "crash",
    categories: ["popular", "crash", "spribe"],
    theme: "theme-red",
    badge: { text: "HOT", type: "hot", icon: "fa-solid fa-fire" },
    image: "/assets/games/SPRIBE/AVIATOR.png",
    actionText: "PLAY NOW",
  },
  {
    id: 202,
    name: "balloon",
    title: "BALLOON",
    subtitle: "DON'T LET IT POP",
    category: "crash",
    categories: ["popular", "crash", "spribe"],
    theme: "theme-gold",
    badge: { text: "FUN", type: "gold", icon: "fa-solid fa-wind" },
    image: "/assets/games/SPRIBE/BALLON.png",
    actionText: "INFLATE NOW",
  },
  {
    id: 203,
    name: "dice",
    title: "DICE",
    subtitle: "ROLL & WIN • 98.6% RTP",
    category: "table",
    categories: ["popular", "table", "spribe"],
    theme: "theme-purple",
    badge: { text: "TOP", type: "cyan", icon: "fa-solid fa-dice" },
    image: "/assets/games/SPRIBE/DICE.png",
    actionText: "ROLL NOW",
  },
  {
    id: 204,
    name: "hilo",
    title: "HILO",
    subtitle: "GUESS NEXT CARD",
    category: "table",
    categories: ["popular", "table", "spribe"],
    theme: "theme-blue",
    badge: { text: "NEW", type: "cyan", icon: "fa-solid fa-diamond" },
    image: "/assets/games/SPRIBE/HILO.png",
    actionText: "PLAY NOW",
  },
  {
    id: 205,
    name: "hotline",
    title: "HOTLINE",
    subtitle: "FAST ACTION • HIGH PAY",
    category: "instant",
    categories: ["popular", "instant", "spribe"],
    theme: "theme-red",
    badge: { text: "HOT", type: "hot", icon: "fa-solid fa-fire" },
    image: "/assets/games/SPRIBE/HOTLINE.png",
    actionText: "PLAY NOW",
  },
  {
    id: 206,
    name: "keno",
    title: "KENO",
    subtitle: "CLASSIC LOTTERY DRAW",
    category: "table",
    categories: ["popular", "table", "spribe"],
    theme: "theme-purple",
    badge: { text: "CLASSIC", type: "cyan", icon: "fa-solid fa-list-ol" },
    image: "/assets/games/SPRIBE/KENO.png",
    actionText: "PLAY NOW",
  },
  {
    id: 207,
    name: "keno 80",
    title: "KENO 80",
    subtitle: "80 BALLS • BIG WINS",
    category: "table",
    categories: ["popular", "table", "spribe"],
    theme: "theme-magenta",
    badge: { text: "VIP", type: "green", icon: "fa-solid fa-gem" },
    image: "/assets/games/SPRIBE/KENO80.png",
    actionText: "PLAY NOW",
  },
  {
    id: 208,
    name: "mines",
    title: "MINES",
    subtitle: "AVOID MINES • CASH OUT",
    category: "table",
    categories: ["popular", "table", "spribe"],
    theme: "theme-green",
    badge: { text: "VIP", type: "green", icon: "fa-solid fa-shield-halved" },
    image: "/assets/games/SPRIBE/MINES.png",
    actionText: "PLAY NOW",
  },
  {
    id: 209,
    name: "mini roulette",
    title: "MINI ROULETTE",
    subtitle: "QUICK SPINS • 12 NUMBERS",
    category: "table",
    categories: ["popular", "table", "spribe"],
    theme: "theme-blue",
    badge: { text: "HOT", type: "hot", icon: "fa-solid fa-circle" },
    image: "/assets/games/SPRIBE/MINIROULETTE.png",
    actionText: "SPIN NOW",
  },
  {
    id: 210,
    name: "pilot",
    title: "PILOT",
    subtitle: "FLYING HIGH • CASH OUT",
    category: "crash",
    categories: ["popular", "crash", "spribe"],
    theme: "theme-red",
    badge: { text: "FUN", type: "hot", icon: "fa-solid fa-plane" },
    image: "/assets/games/SPRIBE/PILOT.png",
    actionText: "FLY NOW",
  },
  {
    id: 211,
    name: "plinko",
    title: "PLINKO",
    subtitle: "DROP BALL • 1,000X MULTI",
    category: "instant",
    categories: ["popular", "instant", "spribe"],
    theme: "theme-magenta",
    badge: { text: "HOT", type: "hot", icon: "fa-solid fa-bullseye" },
    image: "/assets/games/SPRIBE/PLINKO.png",
    actionText: "DROP NOW",
  },
  {
    id: 212,
    name: "goal soccer",
    title: "GOAL / SOCCER",
    subtitle: "PENALTY RUN • SCORE BIG",
    category: "sports",
    categories: ["popular", "sports", "spribe"],
    theme: "theme-gold",
    badge: { text: "POPULAR", type: "cyan", icon: "fa-solid fa-futbol" },
    image: "/assets/games/SPRIBE/SOCCER.png",
    actionText: "KICK NOW",
  },
  {
    id: 213,
    name: "trader",
    title: "TRADER",
    subtitle: "MARKET CHART • CASH OUT",
    category: "crash",
    categories: ["popular", "crash", "spribe"],
    theme: "theme-green",
    badge: { text: "NEW", type: "cyan", icon: "fa-solid fa-chart-line" },
    image: "/assets/games/SPRIBE/TRADER.png",
    actionText: "TRADE NOW",
  },
];

export const GameGrid: React.FC<GameGridProps> = ({
  balance,
  machineType = "smart-pc",
  onBalanceChange,
  showToast,
  onOpenCashout,
}) => {
  const isTerminal = machineType === "terminal";
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogGames, setCatalogGames] = useState<GameItem[]>(initialGames);

  // Active Game Launcher State (PDF Sections 4.6 & 4.7)
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);

  // Fetch live games from GET /smart-pcs/games
  useEffect(() => {
    let isMounted = true;
    api.getGames(selectedCategory === "all" ? undefined : selectedCategory)
      .then((items) => {
        if (isMounted && items && items.length > 0) {
          const mapped: GameItem[] = items.map((item, idx) => ({
            id: item.id || idx + 1,
            name: item.name.toLowerCase(),
            title: item.name.toUpperCase(),
            subtitle: item.description || "LIVE PROVIDER GAME",
            category: item.category.toLowerCase(),
            categories: [item.category.toLowerCase(), item.provider.toLowerCase()],
            theme: (["theme-red", "theme-gold", "theme-green", "theme-purple", "theme-blue"] as const)[idx % 5],
            badge: item.payout_label ? { text: item.payout_label, type: "hot" } : undefined,
            image: item.image || item.provider_image || "/assets/games/SPRIBE/AVIATOR.png",
            actionText: "PLAY NOW",
            kind: item.kind,
            provider: item.provider,
            uuid: item.uuid,
            choices: item.choices,
          }));
          setCatalogGames(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const filteredGames = useMemo(() => {
    return catalogGames.filter((game) => {
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
  }, [catalogGames, selectedCategory, searchQuery]);

  const handleLaunchGame = (game: GameItem) => {
    if (!isTerminal) {
      // Smart PC Dedicated Game Page (Header on top, full game stage below)
      navigate(`/smart-pc/play/${encodeURIComponent(game.uuid || game.id || game.name)}`, {
        state: { game },
      });
    } else {
      setActiveGame(game);
    }
  };

  const handleCloseGame = () => {
    setActiveGame(null);
  };

  const handleJoinTournament = (tourName: string) => {
    showToast?.(`Successfully enrolled in ${tourName}! Your points are now tracking.`);
  };

  const handleClaimPromo = (promoName: string) => {
    showToast?.(`${promoName} activated! Approach Cashier Desk to claim.`);
  };

  return (
    <>
      {/* ==============================================================
           SECTION 1: LIVE WINNERS REAL-TIME ROLLING FEED (Smart PC Only)
      =============================================================== */}
      {!isTerminal && <LiveWinnersTicker />}

      {/* ==============================================================
           SECTION 2: SEARCH & CATEGORY FILTER BAR
      =============================================================== */}
      <section id="categorySection" className="mb-5 showcase-block-panel">
        <div className="section-header-bar">
          <h2 className="section-header-title">
            <i className="fa-solid fa-layer-group text-info"></i> Browse & Filter Games
          </h2>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm ${selectedCategory === "all" ? "btn-warning text-dark fw-bold" : "btn-outline-secondary text-light"} rounded-pill px-3`}
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              <i className="fa-solid fa-arrows-rotate me-1"></i> Reset Filters
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
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-sm text-secondary p-0 ms-1"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
            <div className="game-count-hud d-none d-sm-inline-flex">
              <span id="gameCountBadge" className="count-num">
                {filteredGames.length}
              </span>
              <span>Available</span>
            </div>
          </div>
        </div>

        {/* Filtered Games Grid */}
        <div className="games-grid mt-3" id="categoryGamesGridContainer">
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
              No matching games found for "{searchQuery}". Try another filter or keyword.
            </p>
            <button
              className="btn btn-outline-warning rounded-pill px-4 py-2"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Show All Games
            </button>
          </div>
        )}
      </section>

      {/* ==============================================================
           SMART PC SECTIONS (Hidden on Terminal):
           - Featured Picks Swiper
           - Popular Games Swiper
           - Daily Tournaments Arena
           - VIP Promotions & Perks
           - Smart PC Help Bar
      =============================================================== */}
      {!isTerminal && (
        <>
          {/* SECTION 3: FEATURED / GRAND VIP PICKS (SWIPER SLIDER) */}
          <section id="featuredSection" className="mb-5 showcase-block-panel">
            <div className="section-header-bar" id="featuredHeader">
              <h2 className="section-header-title">
                <i className="fa-solid fa-crown text-warning"></i> Grand VIP & High Roller Picks
              </h2>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill d-none d-sm-inline-flex" style={{ fontSize: "0.72rem" }}>
                  <i className="fa-solid fa-bolt me-1"></i> HIGH MULTIPLIERS
                </span>
                <button type="button" className="swiper-nav-btn swiper-featured-prev" aria-label="Previous Featured">
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" className="swiper-nav-btn swiper-featured-next" aria-label="Next Featured">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Autoplay, FreeMode]}
              navigation={{
                prevEl: ".swiper-featured-prev",
                nextEl: ".swiper-featured-next",
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              freeMode={true}
              slidesPerView={2}
              spaceBetween={12}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 12 },
                576: { slidesPerView: 3, spaceBetween: 12 },
                768: { slidesPerView: 4, spaceBetween: 12 },
                992: { slidesPerView: 6, spaceBetween: 12 },
                1200: { slidesPerView: 8, spaceBetween: 12 },
              }}
              className="casino-swiper-slider"
            >
              {FEATURED_GAMES.map((game) => (
                <SwiperSlide key={`featured-${game.id}`}>
                  <GameCard game={game} onPlay={handleLaunchGame} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* SECTION 4: POPULAR SPRIBE ARCADE & CRASH GAMES (SWIPER SLIDER) */}
          <section id="popularSection" className="mb-5 showcase-block-panel">
            <div className="section-header-bar" id="popularHeader">
              <h2 className="section-header-title">
                <i className="fa-solid fa-fire text-danger"></i> Popular Arcade & Crash Games
              </h2>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger text-light fw-bold px-3 py-1 rounded-pill d-none d-sm-inline-flex" style={{ fontSize: "0.72rem" }}>
                  <i className="fa-solid fa-users me-1"></i> TOP 13 PLAYED
                </span>
                <button type="button" className="swiper-nav-btn swiper-popular-prev" aria-label="Previous Popular">
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" className="swiper-nav-btn swiper-popular-next" aria-label="Next Popular">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Autoplay, FreeMode]}
              navigation={{
                prevEl: ".swiper-popular-prev",
                nextEl: ".swiper-popular-next",
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              freeMode={true}
              slidesPerView={2}
              spaceBetween={12}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 12 },
                576: { slidesPerView: 3, spaceBetween: 12 },
                768: { slidesPerView: 4, spaceBetween: 12 },
                992: { slidesPerView: 6, spaceBetween: 12 },
                1200: { slidesPerView: 8, spaceBetween: 12 },
              }}
              className="casino-swiper-slider"
            >
              {POPULAR_GAMES.map((game) => (
                <SwiperSlide key={`popular-${game.id}`}>
                  <GameCard game={game} onPlay={handleLaunchGame} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* SECTION 5: DAILY TOURNAMENTS & CHALLENGES ARENA */}
          <TournamentSection onJoinTournament={handleJoinTournament} />

          {/* SECTION 6: VIP REWARDS & CASHIER PERKS */}
          <VipPromotionsSection
            onClaimPromo={handleClaimPromo}
            onOpenCashout={onOpenCashout}
          />

          {/* SECTION 7: SMART PC HELP & FAIR PLAY ASSURANCE */}
          <SmartPCHelpBar />
        </>
      )}

      {/* ==============================================================
           GAME LAUNCHER MODAL (Supports Provider Games & Local Games via API)
      =============================================================== */}
      <GameLauncherModal
        isOpen={!!activeGame}
        game={activeGame}
        onClose={handleCloseGame}
        balance={balance}
        onBalanceChange={onBalanceChange}
        showToast={showToast}
      />
    </>
  );
};

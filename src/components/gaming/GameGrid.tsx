import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import type { GameItem, MachineType } from "../../types";
import { api } from "../../services/api";
import { GameCard } from "./GameCard";
import { LiveWinnersTicker } from "./LiveWinnersTicker";
import { TournamentSection } from "./TournamentSection";
import { VipPromotionsSection } from "./VipPromotionsSection";
import { SmartPCHelpBar } from "./SmartPCHelpBar";

interface GameGridProps {
  balance: number;
  machineType?: MachineType;
  onBalanceChange?: (newBalance: number) => void;
  showToast?: (message: string) => void;
  onOpenCashout?: () => void;
}

const DEFAULT_CATEGORIES = [
  { id: "all", label: "All Games", icon: "fa-solid fa-table-cells-large" },
  { id: "spribe", label: "Spribe Live", icon: "fa-solid fa-plane-departure text-warning", isHot: true },
  { id: "endorphina", label: "Endorphina", icon: "fa-solid fa-gem text-info" },
  // { id: "kagaming", label: "KA Gaming", icon: "fa-solid fa-crown text-warning" },
  // { id: "evoplay", label: "Evoplay", icon: "fa-solid fa-fire text-danger" },
  { id: "slots", label: "Slots", icon: "fa-solid fa-clover text-success" },
  
];

export const GameGrid: React.FC<GameGridProps> = ({
  balance: _balance,
  machineType = "smart-pc",
  onBalanceChange: _onBalanceChange,
  showToast,
  onOpenCashout,
}) => {
  const navigate = useNavigate();
  const isTerminal = machineType === "terminal";
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogGames, setCatalogGames] = useState<GameItem[]>([]);
  const [popularGames, setPopularGames] = useState<GameItem[]>([]);
  const [featuredSpribeGames, setFeaturedSpribeGames] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalGames, setTotalGames] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const spribeImageMap: Record<string, string> = {
    "aviator": "1.jpg",
    "hilo": "2.jpg",
    "hotline": "3.jpg",
    "goal": "4.jpg",
    "keno": "5.jpg",
    "mines": "6.jpg",
    "mini roulette":"7.jpg",
    "dice": "8.jpg",
    "plinko": "11.jpg",
    "balloon": "10.jpg",
    "pilot": "12.jpg",
    "trader": "13.jpg"
  };

  // Helper mapper for live API items
  const mapApiGame = useCallback(
    (
      item: {
        id?: string | number;
        uuid?: string;
        name: string;
        description?: string;
        category?: string;
        provider?: string;
        payout_label?: string;
        image?: string | null;
        provider_image?: string | null;
        kind?: "provider" | "local";
        choices?: string[];
      },
      idx: number
    ): GameItem => ({
      id: item.id || item.uuid || idx + 1,
      name: item.name.toLowerCase(),
      title: item.name.toUpperCase(),
      subtitle: item.description || "LIVE PROVIDER GAME",
      category: (item.category || "slots").toLowerCase(),
      categories: [
        (item.category || "slots").toLowerCase(),
        (item.provider || "provider").toLowerCase(),
      ],
      theme: (["theme-gold", "theme-red", "theme-green", "theme-purple", "theme-blue"] as const)[
        idx % 5
      ],
      badge: item.payout_label
        ? { text: item.payout_label, type: "hot" }
        : { text: "LIVE", type: "live" },
      image: (() => {
        const n = item.name.toLowerCase();
        if (item.provider?.toLowerCase().includes("spribe") || item.category?.toLowerCase().includes("spribe") || n.includes("spribe")) {
          for (const [key, val] of Object.entries(spribeImageMap)) {
            if (n.includes(key)) return `/assets/images/spribe/${val}`;
          }
        }
        return item.image || item.provider_image || "/assets/games/SPRIBE/AVIATOR.png";
      })(),
      actionText: "PLAY NOW",
      kind: item.kind || "provider",
      provider: item.provider || "Game Provider",
      uuid: item.uuid || String(item.id),
      choices: item.choices || [],
    }),
    []
  );

  const getProviderQuery = useCallback(() => {
    return selectedFilter === "spribe"
      ? "Spribe"
      : selectedFilter === "endorphina"
      ? "Endorphina"
      : selectedFilter === "kagaming"
      ? "KAGaming"
      : selectedFilter === "evoplay"
      ? "Evoplay"
      : undefined;
  }, [selectedFilter]);

  // Fast querySelector smooth scroll & filter changer
  const scrollToCatalog = useCallback((category = "all") => {
    setSelectedFilter(category);
    setSearchQuery("");
    const catalogElement = document.querySelector("#categorySection");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

      // Fetch Spribe games and popular games once on mount (independent of filters)
  useEffect(() => {
    let isMounted = true;
    
    // Fetch Popular
    api
      .getGamesPage(undefined, 1, 50)
      .then((res) => {
        if (isMounted && res.games && Array.isArray(res.games)) {
          const mapped = res.games.map((item, idx) => mapApiGame(item, idx));
          setPopularGames(mapped.length > 10 ? mapped.slice(10, 25) : mapped);
        }
      })
      .catch((err) => console.warn("Failed to load popular games:", err));

    // Fetch Spribe
    api
      .getGamesPage("Spribe", 1, 50)
      .then((res) => {
        if (isMounted && res.games && Array.isArray(res.games)) {
          // Filter out 'mobile' variants so we get unique Spribe games
          const uniqueSpribeGames = res.games.filter(game => !game.name.toLowerCase().includes('mobile'));
          
          const mapped = uniqueSpribeGames.map((item, idx) => mapApiGame(item, idx));
          setFeaturedSpribeGames(mapped.slice(0, 13));
        }
      })
      .catch((err) => console.warn("Failed to load spribe games:", err));

    return () => { isMounted = false; };
  }, [mapApiGame]);

  // Use the fetched Spribe games instead of hardcoded
  const featuredGames = featuredSpribeGames;

  
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setCurrentPage(1);

    const providerQuery = getProviderQuery();

    api
      .getGamesPage(providerQuery, 1, 50)
      .then((res) => {
        if (isMounted) {
          if (res.games && Array.isArray(res.games) && res.games.length > 0) {
            // Filter out 'mobile' duplicate games from catalog view
            const filteredGames = res.games.filter(g => !g.name.toLowerCase().includes('mobile'));
            const mapped = filteredGames.map((item, idx) => mapApiGame(item, idx));
            setCatalogGames(mapped);
            setHasMore(res.hasMore);
            setTotalGames(res.total);
          } else {
            setCatalogGames([]);
            setHasMore(false);
            setTotalGames(0);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Could not load games from API:", err);
          setCatalogGames([]);
          setHasMore(false);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFilter, mapApiGame, getProviderQuery]);

  // Load Next Page of Games ("View More Games")
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const providerQuery = getProviderQuery();
    const nextPage = currentPage + 1;

    try {
      const res = await api.getGamesPage(providerQuery, nextPage, 50);
      if (res.games && Array.isArray(res.games) && res.games.length > 0) {
        const filteredGames = res.games.filter(g => !g.name.toLowerCase().includes('mobile'));
        const mapped = filteredGames.map((item, idx) => mapApiGame(item, catalogGames.length + idx));
        setCatalogGames((prev) => [...prev, ...mapped]);
        setCurrentPage(nextPage);
        setHasMore(res.hasMore);
        setTotalGames(res.total);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn("Failed to load more games:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const [isMobileDevice, setIsMobileDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredGames = useMemo(() => {
    return catalogGames.filter((game) => {
      // Platform Filter: Laptop/Desktop view shows desktop games, Mobile shows mobile games
      const isMobileGame =
        game.name.toLowerCase().includes("mobile") ||
        game.title.toLowerCase().includes("mobile");

      if (!isMobileDevice && isMobileGame) {
        // Exclude mobile-specific variants on desktop/laptop
        return false;
      }

      const filterLower = selectedFilter.toLowerCase();
      const matchesFilter =
        filterLower === "all" ||
        game.category.includes(filterLower) ||
        (game.provider && game.provider.toLowerCase().includes(filterLower)) ||
        game.categories?.some((c) => c.includes(filterLower)) ||
        (filterLower === "instant" &&
          (game.category.includes("instant") ||
            game.category.includes("crash") ||
            game.provider?.toLowerCase() === "spribe"));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.name.toLowerCase().includes(q) ||
        (game.provider && game.provider.toLowerCase().includes(q)) ||
        game.categories?.some((c) => c.includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [catalogGames, selectedFilter, searchQuery, isMobileDevice]);

  // Derived dynamically from live API games
  


  // Open Game directly on dedicated GamePlayPage with Header
  const handleLaunchGame = (game: GameItem) => {
    const gameIdentifier = game.uuid || game.id || game.name;
    const playRoute = isTerminal
      ? `/terminal/play/${encodeURIComponent(gameIdentifier)}`
      : `/smart-pc/play/${encodeURIComponent(gameIdentifier)}`;

    navigate(playRoute, { state: { game } });
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
          <div className="d-flex align-items-center gap-3">
            <h2 className="section-header-title mb-0">
              <i className="fa-solid fa-layer-group text-warning"></i> Live Casino Catalog
            </h2>

          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              id="viewAllGamesBtn"
              className={`btn btn-sm ${
                selectedFilter === "all"
                  ? "btn-warning text-dark fw-bold shadow-sm"
                  : "btn-outline-warning text-warning"
              } rounded-pill px-3 d-inline-flex align-items-center gap-1`}
              onClick={() => scrollToCatalog("all")}
            >
              <i className="fa-solid fa-grid-2"></i> All Games ({totalGames || catalogGames.length})
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-light rounded-pill px-3"
              onClick={() => {
                setSelectedFilter("all");
                setSearchQuery("");
              }}
            >
              <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
            </button>
          </div>
        </div>

        {/* Category Navigation Bar & Search */}
        <div className="category-nav-bar">
          <div className="category-scroll-container" id="categoryTabs">
            {DEFAULT_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`cat-pill ${selectedFilter === cat.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedFilter(cat.id);
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
                placeholder="Search live games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                spellCheck={false}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="row g-3 mt-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <div key={n} className="col-6 col-md-4 col-lg-3 col-xl-2">
                <div
                  className="p-4 rounded-4 text-center d-flex flex-column align-items-center justify-content-center"
                  style={{
                    height: "250px",
                    background: "rgba(13, 5, 29, 0.7)",
                    border: "1px solid rgba(147, 51, 234, 0.25)",
                    animation: "pulse 1.5s infinite ease-in-out",
                  }}
                >
                  <div className="spinner-border text-warning spinner-border-sm mb-2" role="status"></div>
                  <span className="text-secondary small fw-bold">Loading Live Game...</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtered Games Grid (Pure API) */}
        {!isLoading && (
          <div className="games-grid mt-3" id="categoryGamesGridContainer">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onPlay={handleLaunchGame} />
            ))}
          </div>
        )}

        {/* View More Games Pagination Loader Section (Left-Right Layout) */}
        {!isLoading && filteredGames.length > 0 && (
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mt-4 pt-3 pb-2 border-top border-purple-subtle gap-3 px-2">
            {hasMore ? (
              <>
                {/* Left Side: Game Count & Progress Bar */}
                <div className="d-flex align-items-center gap-3">
                  <div className="text-secondary small">
                    Showing <strong className="text-warning">{catalogGames.length}</strong> of{" "}
                    <strong className="text-light">{totalGames}</strong> Live Games
                  </div>
                  <div
                    className="progress"
                    style={{
                      width: "140px",
                      height: "7px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      className="progress-bar bg-warning"
                      style={{
                        width: `${Math.min(100, Math.round((catalogGames.length / (totalGames || 1)) * 100))}%`,
                        borderRadius: "10px",
                      }}
                    ></div>
                  </div>
                  <span className="badge bg-dark text-warning border border-warning border-opacity-25 rounded-pill px-2 py-1 small">
                    {Math.min(100, Math.round((catalogGames.length / (totalGames || 1)) * 100))}%
                  </span>
                </div>

                {/* Right Side: View More Games Button */}
                <div>
                  <button
                    id="viewMoreGamesBtn"
                    type="button"
                    className="btn btn-warning text-dark fw-bold rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm transition-all"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Loading more games...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-angles-down"></i>
                        View More Games (+50)
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-secondary small">
                  Showing all <strong className="text-warning">{totalGames || catalogGames.length}</strong> games
                </div>
                <div className="d-flex align-items-center gap-2 text-secondary small py-2 px-3 rounded-pill bg-dark border border-secondary border-opacity-25">
                  <i className="fa-solid fa-circle-check text-success"></i>
                  <span>
                    All <strong className="text-warning">{totalGames || catalogGames.length}</strong> Live Games Loaded
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredGames.length === 0 && (
          <div id="noGamesFoundState" className="text-center py-5">
            <div className="mb-3" style={{ fontSize: "3rem", color: "#a855f7" }}>
              <i className="fa-solid fa-gamepad"></i>
            </div>
            <h3 className="fw-bold text-light mb-2">No Live Games Found</h3>
            <p className="text-secondary small mb-4">
              {searchQuery
                ? `No live games matching "${searchQuery}". Try another keyword or filter.`
                : "No live games found in this category from provider."}
            </p>
            <button
              className="btn btn-outline-warning rounded-pill px-4 py-2"
              onClick={() => {
                setSelectedFilter("all");
                setSearchQuery("");
              }}
            >
              Show All Games
            </button>
          </div>
        )}
      </section>

      {/* ==============================================================
           SMART PC SECTIONS (Populated dynamically from live API):
           - Live Featured Picks Swiper
           - Live Popular Games Swiper
           - Daily Tournaments Arena
           - VIP Promotions & Perks
           - Smart PC Help Bar
      =============================================================== */}
      {!isTerminal && !isLoading && featuredGames.length > 0 && (
        <>
          {/* SECTION 3: LIVE FEATURED PICKS (SWIPER SLIDER) */}
          <section id="featuredSection" className="mb-5 showcase-block-panel">
            <div className="section-header-bar" id="featuredHeader">
              <h2 className="section-header-title">
                <i className="fa-solid fa-crown text-warning"></i> Featured Live Provider Picks
              </h2>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning rounded-pill px-3 d-none d-sm-inline-flex align-items-center gap-1"
                  onClick={() => scrollToCatalog("all")}
                >
                  <i className="fa-solid fa-layer-group"></i> View In Catalog
                </button>
                <button
                  type="button"
                  className="swiper-nav-btn swiper-featured-prev"
                  aria-label="Previous Featured"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="swiper-nav-btn swiper-featured-next"
                  aria-label="Next Featured"
                >
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
              spaceBetween={14}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 14 },
                576: { slidesPerView: 3, spaceBetween: 14 },
                768: { slidesPerView: 4, spaceBetween: 14 },
                992: { slidesPerView: 5, spaceBetween: 16 },
                1200: { slidesPerView: 7, spaceBetween: 16 },
              }}
              className="casino-swiper-slider"
            >
              {featuredGames.map((game) => (
                <SwiperSlide key={`featured-${game.id}`}>
                  <GameCard game={game} onPlay={handleLaunchGame} hideTitleAndSubtitle={true} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* SECTION 4: LIVE POPULAR GAMES (SWIPER SLIDER) */}
          <section id="popularSection" className="mb-5 showcase-block-panel">
            <div className="section-header-bar" id="popularHeader">
              <h2 className="section-header-title">
                <i className="fa-solid fa-fire text-danger"></i> Popular High-Action Games
              </h2>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill px-3 d-none d-sm-inline-flex align-items-center gap-1"
                  onClick={() => scrollToCatalog("all")}
                >
                  <i className="fa-solid fa-fire"></i> View All Games
                </button>
                <button
                  type="button"
                  className="swiper-nav-btn swiper-popular-prev"
                  aria-label="Previous Popular"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="swiper-nav-btn swiper-popular-next"
                  aria-label="Next Popular"
                >
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
              spaceBetween={14}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 14 },
                576: { slidesPerView: 3, spaceBetween: 14 },
                768: { slidesPerView: 4, spaceBetween: 14 },
                992: { slidesPerView: 5, spaceBetween: 16 },
                1200: { slidesPerView: 7, spaceBetween: 16 },
              }}
              className="casino-swiper-slider"
            >
              {popularGames.map((game) => (
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

      {/* End of Smart PC Sections */}
    </>
  );
};


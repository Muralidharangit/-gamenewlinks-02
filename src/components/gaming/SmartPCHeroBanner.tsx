import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

interface SmartPCHeroBannerProps {
  onExploreGames?: () => void;
  onOpenTournament?: () => void;
  onOpenCashout?: () => void;
}

export const SmartPCHeroBanner: React.FC<SmartPCHeroBannerProps> = ({
  onExploreGames,
  onOpenTournament,
  onOpenCashout,
}) => {
  const [jackpot, setJackpot] = useState(1483061.04);
  const [activePlayers, setActivePlayers] = useState(24891);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot((prev) => prev + Math.random() * 0.45 + 0.1);
      if (Math.random() > 0.7) {
        setActivePlayers((prev) => prev + Math.floor(Math.random() * 5 - 2));
      }
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="smartpc-hero-wrapper mb-4">
      <div className="smartpc-hero-frame">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 5500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            el: ".smartpc-hero-pagination",
            bulletClass: "smartpc-hero-bullet",
            bulletActiveClass: "smartpc-hero-bullet-active",
          }}
          navigation={{
            prevEl: ".smartpc-hero-btn-prev",
            nextEl: ".smartpc-hero-btn-next",
          }}
          loop={true}
          className="smartpc-hero-swiper"
        >
          {/* ==============================================================
               SLIDE 1: WINBET GRAND JACKPOT & MULTIPLIER SHOWCASE
          =============================================================== */}
          <SwiperSlide>
            <div className="smartpc-slide slide-jackpot">
              {/* Background Glow Pattern */}
              <div className="slide-bg-ambient">
                <div className="ambient-grid-pattern"></div>
                <div className="slide-particle-spark p-1"></div>
                <div className="slide-particle-spark p-2"></div>
                <div className="slide-particle-spark p-3"></div>
                <div className="slide-particle-spark p-4"></div>
              </div>

              {/* Main Content Layout */}
              <div className="hero-slide-container container-fluid">
                <div className="row align-items-center g-3">
                  {/* Left Column: Jackpot Ticker & Stats */}
                  <div className="col-12 col-lg-7 text-start">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <span className="badge-hero-pill badge-jackpot-live">
                        <i className="fa-solid fa-circle text-danger fs-xs blink-live"></i>
                        <span>GRAND JACKPOT LIVE</span>
                      </span>
                      <span className="badge-hero-pill badge-boost">
                        <i className="fa-solid fa-bolt text-warning"></i>
                        <span>+15% BOOST ACTIVE</span>
                      </span>
                      <span className="badge-hero-pill badge-players d-none d-sm-inline-flex">
                        <i className="fa-solid fa-users text-info"></i>
                        <span>{activePlayers.toLocaleString()} Players Online</span>
                      </span>
                    </div>

                    <h1 className="hero-jackpot-title mb-1">
                      WINBET PROGRESSIVE POOL
                    </h1>

                    <div className="hero-jackpot-amount-wrap mb-2">
                      <div className="jackpot-coin-icon">
                        <i className="fa-solid fa-crown gold-crown-badge"></i>
                        <i className="fa-solid fa-coins"></i>
                      </div>
                      <div className="hero-jackpot-number" id="smartpcJackpotMeter">
                        N${" "}
                        {jackpot.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <p className="hero-jackpot-sub mb-3">
                      Drop into high-volatility Spribe Arcade, Crash Games, and Gates of Olympus to trigger the mega progressive jackpot.
                    </p>

                    <div className="d-flex flex-wrap align-items-center gap-2 pt-1">
                      <button
                        type="button"
                        className="btn-hero-primary"
                        onClick={() => {
                          scrollToSection("categorySection");
                          onExploreGames?.();
                        }}
                      >
                        <i className="fa-solid fa-play me-2"></i>
                        <span>PLAY ALL GAMES</span>
                      </button>
                      <button
                        type="button"
                        className="btn-hero-secondary"
                        onClick={() => scrollToSection("featuredSection")}
                      >
                        <i className="fa-solid fa-crown me-2 text-warning"></i>
                        <span>VIP PICKS</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 3D Game Collage Visual */}
                  <div className="col-12 col-lg-5 text-center position-relative">
                    <div className="hero-visual-cluster">
                      <div className="visual-card visual-center">
                        <img
                          src="/assets/games/3.png"
                          alt="Olympus Blitz"
                          className="img-fluid rounded-4 shadow-hero"
                        />
                        <div className="visual-tag">5,000X MAX</div>
                      </div>
                      <div className="visual-card visual-left d-none d-md-block">
                        <img
                          src="/assets/games/SPRIBE/AVIATOR.png"
                          alt="Aviator"
                          className="img-fluid rounded-4 shadow-hero"
                        />
                        <div className="visual-tag tag-hot">HOT CRASH</div>
                      </div>
                      <div className="visual-card visual-right d-none d-md-block">
                        <img
                          src="/assets/games/SPRIBE/MINES.png"
                          alt="Mines"
                          className="img-fluid rounded-4 shadow-hero"
                        />
                        <div className="visual-tag tag-vip">VIP DIAMOND</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* ==============================================================
               SLIDE 2: DAILY TOURNAMENT & ZEUS BLITZ ARENA
          =============================================================== */}
          <SwiperSlide>
            <div className="smartpc-slide slide-tournament">
              <div className="slide-bg-ambient">
                <div className="ambient-grid-pattern"></div>
                <div className="slide-particle-spark p-1"></div>
                <div className="slide-particle-spark p-3"></div>
              </div>

              <div className="hero-slide-container container-fluid">
                <div className="row align-items-center g-3">
                  <div className="col-12 col-lg-7 text-start">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <span className="badge-hero-pill badge-tournament-hot">
                        <i className="fa-solid fa-fire-flame-curved text-danger"></i>
                        <span>DAILY TOURNAMENT ARENA</span>
                      </span>
                      <span className="badge-hero-pill badge-timer">
                        <i className="fa-solid fa-clock text-warning"></i>
                        <span>ENDS IN 04:22:38</span>
                      </span>
                    </div>

                    <h1 className="hero-jackpot-title text-gold-gradient mb-1">
                      ZEUS BLITZ CHAMPIONSHIP
                    </h1>

                    <div className="hero-prize-banner mb-2">
                      <span className="prize-label">TOTAL CASH PRIZE POOL:</span>
                      <span className="prize-value">N$ 50,000.00</span>
                    </div>

                    <p className="hero-jackpot-sub mb-3">
                      Spin Zeus Blitz & Arcade Slots to earn tournament points. Top 10 shop players share cash rewards credited straight to balance!
                    </p>

                    <div className="d-flex flex-wrap align-items-center gap-2 pt-1">
                      <button
                        type="button"
                        className="btn-hero-primary btn-tournament-cta"
                        onClick={() => {
                          scrollToSection("tournamentSection");
                          onOpenTournament?.();
                        }}
                      >
                        <i className="fa-solid fa-trophy me-2 text-warning"></i>
                        <span>ENTER TOURNAMENT</span>
                      </button>
                      <button
                        type="button"
                        className="btn-hero-secondary"
                        onClick={() => scrollToSection("popularSection")}
                      >
                        <i className="fa-solid fa-gamepad me-2 text-info"></i>
                        <span>QUALIFYING GAMES</span>
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-lg-5 text-center">
                    <div className="tournament-leader-mini-card">
                      <div className="leader-header">
                        <i className="fa-solid fa-ranking-star text-warning"></i>
                        <span>LIVE LEADERBOARD STANDINGS</span>
                      </div>
                      <div className="leader-row rank-1">
                        <span className="rank-badge gold">1st</span>
                        <span className="leader-name">Alex_Windhoek</span>
                        <span className="leader-pts">18,450 pts</span>
                        <span className="leader-prize">N$ 20,000</span>
                      </div>
                      <div className="leader-row rank-2">
                        <span className="rank-badge silver">2nd</span>
                        <span className="leader-name">Kavango_King</span>
                        <span className="leader-pts">14,210 pts</span>
                        <span className="leader-prize">N$ 12,500</span>
                      </div>
                      <div className="leader-row rank-3">
                        <span className="rank-badge bronze">3rd</span>
                        <span className="leader-name">LuckyStrike_07</span>
                        <span className="leader-pts">11,980 pts</span>
                        <span className="leader-prize">N$ 7,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* ==============================================================
               SLIDE 3: SMART PC CASHIER PERKS & INSTANT CASHOUT
          =============================================================== */}
          <SwiperSlide>
            <div className="smartpc-slide slide-vip">
              <div className="slide-bg-ambient">
                <div className="ambient-grid-pattern"></div>
                <div className="slide-particle-spark p-2"></div>
                <div className="slide-particle-spark p-4"></div>
              </div>

              <div className="hero-slide-container container-fluid">
                <div className="row align-items-center g-3">
                  <div className="col-12 col-lg-7 text-start">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <span className="badge-hero-pill badge-vip-exclusive">
                        <i className="fa-solid fa-gem text-info"></i>
                        <span>SMART PC EXCLUSIVE</span>
                      </span>
                      <span className="badge-hero-pill badge-cashier">
                        <i className="fa-solid fa-shield-check text-success"></i>
                        <span>VERIFIED SHOP CASHIER</span>
                      </span>
                    </div>

                    <h1 className="hero-jackpot-title mb-1">
                      VIP REWARDS & INSTANT CASHOUT
                    </h1>

                    <div className="vip-highlight-row mb-2">
                      <div className="vip-chip">
                        <i className="fa-solid fa-percent text-warning"></i>
                        <span>5% Weekly Lossback</span>
                      </div>
                      <div className="vip-chip">
                        <i className="fa-solid fa-money-bill-transfer text-success"></i>
                        <span>Instant Desk Payout</span>
                      </div>
                      <div className="vip-chip">
                        <i className="fa-solid fa-coins text-warning"></i>
                        <span>Zero Commission</span>
                      </div>
                    </div>

                    <p className="hero-jackpot-sub mb-3">
                      Ready to collect your winnings? Request Cash Out on your screen and present your station number to the Windhoek Central cashier counter.
                    </p>

                    <div className="d-flex flex-wrap align-items-center gap-2 pt-1">
                      <button
                        type="button"
                        className="btn-hero-primary btn-gold-shine"
                        onClick={() => {
                          scrollToSection("vipRewardsSection");
                          onOpenCashout?.();
                        }}
                      >
                        <i className="fa-solid fa-hand-holding-dollar me-2"></i>
                        <span>REQUEST CASHOUT</span>
                      </button>
                      <button
                        type="button"
                        className="btn-hero-secondary"
                        onClick={() => scrollToSection("vipRewardsSection")}
                      >
                        <i className="fa-solid fa-gift me-2 text-warning"></i>
                        <span>VIEW REWARDS</span>
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-lg-5 text-center">
                    <div className="smartpc-desk-perk-box">
                      <div className="desk-badge-icon">
                        <i className="fa-solid fa-desktop text-warning"></i>
                      </div>
                      <h4 className="text-light fw-bold mb-1" style={{ fontSize: "1.15rem" }}>
                        Smart PC Station Active
                      </h4>
                      <p className="text-secondary small mb-3">
                        Direct connection to Windhoek Central Cashier Desk. Safe, certified, and instantly redeemable.
                      </p>
                      <div className="d-flex justify-content-center gap-2">
                        <span className="trust-micro-badge">
                          <i className="fa-solid fa-lock text-info me-1"></i> 256-BIT SSL
                        </span>
                        <span className="trust-micro-badge">
                          <i className="fa-solid fa-check text-success me-1"></i> FAIR RNG
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Custom Navigation Controls */}
        <button
          type="button"
          className="smartpc-hero-btn smartpc-hero-btn-prev"
          aria-label="Previous Banner"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          type="button"
          className="smartpc-hero-btn smartpc-hero-btn-next"
          aria-label="Next Banner"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>

        {/* Pagination Dots */}
        <div className="smartpc-hero-pagination"></div>
      </div>
    </div>
  );
};

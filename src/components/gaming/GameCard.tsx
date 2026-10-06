import React, { useRef } from "react";
import type { GameItem } from "../../types";

interface GameCardProps {
  game: GameItem;
  onPlay: (game: GameItem) => void;
  hideTitleAndSubtitle?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, hideTitleAndSubtitle }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const providerName = game.provider || "Live Game";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 6;

    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-4px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  // Determine dynamic action button text
  const getActionText = () => {
    const n = game.name.toLowerCase();
    if (n.includes("balloon")) return "INFLATE NOW";
    if (n.includes("roulette") || n.includes("spin") || n.includes("blitz") || n.includes("bonanza") || n.includes("sweet")) return "SPIN NOW";
    if (n.includes("pilot") || n.includes("aviator")) return "FLY NOW";
    if (n.includes("trader") || n.includes("trade")) return "TRADE NOW";
    if (n.includes("dice")) return "ROLL NOW";
    if (n.includes("soccer") || n.includes("goal") || n.includes("football")) return "KICK NOW";
    if (n.includes("plinko")) return "DROP NOW";
    if (n.includes("mines")) return "PLAY NOW";
    return game.actionText || "PLAY NOW";
  };

  // Determine dynamic top badge
  const getBadgeInfo = () => {
    if (game.badge) {
      return { text: game.badge.text, type: game.badge.type, icon: game.badge.icon };
    }
    const n = game.name.toLowerCase();
    if (n.includes("balloon") || n.includes("pilot")) return { text: "FUN", type: "fun", icon: "fa-solid fa-bolt" };
    if (n.includes("roulette") || n.includes("mines")) return { text: "HOT", type: "hot", icon: "fa-solid fa-fire" };
    if (n.includes("trader")) return { text: "NEW", type: "new", icon: "fa-solid fa-sparkles" };
    if (n.includes("bonanza") || n.includes("blitz")) return { text: "BONUS", type: "bonus", icon: "fa-solid fa-gift" };
    return { text: "LIVE", type: "live", icon: "fa-solid fa-circle" };
  };

  const badgeInfo = getBadgeInfo();
  const actionText = getActionText();

  return (
    <div
      className="chamfer-card-wrapper"
      data-category={game.categories?.join(" ") || game.category}
      data-name={game.name}
    >
      <div
        ref={cardRef}
        className={`chamfer-casino-card ${game.theme || "theme-gold"}`}
        onClick={() => onPlay(game)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Outer Chamfer Neon Border Wrap */}
        <div className="chamfer-border-wrap">
          <div className="chamfer-inner-deck">
            {/* Top Glowing Center Neon Stripe */}
            <div className="card-top-neon-stripe"></div>

            {/* Top Floating Badge */}
            <div className="card-top-badge-row">
              <span className={`chamfer-badge badge-${badgeInfo.type}`}>
                {badgeInfo.icon && <i className={`${badgeInfo.icon} me-1`}></i>}
                <span>{badgeInfo.text}</span>
              </span>
            </div>

            {/* Crystal-Clear Game Artwork Layer */}
            <div className="chamfer-artwork-frame">
              <img
                src={game.image}
                alt={game.title}
                loading="lazy"
                className="chamfer-poster-img"
                onError={(e) => {
                  e.currentTarget.src = "/assets/games/SPRIBE/AVIATOR.png";
                }}
              />
            </div>

            {/* Soft Bottom Shadow for 100% Crisp Typography */}
            <div className="chamfer-bottom-vignette"></div>

            {/* Bottom Content Deck with Italic Title, Gold Subtitle & Pill Button */}
            <div className="chamfer-content-deck">
              {!hideTitleAndSubtitle && (
                <>
                  <div className="chamfer-game-title" title={game.title}>
                    {game.title}
                  </div>
                  <div className="chamfer-game-subtitle">
                    {game.subtitle || `${game.category.toUpperCase()} • ${providerName.toUpperCase()}`}
                  </div>
                </>
              )}
              <button type="button" className="btn-chamfer-neon-pill" aria-label={`Play ${game.title}`}>
                <span>{actionText}</span>
                <i className="fa-solid fa-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




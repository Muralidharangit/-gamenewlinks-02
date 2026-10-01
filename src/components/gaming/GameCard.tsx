import React, { useRef } from "react";
import type { GameItem } from "../../types";

interface GameCardProps {
  game: GameItem;
  onPlay: (game: GameItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 14;

    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    cardRef.current.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

    if (glareRef.current) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      glareRef.current.style.setProperty("--mouse-x", `${pctX}%`);
      glareRef.current.style.setProperty("--mouse-y", `${pctY}%`);
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      className="game-card-stage perspective-stage game-card"
      data-category={game.categories.join(" ")}
      data-name={game.name}
    >
      <div
        ref={cardRef}
        className={`casino-card-container ${game.theme}`}
        onClick={() => onPlay(game)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="card-ground-reflection"></div>
        <div className="neon-filter-wrap">
          <div className="card-outer-bezel">
            <div className="card-inner-chassis">
              <div className="top-notch-tab"></div>
              {game.badge && (
                <span className={`card-floating-badge badge-${game.badge.type}`}>
                  {game.badge.icon && <i className={game.badge.icon}></i>} {game.badge.text}
                </span>
              )}
              <div ref={glareRef} className="card-specular-glare"></div>
              <div className="card-grid-texture"></div>
              <div className="card-artwork-layer">
                <img
                  src={game.image}
                  alt={game.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/games/avi.png";
                  }}
                />
              </div>
              <div className="card-vignette"></div>
              <div className="card-content-deck">
                <div className="card-title-text">{game.title}</div>
                {game.subtitle && <div className="card-subtitle-text">{game.subtitle}</div>}
                <span className="btn-play-neon">
                  <span>{game.actionText || "PLAY NOW"}</span>{" "}
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

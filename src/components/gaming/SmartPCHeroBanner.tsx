import React from "react";
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

export const SmartPCHeroBanner: React.FC<SmartPCHeroBannerProps> = () => {

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
               SLIDE 1
          =============================================================== */}
          <SwiperSlide>
            <div className="smartpc-slide p-0">
              <img src="/assets/banner/1.png" alt="Banner 1" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            </div>
          </SwiperSlide>

          {/* ==============================================================
               SLIDE 2
          =============================================================== */}
          <SwiperSlide>
            <div className="smartpc-slide p-0">
              <img src="/assets/banner/2.png" alt="Banner 2" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            </div>
          </SwiperSlide>

          {/* ==============================================================
               SLIDE 3
          =============================================================== */}
          <SwiperSlide>
            <div className="smartpc-slide p-0">
              <img src="/assets/banner/3.png" alt="Banner 3" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
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

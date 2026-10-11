import type { RouteKey } from "../../types/models";

export function Hero({
  navigate,
  onOpenVideoModal,
}: {
  navigate: (route: RouteKey) => void;
  onOpenVideoModal: () => void;
}) {
  return (
    <section id="hero" className="landing-hero baves-hero hero section dark-background">
      <div className="landing-hero__container baves-hero__container container">
        <div className="landing-hero__row baves-hero__row row align-items-center">
          <div className="landing-hero__col baves-hero__col col-lg-6">
            <div className="landing-hero__content baves-hero__content hero-content pe-0 pe-lg-5">
              <div className="landing-hero__badge baves-hero__badge hero-badge">
                <i className="bi bi-lightning-fill"></i>
                <span>FA26SE185 • BABOK®-Aligned Enterprise Simulation</span>
              </div>

              <h1 className="landing-hero__title baves-hero__title hero-title">
                AI-Powered Multi-Domain Virtual Enterprise Simulation for Business Analysis Training
              </h1>

              <p className="landing-hero__desc baves-hero__desc hero-description">
                Experience real-world Business Analysis beyond static case studies:
                interview ambiguous AI stakeholders with conflicting priorities, adapt to
                mid-project dynamic events, and receive rubric-driven evaluation across BABOK
                competencies.
              </p>

              <div className="landing-hero__features baves-hero__features hero-features">
                <div className="landing-hero__feature-item baves-hero__feature-item feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Multi-Agent Stakeholders</span>
                </div>
                <div className="landing-hero__feature-item baves-hero__feature-item feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Dynamic Scenario Events</span>
                </div>
                <div className="landing-hero__feature-item baves-hero__feature-item feature-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Rubric AI Assessment</span>
                </div>
              </div>

              <div className="landing-hero__actions baves-hero__actions hero-actions">
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("register");
                  }}
                  className="landing-hero__btn landing-hero__btn--primary baves-hero__btn baves-hero__btn--primary btn-primary"
                >
                  <span>Start Simulation</span>
                  <i className="bi bi-arrow-right"></i>
                </a>
                <button
                  type="button"
                  onClick={onOpenVideoModal}
                  className="landing-hero__btn landing-hero__btn--secondary baves-hero__btn baves-hero__btn--secondary btn-secondary"
                >
                  <i className="bi bi-play-circle"></i>
                  <span>Watch Walkthrough</span>
                </button>
              </div>

              <div className="landing-hero__social-proof baves-hero__social-proof hero-social-proof">
                <div className="landing-hero__rating baves-hero__rating rating">
                  <div className="landing-hero__stars baves-hero__stars stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <span className="landing-hero__rating-text baves-hero__rating-text rating-text">
                    Aligned with IIBA BABOK® Competency Standards • Project Code FA26SE185
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-hero__visual-col baves-hero__visual-col col-lg-6">
            <div className="landing-hero__visual baves-hero__visual hero-visual">
              <div className="landing-hero__visual-container baves-hero__visual-container visual-container">
                <img
                  src="/elevate/img/illustration/illustration-27.webp"
                  alt="BA-VES Enterprise Simulation Dashboard"
                  className="landing-hero__main-image baves-hero__main-image img-fluid main-screen"
                />
                <div className="landing-hero__floating-card landing-hero__floating-card--growth baves-hero__floating-card baves-hero__floating-card--growth floating-card card-1">
                  <div className="landing-hero__card-icon baves-hero__card-icon card-icon">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div className="landing-hero__card-content baves-hero__card-content card-content">
                    <span className="landing-hero__card-value baves-hero__card-value card-value">+94%</span>
                    <span className="landing-hero__card-label baves-hero__card-label card-label">Elicitation Mastery</span>
                  </div>
                </div>
                <div className="landing-hero__floating-card landing-hero__floating-card--domains baves-hero__floating-card baves-hero__floating-card--domains floating-card card-2">
                  <div className="landing-hero__card-icon baves-hero__card-icon card-icon">
                    <i className="bi bi-diagram-3-fill"></i>
                  </div>
                  <div className="landing-hero__card-content baves-hero__card-content card-content">
                    <span className="landing-hero__card-value baves-hero__card-value card-value">4 Domains</span>
                    <span className="landing-hero__card-label baves-hero__card-label card-label">Banking • Health • Logistics • Edu</span>
                  </div>
                </div>
                <div className="landing-hero__floating-card landing-hero__floating-card--status baves-hero__floating-card baves-hero__floating-card--status floating-card card-3">
                  <div className="landing-hero__card-icon baves-hero__card-icon card-icon success">
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <div className="landing-hero__card-content baves-hero__card-content card-content">
                    <span className="landing-hero__card-label baves-hero__card-label card-label">BABOK Rubric Calibrated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Aliases for compatibility
export { Hero as LandingHero, Hero as ElevateHero };

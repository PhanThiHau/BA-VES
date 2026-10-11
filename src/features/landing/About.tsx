import type { RouteKey } from "../../types/models";

export function About({
  navigate,
  onOpenVideoModal,
}: {
  navigate: (route: RouteKey) => void;
  onOpenVideoModal: () => void;
}) {
  return (
    <section id="about" className="landing-about baves-about about section">
      {/* Section Title */}
      <div className="landing-about__section-title baves-about__section-title container section-title">
        <h2>About BA-VES</h2>
        <p>Bridging the Gap Between BABOK Theory and Hands-on Virtual Enterprise Practice</p>
      </div>

      <div className="landing-about__container baves-about__container container">
        <div className="landing-about__row baves-about__row row gy-4">
          <div className="landing-about__content-col baves-about__content-col col-lg-6">
            <div className="landing-about__content baves-about__content content-wrapper">
              <div className="landing-about__badge baves-about__badge badge-label">PRODUCT BACKGROUND • FA26SE185</div>
              <h2 className="landing-about__heading baves-about__heading">Empowering Business Analysts with Realistic, Reactive Stakeholder Simulation</h2>
              <p className="landing-about__lead baves-about__lead lead-text">
                Most Business Analysis training remains theory-heavy: learners memorize
                BABOK techniques (elicitation, requirements analysis, documentation)
                without practicing them against an evolving enterprise. Real stakeholders
                are ambiguous, contradict themselves, change priorities mid-project, and
                belong to varied domains with different vocabularies and constraints.
              </p>

              <div className="landing-about__stats-row baves-about__stats-row stats-row">
                <div className="landing-about__stat-item baves-about__stat-item stat-item">
                  <div className="landing-about__stat-number baves-about__stat-number stat-number">4+</div>
                  <div className="landing-about__stat-label baves-about__stat-label stat-label">Enterprise Domains</div>
                </div>
                <div className="landing-about__stat-item baves-about__stat-item stat-item">
                  <div className="landing-about__stat-number baves-about__stat-number stat-number">6</div>
                  <div className="landing-about__stat-label baves-about__stat-label stat-label">BABOK Knowledge Areas</div>
                </div>
                <div className="landing-about__stat-item baves-about__stat-item stat-item">
                  <div className="landing-about__stat-number baves-about__stat-number stat-number">100%</div>
                  <div className="landing-about__stat-label baves-about__stat-label stat-label">Evidence-Based Rubric</div>
                </div>
              </div>

              <div className="landing-about__highlights baves-about__highlights feature-highlights">
                <div className="landing-about__highlight-item baves-about__highlight-item highlight-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Autonomous stakeholder personas with conflicting goals &amp; hidden info</span>
                </div>
                <div className="landing-about__highlight-item baves-about__highlight-item highlight-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Mid-session dynamic events: scope creep, regulatory shifts, budget cuts</span>
                </div>
                <div className="landing-about__highlight-item baves-about__highlight-item highlight-item">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Dual-layer evaluation: automated AI assessment calibrated by instructors</span>
                </div>
              </div>

              <div className="landing-about__cta-group baves-about__cta-group cta-group">
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("register");
                  }}
                  className="landing-about__btn landing-about__btn--primary baves-about__btn baves-about__btn--primary btn-primary"
                >
                  Explore Platform
                </a>
                <button
                  type="button"
                  onClick={onOpenVideoModal}
                  className="landing-about__btn landing-about__btn--secondary baves-about__btn baves-about__btn--secondary btn-secondary"
                >
                  <i className="bi bi-play-circle"></i>
                  <span>Watch Walkthrough</span>
                </button>
              </div>
            </div>
          </div>

          <div className="landing-about__visual-col baves-about__visual-col col-lg-6">
            <div className="landing-about__visual baves-about__visual visual-wrapper">
              <div className="landing-about__main-visual baves-about__main-visual main-visual">
                <img
                  src="/elevate/img/about/about-5.webp"
                  alt="BA-VES Collaborative Stakeholder Simulation"
                  className="landing-about__image baves-about__image img-fluid"
                />
                <div className="landing-about__floating-card landing-about__floating-card--retention baves-about__floating-card baves-about__floating-card--retention floating-card top-card">
                  <div className="landing-about__card-icon baves-about__card-icon card-icon">
                    <i className="bi bi-trophy-fill"></i>
                  </div>
                  <div className="landing-about__card-content baves-about__card-content card-content">
                    <div className="landing-about__card-value baves-about__card-value card-value">100%</div>
                    <div className="landing-about__card-text baves-about__card-text card-text">BABOK v3 Standards</div>
                  </div>
                </div>
                <div className="landing-about__floating-card landing-about__floating-card--roi baves-about__floating-card baves-about__floating-card--roi floating-card bottom-card">
                  <div className="landing-about__card-icon baves-about__card-icon card-icon">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div className="landing-about__card-content baves-about__card-content card-content">
                    <div className="landing-about__card-value baves-about__card-value card-value">3.2x</div>
                    <div className="landing-about__card-text baves-about__card-text card-text">Faster Competency Acquisition</div>
                  </div>
                </div>
              </div>
              <div className="landing-about__secondary-grid baves-about__secondary-grid secondary-grid">
                <img
                  src="/elevate/img/about/about-square-8.webp"
                  alt="Requirement Analysis Workshop"
                  className="landing-about__thumb baves-about__thumb img-fluid"
                />
                <img
                  src="/elevate/img/about/about-square-12.webp"
                  alt="Stakeholder Elicitation Session"
                  className="landing-about__thumb baves-about__thumb img-fluid"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="landing-about__features-grid baves-about__features-grid features-grid">
          <div className="row gy-4">
            <div className="col-lg-3 col-md-6">
              <div className="landing-about__feature-card baves-about__feature-card feature-card">
                <div className="landing-about__feature-icon baves-about__feature-icon feature-icon">
                  <i className="bi bi-cpu"></i>
                </div>
                <h4>Multi-Agent Engine</h4>
                <p>Preserves separate runtime memory and knowledge boundaries for each stakeholder persona.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="landing-about__feature-card baves-about__feature-card feature-card">
                <div className="landing-about__feature-icon baves-about__feature-icon feature-icon">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <h4>Dynamic Scenario Events</h4>
                <p>Simulates real-world changes mid-interview: budget cuts, compliance updates, and scope shifts.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="landing-about__feature-card baves-about__feature-card feature-card">
                <div className="landing-about__feature-icon baves-about__feature-icon feature-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </div>
                <h4>Artifact Processing</h4>
                <p>Supports BRD, User Stories, and Use Cases submitted in DOCX, text-based PDF, and TXT formats.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="landing-about__feature-card baves-about__feature-card feature-card">
                <div className="landing-about__feature-icon baves-about__feature-icon feature-icon">
                  <i className="bi bi-check2-square"></i>
                </div>
                <h4>Rubric AI Assessment</h4>
                <p>Generates criterion-level scoring, required evidence validation, and structured feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Aliases for compatibility
export { About as LandingAbout, About as ElevateAbout };

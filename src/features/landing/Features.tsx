import type { RouteKey } from "../../types/models";

export function Features({
  navigate,
  onOpenVideoModal,
}: {
  navigate: (route: RouteKey) => void;
  onOpenVideoModal: () => void;
}) {
  return (
    <>
      {/* Features Section */}
      <section id="features" className="landing-features baves-features features section">
        {/* Section Title */}
        <div className="landing-features__section-title baves-features__section-title container section-title">
          <h2>Architecture &amp; Features</h2>
          <p>Engineered for High-Fidelity Enterprise Simulation and Rigorous Competency Development</p>
        </div>

        <div className="landing-features__container baves-features__container container">
          <div className="row g-0">
            <div className="col-lg-6">
              <div className="landing-features__content baves-features__content content-wrapper">
                <div className="landing-features__badge baves-features__badge section-badge">Core Platform Capabilities</div>
                <h2>Autonomous Stakeholders &amp; Real-Time Adaptation</h2>
                <p>
                  Built specifically to train modern Business Analysts under unpredictable conditions.
                  Engage autonomous agents, resolve contradictory inputs, and formulate sound
                  business architecture.
                </p>

                <div className="landing-features__checklist baves-features__checklist features-checklist">
                  <div className="landing-features__check-item baves-features__check-item check-item">
                    <i className="bi bi-check-circle"></i>
                    <span>Persona-Specific LLM System Prompting</span>
                  </div>
                  <div className="landing-features__check-item baves-features__check-item check-item">
                    <i className="bi bi-check-circle"></i>
                    <span>Runtime Audit Trail for Plagiarism &amp; AI Misuse Check</span>
                  </div>
                  <div className="landing-features__check-item baves-features__check-item check-item">
                    <i className="bi bi-check-circle"></i>
                    <span>Configurable Assessment Rubrics per Academic Cohort</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="landing-features__cards baves-features__cards features-cards">
                <div className="landing-features__card baves-features__card feature-card primary">
                  <div className="landing-features__card-header card-header">
                    <div className="landing-features__icon-wrapper icon-wrapper">
                      <i className="bi bi-cpu"></i>
                    </div>
                    <h4>Multi-Agent Orchestration</h4>
                  </div>
                  <p>
                    Isolated memory and knowledge boundaries for each stakeholder persona,
                    preventing hallucinations and preserving hidden requirements.
                  </p>
                </div>

                <div className="landing-features__card baves-features__card feature-card secondary">
                  <div className="landing-features__card-header card-header">
                    <div className="landing-features__icon-wrapper icon-wrapper">
                      <i className="bi bi-shield-lock"></i>
                    </div>
                    <h4>Academic Integrity &amp; Logs</h4>
                  </div>
                  <p>
                    Immutable conversational event streams and artifact revision history
                    ensure full evaluation transparency for instructors.
                  </p>
                </div>

                <div className="landing-features__card baves-features__card feature-card tertiary">
                  <div className="landing-features__card-header card-header">
                    <div className="landing-features__icon-wrapper icon-wrapper">
                      <i className="bi bi-graph-up-arrow"></i>
                    </div>
                    <h4>Competency Radar</h4>
                  </div>
                  <p>
                    Visual analytics across BABOK knowledge areas: Elicitation, Requirements
                    Life Cycle, Strategy Analysis, and Solution Evaluation.
                  </p>
                </div>

                <div className="landing-features__card baves-features__card feature-card quaternary">
                  <div className="landing-features__card-header card-header">
                    <div className="landing-features__icon-wrapper icon-wrapper">
                      <i className="bi bi-people"></i>
                    </div>
                    <h4>Cohort Collaboration</h4>
                  </div>
                  <p>
                    Multi-student group allocations, class-wide scenario launches, and
                    comparative performance distributions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features-2" className="landing-features-grid baves-features-grid features-2 section">
        <div className="container">
          <div className="landing-features-grid__wrapper features-grid">
            <div className="landing-features-grid__card feature-card">
              <div className="landing-features-grid__header feature-header">
                <div className="landing-features-grid__icon feature-icon">
                  <i className="bi bi-cpu"></i>
                </div>
                <h3>Deterministic AI Grading</h3>
              </div>
              <p>
                Structured JSON schema evaluation ensures consistent, criterion-by-criterion
                rubric scoring with direct evidence extraction.
              </p>
            </div>

            <div className="landing-features-grid__card feature-card">
              <div className="landing-features-grid__header feature-header">
                <div className="landing-features-grid__icon feature-icon">
                  <i className="bi bi-cloud-check"></i>
                </div>
                <h3>Multi-Format Parser</h3>
              </div>
              <p>
                Upload Word DOCX, text-based PDF, or plain text artifacts with automated
                section extraction and syntax validation.
              </p>
            </div>

            <div className="landing-features-grid__card feature-card">
              <div className="landing-features-grid__header feature-header">
                <div className="landing-features-grid__icon feature-icon">
                  <i className="bi bi-people"></i>
                </div>
                <h3>Instructor Calibration</h3>
              </div>
              <p>
                Review AI marks side-by-side with original text evidence, override scores
                seamlessly, and attach feedback audio or notes.
              </p>
            </div>

            <div className="landing-features-grid__card feature-card">
              <div className="landing-features-grid__header feature-header">
                <div className="landing-features-grid__icon feature-icon">
                  <i className="bi bi-bar-chart"></i>
                </div>
                <h3>Dynamic Event Injection</h3>
              </div>
              <p>
                Mid-session scope creep, budget freezes, or compliance amendments inject
                vital unpredictability into student analysis runs.
              </p>
            </div>
          </div>

          <div className="landing-features-grid__cta cta-container">
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                navigate("register");
              }}
              className="landing-features-grid__cta-btn cta-button cta-primary"
            >
              Get Started Today
            </a>
            <button
              type="button"
              onClick={onOpenVideoModal}
              className="landing-features-grid__cta-btn cta-button cta-secondary"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// Aliases for compatibility
export { Features as LandingFeatures, Features as ElevateFeatures };

import type { RouteKey } from "../../types/models";

export function Services({
  navigate,
}: {
  navigate: (route: RouteKey) => void;
}) {
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPortfolio = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="services" className="landing-services baves-services services section">
      {/* Section Title */}
      <div className="landing-services__section-title baves-services__section-title container section-title">
        <h2>Core Modules</h2>
        <p>Comprehensive Architecture for Multi-Agent Virtual Enterprise Training</p>
      </div>

      <div className="landing-services__container baves-services__container container">
        <div className="landing-services__intro baves-services__intro services-intro">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2>End-to-End Business Analysis Learning Workflow</h2>
              <p>
                From scenario assignment and interactive multi-agent interviews to BA artifact
                submission, rubric-driven AI assessment, and instructor calibration—BA-VES delivers
                a complete, closed-loop training ecosystem aligned with the BABOK framework.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <a href="#contact" onClick={scrollToContact} className="landing-services__btn-consultation btn-consultation">
                Request Academic Demo
              </a>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Card 1 */}
          <div className="col-lg-6">
            <div className="landing-services__card baves-services__card service-card">
              <div className="landing-services__card-header service-card-header">
                <div className="landing-services__icon service-icon">
                  <i className="bi bi-chat-quote-fill"></i>
                </div>
                <div className="landing-services__meta service-meta">
                  <span className="landing-services__category service-category">FE-01 • Simulation</span>
                </div>
              </div>
              <div className="landing-services__card-body service-card-body">
                <h3>Multi-Agent Stakeholder Simulation</h3>
                <p>
                  Engage in interactive text-based interviews with multiple AI Stakeholder Agents.
                  Each agent operates under realistic constraints: personal agendas, knowledge
                  boundaries, hidden information, and conflicting business requirements.
                </p>
                <div className="landing-services__features service-features">
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Persona-specific runtime memory &amp; isolation</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Elicitation of ambiguous &amp; hidden requirements</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Stakeholder conflict resolution practice</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Full conversational audit trail for grading</span>
                  </div>
                </div>
              </div>
              <div className="landing-services__card-footer service-card-footer">
                <a href="#portfolio" onClick={scrollToPortfolio} className="landing-services__link service-link">
                  Explore Scenarios <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col-lg-6">
            <div className="landing-services__card baves-services__card service-card">
              <div className="landing-services__card-header service-card-header">
                <div className="landing-services__icon service-icon">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div className="landing-services__meta service-meta">
                  <span className="landing-services__category service-category">FE-02/03 • Dynamic Engine</span>
                </div>
              </div>
              <div className="landing-services__card-body service-card-body">
                <h3>Dynamic Scenario &amp; Event Engine</h3>
                <p>
                  Experience real-world project unpredictability. Mid-simulation events trigger
                  scope adjustments, regulatory updates, budget restrictions, or stakeholder
                  priority shifts automatically or under instructor command.
                </p>
                <div className="landing-services__features service-features">
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Automated message-count or condition triggers</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Manual instructor event injections in real time</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>ScenarioVersion snapshots for reproducible runs</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Change control &amp; requirement adaptation testing</span>
                  </div>
                </div>
              </div>
              <div className="landing-services__card-footer service-card-footer">
                <a href="#features" className="landing-services__link service-link">
                  Learn Event Engine <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="col-lg-6">
            <div className="landing-services__card baves-services__card service-card">
              <div className="landing-services__card-header service-card-header">
                <div className="landing-services__icon service-icon">
                  <i className="bi bi-clipboard2-check-fill"></i>
                </div>
                <div className="landing-services__meta service-meta">
                  <span className="landing-services__category service-category">FE-04/05 • Assessment</span>
                </div>
              </div>
              <div className="landing-services__card-body service-card-body">
                <h3>Rubric-Driven AI Assessment</h3>
                <p>
                  Submit Business Requirements Documents (BRD), User Stories, and Use Cases.
                  The AI assessment engine evaluates submissions against ground truth and configurable
                  BABOK rubrics to provide criterion-level scores with quoted evidence.
                </p>
                <div className="landing-services__features service-features">
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Support for DOCX, text-based PDF, and TXT files</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Criterion-level scoring with evidence extraction</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Missing element detection &amp; improvement tips</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Consistent, unbiased automated evaluation</span>
                  </div>
                </div>
              </div>
              <div className="landing-services__card-footer service-card-footer">
                <a href="#about" className="landing-services__link service-link">
                  View BABOK Alignment <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="col-lg-6">
            <div className="landing-services__card baves-services__card service-card">
              <div className="landing-services__card-header service-card-header">
                <div className="landing-services__icon service-icon">
                  <i className="bi bi-award-fill"></i>
                </div>
                <div className="landing-services__meta service-meta">
                  <span className="landing-services__category service-category">FE-06/07 • Governance</span>
                </div>
              </div>
              <div className="landing-services__card-body service-card-body">
                <h3>Instructor Calibration &amp; Competency Hub</h3>
                <p>
                  Instructors maintain full control. Review AI scores, add qualitative comments,
                  and calibrate grades without overwriting original AI evaluations. Competency
                  progress is tracked across cohorts and individual learners.
                </p>
                <div className="landing-services__features service-features">
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Human Score calibration &amp; qualitative remarks</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Competency radar tracking across BABOK areas</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Cohort management, deadlines &amp; attempt limits</span>
                  </div>
                  <div className="landing-services__feature-item feature-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Assignment distribution for classes &amp; individuals</span>
                  </div>
                </div>
              </div>
              <div className="landing-services__card-footer service-card-footer">
                <a href="#pricing" className="landing-services__link service-link">
                  View Cohort Plans <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="landing-services__cta baves-services__cta cta-section">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="landing-services__cta-content cta-content">
                    <h3>Ready to Advance Your Business Analysis Training?</h3>
                    <p>
                      Deploy BA-VES for university courses, corporate training academies, or
                      self-paced professional development. Combine realistic simulation with
                      evidence-based assessment.
                    </p>
                    <div className="landing-services__cta-stats cta-stats">
                      <div className="landing-services__cta-stat-item stat-item">
                        <div className="stat-number">4+</div>
                        <div className="stat-label">Enterprise Domains</div>
                      </div>
                      <div className="landing-services__cta-stat-item stat-item">
                        <div className="stat-number">6</div>
                        <div className="stat-label">BABOK Competencies</div>
                      </div>
                      <div className="landing-services__cta-stat-item stat-item">
                        <div className="stat-number">100%</div>
                        <div className="stat-label">Calibrated Reviews</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <div className="landing-services__cta-actions cta-actions">
                    <a
                      href="#register"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("register");
                      }}
                      className="landing-services__btn-primary btn-primary"
                    >
                      Start Free Trial
                    </a>
                    <a href="#portfolio" onClick={scrollToPortfolio} className="landing-services__btn-secondary btn-secondary">
                      View Scenarios
                    </a>
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
export { Services as LandingServices, Services as ElevateServices };

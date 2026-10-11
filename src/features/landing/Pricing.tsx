import type { RouteKey } from "../../types/models";

export function Pricing({
  navigate,
}: {
  navigate: (route: RouteKey) => void;
}) {
  const plans = [
    {
      name: "Student Tier",
      desc: "For individual BA students and independent learners seeking hands-on BABOK practice.",
      price: "19",
      featured: false,
      btnText: "Start Learning",
      features: [
        "Access to 4 core enterprise domains",
        "Interactive stakeholder dialogue with AI personas",
        "Instant criterion-level rubric feedback",
      ],
    },
    {
      name: "Cohort Standard",
      desc: "Ideal for university courses, semester modules, and bootcamps with group oversight.",
      price: "39",
      featured: false,
      btnText: "Launch Cohort",
      features: [
        "Up to 50 active learner workspaces",
        "Instructor calibration hub & rubric editor",
        "Dynamic event triggers & scenario replay",
      ],
    },
    {
      name: "Academic Pro",
      badge: "Most Popular",
      desc: "Full departmental deployment with unlimited authoring and institutional competency analytics.",
      price: "59",
      featured: true,
      btnText: "Enroll Faculty",
      features: [
        "Custom scenario & stakeholder authoring suite",
        "BABOK competency radar & cohort export",
        "Plagiarism & prompt injection guardrails",
      ],
    },
    {
      name: "Enterprise Lab",
      desc: "Custom deployments for corporate training academies and specialized consultancy practices.",
      price: "89",
      featured: false,
      btnText: "Contact Us",
      features: [
        "Private cloud / on-premise LLM options",
        "Proprietary corporate domain modeling",
        "Dedicated SLA, SSO & LMS integration",
      ],
    },
  ];

  return (
    <section id="pricing" className="landing-pricing baves-pricing pricing section">
      {/* Section Title */}
      <div className="landing-pricing__section-title baves-pricing__section-title container section-title">
        <h2>Cohort &amp; Academic Pricing</h2>
        <p>Flexible Plans Designed for Individual Learners, Academic Classrooms, and Enterprise Academies</p>
      </div>

      <div className="landing-pricing__container baves-pricing__container container">
        <div className="landing-pricing__grid baves-pricing__grid row g-4">
          {plans.map((p, idx) => (
            <div key={idx} className="col-xl-3 col-md-6">
              <article className={`landing-pricing__card baves-pricing__card pricing-card ${p.featured ? "featured landing-pricing__card--featured" : ""}`}>
                {p.badge && <div className="landing-pricing__badge plan-badge">{p.badge}</div>}
                <div className="landing-pricing__header plan-header">
                  <span className="landing-pricing__label plan-label">{p.name}</span>
                  <p className="landing-pricing__desc plan-description">{p.desc}</p>
                </div>
                <div className="landing-pricing__price-box plan-price">
                  <span className="landing-pricing__currency currency">$</span>
                  <span className="landing-pricing__amount amount">{p.price}</span>
                  <span className="landing-pricing__duration duration">/learner</span>
                </div>
                <ul className="landing-pricing__features plan-features list-unstyled">
                  {p.features.map((f, fIdx) => (
                    <li key={fIdx} className="landing-pricing__feature-item">
                      <i className="bi bi-check-circle"></i>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="landing-pricing__action plan-action">
                  <button
                    type="button"
                    onClick={() => navigate("register")}
                    className="landing-pricing__btn btn btn-plan"
                  >
                    {p.btnText}
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Aliases for compatibility
export { Pricing as LandingPricing, Pricing as ElevatePricing };

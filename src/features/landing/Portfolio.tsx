import { useState } from "react";

export function Portfolio() {
  const [filter, setFilter] = useState("all");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const scenarios = [
    {
      id: 1,
      category: "Banking & Financial Services",
      domain: "banking",
      title: "Core Banking Modernization & Automated KYC",
      year: "2024",
      image: "/elevate/img/portfolio/portfolio-3.webp",
      desc: "Interview the Chief Risk Officer, Compliance Manager, and Branch Ops Lead. Resolve conflicting requirements between instant digital onboarding and strict anti-money laundering regulations.",
      metric1Label: "Compliance",
      metric1Val: "100% BABOK",
      metric2Label: "Stakeholders",
      metric2Val: "4 Agents",
    },
    {
      id: 2,
      category: "Healthcare & Life Sciences",
      domain: "healthcare",
      title: "Hospital EHR & Telemedicine Patient Intake Portal",
      year: "2024",
      image: "/elevate/img/portfolio/portfolio-7.webp",
      desc: "Elicit requirements from Clinical Directors, Nursing Supervisors, and HIPAA Compliance Officers. Navigate mid-session scope changes triggered by emergency state privacy amendments.",
      metric1Label: "HIPAA Privacy",
      metric1Val: "Zero Leaks",
      metric2Label: "Event Triggers",
      metric2Val: "3 Dynamic Shifts",
    },
    {
      id: 3,
      category: "Logistics & Supply Chain",
      domain: "logistics",
      title: "Cold-Chain Fleet Tracking & Automated Fulfillment",
      year: "2023",
      image: "/elevate/img/portfolio/portfolio-9.webp",
      desc: "Engage Warehouse Directors, Fleet Dispatchers, and Third-Party Carriers. Determine IoT sensor tolerances and reconcile dispute resolution mechanisms during cold chain transit breaks.",
      metric1Label: "Cost Savings",
      metric1Val: "$2.4M Target",
      metric2Label: "SLA Uptime",
      metric2Val: "99.9%",
    },
    {
      id: 4,
      category: "Education & Academic Systems",
      domain: "education",
      title: "University SIS & Hybrid Learning Platform",
      year: "2023",
      image: "/elevate/img/portfolio/portfolio-11.webp",
      desc: "Work with Academic Deans, Student Union Representatives, and IT Infrastructure Leads to define course enrollment algorithms and grading policy governance.",
      metric1Label: "Student Scale",
      metric1Val: "12,000+ Users",
      metric2Label: "Adoption Rate",
      metric2Val: "+58% Target",
    },
    {
      id: 5,
      category: "Banking & Financial Services",
      domain: "banking",
      title: "Omni-Channel Payment Gateway & Merchant Settlement",
      year: "2024",
      image: "/elevate/img/portfolio/portfolio-5.webp",
      desc: "Negotiate transaction clearing deadlines, fraud detection thresholds, and merchant settlement schedules amidst sudden Central Bank interest rate shifts.",
      metric1Label: "Market Share",
      metric1Val: "+28% Target",
      metric2Label: "API Systems",
      metric2Val: "7 Integrations",
    },
    {
      id: 6,
      category: "Logistics & Supply Chain",
      domain: "logistics",
      title: "Intelligent Supply Chain & Demand Forecasting",
      year: "2023",
      image: "/elevate/img/portfolio/portfolio-12.webp",
      desc: "Synthesize ambiguous operational requirements into rigorous BRDs and User Stories. Defend system assumptions during a simulated budget reduction scenario.",
      metric1Label: "Elicitation Speed",
      metric1Val: "3x Faster",
      metric2Label: "Rubric Accuracy",
      metric2Val: "97% Match",
    },
  ];

  const filteredScenarios =
    filter === "all"
      ? scenarios
      : scenarios.filter((s) => s.domain === filter);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="portfolio" className="landing-portfolio baves-portfolio portfolio section">
      {/* Section Title */}
      <div className="landing-portfolio__section-title baves-portfolio__section-title container section-title">
        <h2>Multi-Domain Scenarios</h2>
        <p>Explore Curated Virtual Enterprise Scenarios Across Diverse Industry Contexts</p>
      </div>

      <div className="landing-portfolio__container baves-portfolio__container container">
        {/* Filter Tabs */}
        <ul className="landing-portfolio__filters baves-portfolio__filters portfolio-filters">
          <li
            className={`landing-portfolio__filter-item ${filter === "all" ? "filter-active landing-portfolio__filter-item--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Domains
          </li>
          <li
            className={`landing-portfolio__filter-item ${filter === "banking" ? "filter-active landing-portfolio__filter-item--active" : ""}`}
            onClick={() => setFilter("banking")}
          >
            Banking &amp; Finance
          </li>
          <li
            className={`landing-portfolio__filter-item ${filter === "healthcare" ? "filter-active landing-portfolio__filter-item--active" : ""}`}
            onClick={() => setFilter("healthcare")}
          >
            Healthcare
          </li>
          <li
            className={`landing-portfolio__filter-item ${filter === "logistics" ? "filter-active landing-portfolio__filter-item--active" : ""}`}
            onClick={() => setFilter("logistics")}
          >
            Logistics &amp; Supply Chain
          </li>
          <li
            className={`landing-portfolio__filter-item ${filter === "education" ? "filter-active landing-portfolio__filter-item--active" : ""}`}
            onClick={() => setFilter("education")}
          >
            Higher Education
          </li>
        </ul>

        {/* Scenarios Grid */}
        <div className="landing-portfolio__grid baves-portfolio__grid row gy-4">
          {filteredScenarios.map((s) => (
            <div key={s.id} className="col-lg-6">
              <div className="landing-portfolio__wrapper baves-portfolio__wrapper portfolio-wrapper">
                <div className="landing-portfolio__image-box portfolio-image">
                  <img src={s.image} alt={s.title} className="landing-portfolio__image img-fluid" />
                  <div className="landing-portfolio__category portfolio-category">{s.category}</div>
                </div>
                <div className="landing-portfolio__content portfolio-content">
                  <div className="landing-portfolio__header portfolio-header">
                    <h3>{s.title}</h3>
                    <span className="landing-portfolio__year portfolio-year">{s.year}</span>
                  </div>
                  <p className="landing-portfolio__description portfolio-description">{s.desc}</p>
                  <div className="landing-portfolio__details-row portfolio-details-row">
                    <div className="landing-portfolio__metrics portfolio-metrics">
                      <div className="landing-portfolio__metric-item metric-item">
                        <span className="metric-label">{s.metric1Label}</span>
                        <span className="metric-value">{s.metric1Val}</span>
                      </div>
                      <div className="landing-portfolio__metric-item metric-item">
                        <span className="metric-label">{s.metric2Label}</span>
                        <span className="metric-value">{s.metric2Val}</span>
                      </div>
                    </div>
                    <div className="landing-portfolio__actions portfolio-actions">
                      <button
                        type="button"
                        onClick={() => setLightboxImg(s.image)}
                        className="landing-portfolio__action-btn action-link"
                      >
                        <i className="bi bi-eye"></i> Preview
                      </button>
                      <a href="#contact" onClick={scrollToContact} className="landing-portfolio__action-link action-link">
                        <i className="bi bi-play-circle"></i> Try Scenario
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio CTA */}
        <div className="landing-portfolio__cta baves-portfolio__cta portfolio-cta">
          <div className="row align-items-center">
            <div className="col-lg-9">
              <h3>Need a Custom Enterprise Scenario for Your Organization?</h3>
              <p>
                Instructors and corporate trainers can author custom Stakeholder Personas,
                Agent Knowledge Items, and Dynamic Events via the Scenario Authoring Suite (FE-02).
              </p>
            </div>
            <div className="col-lg-3 text-lg-end">
              <a href="#contact" onClick={scrollToContact} className="landing-portfolio__btn-primary btn-primary">
                Request Authoring Access
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-black">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <i className="bi bi-x-lg text-lg"></i>
            </button>
            <img src={lightboxImg} alt="Preview" className="max-h-[85vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </section>
  );
}

// Aliases for compatibility
export { Portfolio as LandingPortfolio, Portfolio as ElevatePortfolio };

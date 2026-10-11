import { useState } from "react";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail("");
  };

  const scrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="footer" className="landing-footer baves-footer footer position-relative dark-background">
      <div className="landing-footer__container container">
        <div className="landing-footer__main baves-footer__main footer-main">
          <div className="row align-items-start">
            <div className="col-lg-5">
              <div className="landing-footer__brand baves-footer__brand brand-section">
                <a
                  href="#hero"
                  onClick={(e) => scrollTo("hero", e)}
                  className="landing-footer__logo baves-footer__logo logo d-flex align-items-center mb-4"
                >
                  <span className="landing-footer__sitename baves-footer__sitename sitename">BA-VES</span>
                  <span className="landing-footer__badge baves-footer__badge ms-2 rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                    FA26SE185
                  </span>
                </a>
                <p className="landing-footer__brand-desc baves-footer__brand-desc brand-description">
                  AI-Powered Multi-Domain Virtual Enterprise Simulation for Business Analysis Training.
                  Empowering learners to practice elicitation, change management, and artifact development
                  in realistic virtual enterprises.
                </p>

                <div className="landing-footer__contact-info baves-footer__contact-info contact-info mt-5">
                  <div className="landing-footer__contact-item baves-footer__contact-item contact-item">
                    <i className="bi bi-mortarboard"></i>
                    <span>Capstone Project Group GFA26SE16 • Software Engineering</span>
                  </div>
                  <div className="landing-footer__contact-item baves-footer__contact-item contact-item">
                    <i className="bi bi-telephone"></i>
                    <span>+84 911 434 175</span>
                  </div>
                  <div className="landing-footer__contact-item baves-footer__contact-item contact-item">
                    <i className="bi bi-envelope"></i>
                    <span>tamkg1102@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="landing-footer__nav-wrapper baves-footer__nav-wrapper footer-nav-wrapper">
                <div className="row">
                  <div className="col-6 col-lg-3">
                    <div className="landing-footer__nav-col baves-footer__nav-col nav-column">
                      <h6>Simulation</h6>
                      <nav className="landing-footer__nav baves-footer__nav footer-nav">
                        <a href="#about" onClick={(e) => scrollTo("about", e)}>Problem Gap</a>
                        <a href="#services" onClick={(e) => scrollTo("services", e)}>Multi-Agent Engine</a>
                        <a href="#services" onClick={(e) => scrollTo("services", e)}>Dynamic Events</a>
                        <a href="#services" onClick={(e) => scrollTo("services", e)}>Rubric Assessment</a>
                        <a href="#pricing" onClick={(e) => scrollTo("pricing", e)}>Cohort Hub</a>
                      </nav>
                    </div>
                  </div>

                  <div className="col-6 col-lg-3">
                    <div className="landing-footer__nav-col baves-footer__nav-col nav-column">
                      <h6>Domains</h6>
                      <nav className="landing-footer__nav baves-footer__nav footer-nav">
                        <a href="#portfolio" onClick={(e) => scrollTo("portfolio", e)}>Core Banking</a>
                        <a href="#portfolio" onClick={(e) => scrollTo("portfolio", e)}>Healthcare EHR</a>
                        <a href="#portfolio" onClick={(e) => scrollTo("portfolio", e)}>Supply Chain</a>
                        <a href="#portfolio" onClick={(e) => scrollTo("portfolio", e)}>Higher Education</a>
                        <a href="#portfolio" onClick={(e) => scrollTo("portfolio", e)}>Fintech Gateway</a>
                      </nav>
                    </div>
                  </div>

                  <div className="col-6 col-lg-3">
                    <div className="landing-footer__nav-col baves-footer__nav-col nav-column">
                      <h6>Standards</h6>
                      <nav className="landing-footer__nav baves-footer__nav footer-nav">
                        <a href="https://www.iiba.org" target="_blank" rel="noreferrer">IIBA BABOK® v3</a>
                        <a href="#about" onClick={(e) => scrollTo("about", e)}>6 Knowledge Areas</a>
                        <a href="#features" onClick={(e) => scrollTo("features", e)}>BRD Templates</a>
                        <a href="#features" onClick={(e) => scrollTo("features", e)}>User Stories</a>
                        <a href="#features" onClick={(e) => scrollTo("features", e)}>Competency Radar</a>
                      </nav>
                    </div>
                  </div>

                  <div className="col-6 col-lg-3">
                    <div className="landing-footer__nav-col baves-footer__nav-col nav-column">
                      <h6>Team &amp; Mentors</h6>
                      <nav className="landing-footer__nav baves-footer__nav footer-nav">
                        <a href="#contact" onClick={(e) => scrollTo("contact", e)}>Lâm Hữu Khánh Phương</a>
                        <a href="#contact" onClick={(e) => scrollTo("contact", e)}>Lê Vũ Trường</a>
                        <a href="#contact" onClick={(e) => scrollTo("contact", e)}>Trần Văn An (Lead)</a>
                        <a href="#contact" onClick={(e) => scrollTo("contact", e)}>Nguyễn Tấn Thanh Thảo</a>
                        <a href="#contact" onClick={(e) => scrollTo("contact", e)}>Phan Thị Hậu &amp; Lê Vũ Tiến Dũng</a>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-footer__social-section baves-footer__social-section footer-social">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="landing-footer__newsletter baves-footer__newsletter newsletter-section">
                <h5>Stay Updated with BA-VES</h5>
                <p>
                  Receive updates on newly authored domain scenarios, BABOK rubric updates,
                  and academic pilot results.
                </p>
                <form onSubmit={handleSubscribe} className="landing-footer__newsletter-form baves-footer__newsletter-form mt-3 flex max-w-sm gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter academic email"
                    required
                    className="landing-footer__newsletter-input baves-footer__newsletter-input flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="landing-footer__newsletter-btn baves-footer__newsletter-btn rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    {subscribed ? "Enrolled!" : "Subscribe"}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="landing-footer__social baves-footer__social social-section">
                <div className="landing-footer__social-links baves-footer__social-links social-links">
                  <a href="https://www.iiba.org" target="_blank" rel="noreferrer" title="IIBA BABOK" className="landing-footer__social-link baves-footer__social-link social-link">
                    <i className="bi bi-book"></i>
                    <span>IIBA BABOK</span>
                  </a>
                  <a href="mailto:tamkg1102@gmail.com" title="Email" className="landing-footer__social-link baves-footer__social-link social-link">
                    <i className="bi bi-envelope"></i>
                    <span>Email</span>
                  </a>
                  <a href="tel:0911434175" title="Hotline" className="landing-footer__social-link baves-footer__social-link social-link">
                    <i className="bi bi-telephone"></i>
                    <span>Hotline</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-footer__bottom baves-footer__bottom footer-bottom">
        <div className="container">
          <div className="landing-footer__bottom-content baves-footer__bottom-content bottom-content">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="landing-footer__copyright baves-footer__copyright copyright">
                  <p>© 2026 <span className="sitename">BA-VES</span> (Project Code: FA26SE185 • Group: GFA26SE16). All rights reserved.</p>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="landing-footer__legal baves-footer__legal legal-links">
                  <a href="#about" onClick={(e) => scrollTo("about", e)}>BABOK Standards</a>
                  <a href="#contact" onClick={(e) => scrollTo("contact", e)}>Academic Pilot</a>
                  <div className="landing-footer__credits baves-footer__credits credits">
                    BA-VES Academic Simulation Platform • GFA26SE16
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Aliases for compatibility
export { Footer as LandingFooter, Footer as ElevateFooter };

import { useState, useEffect } from "react";
import type { RouteKey } from "../../types/models";

export function Nav({
  navigate,
  activeSection,
}: {
  navigate: (route: RouteKey) => void;
  activeSection: string;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deepDropdownOpen, setDeepDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      id="header"
      className={`landing-header baves-header header d-flex align-items-center fixed-top ${isScrolled ? "landing-header--scrolled baves-header--scrolled scrolled" : ""
        }`}
    >
      <div className="landing-header__container baves-header__container container position-relative d-flex align-items-center justify-content-between">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("hero");
          }}
          className="landing-header__brand baves-header__brand logo d-flex align-items-center me-auto me-xl-0"
        >
          <h1 className="landing-header__logo baves-header__logo sitename">BA-VES</h1>
          <span className="landing-header__badge baves-header__badge ms-2 hidden rounded bg-blue-600/30 px-2 py-0.5 text-[11px] font-semibold text-blue-300 md:inline-block">
            FA26SE185
          </span>
        </a>

        {/* Desktop & Mobile Navigation */}
        <nav
          id="navmenu"
          className={`landing-header__nav baves-header__nav navmenu ${mobileMenuOpen ? "landing-header__nav--mobile-active baves-header__nav--mobile-active mobile-nav-active" : ""
            }`}
          aria-label="Main Navigation"
        >
          <ul className="landing-header__menu baves-header__menu">
            <li className="landing-header__item baves-header__item">
              <a
                href="#hero"
                className={`landing-header__link baves-header__link ${activeSection === "hero" ? "landing-header__link--active baves-header__link--active active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("hero");
                }}
              >
                Home
              </a>
            </li>
            <li className="landing-header__item baves-header__item">
              <a
                href="#about"
                className={`landing-header__link baves-header__link ${activeSection === "about" ? "landing-header__link--active baves-header__link--active active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("about");
                }}
              >
                About
              </a>
            </li>
            <li className="landing-header__item baves-header__item">
              <a
                href="#services"
                className={`landing-header__link baves-header__link ${activeSection === "services" ? "landing-header__link--active baves-header__link--active active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("services");
                }}
              >
                Modules
              </a>
            </li>
            <li className="landing-header__item baves-header__item">
              <a
                href="#features"
                className={`landing-header__link baves-header__link ${activeSection === "features" ? "landing-header__link--active baves-header__link--active active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("features");
                }}
              >
                Features
              </a>
            </li>
            <li className="landing-header__item baves-header__item">
              <a
                href="#portfolio"
                className={`landing-header__link baves-header__link ${activeSection === "portfolio" ? "landing-header__link--active baves-header__link--active active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("portfolio");
                }}
              >
                Domains
              </a>
            </li>
            <li className="landing-header__item baves-header__item">
              <a
                href="#pricing"
                className={`landing-header__link baves-header__link ${activeSection === "pricing" ? "landing-header__link--active baves-header__link--active active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("pricing");
                }}
              >
                Cohorts
              </a>
            </li>
            <li
              className={`landing-header__item baves-header__item landing-header__item--dropdown baves-header__item--dropdown dropdown ${dropdownOpen ? "dropdown-active" : ""
                }`}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => {
                setDropdownOpen(false);
                setDeepDropdownOpen(false);
              }}
            >
              <a
                href="#dropdown"
                className="landing-header__link baves-header__link"
                onClick={(e) => {
                  e.preventDefault();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <span>BABOK Hub</span>{" "}
                <i className="bi bi-chevron-down toggle-dropdown"></i>
              </a>
              <ul
                className="landing-header__dropdown-menu baves-header__dropdown-menu"
                style={{ display: dropdownOpen ? "block" : undefined }}
              >
                <li className="landing-header__dropdown-item baves-header__dropdown-item">
                  <a href="#about" onClick={() => scrollTo("about")}>
                    BABOK Alignment
                  </a>
                </li>
                <li
                  className={`landing-header__dropdown-item baves-header__dropdown-item dropdown ${deepDropdownOpen ? "dropdown-active" : ""
                    }`}
                  onMouseEnter={() => setDeepDropdownOpen(true)}
                  onMouseLeave={() => setDeepDropdownOpen(false)}
                >
                  <a
                    href="#deep-dropdown"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeepDropdownOpen(!deepDropdownOpen);
                    }}
                  >
                    <span>Simulation Domains</span>{" "}
                    <i className="bi bi-chevron-down toggle-dropdown"></i>
                  </a>
                  <ul style={{ display: deepDropdownOpen ? "block" : undefined }}>
                    <li><a href="#portfolio" onClick={() => scrollTo("portfolio")}>Banking &amp; Financial Services</a></li>
                    <li><a href="#portfolio" onClick={() => scrollTo("portfolio")}>Healthcare &amp; Life Sciences</a></li>
                    <li><a href="#portfolio" onClick={() => scrollTo("portfolio")}>Logistics &amp; Supply Chain</a></li>
                    <li><a href="#portfolio" onClick={() => scrollTo("portfolio")}>Education &amp; Academic Systems</a></li>
                  </ul>
                </li>
                <li className="landing-header__dropdown-item baves-header__dropdown-item">
                  <a href="#services" onClick={() => scrollTo("services")}>
                    Multi-Agent Engine
                  </a>
                </li>
                <li className="landing-header__dropdown-item baves-header__dropdown-item">
                  <a href="#services" onClick={() => scrollTo("services")}>
                    Rubric AI Assessment
                  </a>
                </li>
                <li className="landing-header__dropdown-item baves-header__dropdown-item">
                  <a href="#faq" onClick={() => scrollTo("faq")}>
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </li>
            <li className="landing-header__item baves-header__item">
              <a
                href="#contact"
                className={`landing-header__link baves-header__link ${activeSection === "contact" ? "landing-header__link--active baves-header__link--active active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("contact");
                }}
              >
                Contact
              </a>
            </li>
          </ul>

          <i
            className={`landing-header__mobile-toggle baves-header__mobile-toggle mobile-nav-toggle d-xl-none bi ${mobileMenuOpen ? "bi-x" : "bi-list"
              }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          ></i>
        </nav>

        {/* Social Links & App Access */}
        <div className="landing-header__social baves-header__social header-social-links d-flex align-items-center">
          <a
            href="https://www.iiba.org"
            target="_blank"
            rel="noreferrer"
            title="IIBA BABOK Reference"
            className="landing-header__social-link baves-header__social-link twitter"
            aria-label="IIBA"
          >
            <i className="bi bi-book"></i>
          </a>
          <a
            href="mailto:tamkg1102@gmail.com"
            title="Project Contact"
            className="landing-header__social-link baves-header__social-link facebook"
            aria-label="Email"
          >
            <i className="bi bi-envelope"></i>
          </a>
          <a
            href="tel:0911434175"
            title="Hotline"
            className="landing-header__social-link baves-header__social-link instagram"
            aria-label="Phone"
          >
            <i className="bi bi-telephone"></i>
          </a>
          <button
            onClick={() => navigate("login")}
            className="landing-header__cta baves-header__cta ms-3 hidden rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-500 sm:inline-block"
            style={{ textDecoration: "none" }}
          >
            Enter Simulation
          </button>
        </div>
      </div>
    </header>
  );
}

// Aliases for compatibility
export { Nav as Header, Nav as LandingHeader, Nav as ElevateNav };

import { useState, useEffect } from "react";
import type { RouteKey } from "../../types/models";
import "../../styles/landing.css";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { About } from "./About";
import { Services } from "./Services";
import { Features } from "./Features";
import { Testimonials } from "./Testimonials";
import { Portfolio } from "./Portfolio";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { VideoModal } from "./VideoModal";

export function LandingPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const sections = [
        "hero",
        "about",
        "services",
        "features",
        "testimonials",
        "portfolio",
        "pricing",
        "faq",
        "contact",
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="landing-page landing-page-root baves-landing index-page">
      {/* Navigation Header */}
      <Nav navigate={navigate} activeSection={activeSection} />

      {/* Main Content Sections */}
      <main className="landing-page__main baves-landing__main main">
        <Hero
          navigate={navigate}
          onOpenVideoModal={() => setVideoModalOpen(true)}
        />
        <About
          navigate={navigate}
          onOpenVideoModal={() => setVideoModalOpen(true)}
        />
        <Services navigate={navigate} />
        <Features
          navigate={navigate}
          onOpenVideoModal={() => setVideoModalOpen(true)}
        />
        <Testimonials />
        <Portfolio />
        <Pricing navigate={navigate} />
        <Faq />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll Top Button */}
      <a
        href="#top"
        id="scroll-top"
        className={`landing-scroll-top baves-scroll-top scroll-top d-flex align-items-center justify-content-center ${
          showScrollTop ? "active landing-scroll-top--active baves-scroll-top--active" : ""
        }`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <i className="bi bi-arrow-up-short"></i>
      </a>

      {/* Demo Video Lightbox Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </div>
  );
}
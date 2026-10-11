import { useState } from "react";

export function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does BA-VES simulate realistic, consistent stakeholder behavior?",
      a: "In BA-VES, each stakeholder persona is an AI agent configured with distinct business goals, pain points, knowledge boundaries, and hidden information. The backend maintains separate runtime state and isolated memory for each agent, ensuring that stakeholders answer consistently according to their role and never leak confidential information belonging to other departments.",
    },
    {
      q: "How does the Rubric-Driven AI Assessment align with the BABOK framework?",
      a: "Submitted BA Artifacts (BRD, User Stories, Use Cases) are parsed and evaluated against configurable CriterionDefinitions directly mapped to BABOK Knowledge Areas. The system cross-references the learner's document against Scenario Ground Truth and session conversation transcripts, producing criterion-level scores, cited evidence excerpts, and actionable improvement suggestions.",
    },
    {
      q: "Can instructors review and calibrate the automated AI scores?",
      a: "Yes. BA-VES implements an Instructor-in-the-Loop model. Instructors can examine the AI's diagnostic breakdown, read the extracted evidence quotes, and provide Human Scores alongside qualitative feedback. The platform preserves both scores side-by-side without overwriting the original AI assessment.",
    },
    {
      q: "What types of Dynamic Events occur during a simulation?",
      a: "The Dynamic Scenario Event Engine (FE-03) simulates real-world project unpredictability: mid-session scope changes, new regulatory compliance mandates, sudden budget cuts, or stakeholder priority realignments. Events can be triggered automatically by conversation milestones or injected manually by instructors during live lab sessions.",
    },
    {
      q: "What business domains and file formats are supported in the MVP?",
      a: "BA-VES supports four rich enterprise domains: Core Banking & Fintech, Healthcare & EHR, Logistics & Supply Chain, and Higher Education Management. Learners can create deliverables directly or upload documents in DOCX, text-based PDF, and TXT formats.",
    },
  ];

  const toggle = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="landing-faq baves-faq faq section">
      {/* Section Title */}
      <div className="landing-faq__section-title baves-faq__section-title container section-title">
        <h2>Frequently Asked Questions</h2>
        <p>Everything You Need to Know About the BA-VES Simulation Platform</p>
      </div>

      <div className="landing-faq__container baves-faq__container container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="landing-faq__wrapper baves-faq__wrapper faq-wrapper">
              {faqs.map((f, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`landing-faq__item baves-faq__item faq-item ${isActive ? "faq-active landing-faq__item--active" : ""}`}
                  >
                    <div
                      className="landing-faq__header baves-faq__header faq-header"
                      onClick={() => toggle(idx)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="landing-faq__icon baves-faq__icon faq-icon">
                        <i className="bi bi-question-circle"></i>
                      </div>
                      <h4>{f.q}</h4>
                      <div className="landing-faq__toggle baves-faq__toggle faq-toggle">
                        <i className="bi bi-plus"></i>
                        <i className="bi bi-dash"></i>
                      </div>
                    </div>
                    <div className="landing-faq__content baves-faq__content faq-content">
                      <div className="landing-faq__content-inner content-inner">
                        <p>{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Aliases for compatibility
export { Faq as LandingFaq, Faq as ElevateFaq };

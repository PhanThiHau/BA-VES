import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  return (
    <section id="contact" className="landing-contact baves-contact contact section light-background">
      {/* Section Title */}
      <div className="landing-contact__section-title baves-contact__section-title container section-title">
        <h2>Connect With The Team</h2>
        <p>Project Code: FA26SE185 • Group: GFA26SE16 • Capstone Project</p>
      </div>

      <div className="landing-contact__container baves-contact__container container">
        <div className="landing-contact__row baves-contact__row row gy-4">
          <div className="col-lg-5">
            <div className="landing-contact__info-card baves-contact__info-card info-item">
              <div className="landing-contact__info-icon info-icon">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <div className="landing-contact__info-content info-content">
                <h4>Project Information</h4>
                <p>
                  <strong>BA-VES:</strong> AI-Powered Multi-Domain Virtual Enterprise Simulation
                  for Business Analysis Training.
                </p>
                <div className="mt-3 text-sm text-slate-600">
                  <p className="mb-1"><strong>Advisors / Lecturers:</strong> Lâm Hữu Khánh Phương, Lê Vũ Trường</p>
                  <p className="mb-1"><strong>Team Leader:</strong> Trần Văn An</p>
                  <p className="mb-0"><strong>Members:</strong> Nguyễn Tấn Thanh Thảo, Phan Thị Hậu, Lê Vũ Tiến Dũng</p>
                </div>
              </div>
            </div>

            <div className="landing-contact__details contact-details">
              <div className="landing-contact__detail-item detail-item">
                <div className="landing-contact__detail-icon detail-icon">
                  <i className="bi bi-envelope-open"></i>
                </div>
                <div className="landing-contact__detail-content detail-content">
                  <span className="landing-contact__detail-label detail-label">Project Inquiries</span>
                  <span className="landing-contact__detail-value detail-value">
                    <a href="mailto:tamkg1102@gmail.com">tamkg1102@gmail.com</a>
                  </span>
                </div>
              </div>

              <div className="landing-contact__detail-item detail-item">
                <div className="landing-contact__detail-icon detail-icon">
                  <i className="bi bi-telephone-outbound"></i>
                </div>
                <div className="landing-contact__detail-content detail-content">
                  <span className="landing-contact__detail-label detail-label">Direct Contact</span>
                  <span className="landing-contact__detail-value detail-value">
                    <a href="tel:0911434175">0911 434 175</a>
                  </span>
                </div>
              </div>

              <div className="landing-contact__detail-item detail-item">
                <div className="landing-contact__detail-icon detail-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className="landing-contact__detail-content detail-content">
                  <span className="landing-contact__detail-label detail-label">Institution</span>
                  <span className="landing-contact__detail-value detail-value">
                    Capstone Project Group GFA26SE16<br />
                    Semester FA26 • Software Engineering
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="landing-contact__form-wrapper form-wrapper">
              <div className="landing-contact__form-header form-header">
                <h3>Request Academic Pilot or Demo</h3>
              </div>

              <form onSubmit={handleSubmit} className="landing-contact__form baves-contact__form">
                <div className="row">
                  <div className="col-md-6">
                    <div className="landing-contact__form-group form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Trần Văn An"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="landing-contact__form-group form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@university.edu.vn"
                      />
                    </div>
                  </div>
                </div>

                <div className="landing-contact__form-group form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Pilot deployment for Business Analysis Course"
                  />
                </div>

                <div className="landing-contact__form-group form-group">
                  <label htmlFor="projectMessage">Message</label>
                  <textarea
                    name="message"
                    id="projectMessage"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your student cohort size, training objectives, and desired simulation domains..."
                  />
                </div>

                {status === "loading" && (
                  <div className="landing-contact__loading loading" style={{ display: "block" }}>
                    Sending inquiry...
                  </div>
                )}
                {status === "success" && (
                  <div className="landing-contact__sent-message sent-message" style={{ display: "block" }}>
                    Your message has been sent to the BA-VES team. Thank you!
                  </div>
                )}

                <button type="submit" className="landing-contact__submit-btn submit-btn" disabled={status === "loading"}>
                  <span>Send Inquiry</span>
                  <i className="bi bi-arrow-right"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Aliases for compatibility
export { Contact as LandingContact, Contact as ElevateContact };

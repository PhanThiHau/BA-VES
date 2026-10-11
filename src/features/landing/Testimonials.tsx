export function Testimonials() {
  const testimonials = [
    {
      name: "Trần Văn An",
      position: "BA-VES Project Leader",
      photo: "/elevate/img/person/person-m-7.webp",
      text: "Traditional BA courses teach students what elicitation is, but never how to handle a defensive VP of Finance who actively conceals budgetary constraints. BA-VES bridges that critical gap.",
      featured: true,
    },
    {
      name: "Lâm Hữu Khánh Phương",
      position: "Academic Advisor & Lecturer",
      photo: "/elevate/img/person/person-f-7.webp",
      text: "Grading 60 student requirement documents manually used to take weeks. With BA-VES rubric AI assessment and instructor calibration, students receive immediate, evidence-grounded feedback.",
      featured: false,
    },
    {
      name: "Lê Vũ Trường",
      position: "Technical Mentor & Lecturer",
      photo: "/elevate/img/person/person-m-8.webp",
      text: "The dynamic scenario event engine forces students to experience actual change management—handling mid-sprint compliance changes without derailing project requirements.",
      featured: false,
    },
    {
      name: "Nguyễn Tấn Thanh Thảo",
      position: "Senior BA Learner",
      photo: "/elevate/img/person/person-f-8.webp",
      text: "Practicing stakeholder interviews across Banking and Healthcare domains prepared me for real client meetings far better than static case studies ever could.",
      featured: false,
    },
    {
      name: "Phan Thị Hậu",
      position: "Business Analysis Researcher",
      photo: "/elevate/img/person/person-f-9.webp",
      text: "Comparing BA-VES to traditional IIBA self-study: the ability to engage reactive AI agents and defend decisions under changing business conditions accelerates competency acquisition by 3x.",
      featured: true,
    },
    {
      name: "Lê Vũ Tiến Dũng",
      position: "Simulation Engineer",
      photo: "/elevate/img/person/person-m-13.webp",
      text: "Preserving independent memory for each agent guarantees that stakeholder personas remain consistent, authentic, and challenging throughout every interview session.",
      featured: false,
    },
  ];

  return (
    <section id="testimonials" className="landing-testimonials baves-testimonials testimonials section light-background">
      {/* Section Title */}
      <div className="landing-testimonials__section-title baves-testimonials__section-title container section-title">
        <h2>Perspectives &amp; Validation</h2>
        <p>Insights from Mentors, Project Researchers, and Business Analysis Practitioners</p>
      </div>

      <div className="landing-testimonials__container baves-testimonials__container container">
        <div className="landing-testimonials__grid baves-testimonials__grid row testimonial-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div className={`landing-testimonials__card baves-testimonials__card testimonial-card ${t.featured ? "featured" : ""}`}>
                {t.featured && <div className="landing-testimonials__featured-badge featured-badge">Featured</div>}
                <div className="landing-testimonials__rating rating">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <div className="landing-testimonials__text testimonial-text">
                  <p>{t.text}</p>
                </div>
                <div className="landing-testimonials__profile client-profile">
                  <img src={t.photo} alt={t.name} className="landing-testimonials__photo client-photo" />
                  <div className="landing-testimonials__info client-info">
                    <h4>{t.name}</h4>
                    <span className="landing-testimonials__position client-position">{t.position}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Aliases for compatibility
export { Testimonials as LandingTestimonials, Testimonials as ElevateTestimonials };

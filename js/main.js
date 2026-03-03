(function () {
  const data = window.SITE_CONTENT
  if (!data) return

  const state = { activeTag: "All" }

  function setText(id, value) {
    const el = document.getElementById(id)
    if (el) el.textContent = value
  }

  function renderHero() {
    setText("hero-eyebrow", data.hero.eyebrow)
    setText("hero-title", data.hero.title)
    setText("hero-subtitle", data.hero.subtitle)
    setText("hero-card-meta", data.hero.cardMeta)
    setText("hero-card-title", data.hero.cardTitle)
  }

  function renderWhyUs() {
    const list = document.getElementById("why-us-list")
    if (!list) return
    list.innerHTML = data.whyUs.map((item) => `<li>${item}</li>`).join("")
  }

  function renderRoadmap() {
    setText("roadmap-title", data.roadmap.title)
    setText("roadmap-subtitle", data.roadmap.subtitle)

    const steps = document.getElementById("roadmap-steps")
    if (steps) {
      steps.innerHTML = data.roadmap.steps
        .map(
          (step) => `
            <article class="roadmap-step">
              <p class="phase">${step.phase}</p>
              <h3>${step.title}</h3>
              <p>${step.detail}</p>
            </article>
          `
        )
        .join("")
    }

    const trust = document.getElementById("trust-cards")
    if (trust) {
      trust.innerHTML = data.roadmap.trustCards
        .map(
          (card) => `
            <article class="trust-card">
              <p class="label">${card.label}</p>
              <h3>${card.heading}</h3>
              <p>${card.copy}</p>
            </article>
          `
        )
        .join("")
    }
  }

  function getAllTags() {
    const tags = new Set()
    data.projects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)))
    return ["All", ...Array.from(tags)]
  }

  function renderTagFilters() {
    const wrap = document.getElementById("tag-filters")
    if (!wrap) return
    const tags = getAllTags()

    wrap.innerHTML = tags
      .map(
        (tag) => `
          <button
            type="button"
            class="tag-btn ${state.activeTag === tag ? "active" : ""}"
            data-tag="${tag}"
          >${tag}</button>
        `
      )
      .join("")

    wrap.querySelectorAll(".tag-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeTag = btn.getAttribute("data-tag") || "All"
        renderTagFilters()
        renderProjects()
      })
    })
  }

  function filteredProjects() {
    if (state.activeTag === "All") return data.projects
    return data.projects.filter((project) => project.tags.includes(state.activeTag))
  }

  function renderProjects() {
    const grid = document.getElementById("project-grid")
    if (!grid) return

    grid.innerHTML = filteredProjects()
      .map(
        (project) => `
          <article class="project-card">
            <div class="project-preview" style="background:${project.preview};"></div>
            <div class="project-body">
              <p class="project-meta">${project.industry}</p>
              <h3>${project.title}</h3>
              <p class="project-summary">${project.summary}</p>
              <div class="project-bottom">
                <div class="chips">${project.tags
                  .map((tag) => `<span class="chip">${tag}</span>`)
                  .join("")}</div>
                <span class="duration">${project.duration}</span>
              </div>
            </div>
          </article>
        `
      )
      .join("")
  }

  function renderFaq() {
    const wrap = document.getElementById("faq-list")
    if (!wrap) return

    wrap.innerHTML = data.faq
      .map(
        (item, idx) => `
          <details class="faq-item" ${idx === 0 ? "open" : ""}>
            <summary>${item.question}</summary>
            <p>${item.answer}</p>
          </details>
        `
      )
      .join("")
  }

  function setupRevealAnimations() {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"))
    if (!elements.length) return

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    elements.forEach((el) => observer.observe(el))
  }

  function init() {
    renderHero()
    renderWhyUs()
    renderRoadmap()
    renderTagFilters()
    renderProjects()
    renderFaq()
    setupRevealAnimations()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()

(function () {
  const data = window.SITE_CONTENT
  if (!data) return

  const state = { activeTag: "All" }
  let faqTracked = false

  function setText(id, value) {
    const el = document.getElementById(id)
    if (el) el.textContent = value
  }

  function track(eventName, payload) {
    const eventPayload = { event: eventName, ...payload }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(eventPayload)
    }
  }

  function getProjectBySlug(slug) {
    return data.projects.find((project) => project.slug === slug)
  }

  function getAllTags() {
    const tags = new Set()
    data.projects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)))
    return ["All", ...Array.from(tags)]
  }

  function buildProjectCard(project, linkPrefix, options = {}) {
    const compact = Boolean(options.compact)
    return `
      <a
        class="project-card project-card-link ${compact ? "is-compact" : ""}"
        href="${linkPrefix}${project.slug}/"
        data-track="project_click"
        data-project="${project.slug}"
      >
        <div class="project-preview" style="background:${project.preview};">
          <p class="project-poster-line">${project.posterLine || ""}</p>
        </div>
        <div class="project-body">
          <p class="project-meta">${project.industry}</p>
          <h3>${project.title}</h3>
          <p class="project-summary">${project.summary}</p>
          ${
            compact
              ? ""
              : `
                <ul class="project-highlights">
                  ${(project.whatWeDid || [])
                    .slice(0, 2)
                    .map((item) => `<li>${item}</li>`)
                    .join("")}
                </ul>
              `
          }
          <p class="project-outcome"><strong>Outcome:</strong> ${project.outcome || "Production-ready baseline delivered."}</p>
          <div class="project-bottom">
            <div class="chips">
              ${project.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
            </div>
            <span class="project-link">Read case -></span>
          </div>
        </div>
      </a>
    `
  }

  function renderHero() {
    setText("hero-eyebrow", data.hero.eyebrow)
    setText("hero-qualifier", data.hero.qualifier)
    setText("hero-title", data.hero.title)
    setText("hero-subtitle", data.hero.subtitle)
    setText("hero-card-meta", data.hero.cardMeta)
    setText("hero-card-title", data.hero.cardTitle)

    const bulletList = document.getElementById("hero-bullets")
    if (bulletList) {
      bulletList.innerHTML = (data.hero.bullets || []).map((item) => `<li>${item}</li>`).join("")
    }

    const timeline = document.getElementById("hero-timeline")
    if (timeline) {
      timeline.innerHTML = (data.hero.timeline || [])
        .map(
          (item) => `
            <li>
              <span class="hero-time">${item.label}</span>
              <span>${item.text}</span>
            </li>
          `
        )
        .join("")
    }
  }

  function renderSocialProof() {
    setText("proof-title", data.socialProof?.title || "")
    const badges = document.getElementById("proof-badges")
    if (!badges) return
    badges.innerHTML = (data.socialProof?.badges || []).map((badge) => `<span>${badge}</span>`).join("")
  }

  function renderWhyUs() {
    const list = document.getElementById("why-us-list")
    if (!list) return
    list.innerHTML = data.whyUs
      .map(
        (item) => `
          <li>
            <h3>${item.title}</h3>
            <p>${item.detail}</p>
          </li>
        `
      )
      .join("")
  }

  function renderRoadmap() {
    setText("roadmap-title", data.roadmap.title)
    setText("roadmap-subtitle", data.roadmap.subtitle)
    setText("roadmap-collaboration", data.roadmap.collaboration)
    setText("roadmap-stage-note", data.roadmap.stageNote)

    const steps = document.getElementById("roadmap-steps")
    if (steps) {
      steps.innerHTML = data.roadmap.steps
        .map(
          (step) => `
            <article class="roadmap-step">
              <p class="phase">${step.phase}</p>
              <h3>${step.title}</h3>
              <p class="timeline">${step.timeline || ""}</p>
              <p>${step.detail}</p>
              <ul class="mini-list">
                ${(step.deliverables || []).map((item) => `<li>${item}</li>`).join("")}
              </ul>
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

  function renderFaq() {
    const wrap = document.getElementById("faq-list")
    if (!wrap) return

    wrap.innerHTML = data.faq
      .map(
        (item, idx) => `
          <details class="faq-item" ${idx === 0 ? "open" : ""}>
            <summary>${item.question}</summary>
            <ul>
              ${(item.bullets || []).map((point) => `<li>${point}</li>`).join("")}
            </ul>
          </details>
        `
      )
      .join("")

    wrap.querySelectorAll(".faq-item").forEach((el) => {
      el.addEventListener("toggle", () => {
        if (el.open) {
          const question = el.querySelector("summary")?.textContent || "faq"
          track("faq_open", { question })
        }
      })
    })
  }

  function renderProjectGrid(containerId, linkPrefix, filtered, options = {}) {
    const grid = document.getElementById(containerId)
    if (!grid) return

    const list = filtered || data.projects
    grid.innerHTML = list.map((project) => buildProjectCard(project, linkPrefix, options)).join("")
  }

  function renderWorkPage() {
    const grid = document.getElementById("project-grid")
    if (!grid) return

    const linkPrefix = grid.dataset.projectLinkPrefix || "./"
    const filters = document.getElementById("tag-filters")

    if (filters) {
      const tags = getAllTags()
      filters.innerHTML = tags
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

      filters.querySelectorAll(".tag-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeTag = btn.getAttribute("data-tag") || "All"
          track("project_filter", { tag: state.activeTag })
          renderWorkPage()
        })
      })
    }

    const filtered =
      state.activeTag === "All"
        ? data.projects
        : data.projects.filter((project) => project.tags.includes(state.activeTag))
    renderProjectGrid("project-grid", linkPrefix, filtered)
  }

  function renderFeaturedProjects() {
    const grid = document.getElementById("featured-project-grid")
    if (!grid) return
    const linkPrefix = grid.dataset.projectLinkPrefix || "./work/"
    const featured = data.projects.slice(0, 3)
    renderProjectGrid("featured-project-grid", linkPrefix, featured, { compact: true })
  }

  function renderAboutPage() {
    setText("about-title", data.about.title)
    setText("about-copy", data.about.copy)
  }

  function renderProjectPage() {
    const slug = document.body.dataset.projectSlug
    if (!slug) return

    const project = getProjectBySlug(slug)
    if (!project) {
      setText("project-title", "Project not found")
      setText("project-summary", "Please return to the work page and choose a valid project.")
      return
    }

    setText("project-industry", project.industry)
    setText("project-title", project.title)
    setText("project-summary", project.detail)
    setText("project-duration", project.duration)

    const preview = document.getElementById("project-preview")
    if (preview) preview.style.background = project.preview

    const chips = document.getElementById("project-tags")
    if (chips) chips.innerHTML = project.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")

    const deliverables = document.getElementById("project-deliverables")
    if (deliverables) {
      deliverables.innerHTML = project.deliverables.map((item) => `<li>${item}</li>`).join("")
    }

    const related = document.getElementById("related-project-grid")
    if (related) {
      const linkPrefix = related.dataset.projectLinkPrefix || "../"
      const relatedProjects = data.projects.filter((item) => item.slug !== slug).slice(0, 3)
      related.innerHTML = relatedProjects.map((item) => buildProjectCard(item, linkPrefix)).join("")
    }
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

  function setupInteractionTracking() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-track]")
      if (target) {
        const name = target.getAttribute("data-track")
        if (!name) return
        track(name, {
          label: target.textContent?.trim() || "",
          project: target.getAttribute("data-project") || undefined,
          href: target.getAttribute("href") || undefined
        })
        return
      }

      const cta = event.target.closest(".nav-cta, .primary-cta, .footer-cta-link")
      if (cta) {
        track("cta_primary", {
          label: cta.textContent?.trim() || "",
          href: cta.getAttribute("href") || undefined
        })
      }
    })
  }

  function setupScrollTracking() {
    const faq = document.getElementById("faq")
    if (!faq || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !faqTracked) {
            faqTracked = true
            track("faq_seen", { page: document.body.dataset.page || "unknown" })
          }
        })
      },
      { threshold: 0.35 }
    )
    observer.observe(faq)
  }

  function init() {
    renderHero()
    renderSocialProof()
    renderWhyUs()
    renderRoadmap()
    renderFaq()
    renderFeaturedProjects()
    renderWorkPage()
    renderAboutPage()
    renderProjectPage()
    setupRevealAnimations()
    setupInteractionTracking()
    setupScrollTracking()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()

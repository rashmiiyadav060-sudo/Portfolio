/* ==========================================================================
   Portfolio script: vanilla JavaScript only, no dependencies.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTypingEffect();
  initMobileMenu();
  initActiveNav();
  initThemeToggle();
  initContactForm();
  initProjectFilter();
  initBackToTop();
  initRevealOnScroll();
});

/* 1. Typing animation in the hero */
function initTypingEffect() {
  const target = document.getElementById("typed-role");
  if (!target) return;

  const roles = [
    "Computer Science Student",
    "Aspiring Software Developer",
    "AI & Data Science Enthusiast"
  ];
  const typeSpeed = 80;
  const deleteSpeed = 40;
  const pauseAfterWord = 1600;

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIndex];
    target.textContent = current.slice(0, charIndex);

    let delay = deleting ? deleteSpeed : typeSpeed;

    if (!deleting && charIndex === current.length) {
      delay = pauseAfterWord;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    } else {
      charIndex += deleting ? -1 : 1;
    }

    setTimeout(tick, delay);
  }

  tick();
}

/* 2. Responsive mobile navigation */
function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  // Close the menu after picking a link, or when pressing Escape
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

/* 4. Active navigation highlighting (smooth scrolling itself is handled by CSS) */
function initActiveNav() {
  const links = document.querySelectorAll(".main-nav a");
  const sections = document.querySelectorAll("main section[id]");
  if (!links.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isActive);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* 5. Dark / light theme toggle, remembered for the session */
function initThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const root = document.documentElement;

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    button.textContent = theme === "dark" ? "Light" : "Dark";
    button.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };

  applyTheme(root.getAttribute("data-theme") || "dark");

  button.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

/* 6. Contact form validation with success and error feedback */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    name: (value) => {
      if (!value.trim()) return "Please enter your name.";
      if (value.trim().length < 2) return "Name should be at least 2 characters.";
      return "";
    },
    email: (value) => {
      if (!value.trim()) return "Please enter your email address.";
      if (!emailPattern.test(value.trim())) return "Please enter a valid email address.";
      return "";
    },
    subject: (value) => {
      if (!value.trim()) return "Please add a subject.";
      return "";
    },
    message: (value) => {
      if (!value.trim()) return "Please write a message.";
      if (value.trim().length < 10) return "Message should be at least 10 characters.";
      return "";
    }
  };

  const showError = (field, message) => {
    const wrapper = field.closest(".field");
    const errorEl = form.querySelector(`[data-error-for="${field.name}"]`);
    wrapper.classList.toggle("has-error", Boolean(message));
    errorEl.textContent = message;
  };

  const validateField = (field) => {
    const message = rules[field.name] ? rules[field.name](field.value) : "";
    showError(field, message);
    return !message;
  };

  // Validate on blur for quick feedback, and clear errors as the user types
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("has-error")) validateField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = [...form.querySelectorAll("input, textarea")];
    const results = fields.map((field) => validateField(field));

    if (results.every(Boolean)) {
      // No backend is connected, so this only confirms the input is valid.
      status.className = "form-status is-success";
      status.textContent = "Thanks, your message passed validation. Connect a form service to deliver it.";
      form.reset();
    } else {
      status.className = "form-status is-error";
      status.textContent = "Please fix the highlighted fields and try again.";
      const firstInvalid = fields.find((field) => field.closest(".field").classList.contains("has-error"));
      if (firstInvalid) firstInvalid.focus();
    }
  });
}

/* 9. Project filtering by category */
function initProjectFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const projects = document.querySelectorAll(".project");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      projects.forEach((project) => {
        const categories = project.dataset.category.split(" ");
        project.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });
}

/* 7. Back-to-top button */
function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  const toggleVisibility = () => {
    button.classList.toggle("is-visible", window.scrollY > 600);
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* 8. Scroll reveal with Intersection Observer */
function initRevealOnScroll() {
  const targets = document.querySelectorAll(".about-body, .timeline, .skill-group, .project, .contact-intro");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   THE OTHER SIDE — motion layer (GSAP + ScrollTrigger)
   Sections:
     1. Setup & guards
     2. Custom cursor
     3. Magnetic buttons
     4. Hero: split text, lens, cinematic intro
     5. Scroll reveals (lines, stagger, image mask)
     6. Skills marquee tied to scroll
     7. Pinned horizontal projects (desktop only)
     8. Scroll progress & smooth anchor navigation
   ========================================================================== */

(() => {
  "use strict";

  // ---------- 1. Setup & guards ----------
  if (typeof gsap === "undefined") {
    // GSAP failed to load: keep the page readable, skip motion.
    document.documentElement.classList.add("no-motion");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isDesktop = () => window.innerWidth > 900;

  // Helper: split a string into per-character spans (used for the hero name)
  const splitChars = (el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.display = "inline-block";
      span.textContent = ch === " " ? "\u00A0" : ch;
      el.appendChild(span);
    });
    return el.querySelectorAll(".char");
  };

  // ---------- 2. Custom cursor ----------
  const cursor = document.querySelector(".cursor");
  if (cursor && finePointer) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });

    // Grow the cursor over interactive elements
    document.querySelectorAll("a, button, .magnetic").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add(el.dataset.cursor === "explore" ? "is-explore" : "is-hover");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover", "is-explore");
      });
    });
  }

  // ---------- 3. Magnetic buttons ----------
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = el.classList.contains("explore") ? 0.35 : 0.25;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  // ---------- 4. Hero ----------
  // Split the visible layer into letters, then mirror the identical letter
  // structure into the inverse layer so the two line up exactly under the lens.
  const visibleSplits = document.querySelectorAll(".hero-title:not(.inverse) .split");
  const heroChars = [];
  visibleSplits.forEach((el) => heroChars.push(...splitChars(el)));
  document.querySelectorAll(".hero-title.inverse .split").forEach((el, i) => {
    el.innerHTML = visibleSplits[i].innerHTML;
  });
  const inverseChars = document.querySelectorAll(".hero-title.inverse .char");

  // Lens: a circle follows the pointer and reveals the inverse layer beneath
  const stage = document.getElementById("lens");
  const inverse = document.querySelector(".hero-title.inverse");
  if (stage && inverse && finePointer && !reduceMotion) {
    const lensRadius = { value: 0 };
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let lensActive = false;

    stage.addEventListener("mouseenter", () => {
      lensActive = true;
      gsap.to(lensRadius, { value: Math.max(120, window.innerWidth * 0.11), duration: 0.6, ease: "expo.out" });
    });
    stage.addEventListener("mouseleave", () => {
      lensActive = false;
      gsap.to(lensRadius, { value: 0, duration: 0.6, ease: "expo.in" });
    });
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
    });

    // Ease the lens centre toward the pointer each frame
    gsap.ticker.add(() => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      inverse.style.setProperty("--x", pos.x + "px");
      inverse.style.setProperty("--y", pos.y + "px");
      inverse.style.clipPath = `circle(${lensRadius.value}px at ${pos.x}px ${pos.y}px)`;
    });
    void lensActive;
  }

  // Cinematic intro: letters rise and rotate in, a subtle scale-settle on the name
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .from([...heroChars, ...inverseChars], {
      yPercent: 110, rotate: 6, opacity: 0, duration: 1.4, stagger: { each: 0.035, from: "start" },
    })
    .from(".hero-meta > *", { y: 28, opacity: 0, duration: 1, stagger: 0.12 }, "-=0.9")
    .from(".nav", { y: -20, opacity: 0, duration: 0.8 }, "-=0.8")
    .from(".hero-hint", { opacity: 0, duration: 1 }, "-=0.6");

  // Gentle parallax on the hero name as the page scrolls away
  gsap.to(".hero-stage", {
    yPercent: -12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // ---------- 5. Scroll reveals ----------
  // Line reveal: each .line > span rises out of its mask
  gsap.utils.toArray("[data-reveal-lines]").forEach((block) => {
    const lines = block.querySelectorAll(".line > span");
    gsap.from(lines, {
      yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.12,
      scrollTrigger: { trigger: block, start: "top 82%" },
    });
  });

  // Simple fade-rise for labels and single blocks
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // Staggered children (skill cards, contact links)
  gsap.utils.toArray("[data-reveal-stagger]").forEach((list) => {
    gsap.from(list.children, {
      y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.09,
      scrollTrigger: { trigger: list, start: "top 85%" },
    });
  });

  // Image mask: the art panel wipes open from the bottom, then its inner glyph drifts
  gsap.utils.toArray("[data-mask]").forEach((wrap) => {
    gsap.fromTo(wrap,
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut",
        scrollTrigger: { trigger: wrap, start: "top 80%" },
      }
    );
    const art = wrap.querySelector(".mask-art");
    if (art && !reduceMotion) {
      gsap.fromTo(art, { scale: 1.25 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
  });

  // Timeline items draw their own rule line as they enter
  gsap.utils.toArray(".tl-item").forEach((item) => {
    gsap.from(item, {
      borderBottomColor: "rgba(255,90,31,0)", duration: 1.2, ease: "power2.out",
      scrollTrigger: { trigger: item, start: "top 90%" },
    });
  });

  // ---------- 6. Skills marquee tied to scroll ----------
  const marquee = document.querySelector("[data-marquee]");
  if (marquee && !reduceMotion) {
    // Loop across the duplicated set of skills
    const loop = gsap.to(marquee, { xPercent: -50, ease: "none", duration: 28, repeat: -1 });
    // Scroll velocity speeds up / slows the marquee a little
    ScrollTrigger.create({
      trigger: ".skills", start: "top bottom", end: "bottom top",
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 1200, 2.5);
        gsap.to(loop, { timeScale: boost, duration: 0.3, overwrite: true });
      },
    });
  }

  // ---------- 7. Pinned horizontal projects (desktop only) ----------
  const track = document.querySelector("[data-track]");
  const pinSection = document.querySelector(".projects-pin");
  if (track && pinSection && !reduceMotion) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.4);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: ".projects",
          start: "top top",
          end: () => "+=" + distance(),
          pin: pinSection,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      // Cards fade in as they enter the viewport during the horizontal sweep
      gsap.utils.toArray(".card").forEach((card) => {
        gsap.from(card, {
          opacity: 0.15, scale: 0.94, ease: "none",
          scrollTrigger: {
            containerAnimation: tween, trigger: card, start: "left 90%", end: "left 55%", scrub: true,
          },
        });
      });
      return () => { /* ScrollTrigger cleans up on context revert */ };
    });
  }

  // ---------- 8. Scroll progress & smooth anchor navigation ----------
  const progress = document.querySelector(".progress");
  if (progress) {
    gsap.to(progress, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });
  }

  // Smooth scroll for in-page links (respects reduced motion)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // Native smooth scroll; ScrollToPlugin is not loaded, so no GSAP scrollTo here.
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  // Placeholder links: prevent navigation to "#" and make it obvious they need editing
  document.querySelectorAll("[data-placeholder]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      el.textContent = "Add your project link";
    });
  });

  // Refresh layout once everything (fonts, images) has settled
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

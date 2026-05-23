// ============================================================
// Vanilla controller + CDN library integrations
// tsParticles · GSAP ScrollTrigger · Lenis · Typed.js
// ============================================================

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const themeToggle = document.querySelector("[data-theme-toggle]");
const printButton = document.querySelector("[data-print]");
const copyEmailButton = document.querySelector("[data-copy-email]");
const copyStatus = document.querySelector("[data-copy-status]");
const year = document.querySelector("[data-year]");

const storageKey = "portfolio-theme";
const savedTheme = localStorage.getItem(storageKey);
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

root.dataset.theme = savedTheme || (prefersDark ? "dark" : "dark");
if (year) year.textContent = new Date().getFullYear();

// ----------------------------------------------- nav

const closeMenu = () => {
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));

// ----------------------------------------------- theme

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem(storageKey, nextTheme);
});

// ----------------------------------------------- print

printButton?.addEventListener("click", () => window.print());

// ----------------------------------------------- copy email

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.copyEmail;
  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = `✓ ${email} copied`;
  } catch {
    copyStatus.textContent = email;
  }
  window.setTimeout(() => {
    copyStatus.textContent = "";
  }, 2800);
});

// ----------------------------------------------- header scroll state

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

// ----------------------------------------------- active nav (IntersectionObserver)

const sections = [...document.querySelectorAll("main section[id]")];
const navById = new Map(
  [...navLinks].map((link) => [link.getAttribute("href").replace("#", ""), link]),
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.remove("is-active"));
      navById.get(entry.target.id)?.classList.add("is-active");
    });
  },
  { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
);

sections.forEach((section) => sectionObserver.observe(section));

// ============================================================
// CDN library integrations — gracefully skip if a lib failed
// ============================================================

// ----------------------------------------------- Lenis smooth scroll

let lenis = null;
if (typeof Lenis !== "undefined" && !prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

// ----------------------------------------------- GSAP scroll-triggered reveals

const revealEls = document.querySelectorAll(".reveal");

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  revealEls.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      },
    );
  });

  // hero metric counters subtle entrance
  gsap.from(".hero-metrics dt", {
    opacity: 0,
    y: 12,
    duration: 0.8,
    stagger: 0.08,
    delay: 0.3,
    ease: "power2.out",
  });
} else {
  // fallback: simple IntersectionObserver reveal (no motion if reduced)
  const ioReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          ioReveal.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  revealEls.forEach((el) => ioReveal.observe(el));
}

// ----------------------------------------------- tsParticles cyber backdrop

if (typeof tsParticles !== "undefined" && !prefersReducedMotion) {
  tsParticles
    .load({
      id: "tsparticles",
      options: {
        fullScreen: { enable: false },
        background: { color: "transparent" },
        fpsLimit: 60,
        detectRetina: true,
        particles: {
          number: { value: 55, density: { enable: true, area: 900 } },
          color: { value: ["#22d3ee", "#a78bfa", "#67e8f9"] },
          links: {
            enable: true,
            distance: 140,
            color: "#22d3ee",
            opacity: 0.18,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: "none",
            outModes: { default: "out" },
            random: true,
            straight: false,
          },
          opacity: { value: { min: 0.15, max: 0.5 } },
          size: { value: { min: 1, max: 2.4 } },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: { enable: true },
          },
          modes: {
            grab: { distance: 160, links: { opacity: 0.45 } },
          },
        },
      },
    })
    .catch(() => {
      /* swallow — backdrop is decorative */
    });

  // pin the canvas behind everything
  const particlesEl = document.getElementById("tsparticles");
  if (particlesEl) {
    Object.assign(particlesEl.style, {
      position: "fixed",
      inset: "0",
      zIndex: "-1",
      pointerEvents: "none",
    });
  }
}

// ----------------------------------------------- Typed.js hero tagline

const typedTarget = document.querySelector("[data-typed-target]");
if (typedTarget && typeof Typed !== "undefined" && !prefersReducedMotion) {
  typedTarget.textContent = "";
  // eslint-disable-next-line no-new
  new Typed(typedTarget, {
    strings: [
      "Backend engineer · I live in AWS, EKS, Terraform and Redis.",
      "Cloud-native at 50K QPS · Spring Boot / Kafka / EKS.",
      "Weekends: tinkering with LLM workflows on the side.",
    ],
    typeSpeed: 36,
    backSpeed: 18,
    backDelay: 2200,
    startDelay: 400,
    loop: true,
    showCursor: true,
    cursorChar: "▍",
  });
}

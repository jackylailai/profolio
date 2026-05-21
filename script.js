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
const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

root.dataset.theme = savedTheme || (preferredDark ? "dark" : "light");
year.textContent = new Date().getFullYear();

const closeMenu = () => {
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem(storageKey, nextTheme);
});

printButton?.addEventListener("click", () => window.print());

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.copyEmail;

  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = "Email copied.";
  } catch {
    copyStatus.textContent = email;
  }

  window.setTimeout(() => {
    copyStatus.textContent = "";
  }, 2500);
});

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const sections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  {
    rootMargin: "-35% 0px -58% 0px",
    threshold: 0,
  },
);

sections.forEach((section) => sectionObserver.observe(section));

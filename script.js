const menuButton = document.querySelector(".menu-btn");
const topNav = document.querySelector(".top-nav");
const revealItems = document.querySelectorAll(".reveal");
const yearEl = document.getElementById("year");
const pageId = document.body.dataset.page;
const typingTargets = document.querySelectorAll("[data-typing]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (menuButton && topNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = topNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  topNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      topNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

if (pageId) {
  const activeLink = document.querySelector(`[data-nav="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }
}

if (revealItems.length > 0 && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function typeText(target, text, delay = 38) {
  let index = 0;
  target.textContent = "";

  const tick = () => {
    if (index >= text.length) {
      return;
    }

    target.textContent += text[index];
    index += 1;
    window.setTimeout(tick, delay);
  };

  tick();
}

typingTargets.forEach((target) => {
  const text = target.dataset.text || "";

  if (reduceMotion) {
    target.textContent = text;
    return;
  }

  typeText(target, text);
});

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
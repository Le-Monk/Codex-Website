const menuButton = document.querySelector(".menu-btn");
const topNav = document.querySelector(".top-nav");
const revealItems = document.querySelectorAll(".reveal");
const yearEl = document.getElementById("year");

if (menuButton && topNav) {
  menuButton.addEventListener("click", () => {
    topNav.classList.toggle("open");
  });

  topNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      topNav.classList.remove("open");
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => observer.observe(item));

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

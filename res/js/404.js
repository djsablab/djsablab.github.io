console.log(
  "================================\n         Hello there! 👋\n      I was not expecting\n        you to be there\n================================",
);

// Scroll navigation
document.querySelectorAll("[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .getElementById(btn.dataset.target)
      .scrollIntoView({ behavior: "smooth" });
  });
});

// Dark mode toggle
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");
const icon = document.getElementById("themeIcon");

function setTheme(isDark) {
  root.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme === "dark" || (!savedTheme && prefersDark));

// CTA Ripple Effect
document.querySelectorAll(".ripple-btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = button.getBoundingClientRect();
    ripple.style.width =
      ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
    ripple.style.left = `${e.clientX - rect.left - rect.width / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - rect.height / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});
// Return button action
document.getElementById("rt-button").addEventListener("click", () => {
  window.open("https://djsablab.github.io/", "_self");
});

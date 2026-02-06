console.log(
  "================================\n         Hello there! 👋\n================================",
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
  icon.setAttribute("name", isDark ? "sunny-outline" : "moon-outline");
  toggle.setAttribute("aria-pressed", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme === "dark" || (!savedTheme && prefersDark));

toggle.addEventListener("click", () => {
  setTheme(!root.classList.contains("dark"));
});

/* Skills generation */
const skills = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "React",
  "Java",
  "Mobile Development",
  "Android Development",
  "Tailwind CSS",
  "Responsive Design",
];
const skillsContainer = document.getElementById("skills-container");
skills.forEach((skill) => {
  const li = document.createElement("li");
  li.textContent = skill;
  li.className = "chip";
  skillsContainer.appendChild(li);
});

/* Projects generation */
const projectsData = [
  {
    title: "TideTasks",
    description:
      "Tide Tasks is a powerful personal task scheduling application built with React Native with Expo environment.",
    url: "https://github.com/djsablab/TideTasks",
    image: "./res/assets/tidetasks-preview.jpg",
    tech: ["React Native", "Expo", "Firebase", "JS"],
  },
  {
    title: "World Countries Data",
    description:
      "World Countries Data is an HTML; CSS and JavaScript based, semi-responsive website powered with REST Countries API",
    url: "https://github.com/djsablab/WorldCountriesData",
    image: "./res/assets/wcd-preview.png",
    tech: ["HTML", "CSS", "JavaScript", "API", "REST"],
  },
  {
    title: "RN Hotel",
    description:
      "A hotel booking app built with React Native and Firebase, using Expo for development and testing.",
    url: "https://github.com/djsablab/rn-hotel",
    image: "./res/assets/rnhotel-preview.jpg",
    tech: ["React Native", "Firebase", "JS", "Expo"],
  },
];

const projectsContainer = document.getElementById("projects");
projectsData.forEach((proj) => {
  const card = document.createElement("div");
  card.className = "project-card bg-white dark:bg-[#1E1E1E] p-4 flex flex-col items-end rounded-xl shadow-md hover:scale-105 transition-transform";
  card.innerHTML = `
        <img src="${proj.image}" alt="${proj.title}" class="rounded-xl mb-4 w-full h-48 object-contain">
        <h3 class="text-xl font-bold mb-2 w-full text-left">${proj.title}</h3>
        <p class="text-[#616161] dark:text-[#9E9E9E] mb-2 h-full">${proj.description}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          ${proj.tech.map((tech) => `<span class="chip">${tech}</span>`).join("")}
        </div>
        <a href="${proj.url}" target="_blank" class="px-4 py-2 bg-[#b71c1c] text-white rounded-lg hover:scale-105 transition-transform">View Project</a>
      `;
  projectsContainer.appendChild(card);
});

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

document.getElementById("dr-button").addEventListener("click", () => {
  window.open("https://djsablab.github.io/resume", "_blank");
});

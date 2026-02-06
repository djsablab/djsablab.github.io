const OWNER = "djsablab";

/* =========================
   GLOBALS
========================= */

let screenshots = [];
let currentIndex = 0;

/* =========================
   INIT
========================= */

loadApp();
loadStore();

/* =========================
   STORE HOME
========================= */

async function loadStore() {
  const container = document.getElementById("apps");
  if (!container) return;

  container.innerHTML = "Loading apps...";

  try {
    const repos = await fetch(
      `https://api.github.com/users/${OWNER}/repos`,
    ).then((r) => r.json());

    container.innerHTML = "";

    /* ---------- RELATIVE TIME (CACHED + AUTO UPDATE) ---------- */
    const timeCache = new Map();

    function timeAgo(dateString) {
      const seconds = Math.floor(
        (Date.now() - new Date(dateString).valueOf()) / 1000,
      );
      if (seconds < 60) return "just now";

      const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
      ];

      for (const i of intervals) {
        const count = Math.floor(seconds / i.seconds);
        if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
      }
    }

    /* ---------- MAIN RENDER ---------- */
    repos
      .filter((repo) => repo.topics?.includes("djsw-compatible"))
      .forEach((repo) => {
        const card = document.createElement("div");
        card.className =
          "cursor-pointer rounded-2xl border border-white/10 " +
          "bg-gradient-to-b from-white/5 to-white/[0.02] " +
          "p-4 transition hover:-translate-y-1 hover:border-white/20 " +
          "flex flex-col sm:flex-row items-center gap-4";

        /* ---------- ICON ---------- */
        const icon = document.createElement("img");
        icon.src = `https://raw.githubusercontent.com/${OWNER}/${repo.name}/main/store-assets/icon.png`;
        icon.onerror = () => (icon.src = "fallback.png");
        icon.className = "rounded-xl object-cover w-24 h-24 sm:w-32 sm:h-32";

        /* ---------- CONTENT ---------- */
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "flex flex-col flex-1 w-full";

        const header = document.createElement("div");
        header.className = "flex flex-row items-center justify-between";

        const title = document.createElement("div");
        title.textContent = repo.name;
        title.className = "font-semibold text-sm sm:text-md";

        const stars = document.createElement("div");
        stars.textContent = `★ ${(repo.stargazers_count || 0).toLocaleString()}`;
        stars.className = "font-semibold text-sm sm:text-lg text-yellow-400";

        header.append(title, stars);

        const desc = document.createElement("div");
        desc.textContent = repo.description || "";
        desc.className =
          "text-xs sm:text-sm lg:text-base text-zinc-400 mt-1 line-clamp-2";

        /* ---------- META + ACTION BAR ---------- */
        const footer = document.createElement("div");
        footer.className =
          "mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3";

        /* Meta info (left) */
        const meta = document.createElement("div");
        meta.className =
          "flex flex-row items-center gap-2 text-xs text-zinc-400";

        const updated = document.createElement("span");
        updated.innerHTML = `⏱ Updated ${timeAgo(repo.pushed_at)}`;
        meta.appendChild(updated);

        if (repo.fork) {
          const forkBadge = document.createElement("span");
          forkBadge.textContent = "🍴 Forked";
          forkBadge.title = "This repository is forked from another project";
          forkBadge.className =
            "px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 " +
            "border border-purple-400/20 cursor-help";
          meta.appendChild(forkBadge);
        }

        /* Actions (right) */
        const actions = document.createElement("div");
        actions.className = "flex flex-row gap-2 justify-end";

        const viewMoreBtn = document.createElement("button");
        viewMoreBtn.textContent = "View More";
        viewMoreBtn.className =
          "px-4 py-1.5 rounded-full bg-blue-500 text-sm font-medium " +
          "hover:brightness-110 active:scale-95 transition";
        viewMoreBtn.onclick = (e) => {
          e.stopPropagation();
          location.href = `app.html?app=${repo.name}`;
        };

        const githubBtn = document.createElement("button");
        githubBtn.textContent = "GitHub";
        githubBtn.className =
          "px-4 py-1.5 rounded-full text-sm border border-white/10 " +
          "bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition";
        githubBtn.onclick = (e) => {
          e.stopPropagation();
          location.href = `https://github.com/${OWNER}/${repo.name}`;
        };

        actions.append(viewMoreBtn, githubBtn);
        footer.append(meta, actions);

        cardWrapper.append(header, desc, footer);
        card.append(icon, cardWrapper);

        container.appendChild(card);
      });

    if (!container.children.length) {
      container.textContent = "No compatible apps found.";
    }
  } catch {
    container.textContent = "Failed to load apps.";
  }
}

/* =========================
   APP PAGE
========================= */

async function loadApp() {
  const params = new URLSearchParams(location.search);
  const repoName = params.get("app");
  if (!repoName) return;

  const repo = await fetch(
    `https://api.github.com/repos/${OWNER}/${repoName}`,
  ).then((r) => r.json());

  document.title = `${repo.name} - DJ's Workbench`;
  document.getElementById("name").textContent = repo.name;
  document.getElementById("desc").textContent = repo.description || "";
  document.getElementById("icon").src =
    `https://raw.githubusercontent.com/${OWNER}/${repoName}/main/store-assets/icon.png`;

  document.getElementById("view_on_github").onclick = () => {
    location.href = repo.html_url;
  };

  renderStars(repo.stargazers_count || 0);
  loadStoreMeta(repoName);
  await loadScreenshots(repoName);
  initScreenshotArrows();
  initDownloadModal(repoName);
}

/* =========================
   STARS
========================= */

function renderStars(count) {
  document.getElementById("stars").textContent = `★ ${count.toLocaleString()}`;
}

/* =========================
   STORE META
========================= */

async function loadStoreMeta(repo) {
  try {
    const meta = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${repo}/main/store-assets/store.json`,
    ).then((r) => r.json());

    document.getElementById("developer").textContent = meta.developer || OWNER;
  } catch {
    document.getElementById("developer").textContent = OWNER;
  }
}

/* =========================
   SCREENSHOTS
========================= */

async function loadScreenshots(repo) {
  const container = document.getElementById("screenshots");
  if (!container) return;

  screenshots = [];
  container.innerHTML = "";

  const files = await fetch(
    `https://api.github.com/repos/${OWNER}/${repo}/contents/store-assets/screenshots`,
  ).then((r) => r.json());

  if (!Array.isArray(files)) return;

  files.forEach((file, index) => {
    screenshots.push(file.download_url);

    const img = document.createElement("img");
    img.src = file.download_url;
    img.className =
      "rounded-xl snap-start cursor-pointer hover:scale-[1.02] transition " +
      "border border-white/10";

    img.onclick = () => openPreview(index);
    container.appendChild(img);
  });
}

/* =========================
   SCREENSHOT ARROWS
========================= */

function initScreenshotArrows() {
  const container = document.getElementById("screenshots");
  const prev = document.getElementById("ssPrev");
  const next = document.getElementById("ssNext");

  if (!container || !prev || !next) return;

  const scrollAmount = 320;

  prev.onclick = () => {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  next.onclick = () => {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };
}

/* =========================
   IMAGE PREVIEW
========================= */

function openPreview(index) {
  const modal = document.getElementById("previewModal");
  const img = document.getElementById("previewImage");

  currentIndex = index;
  img.src = screenshots[currentIndex];
  modal.classList.remove("hidden");

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}

document.getElementById("prevImg")?.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
  previewImage.src = screenshots[currentIndex];
});

document.getElementById("nextImg")?.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % screenshots.length;
  previewImage.src = screenshots[currentIndex];
});

/* =========================
   DOWNLOAD MODAL
========================= */

function getLatestRelease(releases) {
  return releases.reduce((a, b) =>
    new Date(b.published_at) > new Date(a.published_at) ? b : a,
  );
}

function initDownloadModal(repo) {
  const modal = document.getElementById("downloadModal");
  const list = document.getElementById("releaseList");
  const openBtn = document.getElementById("downloadBtn");
  const closeBtn = document.getElementById("closeModal");
  const title = document.getElementById("mod-title");

  openBtn.onclick = () => {
    modal.classList.remove("hidden");
    list.textContent = "Loading releases...";
    title.textContent = `Download ${repo}`;

    fetch(`https://api.github.com/repos/${OWNER}/${repo}/releases`)
      .then((r) => r.json())
      .then(renderReleases)
      .catch(() => {
        list.textContent = "Failed to load releases.";
      });
  };

  closeBtn.onclick = closeModal;
  modal.onclick = (e) => e.target === modal && closeModal();

  function closeModal() {
    modal.classList.add("hidden");
  }

  function renderReleases(releases) {
    if (!Array.isArray(releases) || !releases.length) {
      list.textContent = "No releases found.";
      return;
    }

    list.innerHTML = "";
    const latest = getLatestRelease(releases);

    releases.forEach((release) => {
      const block = document.createElement("div");
      block.className = "border-b border-white/10 pb-3";

      const version = document.createElement("div");
      version.className =
        "text-sm font-medium " +
        (release.id === latest.id ? "text-green-400" : "text-blue-400");

      version.textContent =
        release.tag_name + (release.id === latest.id ? " ✓ Latest" : "");

      block.appendChild(version);

      release.assets
        .filter((a) => !a.name.startsWith("Source code"))
        .forEach((asset) => {
          const link = document.createElement("a");
          link.href = asset.browser_download_url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = asset.name;

          link.className =
            "mt-2 block rounded-lg bg-zinc-800 px-3 py-2 text-sm " +
            "hover:bg-zinc-700 active:scale-95 transition";

          link.onclick = (e) => e.stopPropagation();
          block.appendChild(link);
        });

      list.appendChild(block);
    });
  }
}

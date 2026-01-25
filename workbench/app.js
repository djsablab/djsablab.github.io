const OWNER = "djsablab";

/* =========================
   INIT
========================= */

loadApp();

/* =========================
   STORE HOME
========================= */

loadStore();

async function loadStore() {
  const container = document.getElementById("apps");
  if (!container) return;

  container.innerHTML = "Loading apps...";

  try {
    const repos = await fetch(
      `https://api.github.com/users/${OWNER}/repos`
    ).then(r => r.json());

    container.innerHTML = "";

    repos
      .filter(repo => repo.topics?.includes("djsw-compatible"))
      .forEach(repo => {
        const card = document.createElement("div");
        card.className =
          "cursor-pointer rounded-2xl border border-white/10 " +
          "bg-gradient-to-b from-white/5 to-white/[0.02] " +
          "p-4 transition hover:-translate-y-1 hover:border-white/20";

        const icon = document.createElement("img");
        icon.src =
          `https://raw.githubusercontent.com/${OWNER}/${repo.name}/main/store-assets/icon.png`;
        icon.onerror = () => {
          icon.src = "fallback.png";
        };
        icon.className = "w-14 h-14 rounded-xl mb-3";

        const title = document.createElement("div");
        title.textContent = repo.name;
        title.className = "font-semibold text-sm";

        const desc = document.createElement("div");
        desc.textContent = repo.description || "";
        desc.className = "text-xs text-zinc-400 mt-1";

        card.append(icon, title, desc);

        card.onclick = () => {
          location.href = `app.html?repo=${repo.name}`;
        };

        container.appendChild(card);
      });

    if (!container.children.length) {
      container.textContent = "No compatible apps found.";
    }

  } catch (err) {
    container.textContent = "Failed to load apps.";
  }
}

/* =========================
   APP PAGE
========================= */

async function loadApp() {
  const params = new URLSearchParams(location.search);
  const repoName = params.get("repo");
  if (!repoName) return;

  const repo = await fetch(
    `https://api.github.com/repos/${OWNER}/${repoName}`
  ).then(r => r.json());

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
  loadScreenshots(repoName);
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
      `https://raw.githubusercontent.com/${OWNER}/${repo}/main/store-assets/store.json`
    ).then(r => r.json());

    document.getElementById("developer").textContent =
      meta.developer || OWNER;
  } catch {
    document.getElementById("developer").textContent = OWNER;
  }
}

/* =========================
   SCREENSHOTS
========================= */

async function loadScreenshots(repo) {
  const container = document.getElementById("screenshots");

  const files = await fetch(
    `https://api.github.com/repos/${OWNER}/${repo}/contents/store-assets/screenshots`
  ).then(r => r.json());

  if (!Array.isArray(files)) return;

  files.forEach(file => {
    const img = document.createElement("img");
    img.src = file.download_url;
    img.className =
      "h-80 rounded-xl snap-start cursor-pointer hover:scale-[1.02] transition w-[100] " +
      "object-cover border border-white/10";

    img.onclick = () => openPreview(img.src);
    container.appendChild(img);
  });
}

/* =========================
   IMAGE PREVIEW
========================= */

function openPreview(src) {
  const modal = document.getElementById("previewModal");
  const img = document.getElementById("previewImage");

  img.src = src;
  modal.classList.remove("hidden");

  modal.onclick = () => modal.classList.add("hidden");
}

/* =========================
   DOWNLOAD MODAL
========================= */

function getLatestRelease(releases) {
  return releases.reduce((a, b) =>
    new Date(b.published_at) > new Date(a.published_at) ? b : a
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
    document.body.classList.add("overflow-hidden");
    list.textContent = "Loading releases...";
    title.textContent = `Download ${repo}`;

    fetch(`https://api.github.com/repos/${OWNER}/${repo}/releases`)
      .then(r => r.json())
      .then(renderReleases)
      .catch(() => {
        list.textContent = "Failed to load releases.";
      });
  };

  closeBtn.onclick = closeModal;
  modal.onclick = (e) => e.target === modal && closeModal();

  function closeModal() {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  function renderReleases(releases) {
    if (!Array.isArray(releases) || !releases.length) {
      list.textContent = "No releases found.";
      return;
    }

    list.innerHTML = "";
    const latest = getLatestRelease(releases);

    releases.forEach(release => {
      const block = document.createElement("div");
      block.className = "border-b border-white/10 pb-3";

      const version = document.createElement("div");
      version.className =
        "text-sm font-medium " +
        (release.id === latest.id
          ? "text-green-400"
          : "text-blue-400");

      version.textContent =
        release.tag_name +
        (release.id === latest.id ? " ✓ Latest" : "");

      block.appendChild(version);

      release.assets
        .filter(a => !a.name.startsWith("Source code"))
        .forEach(asset => {
          const a = document.createElement("a");
          a.href = asset.browser_download_url;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = asset.name;

          a.className =
            "mt-2 block rounded-lg bg-zinc-800 px-3 py-2 text-sm " +
            "hover:bg-zinc-700 active:scale-95 transition";

          block.appendChild(a);
        });

      list.appendChild(block);
    });
  }
}

// ====== CONFIG: pages of your personal site ======
const PAGES = [
  { file: "index.html",       label: "Home" },
  { file: "cv.html",          label: "CV" },
  { file: "publications.html",label: "Publications" },
  { file: "talks.html",       label: "Communications orales" },
  { file: "teaching.html",    label: "Enseignements" }
];

function getCurrentPage() {
  const path = window.location.pathname;
  const last = path.split("/").pop();
  return last === "" ? "index.html" : last;
}

// ====== HIGHLIGHT IN CURRENT PAGE (used on load & after navigation) ======
function highlightInCurrentPage(qLower) {
  const candidates = document.querySelectorAll(
    "main.page-card h2, main.page-card h3, main.page-card p, main.page-card li"
  );
  if (!candidates.length) return false;

  candidates.forEach(el => el.classList.remove("search-hit"));

  let firstHit = null;
  for (const el of candidates) {
    const text = el.textContent.toLowerCase();
    if (text.includes(qLower)) {
      el.classList.add("search-hit");
      if (!firstHit) firstHit = el;
    }
  }

  if (firstHit) {
    firstHit.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }
  return false;
}

// ====== BUILD SNIPPET FROM PLAIN TEXT ======
function buildSnippet(text, idx, queryLength) {
  const radius = 60;
  const start = Math.max(0, idx - radius);
  const end   = Math.min(text.length, idx + queryLength + radius);
  let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "… " + snippet;
  if (end < text.length) snippet = snippet + " …";
  return snippet;
}

// ====== SEARCH ACROSS ALL PAGES, RETURN ALL SUGGESTIONS ======
async function searchEverywhere(queryOriginal) {
  const qLower = queryOriginal.toLowerCase();
  const resultsBox = document.querySelector("#search-results");
  if (!resultsBox) return;

  const current = getCurrentPage();
  resultsBox.innerHTML = "<div style='font-size:0.8rem;color:#777;'>Recherche…</div>";

  const allResults = [];

  for (const page of PAGES) {
    try {
      let text;

      if (page.file === current) {
        // use current document text (no extra fetch)
        text = document.body.innerText;
      } else {
        const res = await fetch(page.file);
        if (!res.ok) continue;
        const html = await res.text();

        // strip HTML tags to get plain text
        text = html.replace(/<script[\s\S]*?<\/script>/gi, "")
                   .replace(/<style[\s\S]*?<\/style>/gi, "")
                   .replace(/<[^>]+>/g, " ");
      }

      const textLower = text.toLowerCase();
      let idx = textLower.indexOf(qLower);
      if (idx === -1) continue;

      // We only take the FIRST hit per page for the suggestions
      const snippet = buildSnippet(text, idx, queryOriginal.length);
      allResults.push({
        page,
        snippet
      });

    } catch (e) {
      // ignore this page if fetch fails
      console.error("Search fetch error for", page.file, e);
    }
  }

  // Display all suggestions
  if (!allResults.length) {
    resultsBox.innerHTML = "<div style='font-size:0.8rem;color:#777;'>Aucun résultat trouvé.</div>";
    return;
  }

  resultsBox.innerHTML = "";
  allResults.forEach(result => {
    const div = document.createElement("div");
    div.className = "search-result";

    const title = document.createElement("div");
    title.className = "search-result-title";
    title.textContent = result.page.label + " (" + result.page.file + ")";

    const snippetEl = document.createElement("div");
    snippetEl.className = "search-result-snippet";
    snippetEl.textContent = result.snippet;

    div.appendChild(title);
    div.appendChild(snippetEl);

    // when clicking a suggestion → go to page + keep query in hash
    div.addEventListener("click", () => {
      const target = result.page.file + "#search=" + encodeURIComponent(queryOriginal);
      window.location.href = target;
    });

    resultsBox.appendChild(div);
  });
}

// ====== INIT (runs on every page) ======
document.addEventListener("DOMContentLoaded", () => {
  // navbar scroll color
  const topbar = document.querySelector(".topbar");
  window.addEventListener("scroll", () => {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  const searchBtn   = document.querySelector(".search-btn");
  const searchPanel = document.querySelector("#page-search-panel");
  const searchInput = document.querySelector("#page-search-input");
  const resultsBox  = document.querySelector("#search-results");

  if (searchBtn && searchPanel && searchInput && resultsBox) {
    // open/close panel
    searchBtn.addEventListener("click", () => {
      searchPanel.classList.toggle("open");
      if (searchPanel.classList.contains("open")) {
        resultsBox.innerHTML = "";
        searchInput.value = "";
        searchInput.focus();
      }
    });

    // when pressing Enter → search everywhere & list ALL suggestions
    searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const q = searchInput.value.trim();
      if (!q) return;
      searchEverywhere(q);
    });
  }

  // When landing with #search=query in URL → highlight in this page
  const hash = window.location.hash;
  if (hash.startsWith("#search=")) {
    const q = decodeURIComponent(hash.slice("#search=".length)).toLowerCase();
    highlightInCurrentPage(q);
  }
});

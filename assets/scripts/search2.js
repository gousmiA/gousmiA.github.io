// =================== CONFIG ===================
const PAGES = [
  { file: "index.html",       label: "Home" },
  { file: "cv.html",          label: "CV" },
  { file: "publications.html",label: "Publications" },
  { file: "talks.html",       label: "Communications orales" },
  { file: "teaching.html",    label: "Enseignements" }
];

// Normalize text: remove accents + unify quotes
function normalize(str) {
  return str
    .normalize("NFD")                   // split accents
    .replace(/[\u0300-\u036f]/g, "")    // remove accents
    .replace(/’/g, "'")                 // typographic apostrophe → '
    .toLowerCase();
}

// Levenshtein distance (typo tolerance)
function levenshtein(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
      );
    }
  }
  return m[b.length][a.length];
}

function isMatch(normalText, normalQuery) {
  if (normalText.includes(normalQuery)) return true;
  if (levenshtein(normalText, normalQuery) <= 1) return true;
  return false;
}

// ====== Exact highlight inside a paragraph ======
function highlightPhrase(el, query) {
  const text = el.innerHTML;
  const qNorm = normalize(query);

  // Find real positions (non-normalized)
  let html = el.innerHTML;
  let plain = normalize(el.innerText);

  const idx = plain.indexOf(qNorm);
  if (idx === -1) return;

  // Extract original substring
  const original = el.innerText.substring(idx, idx + query.length);

  // Replace only the exact part (HTML-safe)
  const regex = new RegExp(original, "i");
  el.innerHTML = el.innerHTML.replace(regex, `<span class="search-hit-word">$&</span>`);
}

function highlightInCurrentPage(query) {
  const qNorm = normalize(query);

  const candidates = document.querySelectorAll(
    "main h1, main h2, main h3, main p, main li"
  );

  let firstHit = null;

  candidates.forEach(el => {
    el.querySelectorAll(".search-hit-word").forEach(e => e.remove());
  });

  for (const el of candidates) {
    const txtNorm = normalize(el.innerText);

    if (isMatch(txtNorm, qNorm)) {
      highlightPhrase(el, query);

      if (!firstHit) firstHit = el;
    }
  }

  if (firstHit) {
    firstHit.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }
  return false;
}

// =================== SNIPPET BUILDER ===================
function buildSnippet(text, idx, qLen) {
  const radius = 60;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + qLen + radius);
  let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "… " + snippet;
  if (end < text.length) snippet = snippet + " …";
  return snippet;
}

// =================== CROSS-PAGE SEARCH ===================
async function searchEverywhere(query) {
  const qNorm = normalize(query);
  const resultsBox = document.querySelector("#search-results");
  const current = getCurrentPage();

  resultsBox.innerHTML = "<div style='font-size:0.8rem;color:#777;'>Recherche…</div>";

  const results = [];

  for (const page of PAGES) {
    try {
      let text;

      if (page.file === current) {
        text = document.body.innerText;
      } else {
        const res = await fetch(page.file);
        if (!res.ok) continue;
        text = res
          .textSync
          ? await res.text()
          : (await res.text());
      }

      const plain = normalize(
        text.replace(/<[^>]+>/g, " ")
      );

      const idx = plain.indexOf(qNorm);
      if (idx === -1) continue;

      const snippet = buildSnippet(text, idx, query.length);
      results.push({ page, snippet });

    } catch (e) {
      console.error("Search fetch error:", page.file);
    }
  }

  if (results.length === 0) {
    resultsBox.innerHTML = `<div>Aucun résultat pour "${query}".</div>`;
    return;
  }

  resultsBox.innerHTML = "";
  results.forEach(result => {
    const box = document.createElement("div");
    box.className = "search-result";

    box.innerHTML = `
      <div class="search-result-title">${result.page.label}</div>
      <div class="search-result-snippet">${result.snippet}</div>
    `;

    box.addEventListener("click", () => {
      window.location.href = result.page.file + "#search=" + encodeURIComponent(query);
    });

    resultsBox.appendChild(box);
  });
}

function getCurrentPage() {
  const p = window.location.pathname.split("/").pop();
  return p === "" ? "index.html" : p;
}

// =================== MAIN INIT ===================
document.addEventListener("DOMContentLoaded", () => {
  // Navbar scroll
  const topbar = document.querySelector(".topbar");
  window.addEventListener("scroll", () => {
    topbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  // Search panel
  const btn = document.querySelector(".search-btn");
  const panel = document.querySelector("#page-search-panel");
  const input = document.querySelector("#page-search-input");
  const results = document.querySelector("#search-results");

  if (btn && panel && input && results) {
    btn.addEventListener("click", () => {
      panel.classList.toggle("open");
      input.value = "";
      results.innerHTML = "";
      if (panel.classList.contains("open")) input.focus();
    });

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        searchEverywhere(input.value.trim());
      }
    });
  }

  // Highlight if arriving with #search
  const hash = window.location.hash;
  if (hash.startsWith("#search=")) {
    const q = decodeURIComponent(hash.slice(8));
    highlightInCurrentPage(q);
  }

  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash;
    if (newHash.startsWith("#search=")) {
      const q = decodeURIComponent(newHash.slice(8));
      highlightInCurrentPage(q);
    }
  });
});

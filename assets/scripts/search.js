// ====== CONFIG: list of pages in your site ======
const PAGES = [
  "index.html",
  "cv.html",
  "publications.html",
  "talks.html",
  "teaching.html"
];

function getCurrentPage() {
  const path = window.location.pathname;
  const last = path.split("/").pop();
  return last === "" ? "index.html" : last;
}

// ====== NAVBAR COLOR ON SCROLL ======
document.addEventListener("DOMContentLoaded", () => {
  const topbar = document.querySelector(".topbar");

  window.addEventListener("scroll", () => {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  const searchBtn   = document.querySelector(".search-btn");
  const searchPanel = document.querySelector("#page-search-panel");
  const searchInput = document.querySelector("#page-search-input");

  if (searchBtn && searchPanel && searchInput) {
    // open / close search panel
    searchBtn.addEventListener("click", () => {
      searchPanel.classList.toggle("open");
      if (searchPanel.classList.contains("open")) {
        searchInput.focus();
      }
    });

    // ENTER = search current page, if not found → other pages
    searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const q = searchInput.value.trim();
      if (!q) return;
      const qLower = q.toLowerCase();

      const foundHere = searchInCurrentPage(qLower);
      if (!foundHere) {
        searchInOtherPages(qLower);
      }
    });
  }

  // If we arrived with a #search=... in the URL, highlight automatically
  const hash = window.location.hash;
  if (hash.startsWith("#search=")) {
    const q = decodeURIComponent(hash.slice("#search=".length)).toLowerCase();
    searchInCurrentPage(q);
  }
});

// ====== IN-PAGE SEARCH (current page) ======
function searchInCurrentPage(qLower) {
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

// ====== CROSS-PAGE SEARCH (other HTML files) ======
async function searchInOtherPages(qLower) {
  const current = getCurrentPage();

  for (const page of PAGES) {
    if (page === current) continue;

    try {
      const res = await fetch(page);
      if (!res.ok) continue;
      const text = (await res.text()).toLowerCase();

      if (text.includes(qLower)) {
        // Found on another page → go there and pass the query in the hash
        window.location.href = page + "#search=" + encodeURIComponent(qLower);
        return;
      }
    } catch (e) {
      // ignore fetch errors (e.g. missing page)
    }
  }

  // Optional: alert if nothing found anywhere
  alert("No result found for: " + qLower);
}

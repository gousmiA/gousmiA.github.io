// NAVBAR COLOR ON SCROLL
const topbar = document.querySelector('.topbar');

window.addEventListener('scroll', () => {
  if (topbar) {
    topbar.classList.toggle('scrolled', window.scrollY > 40);
  }
});

// SEARCH ELEMENTS
const searchBtn   = document.querySelector('.search-btn');
const searchPanel = document.querySelector('#page-search-panel');
const searchInput = document.querySelector('#page-search-input');

if (searchBtn && searchPanel && searchInput) {

  // Open/close search input
  searchBtn.addEventListener('click', () => {
    searchPanel.classList.toggle('open');
    if (searchPanel.classList.contains('open')) {
      searchInput.focus();
    }
  });

  // In-page search + full-site search
  searchInput.addEventListener('keydown', (e) => {
    const q = searchInput.value.trim();
    if (!q) return;

    // SHIFT + ENTER → search whole website via DuckDuckGo
    if (e.key === "Enter" && e.shiftKey) {
      const url = "https://duckduckgo.com/?q=" +
                   encodeURIComponent("site:gousmia.github.io " + q);
      window.open(url, "_blank");
      return;
    }

    // ENTER → search only inside current page
    if (e.key === "Enter") {
      const candidates = document.querySelectorAll(
        'main.page-card h2, main.page-card h3, main.page-card p, main.page-card li'
      );

      // Remove previous highlights
      candidates.forEach(el => el.classList.remove('search-hit'));

      let firstHit = null;
      const qLower = q.toLowerCase();

      // Highlight all hits + scroll to first
      for (const el of candidates) {
        if (el.textContent.toLowerCase().includes(qLower)) {
          el.classList.add('search-hit');
          if (!firstHit) firstHit = el;
        }
      }

      if (firstHit) {
        firstHit.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

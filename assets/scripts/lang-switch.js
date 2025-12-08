/* ============================================================
   Language Switcher – FR <-> EN (folder: Page_en)
   French pages:   /.../index.html, /.../cv.html, ...
   English pages:  /.../Page_en/index.html, /.../Page_en/cv.html, ...
   ============================================================ */

function switchLang() {
  const loc = window.location;
  let path = loc.pathname; // e.g. /gousmia.github.io/index.html or /gousmia.github.io/Page_en/index.html

  // split path into segments
  let segments = path.split("/"); // ["", "gousmia.github.io", "index.html"]

  // get file name
  let file = segments.pop();
  if (!file) {
    // URL ended with a slash, assume index.html
    file = "index.html";
  }

  const isEnglish = segments.includes("Page_en");

  let newSegments;

  if (isEnglish) {
    // We are in /.../Page_en/xxx  --> go back to /.../xxx
    newSegments = segments.filter(seg => seg !== "Page_en");
  } else {
    // We are in FR  --> insert Page_en before the file
    newSegments = segments.concat("Page_en");
  }

  // rebuild base path
  let base = newSegments.join("/");
  if (!base.startsWith("/")) {
    base = "/" + base;
  }
  if (!base.endsWith("/")) {
    base += "/";
  }

  const newPath = base + file;

  // keep query string and hash if any
  loc.href = newPath + loc.search + loc.hash;
}

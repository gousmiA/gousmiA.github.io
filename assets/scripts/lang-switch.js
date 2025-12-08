/* ============================================================
   Language Switcher – Independent JS File
   Switch between French page (page.html)
   and its English version (page_en.html)
   ============================================================ */

function switchLang() {
  const loc = window.location;
  let path = loc.pathname;

  // Extract file name (or assume index.html)
  let file = path.split("/").pop();
  if (!file || file === "") {
    file = "index.html";
    path = path + (path.endsWith("/") ? "" : "/") + file;
  }

  let newFile;

  // Case 1 : english version → go back to french
  if (file.endsWith("_en.html")) {
    newFile = file.replace("_en.html", ".html");
  }

  // Case 2 : french version → go to english version
  else if (file.endsWith(".html")) {
    newFile = file.replace(".html", "_en.html");
  }

  // Fallback
  else {
    newFile = "index_en.html";
  }

  const newPath = path.replace(file, newFile);

  // Redirect, keeping URL parameters + anchors (if any)
  loc.href = newPath + loc.search + loc.hash;
}

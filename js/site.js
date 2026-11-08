/* ==========================================================
   Menu and footer for EVERY page.

   >>> TO ADD A PAGE TO THE MENU: copy one line in the list below,
   >>> change the title (what people see) and the href (the file name).
   ========================================================== */
(function () {
  var PAGES = [
    { title: "Home",        href: "index.html" },
    { title: "MeadowGuard", href: "meadowguard.html" },
    { title: "Our Team",    href: "team.html" }
    // Add your page here. Remember the comma at the end of the line above it.
    // Example:  { title: "Research", href: "research.html" }
  ];

  var here = location.pathname.split("/").pop() || "index.html";

  var header = document.getElementById("site-header");
  if (header) {
    var links = PAGES.map(function (p) {
      var current = p.href === here ? ' aria-current="page"' : "";
      return '<a href="' + p.href + '"' + current + ">" + p.title + "</a>";
    }).join("");
    header.outerHTML =
      '<header class="wrap site-header">' +
      '<a class="brand" href="index.html" aria-label="Protect The Meadows home">' +
      '<span class="c-green">Protect</span><span class="c-blue">The</span><span class="c-orange">Meadows</span></a>' +
      '<nav class="site-nav" aria-label="Main">' + links + "</nav></header>";
  }

  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.outerHTML =
      '<footer class="site-footer"><div class="wrap">' +
      "<p><strong>Built by NovaBots</strong>, a FIRST LEGO League team, for the BioGlow 2026–27 season. " +
      "Our project, MeadowGuard, uses a camera and an Arduino to light up a warning sign and play a friendly reminder when someone steps off the trail.</p>" +
      "<p>protectthemeadows.org</p></div></footer>";
  }

  // Only when you open the site on your own computer: show how many yellow TODO spots are left.
  var local = location.protocol === "file:" || /^(localhost|127\.|\[::1\])/.test(location.hostname);
  var todos = document.querySelectorAll(".todo").length;
  if (local && todos) {
    var b = document.createElement("div");
    b.className = "todo-badge";
    b.textContent = todos + (todos === 1 ? " yellow spot" : " yellow spots") + " to fill in";
    document.body.appendChild(b);
  }
})();

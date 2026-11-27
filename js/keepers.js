/* The "I'll stay on the trail" button and the meadow keeper count.
   Only a random ID is sent: no names, addresses or locations.
   Open the home page with ?test=1 to try it without changing the real count. */
(function () {
  var SHOW_FROM = 10; // smaller totals are not shown yet
  var KEY = "meadow-keeper-v1";
  var button = document.getElementById("pledge");
  if (!button) return;
  var title = document.getElementById("thx-h"), line = document.getElementById("keepers");
  var endpoint = (window.SURVEY_ENDPOINT || "").trim();
  var isTest = /[?&]test=1\b/.test(location.search);
  var key = isTest ? KEY + "-test" : KEY;
  var me = null;
  try { me = JSON.parse(localStorage.getItem(key)); } catch (e) {}
  if (!me || !me.id) me = null;

  function keep() { try { localStorage.setItem(key, JSON.stringify(me)); } catch (e) {} }

  function show(count) {
    if (!line || typeof count !== "number" || count < SHOW_FROM) return;
    var n = count.toLocaleString("en-US");
    line.textContent = me && me.saved ? "You are one of " + n + " meadow keepers" : "Join " + n + " meadow keepers";
    line.hidden = false;
  }

  function pledged() {
    button.setAttribute("aria-pressed", "true");
    button.classList.add("done");
    button.textContent = "You are a meadow keeper";
    if (title) title.textContent = "Thank you, meadow keeper";
  }

  function ask(options) {
    return fetch(endpoint, options)
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok || typeof j.keepers !== "number") throw new Error("no count"); return j.keepers; });
  }

  // If saving fails, nothing breaks: it is tried again on the next visit.
  function save() {
    ask({ method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "pledge", id: me.id, test: isTest }), keepalive: true })
      .then(function (count) { me.saved = true; keep(); show(count); })
      .catch(function () {});
  }

  button.addEventListener("click", function () {
    if (me) return; // one pledge for each browser
    me = { id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10), saved: false };
    keep();
    pledged();
    if (endpoint) save();
  });

  if (me) pledged();
  if (!endpoint) return;
  if (me && !me.saved) save();
  else ask().then(show).catch(function () {});
})();

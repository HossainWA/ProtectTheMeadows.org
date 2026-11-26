/* Visitor survey: before questions, the meadow, after questions.
   Open survey.html?test=1 to try it: those answers are marked as tests and left out of the totals. */
(function () {
  // The same wording before and after, so the two sets of answers can be compared fairly.
  var QUESTIONS = [
    { short: "Staying on the trail",
      text: "When visiting a National Park, how likely are you to stay on designated trails rather than walk through the meadows?" },
    { short: "Photos and shortcuts",
      text: "If you wanted to take a closer photograph of wildflowers or take a shortcut, how likely would you be to stay on the designated trail?" },
    { short: "A light or sound reminder",
      text: "If a system detected that you had stepped off the trail and provided a gentle light or sound alert, how likely would that reminder encourage you to return to the trail?",
      // Shown on the last page, so visitors can picture the kind of system we mean.
      afterImage: { src: "images/mg-prototype.jpg", alt: "A trail sign with a red warning light and a camera on top" } }
  ];
  var SCALE = ["Very unlikely", "Unlikely", "Not sure", "Likely", "Very likely"];
  var VERSION = 2, KEY = "meadow-survey-v1";
  var endpoint = (window.SURVEY_ENDPOINT || "").trim();
  var isTest = /[?&]test=1\b/.test(location.search);

  function $(id) { return document.getElementById(id); }
  function newId() { return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10); }
  function fresh() { return { id: newId(), step: "welcome", before: null, after: null, saved: false }; }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.id && s.step && s.test === isTest) return s;
    } catch (e) {}
    return fresh();
  }
  function keep() {
    state.test = isTest;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  var state = load();

  function build(phase) {
    var box = document.querySelector("#form-" + phase + " .questions");
    box.innerHTML = QUESTIONS.map(function (q, i) {
      var name = phase + (i + 1);
      var pic = phase === "after" ? q.afterImage : null;
      var ask = '<span>Question ' + (i + 1) + " of 3</span> " + q.text;
      if (pic) ask = '<i class="ask">' + ask + '</i><img src="' + pic.src + '" alt="' + pic.alt + '">';
      return '<fieldset class="q" data-name="' + name + '"><legend' + (pic ? ' class="with-pic"' : "") + ">" + ask +
        '</legend><div class="scale">' + SCALE.map(function (label, n) {
          return '<label><input type="radio" name="' + name + '" value="' + (n + 1) + '"><span><b>' + (n + 1) + "</b>" + label + "</span></label>";
        }).join("") + "</div></fieldset>";
    }).join("");
  }

  function read(phase) {
    var form = $("form-" + phase), out = [], missing = null;
    QUESTIONS.forEach(function (q, i) {
      var name = phase + (i + 1), hit = form.querySelector('input[name="' + name + '"]:checked');
      var set = form.querySelector('[data-name="' + name + '"]');
      set.classList.toggle("missing", !hit);
      if (hit) out.push(Number(hit.value)); else if (!missing) missing = set;
    });
    form.querySelector(".warn-text").hidden = !missing;
    if (missing) {
      missing.scrollIntoView({ block: "center" });
      missing.querySelector("input").focus({ preventScroll: true });
      return null;
    }
    return out;
  }

  function send(stage) {
    var data = { id: state.id, stage: stage, before: state.before, after: state.after,
      test: isTest, version: VERSION };
    // text/plain keeps this a "simple" request, which Google Apps Script accepts from other websites.
    return fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data), keepalive: true })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error("not saved"); });
  }

  function sendFinal() {
    var note = $("save-state"), retry = $("retry"), id = state.id;
    retry.hidden = true;
    if (!endpoint) { note.textContent = "You finished the practice run. Nothing was saved."; return; }
    if (state.saved) { note.textContent = "Your answers are saved. You helped our research."; return; }
    note.textContent = "Saving your answers...";
    send("complete").then(function () {
      if (state.id !== id) return;
      state.saved = true; keep();
      note.textContent = "Your answers are saved. You helped our research.";
    }).catch(function () {
      if (state.id !== id) return;
      note.textContent = "Your answers did not save. Check your internet connection and try again.";
      retry.hidden = false;
    });
  }

  function showResults() {
    $("results").innerHTML = '<h3>Your answers</h3><div class="cards">' + QUESTIONS.map(function (q, i) {
      var b = state.before[i], a = state.after[i];
      var change = a > b ? "More likely than before" : a < b ? "Less likely than before" : "Same as before";
      return '<div class="card"><b>' + q.short + '</b><div class="pair">' +
        "<div><small>First</small><strong>" + b + "</strong><em>" + SCALE[b - 1] + "</em></div>" +
        '<i aria-hidden="true">&rarr;</i>' +
        "<div><small>Now</small><strong>" + a + "</strong><em>" + SCALE[a - 1] + "</em></div></div><p>" + change + "</p></div>";
    }).join("") + "</div>";
  }

  function show(step, moved) {
    state.step = step; keep();
    var current;
    Array.prototype.forEach.call(document.querySelectorAll("[data-step]"), function (s) {
      s.hidden = s.getAttribute("data-step") !== step;
      if (!s.hidden) current = s;
    });
    var at = { before: 0, learn: 1, after: 2, done: 3 }[step];
    $("progress").hidden = at === undefined;
    Array.prototype.forEach.call($("progress").children, function (li, i) {
      li.className = i < at ? "done" : i === at ? "now" : "";
      if (i === at) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    if (step === "done") { showResults(); sendFinal(); }
    if (moved) {
      scrollTo(0, 0);
      var h = current.querySelector("h1,h2"); if (h) h.focus({ preventScroll: true });
    }
  }

  build("before"); build("after");
  $("practice").hidden = !!endpoint;

  $("start").addEventListener("click", function () { show("before", true); });
  $("form-before").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = read("before"); if (!v) return;
    state.before = v;
    // Saved now too, so the team can see how many people stop partway.
    if (endpoint) send("before").catch(function () {});
    show("learn", true);
  });
  $("to-after").addEventListener("click", function () { show("after", true); });
  $("form-after").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = read("after"); if (!v) return;
    state.after = v; state.saved = false;
    show("done", true);
  });
  document.addEventListener("change", function (e) {
    var set = e.target.closest && e.target.closest(".q.missing");
    if (set) set.classList.remove("missing");
  });
  $("retry").addEventListener("click", sendFinal);
  $("again").addEventListener("click", function () {
    state = fresh(); $("form-before").reset(); $("form-after").reset();
    var reset = $("reset"); if (reset) reset.click();
    show("welcome", true);
  });
  $("share-survey").addEventListener("click", function () {
    var b = this, url = "https://www.protectthemeadows.org/survey.html";
    function done() { b.textContent = "Copied. Pass it on."; }
    function manual() { b.textContent = url; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, manual); else manual();
  });

  // If the page was closed partway, carry on from the same step.
  if ((state.step === "learn" || state.step === "after" || state.step === "done") && !state.before) state = fresh();
  if (state.step === "done" && !state.after) state = fresh();
  show(state.step, false);
})();

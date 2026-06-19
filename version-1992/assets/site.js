(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setUpMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function setUpHeroSlider() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setUpCardFiltering() {
    var input = document.querySelector("[data-card-filter]");
    var grid = document.querySelector("[data-card-grid]");
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var text = card.textContent.toLowerCase();
        card.style.display = !value || title.indexOf(value) !== -1 || text.indexOf(value) !== -1 ? "" : "none";
      });
    });
  }

  function setUpSorting() {
    var select = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");
    if (!select || !grid) {
      return;
    }
    var original = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    select.addEventListener("change", function () {
      var value = select.value;
      var cards = original.slice();
      if (value === "views") {
        cards.sort(function (a, b) {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });
      } else if (value === "year") {
        cards.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else if (value === "title") {
        cards.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      } else {
        cards.sort(function (a, b) {
          return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function searchCard(movie) {
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHtml(movie.file) + "\" title=\"" + escapeHtml(movie.title) + "\">" +
      "<figure class=\"card-cover\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\">" +
      "<span class=\"play-icon\">▶</span>" +
      "</figure>" +
      "<div class=\"card-body\">" +
      "<h2>" + escapeHtml(movie.title) + "</h2>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.category) + "</span></div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function setUpSearchPage() {
    var page = document.querySelector("[data-search-page]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-input]");
    if (!page || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    var list = window.SEARCH_MOVIES;
    if (query) {
      var lower = query.toLowerCase();
      list = list.filter(function (movie) {
        return [movie.title, movie.oneLine, movie.genre, movie.tags, movie.region, movie.year, movie.category].join(" ").toLowerCase().indexOf(lower) !== -1;
      });
      if (title) {
        title.textContent = "搜索结果：" + query;
      }
    } else {
      list = list.slice(0, 40);
      if (title) {
        title.textContent = "精选影片";
      }
    }
    results.innerHTML = list.slice(0, 120).map(searchCard).join("");
  }

  ready(function () {
    setUpMobileMenu();
    setUpHeroSlider();
    setUpCardFiltering();
    setUpSorting();
    setUpSearchPage();
  });
})();

function initStaticPlayer(videoId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay || !sourceUrl) {
    return;
  }
  var hls = null;
  var attached = false;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    attachSource();
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

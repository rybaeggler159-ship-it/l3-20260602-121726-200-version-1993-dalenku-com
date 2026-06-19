(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      showSlide(0);
      startTimer();
    }

    var filterScope = document.querySelector("[data-filter-scope]");
    if (filterScope) {
      var cards = Array.prototype.slice.call(filterScope.querySelectorAll("[data-filter-card]"));
      var keywordInput = document.querySelector("[data-filter-keyword]");
      var typeSelect = document.querySelector("[data-filter-type]");
      var regionSelect = document.querySelector("[data-filter-region]");
      var emptyState = document.querySelector("[data-empty-state]");
      var form = document.querySelector("[data-filter-form]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (keywordInput && initialQuery) {
        keywordInput.value = initialQuery;
      }

      function applyFilter() {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchType = !type || cardType === type;
          var matchRegion = !region || cardRegion === region;
          var show = matchKeyword && matchType && matchRegion;

          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          applyFilter();
        });
      }

      [keywordInput, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var prepared = false;
      var hlsInstance = null;

      function prepare() {
        if (!video || prepared) {
          return;
        }

        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        prepared = true;
      }

      function playVideo() {
        if (!video) {
          return;
        }

        prepare();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
          box.classList.remove("is-playing");
        });

        video.addEventListener("ended", function () {
          box.classList.remove("is-playing");
          if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
            hlsInstance.stopLoad();
          }
        });
      }
    });
  });
})();

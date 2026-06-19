(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cardList = document.querySelector('[data-card-list]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function applySearch() {
    if (!searchInput || !cards.length) {
      return;
    }
    var query = searchInput.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('hidden-card', query && haystack.indexOf(query) === -1);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  var clearButton = document.querySelector('[data-filter-clear]');
  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }

  function sortCards(mode) {
    if (!cardList || !cards.length) {
      return;
    }
    var sorted = cards.slice().sort(function (a, b) {
      var av = Number(a.getAttribute(mode === 'year' ? 'data-year' : 'data-hot')) || 0;
      var bv = Number(b.getAttribute(mode === 'year' ? 'data-year' : 'data-hot')) || 0;
      return bv - av;
    });
    sorted.forEach(function (card) {
      cardList.appendChild(card);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-sort]')).forEach(function (button) {
    button.addEventListener('click', function () {
      sortCards(button.getAttribute('data-filter-sort'));
    });
  });

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setStatus(panel, message) {
    var status = panel ? panel.querySelector('[data-player-status]') : null;
    if (status) {
      status.textContent = message;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-play-button]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var video = document.getElementById(button.getAttribute('data-target'));
      var src = button.getAttribute('data-video-src');
      var panel = button.closest('[data-player-panel]');

      if (!video || !src) {
        setStatus(panel, '播放源连接失败');
        return;
      }

      button.classList.add('is-hidden');
      setStatus(panel, '正在连接高清播放源');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().then(function () {
          setStatus(panel, '正在播放');
        }).catch(function () {
          setStatus(panel, '点击视频区域继续播放');
        });
        return;
      }

      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setStatus(panel, '正在播放');
            }).catch(function () {
              setStatus(panel, '点击视频区域继续播放');
            });
          });
          hls.on(Hls.Events.ERROR, function () {
            setStatus(panel, '播放源正在重新连接');
          });
        } else {
          video.src = src;
          video.play().catch(function () {
            setStatus(panel, '当前浏览器需要支持 HLS 播放');
          });
        }
      }).catch(function () {
        video.src = src;
        video.play().catch(function () {
          setStatus(panel, '播放源连接失败，请稍后重试');
        });
      });
    });
  });
})();

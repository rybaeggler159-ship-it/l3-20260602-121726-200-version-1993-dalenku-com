(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var setSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var search = document.querySelector('[data-search-input]');

  if (search) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    search.addEventListener('input', function () {
      var value = search.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-genre') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', value && haystack.indexOf(value) === -1);
      });
    });
  }

  var playButton = document.querySelector('.player-cover');
  var video = document.getElementById('videoPlayer');

  if (playButton && video) {
    var playbackUrl = playButton.getAttribute('data-play');
    var hlsInstance = null;
    var ready = false;

    var prepare = function () {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playbackUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playbackUrl;
      }
    };

    var start = function () {
      prepare();
      playButton.classList.add('is-hidden');
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    };

    playButton.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();

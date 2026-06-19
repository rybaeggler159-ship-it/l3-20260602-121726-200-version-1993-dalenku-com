(function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === current);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var list = scope.parentElement.querySelector('[data-card-list]');
            if (!list) {
                return;
            }

            var input = scope.querySelector('[data-search-input]');
            var region = scope.querySelector('[data-filter-region]');
            var year = scope.querySelector('[data-filter-year]');
            var count = scope.querySelector('[data-result-count]');
            var cards = Array.prototype.slice.call(list.children);

            function apply() {
                var query = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
                    var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                    var show = matchQuery && matchRegion && matchYear;

                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部';
                }
            }

            [input, region, year].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var keyword = params.get('q');
            if (keyword && input) {
                input.value = keyword;
            }

            apply();
        });
    }

    window.initPlayer = function (source) {
        var video = document.querySelector('.movie-video');
        var trigger = document.querySelector('[data-play-trigger]');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', '1');
        }

        function play() {
            attach();
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.getAttribute('data-ready') !== '1') {
                play();
            }
        });

        video.addEventListener('play', attach);
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    setupHero();
    setupFilters();
})();

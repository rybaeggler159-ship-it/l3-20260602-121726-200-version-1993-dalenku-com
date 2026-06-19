document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll('[data-card-grid]').forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.children);
        var root = grid.closest('section') || document;
        var input = root.querySelector('[data-filter-input]') || document.querySelector('[data-filter-input]');
        var sortSelect = root.querySelector('[data-sort-select]') || document.querySelector('[data-sort-select]');
        var yearButtons = Array.prototype.slice.call(root.querySelectorAll('[data-year-filter]'));
        var activeYear = 'all';

        function applyFilters() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var sortValue = sortSelect ? sortSelect.value : 'year';
            var sortedCards = cards.slice().sort(function (a, b) {
                if (sortValue === 'heat') {
                    return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
                }
                if (sortValue === 'rating') {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });

            sortedCards.forEach(function (card) {
                var haystack = [
                    card.dataset.title || '',
                    card.dataset.tags || '',
                    card.dataset.region || ''
                ].join(' ').toLowerCase();
                var yearMatches = activeYear === 'all' || String(card.dataset.year) === activeYear;
                var queryMatches = !query || haystack.indexOf(query) !== -1;
                card.style.display = yearMatches && queryMatches ? '' : 'none';
                grid.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilters);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.dataset.yearFilter || 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilters();
            });
        });

        applyFilters();
    });
});

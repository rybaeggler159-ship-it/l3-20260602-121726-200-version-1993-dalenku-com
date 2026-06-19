document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-video-player]');
    var playButton = document.querySelector('[data-play-button]');

    if (!video) {
        return;
    }

    var source = video.dataset.videoSrc || video.currentSrc || video.getAttribute('src');
    var shell = video.closest('.player-shell');
    var initialized = false;

    function initializePlayer() {
        if (initialized || !source) {
            return;
        }

        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function playVideo() {
        initializePlayer();
        if (shell) {
            shell.classList.add('is-playing');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (shell) {
                    shell.classList.remove('is-playing');
                }
            });
        }
    }

    if (playButton) {
        playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (shell) {
            shell.classList.add('is-playing');
        }
    });

    video.addEventListener('pause', function () {
        if (shell && video.currentTime === 0) {
            shell.classList.remove('is-playing');
        }
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    initializePlayer();
});

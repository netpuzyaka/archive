// === SlivArchive Category Page Script ===

(function () {
    'use strict';

    // ===== PROTECTION =====
    // Block right-click
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('video, img')) {
            e.preventDefault();
            showToast('Защита контента | Копирование запрещено');
        }
    });

    // Block keyboard shortcuts for saving/source
    document.addEventListener('keydown', function (e) {
        if (!e.ctrlKey) return;
        const keys = ['s', 'u', 'p', 'd'];
        if (keys.includes(e.key.toLowerCase())) {
            e.preventDefault();
            showToast('Защита контента | Действие заблокировано');
        }
    });

    // Block drag & drop
    document.addEventListener('dragstart', function (e) {
        if (e.target.closest('video, img')) e.preventDefault();
    });

    // ===== TOAST =====
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas fa-shield-halved"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2500);
        }, 10);
    }
    window.showToast = showToast;

    // ===== CATEGORY CONFIG =====
    // Defined in the HTML page as window.CATEGORY_CONFIG
    let config = window.CATEGORY_CONFIG || { title: 'Категория', description: '', icon: 'fa-folder', videos: [] };

    if (typeof config.videos === 'undefined') config.videos = [];

    // ===== POPULATE CATEGORY =====
    function populateCategory() {
        try {
            document.getElementById('categoryTitle').textContent = config.title;
            const desc = document.getElementById('categoryDescription');
            if (desc) desc.textContent = config.description || 'Контент категории';
            const navName = document.getElementById('navCategoryName');
            if (navName) navName.textContent = config.title;
            const iconBox = document.getElementById('categoryIcon');
            if (iconBox) iconBox.innerHTML = `<i class="fas ${config.icon || 'fa-folder'}"></i>`;
            document.title = `SlivArchive — ${config.title}`;
        } catch (err) {
            console.error('populateCategory error:', err);
        }
        renderVideos();
    }

    // ===== RENDER VIDEOS (inline player) =====
    function renderVideos() {
        const grid = document.getElementById('videosGrid');
        const noVideos = document.getElementById('noVideos');
        const badge = document.getElementById('videoCountBadge');

        if (badge) badge.textContent = `${config.videos.length} видео`;

        if (config.videos.length === 0) {
            grid.style.display = 'none';
            noVideos.style.display = 'flex';
            return;
        }

        grid.style.display = 'grid';
        noVideos.style.display = 'none';

        grid.innerHTML = config.videos.map((video, index) => `
            <div class="video-card" data-index="${index}" style="animation-delay: ${index * 0.1}s">
                <div class="video-player-wrap-inline">
                    <video
                        controls
                        playsinline
                        preload="metadata"
                        controlslist="nodownload noplaybackrate noremoteplayback"
                        disablepictureinpicture
                        data-title="${(video.title || '').replace(/"/g, '&quot;')}"
                    >
                        <source src="${video.src}" type="video/mp4">
                    </video>
                    <div class="video-watermark-inline">${config.title.toUpperCase()}</div>
                </div>
                <div class="video-card-info">
                    <div class="video-card-title">${video.title}</div>
                    <div class="video-card-meta">
                        <span><i class="fas fa-calendar"></i> ${video.date || '—'}</span>
                        <span><i class="fas fa-shield-halved"></i> Защищено</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Protection for each inline player
        grid.querySelectorAll('video').forEach(player => {
            player.addEventListener('contextmenu', e => e.preventDefault());
            player.addEventListener('dragstart', e => e.preventDefault());
            player.addEventListener('play', () => {
                // Pause all others when one starts
                grid.querySelectorAll('video').forEach(other => {
                    if (other !== player && !other.paused) other.pause();
                });
                showVideoWatermark(player);
            });
        });
    }

    // ===== WATERMARK FADE =====
    function showVideoWatermark(video) {
        const wrap = video.closest('.video-player-wrap-inline');
        if (!wrap) return;
        const wm = wrap.querySelector('.video-watermark-inline');
        if (!wm) return;
        wm.classList.remove('on');
        requestAnimationFrame(() => wm.classList.add('on'));
        clearTimeout(wm._t);
        wm._t = setTimeout(() => wm.classList.remove('on'), 1800);
    }

    // ===== IFRAME EMBED BLOCKER =====
    if (window.top !== window.self) {
        window.top.location = window.location;
    }

    // ===== DOM PROTECTION =====
    const observer = new MutationObserver(function () {
        document.querySelectorAll('video').forEach(v => {
            if (!v.hasAttribute('controlslist')) {
                v.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', function () {
        populateCategory();
    });

    // Expose for debugging / reuse
    window.SlivArchiveCategory = { config, renderVideos };
})();
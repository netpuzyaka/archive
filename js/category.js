// === SlivArchive Category Page Script ===

(function () {
    'use strict';

    // ===== PROTECTION =====
    // Block right-click
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('video, img, .video-card')) {
            e.preventDefault();
            showToast('Защита контента | Копирование запрещено');
        }
    });

    // Block keyboard shortcuts for saving/source
    document.addEventListener('keydown', function (e) {
        if (!e.ctrlKey) return;
        const keys = ['s', 'u', 'c', 'p', 'd'];
        if (keys.includes(e.key.toLowerCase())) {
            e.preventDefault();
            if (e.key.toLowerCase() === 'c') return;
            showToast('Защита контента | Действие заблокировано');
        }
    });

    // Block drag & drop
    document.addEventListener('dragstart', function (e) {
        if (e.target.closest('video, img')) e.preventDefault();
    });

    // Device orientation protection
    const ACCEPTED_ORIENTATIONS = null;
    window.addEventListener('deviceorientation', function () {
        // Rotation-based protection (mobile screenshot defense)
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
    // This data is defined in the HTML page and injected here
    const config = window.CATEGORY_CONFIG || { title: 'Категория', description: '', icon: 'fa-folder', videos: [] };

    // ===== POPULATE CATEGORY =====
    function populateCategory() {
        // Set category info
        document.getElementById('categoryTitle').textContent = config.title;
        document.getElementById('categoryDescription').textContent = config.description || 'Контент категории';
        document.getElementById('navCategoryName').textContent = config.title;
        document.getElementById('categoryIcon').innerHTML = `<i class="fas ${config.icon}"></i>`;

        // Document title
        document.title = `SlivArchive — ${config.title}`;

        // Render videos
        renderVideos();
    }

    // ===== RENDER VIDEOS =====
    function renderVideos() {
        const grid = document.getElementById('videosGrid');
        const noVideos = document.getElementById('noVideos');
        const badge = document.getElementById('videoCountBadge');

        badge.textContent = `${config.videos.length} видео`;

        if (!config.videos || config.videos.length === 0) {
            grid.style.display = 'none';
            noVideos.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noVideos.style.display = 'none';

        grid.innerHTML = config.videos.map((video, index) => `
            <div class="video-card" data-index="${index}" id="videoCard-${index}" style="animation-delay: ${index * 0.1}s">
                <div class="video-thumb">
                    <div class="video-play-badge"><i class="fas fa-play"></i></div>
                    <div class="video-thumb-icon"><i class="fas fa-film"></i></div>
                    <div class="protection-banner"><i class="fas fa-lock"></i> Защищено</div>
                </div>
                <div class="video-card-info">
                    <div class="video-card-title">${video.title}</div>
                    <div class="video-card-meta">
                        <span><i class="fas fa-calendar"></i> ${video.date || '—'}</span>
                        <span><i class="fas fa-shield-halved"></i> Приватно</span>
                    </div>
                    <div class="video-card-open">
                        <span>Смотреть <i class="fas fa-arrow-up-right"></i></span>
                    </div>
                </div>
            </div>
        `).join('');

        // 3D hover effect
        grid.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateY = (x - centerX) / centerX * 6;
                const rotateX = -(y - centerY) / centerY * 6;
                this.style.transform = `translateY(-8px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
            card.addEventListener('click', function () {
                openVideo(parseInt(this.dataset.index));
            });
        });
    }

    // ===== OPEN VIDEO =====
    function openVideo(index) {
        const video = config.videos[index];
        if (!video) return;

        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        const title = document.getElementById('videoModalTitle');
        const watermark = document.getElementById('videoWatermark');

        // Watermark with title
        watermark.textContent = config.title.toUpperCase();

        title.textContent = video.title;
        player.src = video.src;
        player.poster = video.poster || '';

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Autoplay attempt
        player.play().catch(() => {});

        // Video protection events
        if (player.dataset.protected !== 'true') {
            player.dataset.protected = 'true';
            player.addEventListener('contextmenu', e => e.preventDefault());
            player.addEventListener('dragstart', e => e.preventDefault());
        }
    }

    // ===== CLOSE VIDEO =====
    function closeVideo() {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        player.pause();
        player.removeAttribute('src');
        player.load();
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // ===== IFRAME EMBED BLOCKER =====
    // Prevents site from being embedded in iframes
    if (window.top !== window.self) {
        window.top.location = window.location;
    }

    // ===== DOM PROTECTION =====
    const observer = new MutationObserver(function (mutations) {
        // Re-apply protections dynamically
        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
            if (!v.hasAttribute('controlslist')) {
                v.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', function () {
        populateCategory();
        document.getElementById('closeVideoModal').addEventListener('click', closeVideo);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeVideo();
        });
        document.getElementById('videoModal').addEventListener('click', function (e) {
            if (e.target === this) closeVideo();
        });
    });
})();
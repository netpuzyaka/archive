// === SlivArchive Core Script ===

(function () {
    'use strict';

    // ===== DATA =====
    // Categories data - add new categories here
    let CATEGORIES = [
        {
            id: 'pantera-kazan',
            title: 'Пантера Казань',
            icon: 'fa-cat',
            description: 'Эксклюзивный контент из Казани. Три видеозаписи.',
            videoCount: 3,
            url: 'categories/pantera-kazan.html'
        },
        {
            id: 'podyezd-voronezh',
            title: 'Подъезд Воронеж',
            icon: 'fa-building',
            description: 'Эксклюзивный контент из Воронежа.',
            videoCount: 1,
            url: 'categories/podyezd-voronezh.html'
        },
        {
            id: 'sobaka',
            title: 'Собака',
            icon: 'fa-paw',
            description: 'Два ракурса одной съёмки — передний и задний.',
            videoCount: 2,
            url: 'categories/sobaka.html'
        }
    ];

    // ===== STATE =====
    let currentFilter = 'all';

    // ===== PROTECTION =====
    // Block right-click on video/media
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('video, img, .category-card')) {
            e.preventDefault();
            showToast('Защита контента | Копирование запрещено');
        }
    });

    // Block download shortcuts
    document.addEventListener('keydown', function (e) {
        if (!e.ctrlKey) return;
        const keys = ['s', 'u', 'c', 'p', 'd'];
        if (keys.includes(e.key.toLowerCase())) {
            e.preventDefault();
            if (e.key.toLowerCase() === 'c') return;
            showToast('Защита контента | Действие заблокировано');
        }
    });

    // Avoid drag GIF
    window.addEventListener('selectstart', function (e) {
        if (e.target.closest('video, img')) e.preventDefault();
    });

    // ===== PARTICLE SYSTEM =====
    function initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        const count = window.innerWidth < 768 ? 15 : 30;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (8 + Math.random() * 12) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.background = i % 3 === 0 ? '#ff3b5c' : '#7000ff';
            container.appendChild(particle);
        }
    }

    // ===== 3D CARD MOUSE EFFECT =====
    function addCard3D() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateY = (x - centerX) / centerX * 8;
                const rotateX = -(y - centerY) / centerY * 8;
                this.style.transform = `translateY(-8px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.02)`;
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
        });
    }

    // ===== RENDER CATEGORIES =====
    function renderCategories(filter) {
        const grid = document.getElementById('categoriesGrid');
        const noResults = document.getElementById('noResults');
        if (!grid) return;

        let filtered;
        if (filter === 'all') {
            filtered = CATEGORIES;
        } else if (CATEGORIES.some(c => c.id === filter)) {
            filtered = CATEGORIES.filter(c => c.id === filter);
        } else {
            const q = filter.toLowerCase();
            filtered = CATEGORIES.filter(c =>
                c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
            );
        }

        grid.innerHTML = filtered.map((cat, index) => `
            <div class="category-card" data-id="${cat.id}" style="animation-delay: ${index * 0.08}s">
                <div class="card-top">
                    <span class="card-number">#${String(index + 1).padStart(2, '0')}</span>
                    <div class="card-icon"><i class="fas ${cat.icon}"></i></div>
                </div>
                <h3 class="card-title">${cat.title}</h3>
                <p class="card-desc">${cat.description}</p>
                <div class="card-meta">
                    <span><i class="fas fa-video"></i> ${cat.videoCount} видеозаписей</span>
                    <span><i class="fas fa-lock"></i> Приватно</span>
                </div>
                <div class="card-arrow"><i class="fas fa-arrow-right"></i></div>
            </div>
        `).join('');

        noResults.style.display = filtered.length === 0 ? 'block' : 'none';

        // Handle card clicks and 3D effect
        grid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function () {
                const cat = CATEGORIES.find(c => c.id === this.dataset.id);
                if (cat) {
                    showLoading();
                    setTimeout(() => {
                        window.location.href = cat.url;
                    }, 400);
                }
            });
        });

        addCard3D();
        updateStats(filtered.length);
    }

    // ===== UPDATE STATS =====
    function updateStats(categoryCount) {
        const catCount = document.getElementById('categoryCount');
        if (catCount) catCount.textContent = CATEGORIES.length;

        const vidCount = document.getElementById('videoCount');
        if (vidCount) vidCount.textContent = CATEGORIES.reduce((s, c) => s + (c.videoCount || 0), 0);
    }

    // ===== FILTER =====
    function initFilters() {
        // Build filter buttons dynamically from categories
        const filterBtns = document.querySelector('.filter-buttons');
        if (filterBtns) {
            const allBtn = `<button class="filter-btn active" data-filter="all">Все</button>`;
            const catBtns = CATEGORIES.map(cat =>
                `<button class="filter-btn" data-filter="${cat.id}">${cat.title}</button>`
            ).join('');
            filterBtns.innerHTML = allBtn + catBtns;

            filterBtns.addEventListener('click', function (e) {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                renderCategories(currentFilter);
            });
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                const v = this.value.trim();
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                const allBtn = document.querySelector('[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
                currentFilter = 'all';
                renderCategories(v);
            });
        }
    }

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

    // ===== AGE VERIFICATION =====
    function initAgeVerification() {
        const ageModal = document.getElementById('ageModal');
        const agreementModal = document.getElementById('agreementModal');
        const blockedPage = document.getElementById('blockedPage');
        const mainSite = document.getElementById('mainSite');
        const agreeCheck = document.getElementById('agreeCheck');
        const agreeAccept = document.getElementById('agreeAccept');

        // If already verified and agreed
        const verified = sessionStorage.getItem('slivarchive_verified');

        if (verified === 'true') {
            ageModal.style.display = 'none';
            agreementModal.style.display = 'none';
            mainSite.classList.remove('hidden');
            return;
        }

        document.getElementById('ageAccept').addEventListener('click', function () {
            ageModal.style.display = 'none';
            agreementModal.style.display = 'flex';
        });

        document.getElementById('ageReject').addEventListener('click', function () {
            ageModal.style.display = 'none';
            blockedPage.style.display = 'flex';
        });

        document.getElementById('agreeReject').addEventListener('click', function () {
            agreementModal.style.display = 'none';
            blockedPage.style.display = 'flex';
        });

        agreeCheck.addEventListener('change', function () {
            agreeAccept.disabled = !this.checked;
            if (this.checked) {
                agreeAccept.style.background = 'var(--gradient-primary)';
                agreeAccept.style.opacity = '1';
                agreeAccept.style.cursor = 'pointer';
            }
        });

        agreeAccept.addEventListener('click', function () {
            if (!agreeCheck.checked) {
                showToast('Пожалуйста, примите пользовательское соглашение!');
                return;
            }
            sessionStorage.setItem('slivarchive_verified', 'true');
            agreementModal.style.display = 'none';
            mainSite.classList.remove('hidden');
            showToast('Добро пожаловать в SlivArchive!');
        });

        document.getElementById('agreementLink').addEventListener('click', function (e) {
            e.preventDefault();
            agreementModal.style.display = 'flex';
            agreementModal.querySelector('.btn-danger').style.display = 'none';
        });
    }

    // ===== LOADING OVERLAY =====
    function showLoading() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Загрузка...</span>
        `;
        document.body.appendChild(overlay);
    }

    // ===== 3D TILT HERO =====
    function initHero3D() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const title = document.querySelector('.hero-title');
        if (!title) return;

        hero.addEventListener('mousemove', function (e) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const x = (e.clientX / width - 0.5) * 20;
            const y = (e.clientY / height - 0.5) * 20;
            title.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
        });

        hero.addEventListener('mouseleave', function () {
            title.style.transform = 'rotateY(0) rotateX(0)';
        });
    }

    // ===== INIT =====
    function init() {
        initParticles();
        initAgeVerification();
        initFilters();
        initHero3D();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
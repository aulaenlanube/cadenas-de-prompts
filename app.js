document.addEventListener('DOMContentLoaded', () => {
    const dashboardView = document.getElementById('dashboardView');
    const appDetailsView = document.getElementById('appDetailsView');
    const cardsGrid = document.getElementById('cardsGrid');
    const backBtn = document.getElementById('backBtn');
    const progressBar = document.getElementById('progressBar');

    const detailTitle = document.getElementById('detailTitle');
    const detailDescription = document.getElementById('detailDescription');
    const detailLink = document.getElementById('detailLink');
    const promptCount = document.getElementById('promptCount');
    const promptsContainer = document.getElementById('promptsContainer');

    function renderCards() {
        cardsGrid.innerHTML = '';
        window.appDataList.forEach((app, index) => {
            const card = document.createElement('div');
            card.className = 'app-card glass-panel';
            // Simple staggered entrance
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <div class="app-card-icon">
                    <i data-lucide="${app.icon}" color="${app.iconColor}"></i>
                </div>
                <h3>${app.title}</h3>
                <p>${app.description}</p>
                <div class="app-card-footer">
                    <span>${app.prompts.length} Prompts</span>
                    <i data-lucide="sparkles" style="width:18px;height:18px;"></i>
                </div>
            `;
            
            card.addEventListener('click', () => {
                showAppDetails(app.id);
            });
            
            cardsGrid.appendChild(card);
        });
        lucide.createIcons();
    }

    function showAppDetails(appId) {
        const app = window.appDataList.find(a => a.id === appId);
        if(!app) return;

        dashboardView.classList.remove('active-view');
        appDetailsView.classList.add('active-view');

        window.scrollTo(0, 0);
        updateProgressBar();

        detailTitle.textContent = app.title;
        detailDescription.textContent = app.description;
        detailLink.href = app.url;
        promptCount.textContent = app.prompts.length;

        promptsContainer.innerHTML = '';

        if (app.prompts.length === 0) {
            promptsContainer.innerHTML = `
                <div class="empty-state glass-panel">
                    <p>Todavía no se han añadido prompts a esta aplicación.</p>
                </div>
            `;
            return;
        }

        // Add the glowing line background
        const lineBg = document.createElement('div');
        lineBg.className = 'prompts-line';
        const lineFill = document.createElement('div');
        lineFill.className = 'prompts-line-fill';
        lineFill.id = 'promptsLineFill';
        lineBg.appendChild(lineFill);
        promptsContainer.appendChild(lineBg);

        app.prompts.forEach((prompt) => {
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';
            
            promptItem.innerHTML = `
                <div class="prompt-number">${prompt.id}</div>
                <div class="prompt-content glass-panel">
                    <h4>Prompt ${prompt.id}</h4>
                    <div class="prompt-text-block">${prompt.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                </div>
            `;
            promptsContainer.appendChild(promptItem);
        });
        
        lucide.createIcons();
        setupScrollReveal();
    }

    // Scroll Progress & Reveal Logic
    function updateProgressBar() {
        if (!appDetailsView.classList.contains('active-view')) {
            progressBar.style.width = '0%';
            return;
        }
        
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';

        // Update the glowing timeline line fill as well
        const lineFill = document.getElementById('promptsLineFill');
        if (lineFill) {
            const containerBox = promptsContainer.getBoundingClientRect();
            // Calculate how far we are down the container
            const startRevealOffset = window.innerHeight * 0.6; // when line should start moving
            let fillPct = 0;
            if (containerBox.top < startRevealOffset) {
                fillPct = Math.min(100, Math.max(0, ((startRevealOffset - containerBox.top) / containerBox.height) * 100));
            }
            lineFill.style.height = fillPct + '%';
        }
    }

    function setupScrollReveal() {
        const items = document.querySelectorAll('.prompt-item');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -15% 0px', // trigger when 15% from bottom
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.classList.add('is-active');
                } else {
                    // Slight diming when scrolling past if wanted, but keeping it visible is usually better
                    entry.target.classList.remove('is-active');
                }
            });
        }, observerOptions);

        items.forEach(item => {
            observer.observe(item);
            // Check immediately on load if visible
            const rect = item.getBoundingClientRect();
            if(rect.top < window.innerHeight) {
                item.classList.add('is-visible');
                item.classList.add('is-active');
            }
        });
    }

    window.addEventListener('scroll', updateProgressBar);

    backBtn.addEventListener('click', () => {
        appDetailsView.classList.remove('active-view');
        dashboardView.classList.add('active-view');
        progressBar.style.width = '0%';
        window.scrollTo(0, 0);
    });

    // Run first initialization
    renderCards();
});

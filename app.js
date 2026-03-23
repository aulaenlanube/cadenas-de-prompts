document.addEventListener('DOMContentLoaded', () => {
    const dashboardView = document.getElementById('dashboardView');
    const appDetailsView = document.getElementById('appDetailsView');
    const cardsGrid = document.getElementById('cardsGrid');
    const backBtn = document.getElementById('backBtn');
    const progressBar = document.getElementById('progressBar');

    const promptNavigator = document.getElementById('promptNavigator');
    const prevPromptBtn = document.getElementById('prevPromptBtn');
    const nextPromptBtn = document.getElementById('nextPromptBtn');
    const currentPromptIndicator = document.querySelector('#currentPromptIndicator span');
    
    let currentAppTotalPrompts = 0;
    let activePromptIndex = 0;

    const detailTitle = document.getElementById('detailTitle');
    const detailDescription = document.getElementById('detailDescription');
    const detailLink = document.getElementById('detailLink');
    const promptCount = document.getElementById('promptCount');
    const promptsContainer = document.getElementById('promptsContainer');

    // Cross-fade spatial transition
    function triggerViewTransition(fromView, toView, direction) {
        document.body.style.overflow = 'hidden'; 
        fromView.style.animation = direction === 'forward' ? 
            'slideExitLeft 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 
            'slideExitRight 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        
        // Wait just before exit completes to bring next view
        setTimeout(() => {
            fromView.classList.remove('active-view');
            fromView.style.animation = ''; // clean up
            
            toView.classList.add('active-view');
            toView.style.animation = direction === 'forward' ? 
                'slideEnterRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 
                'slideEnterLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
            window.scrollTo({ top: 0, behavior: 'instant' });
            
            setTimeout(() => {
                document.body.style.overflow = '';
                toView.style.animation = '';
            }, 400);

        }, 340);
    }

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

        triggerViewTransition(dashboardView, appDetailsView, 'forward');

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

        currentAppTotalPrompts = app.prompts.length;
        if (currentAppTotalPrompts > 0) {
            promptNavigator.classList.add('visible');
        } else {
            promptNavigator.classList.remove('visible');
        }
        updateNavigator();
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

        // Scroll to top button visibility
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (winScroll > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

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

    const TARGET_OFFSET = 150; // pixels from top of viewport to align targets

    function updateNavigator() {
        if (currentAppTotalPrompts === 0) return;
        
        const prompts = document.querySelectorAll('.prompt-item');
        if (prompts.length === 0) return;

        let closestIdx = 0;
        let foundIntersect = false;
        let minDistance = Infinity;

        prompts.forEach((prompt, idx) => {
            const rect = prompt.getBoundingClientRect();
            
            // If the element crosses the strict target line
            if (rect.top <= TARGET_OFFSET && rect.bottom > TARGET_OFFSET) {
                closestIdx = idx;
                foundIntersect = true;
            } else if (!foundIntersect) {
                // Find closest top edge to our TARGET_OFFSET line
                const distance = Math.abs(rect.top - TARGET_OFFSET);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIdx = idx;
                }
            }
        });

        activePromptIndex = closestIdx;
        currentPromptIndicator.textContent = `${activePromptIndex + 1} / ${currentAppTotalPrompts}`;

        prevPromptBtn.disabled = activePromptIndex === 0;
        nextPromptBtn.disabled = activePromptIndex === currentAppTotalPrompts - 1;
    }

    prevPromptBtn.addEventListener('click', () => {
        if (activePromptIndex > 0) {
            const prompts = document.querySelectorAll('.prompt-item');
            const target = prompts[activePromptIndex - 1];
            const y = target.getBoundingClientRect().top + window.scrollY - TARGET_OFFSET;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });

    nextPromptBtn.addEventListener('click', () => {
        if (activePromptIndex < currentAppTotalPrompts - 1) {
            const prompts = document.querySelectorAll('.prompt-item');
            const target = prompts[activePromptIndex + 1];
            const y = target.getBoundingClientRect().top + window.scrollY - TARGET_OFFSET;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });

    window.addEventListener('scroll', () => {
        updateProgressBar();
        if(appDetailsView.classList.contains('active-view')) {
            updateNavigator();
        }
    });

    // Theme Toggle Logic
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');

    lightThemeBtn.addEventListener('click', () => {
        document.body.classList.add('light-theme');
        lightThemeBtn.classList.add('active');
        darkThemeBtn.classList.remove('active');
    });

    darkThemeBtn.addEventListener('click', () => {
        document.body.classList.remove('light-theme');
        darkThemeBtn.classList.add('active');
        lightThemeBtn.classList.remove('active');
    });

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    backBtn.addEventListener('click', () => {
        promptNavigator.classList.remove('visible');
        progressBar.style.width = '0%';
        triggerViewTransition(appDetailsView, dashboardView, 'back');
    });

    // Run first initialization
    renderCards();
});

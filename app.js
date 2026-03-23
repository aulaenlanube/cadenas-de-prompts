document.addEventListener('DOMContentLoaded', () => {
    const dashboardView = document.getElementById('dashboardView');
    const appDetailsView = document.getElementById('appDetailsView');
    const cardsGrid = document.getElementById('cardsGrid');
    const backBtn = document.getElementById('backBtn');

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
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <div class="app-card-icon">
                    <i data-lucide="${app.icon}" color="${app.iconColor}"></i>
                </div>
                <h3>${app.title}</h3>
                <p>${app.description}</p>
                <div class="app-card-footer">
                    <span>${app.prompts.length} Prompts</span>
                    <i data-lucide="sparkles" style="width:16px;height:16px;"></i>
                </div>
            `;
            
            card.addEventListener('click', () => {
                showAppDetails(app.id);
            });
            
            cardsGrid.appendChild(card);
        });
        // Re-process icons using Lucide
        lucide.createIcons();
    }

    function showAppDetails(appId) {
        const app = window.appDataList.find(a => a.id === appId);
        if(!app) return;

        dashboardView.classList.remove('active-view');
        appDetailsView.classList.add('active-view');

        window.scrollTo(0, 0);

        detailTitle.textContent = app.title;
        detailDescription.textContent = app.description;
        detailLink.href = app.url;
        promptCount.textContent = app.prompts.length;

        promptsContainer.innerHTML = '';

        if (app.prompts.length === 0) {
            promptsContainer.innerHTML = `
                <div class="empty-state glass-panel" style="margin-top:2rem">
                    <p>Todavía no se han añadido prompts a esta aplicación.</p>
                </div>
            `;
            return;
        }

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
    }

    backBtn.addEventListener('click', () => {
        appDetailsView.classList.remove('active-view');
        dashboardView.classList.add('active-view');
        window.scrollTo(0, 0);
    });

    // Run first initialization
    renderCards();
});

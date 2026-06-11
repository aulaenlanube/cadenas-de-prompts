document.addEventListener('DOMContentLoaded', () => {
    const dashboardView = document.getElementById('dashboardView');
    const appDetailsView = document.getElementById('appDetailsView');
    const infografiasView = document.getElementById('infografiasView');
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
        setActiveNav('dashboardView');

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

        const esc = (str) => String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        app.prompts.forEach((prompt) => {
            // Session events (compactions, pauses) render as a divider
            // between prompts, outside the numbered timeline items.
            if (prompt.sessionBreak) {
                const breakItem = document.createElement('div');
                breakItem.className = 'session-break';
                breakItem.innerHTML = `
                    <i data-lucide="archive" style="width:15px;height:15px;"></i>
                    <span>${esc(prompt.sessionBreak)}</span>
                `;
                promptsContainer.appendChild(breakItem);
            }

            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';

            const metaChips = [];
            if (prompt.date) {
                metaChips.push(`
                    <span class="prompt-chip">
                        <i data-lucide="clock"></i>${esc(prompt.date)}
                    </span>`);
            }
            if (prompt.screenshot) {
                metaChips.push(`
                    <span class="prompt-chip prompt-chip--shot">
                        <i data-lucide="camera"></i>Con captura adjunta
                    </span>`);
            }

            const headerHtml = metaChips.length ? `
                <div class="prompt-topline">
                    <h4>Prompt ${prompt.id}</h4>
                    <div class="prompt-meta">${metaChips.join('')}</div>
                </div>` : `
                <h4>Prompt ${prompt.id}</h4>`;

            promptItem.innerHTML = `
                <div class="prompt-number">${prompt.id}</div>
                <div class="prompt-content glass-panel">
                    ${headerHtml}
                    ${prompt.title ? `<h3 class="prompt-title">${esc(prompt.title)}</h3>` : ''}
                    <div class="prompt-text-block">${esc(prompt.text)}</div>
                    ${prompt.commit ? `
                    <div class="prompt-commit">
                        <i data-lucide="git-commit-horizontal"></i>
                        <code>${esc(prompt.commit)}</code>
                    </div>` : ''}
                    ${prompt.note ? `<p class="prompt-note">${esc(prompt.note)}</p>` : ''}
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

    // ============================================================
    //  SITE HEADER NAVIGATION
    // ============================================================
    function setActiveNav(viewId) {
        const navTarget = viewId === 'infografiasView' ? 'infografias' : 'dashboard';
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('is-active', link.dataset.nav === navTarget);
        });
    }

    function navigateToView(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        const current = document.querySelector('.view.active-view');
        if (!current || current === target) return;

        const order = { dashboardView: 0, appDetailsView: 1, infografiasView: 1 };
        const direction = (order[targetId] ?? 0) >= (order[current.id] ?? 0) ? 'forward' : 'back';

        if (current.id === 'appDetailsView') {
            promptNavigator.classList.remove('visible');
            progressBar.style.width = '0%';
        }

        triggerViewTransition(current, target, direction);
        setActiveNav(targetId);
    }

    document.querySelectorAll('.nav-link, .site-brand').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.nav === 'infografias' ? 'infografiasView' : 'dashboardView';
            navigateToView(target);
        });
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
        setActiveNav('dashboardView');
    });

    // Infografias view navigation
    const openInfografiasBtn = document.getElementById('openInfografiasBtn');
    const backFromInfografiasBtn = document.getElementById('backFromInfografiasBtn');

    if (openInfografiasBtn) {
        openInfografiasBtn.addEventListener('click', () => {
            triggerViewTransition(dashboardView, infografiasView, 'forward');
            setActiveNav('infografiasView');
            // Re-sync slide on open in case layout changed
            requestAnimationFrame(() => setActiveSlide(activeSlideIndex, true));
        });
    }
    if (backFromInfografiasBtn) {
        backFromInfografiasBtn.addEventListener('click', () => {
            triggerViewTransition(infografiasView, dashboardView, 'back');
            setActiveNav('dashboardView');
        });
    }

    // ============================================================
    //  INFOGRAFÍAS CAROUSEL (Coverflow-style)
    // ============================================================
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.getElementById('carouselDots');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carouselSlideTitle = document.getElementById('carouselSlideTitle');
    const carouselSlideSubtitle = document.getElementById('carouselSlideSubtitle');
    const carouselSlideCategory = document.getElementById('carouselSlideCategory');
    const viewPromptBtn = document.getElementById('viewPromptBtn');

    let activeSlideIndex = 0;
    let infografiasList = window.infografiasData || [];

    function renderCarousel() {
        if (!carouselTrack || infografiasList.length === 0) return;

        carouselTrack.innerHTML = '';
        carouselDots.innerHTML = '';

        infografiasList.forEach((info, idx) => {
            const slide = document.createElement('button');
            slide.className = 'carousel-slide';
            slide.type = 'button';
            slide.dataset.index = idx;
            slide.style.setProperty('--slide-accent', info.accent || '#818cf8');
            slide.setAttribute('aria-label', `Infografía: ${info.title}`);
            slide.innerHTML = `
                <div class="carousel-slide__inner">
                    <img src="${info.image}" alt="${info.title}" loading="lazy" />
                    <div class="carousel-slide__shine"></div>
                    <div class="carousel-slide__badge">
                        <i data-lucide="sparkles" style="width:12px;height:12px;"></i>
                        <span>Image-2</span>
                    </div>
                    <div class="carousel-slide__overlay">
                        <span class="carousel-slide__title">${info.title}</span>
                    </div>
                </div>
            `;
            slide.addEventListener('click', () => {
                if (idx === activeSlideIndex) {
                    openPromptModal(infografiasList[idx]);
                } else {
                    setActiveSlide(idx);
                }
            });
            carouselTrack.appendChild(slide);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.dataset.index = idx;
            dot.setAttribute('aria-label', `Ir a ${info.title}`);
            dot.addEventListener('click', () => setActiveSlide(idx));
            carouselDots.appendChild(dot);
        });

        setActiveSlide(0, true);
        lucide.createIcons();
    }

    function setActiveSlide(index, instant = false) {
        const total = infografiasList.length;
        if (total === 0) return;
        activeSlideIndex = ((index % total) + total) % total;

        const slides = carouselTrack.querySelectorAll('.carousel-slide');
        slides.forEach((slide, idx) => {
            // Compute shortest signed offset (handles wrap-around)
            let diff = idx - activeSlideIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const abs = Math.abs(diff);
            slide.classList.toggle('is-active', diff === 0);
            slide.classList.toggle('is-near', abs === 1);
            slide.classList.toggle('is-far', abs >= 2);
            slide.style.setProperty('--offset', diff);
            slide.style.setProperty('--abs-offset', abs);
            slide.setAttribute('aria-hidden', diff !== 0 ? 'true' : 'false');
            slide.tabIndex = diff === 0 ? 0 : -1;

            if (instant) {
                slide.style.transition = 'none';
                requestAnimationFrame(() => {
                    slide.style.transition = '';
                });
            }
        });

        const dots = carouselDots.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === activeSlideIndex);
        });

        const current = infografiasList[activeSlideIndex];
        if (current) {
            carouselSlideTitle.textContent = current.title;
            carouselSlideSubtitle.textContent = current.subtitle;
            carouselSlideCategory.textContent = current.category;
            carouselSlideCategory.style.setProperty('--chip-accent', current.accent || '#818cf8');

            // Trigger info text re-animation
            const info = document.getElementById('carouselInfo');
            if (info) {
                info.classList.remove('is-animating');
                void info.offsetWidth;
                info.classList.add('is-animating');
            }
        }
    }

    if (carouselPrev) carouselPrev.addEventListener('click', () => setActiveSlide(activeSlideIndex - 1));
    if (carouselNext) carouselNext.addEventListener('click', () => setActiveSlide(activeSlideIndex + 1));

    // Keyboard navigation when carousel section is in viewport and dashboard active
    document.addEventListener('keydown', (e) => {
        if (!dashboardView.classList.contains('active-view')) return;
        if (document.body.classList.contains('modal-open')) return;
        const stage = document.getElementById('carouselStage');
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;

        if (e.key === 'ArrowLeft') {
            setActiveSlide(activeSlideIndex - 1);
        } else if (e.key === 'ArrowRight') {
            setActiveSlide(activeSlideIndex + 1);
        }
    });

    // Drag / swipe support
    let dragStartX = null;
    let dragMoved = false;
    if (carouselTrack) {
        carouselTrack.addEventListener('pointerdown', (e) => {
            dragStartX = e.clientX;
            dragMoved = false;
            carouselTrack.classList.add('is-dragging');
        });
        window.addEventListener('pointermove', (e) => {
            if (dragStartX === null) return;
            const dx = e.clientX - dragStartX;
            if (Math.abs(dx) > 8) dragMoved = true;
        });
        window.addEventListener('pointerup', (e) => {
            if (dragStartX === null) return;
            const dx = e.clientX - dragStartX;
            carouselTrack.classList.remove('is-dragging');
            if (Math.abs(dx) > 60) {
                setActiveSlide(activeSlideIndex + (dx < 0 ? 1 : -1));
            }
            dragStartX = null;
            // Prevent click after drag
            if (dragMoved) {
                setTimeout(() => { dragMoved = false; }, 50);
            }
        });
        // Block click after drag
        carouselTrack.addEventListener('click', (e) => {
            if (dragMoved) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
    }

    // ============================================================
    //  PROMPT MODAL
    // ============================================================
    const promptModal = document.getElementById('promptModal');
    const promptModalImage = document.getElementById('promptModalImage');
    const promptModalTitle = document.getElementById('promptModalTitle');
    const promptModalSubtitle = document.getElementById('promptModalSubtitle');
    const promptModalCategory = document.getElementById('promptModalCategory');
    const promptModalText = document.getElementById('promptModalText');
    const copyPromptBtn = document.getElementById('copyPromptBtn');

    // Simple, reliable scroll lock. We tried a position:fixed approach
    // but iOS Safari got into a stuck state on the second open (the
    // body shift wasn't always cleared cleanly between modal cycles).
    // Plain overflow: hidden on body+html is enough — the modals are
    // position: fixed so they cover the viewport regardless.
    function lockBackgroundScroll() {
        document.body.classList.add('modal-open');
    }
    function unlockBackgroundScroll() {
        // Only release when no other modal is still open.
        const promptOpen = promptModal && promptModal.classList.contains('is-open');
        const infoOpen = infoModal && infoModal.classList.contains('is-open');
        if (!promptOpen && !infoOpen) {
            document.body.classList.remove('modal-open');
        }
    }

    function openPromptModal(item) {
        if (!item || !promptModal) return;
        promptModalImage.src = item.image;
        promptModalImage.alt = item.title;
        promptModalTitle.textContent = item.title;
        promptModalSubtitle.textContent = item.subtitle;
        promptModalCategory.textContent = item.category;
        promptModalCategory.style.setProperty('--chip-accent', item.accent || '#818cf8');
        promptModalText.textContent = item.prompt;
        promptModal.classList.add('is-open');
        promptModal.setAttribute('aria-hidden', 'false');
        lockBackgroundScroll();
    }

    function closePromptModal() {
        if (!promptModal) return;
        if (!promptModal.classList.contains('is-open')) return;
        // Move focus out before hiding: browsers block aria-hidden on an
        // element that contains the focused element (the close button itself).
        if (promptModal.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        promptModal.classList.remove('is-open', 'is-fullscreen');
        promptModal.setAttribute('aria-hidden', 'true');
        unlockBackgroundScroll();
    }

    if (viewPromptBtn) {
        viewPromptBtn.addEventListener('click', () => {
            openPromptModal(infografiasList[activeSlideIndex]);
        });
    }

    if (promptModal) {
        promptModal.querySelectorAll('[data-modal-close]').forEach(el => {
            el.addEventListener('click', closePromptModal);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && promptModal && promptModal.classList.contains('is-open')) {
            // Exit fullscreen first if active, otherwise close the modal
            if (promptModal.classList.contains('is-fullscreen')) {
                setFullscreen(false);
            } else {
                closePromptModal();
            }
        }
    });

    if (copyPromptBtn) {
        copyPromptBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(promptModalText.textContent);
                const label = copyPromptBtn.querySelector('span');
                const originalText = label.textContent;
                label.textContent = '¡Copiado!';
                copyPromptBtn.classList.add('is-success');
                setTimeout(() => {
                    label.textContent = originalText;
                    copyPromptBtn.classList.remove('is-success');
                }, 1800);
            } catch (err) {
                console.error('Copy failed', err);
            }
        });
    }

    // ============================================================
    //  INFOGRAFÍAS CTA PREVIEW (dashboard)
    // ============================================================
    function renderInfografiasCta() {
        const previewWrap = document.getElementById('infografiasCtaPreview');
        const bgWrap = document.getElementById('infografiasCtaBg');
        if (!previewWrap || infografiasList.length === 0) return;

        // Pick 3 visually striking infographics for preview stack
        const picks = [
            infografiasList.find(i => i.id === 10) || infografiasList[0], // sistema solar
            infografiasList.find(i => i.id === 11) || infografiasList[1], // ADN
            infografiasList.find(i => i.id === 17) || infografiasList[2], // electromagnetismo
        ];

        previewWrap.innerHTML = picks.map((info, idx) => `
            <div class="cta-preview-card" style="--idx:${idx}; --slide-accent:${info.accent}">
                <img src="${info.image}" alt="${info.title}" loading="lazy" />
                <div class="cta-preview-card__shine"></div>
            </div>
        `).join('');

        if (bgWrap) {
            bgWrap.style.setProperty('--accent-1', picks[0].accent);
            bgWrap.style.setProperty('--accent-2', picks[2].accent);
        }
    }

    // ============================================================
    //  IMAGE ZOOM IN PROMPT MODAL
    // ============================================================
    const imageWrap = document.getElementById('promptModalImageWrap');
    const zoomLevelLabel = document.getElementById('zoomLevel');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');

    const ZOOM_MAX = 5;
    const ZOOM_STEP = 0.25;

    // Image rendered with width:100%, height:auto, transform-origin: 0 0
    // Default state (scale 1, x:0 y:0): image fills wrap width, top-aligned
    // For 9:16 images, vertical overflow is the norm — user pans down
    // Zoom out below 1 shrinks the image so it fully fits the wrap
    let zoomState = { scale: 1, x: 0, y: 0 };
    let zoomMinScale = 0.3; // recomputed dynamically when image loads

    function recomputeMinScale() {
        if (!imageWrap || !promptModalImage.complete || !promptModalImage.naturalHeight) return;
        const wrapH = imageWrap.clientHeight;
        const wrapW = imageWrap.clientWidth;
        const baseH = promptModalImage.offsetHeight; // displayed height at scale 1
        const baseW = promptModalImage.offsetWidth;
        if (baseH > 0 && baseW > 0) {
            const fitByHeight = wrapH / baseH;
            const fitByWidth = wrapW / baseW;
            zoomMinScale = Math.max(0.2, Math.min(1, Math.min(fitByHeight, fitByWidth)));
        }
    }

    function applyZoom() {
        if (!imageWrap) return;
        const img = promptModalImage;
        img.style.transform = `translate3d(${zoomState.x}px, ${zoomState.y}px, 0) scale(${zoomState.scale})`;

        // Detect if image overflows wrap in any direction → user can pan
        const baseW = img.offsetWidth;
        const baseH = img.offsetHeight;
        const scaledW = baseW * zoomState.scale;
        const scaledH = baseH * zoomState.scale;
        const wrapW = imageWrap.clientWidth;
        const wrapH = imageWrap.clientHeight;
        const canPan = scaledW > wrapW + 1 || scaledH > wrapH + 1;
        imageWrap.dataset.zoom = canPan ? 'zoomed' : '1';

        if (zoomLevelLabel) zoomLevelLabel.textContent = `${Math.round(zoomState.scale * 100)}%`;
        if (zoomOutBtn) zoomOutBtn.disabled = zoomState.scale <= zoomMinScale + 0.001;
        if (zoomInBtn) zoomInBtn.disabled = zoomState.scale >= ZOOM_MAX - 0.001;
    }

    function clampPan() {
        if (!imageWrap) return;
        const wrapW = imageWrap.clientWidth;
        const wrapH = imageWrap.clientHeight;
        const baseW = promptModalImage.offsetWidth;
        const baseH = promptModalImage.offsetHeight;
        const scaledW = baseW * zoomState.scale;
        const scaledH = baseH * zoomState.scale;

        if (scaledW >= wrapW) {
            const minX = wrapW - scaledW; // negative
            zoomState.x = Math.min(0, Math.max(minX, zoomState.x));
        } else {
            zoomState.x = (wrapW - scaledW) / 2;
        }
        if (scaledH >= wrapH) {
            const minY = wrapH - scaledH; // negative
            zoomState.y = Math.min(0, Math.max(minY, zoomState.y));
        } else {
            zoomState.y = (wrapH - scaledH) / 2;
        }
    }

    function setZoom(newScale, originX, originY) {
        const prev = zoomState.scale;
        const next = Math.max(zoomMinScale, Math.min(ZOOM_MAX, newScale));
        if (Math.abs(next - prev) < 0.001) return;

        if (originX !== undefined && originY !== undefined && imageWrap) {
            // Keep the point under the cursor anchored
            const rect = imageWrap.getBoundingClientRect();
            const cx = originX - rect.left;
            const cy = originY - rect.top;
            const ratio = next / prev;
            zoomState.x = cx - (cx - zoomState.x) * ratio;
            zoomState.y = cy - (cy - zoomState.y) * ratio;
        }

        zoomState.scale = next;
        clampPan();
        applyZoom();
    }

    function resetZoom() {
        zoomState = { scale: 1, x: 0, y: 0 };
        applyZoom();
    }

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => setZoom(zoomState.scale + ZOOM_STEP));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoom(zoomState.scale - ZOOM_STEP));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);

    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    function setFullscreen(on) {
        if (!promptModal) return;
        promptModal.classList.toggle('is-fullscreen', on);
        if (fullscreenBtn) {
            const icon = fullscreenBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', on ? 'minimize' : 'maximize');
                fullscreenBtn.title = on ? 'Salir de pantalla completa (F · Esc)' : 'Pantalla completa (F)';
                lucide.createIcons();
            }
        }
        // Layout dimensions just changed — reset and recompute on next frame
        requestAnimationFrame(() => {
            recomputeMinScale();
            resetZoom();
        });
    }

    function toggleFullscreen() {
        if (!promptModal) return;
        setFullscreen(!promptModal.classList.contains('is-fullscreen'));
    }

    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // F key shortcut while modal is open
    document.addEventListener('keydown', (e) => {
        if (!promptModal || !promptModal.classList.contains('is-open')) return;
        if (e.key === 'f' || e.key === 'F') {
            // Avoid hijacking when user is typing in an input (none in modal currently, but be safe)
            const tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea') return;
            e.preventDefault();
            toggleFullscreen();
        }
    });

    // Recompute min scale and reapply when a new image finishes loading
    if (promptModalImage) {
        promptModalImage.addEventListener('load', () => {
            recomputeMinScale();
            // Default state: top-aligned, scale 1 — already set by resetZoom on open
            // Just clamp in case viewport changed dimensions
            clampPan();
            applyZoom();
        });
    }

    if (imageWrap) {
        // Double-click / double-tap to toggle zoom
        imageWrap.addEventListener('dblclick', (e) => {
            if (zoomState.scale > 1.5) {
                resetZoom();
            } else {
                setZoom(2.5, e.clientX, e.clientY);
            }
        });

        // Mouse wheel zoom
        imageWrap.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
            setZoom(zoomState.scale + delta, e.clientX, e.clientY);
        }, { passive: false });

        // ---- Touch: pinch-to-zoom + single-finger pan when zoomed ----
        // We use Touch events (instead of Pointer events) for pinch because
        // Pointer events don't natively expose simultaneous touches in a way
        // that's portable for gesture math.
        const activeTouches = new Map(); // identifier -> {x, y}
        let pinchStart = null;           // {distance, scale, cx, cy, ox, oy}
        let touchPanStart = null;        // {x, y, ox, oy}

        function getTouchesArr() {
            return Array.from(activeTouches.values());
        }

        imageWrap.addEventListener('touchstart', (e) => {
            for (const t of e.changedTouches) {
                activeTouches.set(t.identifier, { x: t.clientX, y: t.clientY });
            }
            const touches = getTouchesArr();
            if (touches.length >= 2) {
                // Block iOS Safari's native pinch-zoom on multi-touch
                e.preventDefault();
                const [a, b] = touches;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                pinchStart = {
                    distance: Math.hypot(dx, dy),
                    scale: zoomState.scale,
                    cx: (a.x + b.x) / 2,
                    cy: (a.y + b.y) / 2,
                    ox: zoomState.x,
                    oy: zoomState.y,
                };
                touchPanStart = null;
            } else if (touches.length === 1 && imageWrap.dataset.zoom === 'zoomed') {
                // Begin single-finger pan (only when zoomed)
                const t = touches[0];
                touchPanStart = { x: t.x, y: t.y, ox: zoomState.x, oy: zoomState.y };
                imageWrap.classList.add('is-panning');
            }
            // Note: native dblclick handler covers double-tap-to-zoom.
        }, { passive: false });

        // Safari iOS fires its own GestureEvents (a non-standard event
        // family) BEFORE touch events when it detects a pinch — and uses
        // those to drive its native page zoom. preventDefault on these
        // is the only way to suppress Safari's pinch behavior so our
        // touch-based pinch handler can take over cleanly.
        imageWrap.addEventListener('gesturestart', (e) => { e.preventDefault(); });
        imageWrap.addEventListener('gesturechange', (e) => { e.preventDefault(); });
        imageWrap.addEventListener('gestureend', (e) => { e.preventDefault(); });

        imageWrap.addEventListener('touchmove', (e) => {
            for (const t of e.changedTouches) {
                if (activeTouches.has(t.identifier)) {
                    activeTouches.set(t.identifier, { x: t.clientX, y: t.clientY });
                }
            }
            const touches = getTouchesArr();
            if (touches.length === 2 && pinchStart) {
                e.preventDefault();
                const [a, b] = touches;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distance = Math.hypot(dx, dy);
                const ratio = distance / pinchStart.distance;
                const newScale = pinchStart.scale * ratio;
                const cx = (a.x + b.x) / 2;
                const cy = (a.y + b.y) / 2;
                // Anchor the midpoint as we scale (keeps the spot under the
                // user's fingers fixed)
                setZoom(newScale, cx, cy);
            } else if (touches.length === 1 && touchPanStart) {
                e.preventDefault();
                const t = touches[0];
                zoomState.x = touchPanStart.ox + (t.x - touchPanStart.x);
                zoomState.y = touchPanStart.oy + (t.y - touchPanStart.y);
                clampPan();
                applyZoom();
            }
        }, { passive: false });

        const endTouch = (e) => {
            for (const t of e.changedTouches) {
                activeTouches.delete(t.identifier);
            }
            if (activeTouches.size < 2) pinchStart = null;
            if (activeTouches.size === 0) {
                touchPanStart = null;
                imageWrap.classList.remove('is-panning');
            }
        };
        imageWrap.addEventListener('touchend', endTouch);
        imageWrap.addEventListener('touchcancel', endTouch);

        // ---- Mouse / pen: drag to pan (when zoomed) ----
        // We gate on pointerType so we don't double-handle touch.
        let panStart = null;
        imageWrap.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') return;
            if (imageWrap.dataset.zoom !== 'zoomed') return;
            panStart = { x: e.clientX, y: e.clientY, ox: zoomState.x, oy: zoomState.y };
            imageWrap.classList.add('is-panning');
            imageWrap.setPointerCapture(e.pointerId);
        });
        imageWrap.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            if (!panStart) return;
            zoomState.x = panStart.ox + (e.clientX - panStart.x);
            zoomState.y = panStart.oy + (e.clientY - panStart.y);
            clampPan();
            applyZoom();
        });
        const endPan = (e) => {
            if (e.pointerType === 'touch') return;
            if (!panStart) return;
            panStart = null;
            imageWrap.classList.remove('is-panning');
            try { imageWrap.releasePointerCapture(e.pointerId); } catch {}
        };
        imageWrap.addEventListener('pointerup', endPan);
        imageWrap.addEventListener('pointercancel', endPan);
    }

    // Hook reset on every modal open (override openPromptModal)
    const originalOpen = openPromptModal;
    openPromptModal = function(item) {
        resetZoom();
        originalOpen(item);
    };

    // ============================================================
    //  META-PROMPT INFO MODAL
    // ============================================================
    const infoModal = document.getElementById('infoModal');
    const metaPromptBtn = document.getElementById('metaPromptBtn');

    function openInfoModal() {
        if (!infoModal) return;
        if (infoModal.classList.contains('is-open')) return;
        infoModal.classList.add('is-open');
        infoModal.setAttribute('aria-hidden', 'false');
        lockBackgroundScroll();
    }

    function closeInfoModal() {
        if (!infoModal) return;
        if (!infoModal.classList.contains('is-open')) return;
        if (infoModal.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        infoModal.classList.remove('is-open');
        infoModal.setAttribute('aria-hidden', 'true');
        unlockBackgroundScroll();
    }

    if (metaPromptBtn) metaPromptBtn.addEventListener('click', openInfoModal);
    if (infoModal) {
        infoModal.querySelectorAll('[data-info-close]').forEach(el => {
            el.addEventListener('click', closeInfoModal);
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && infoModal && infoModal.classList.contains('is-open')) {
            closeInfoModal();
        }
    });

    // Run first initialization
    renderCards();
    renderCarousel();
    renderInfografiasCta();
});

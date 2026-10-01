const body = document.body;
const themeSwitches = Array.from(document.querySelectorAll(".theme-switch"));

function applySavedTheme() {
    const savedTheme = localStorage.getItem("portfolio-theme") || "dark";

    if (savedTheme === "light") {
        body.classList.add("light-mode");
        themeSwitches.forEach((btn) => btn.setAttribute("aria-pressed", "true"));
    }
}

function updateTheme() {
    const isLight = body.classList.toggle("light-mode");

    themeSwitches.forEach((btn) => btn.setAttribute("aria-pressed", String(isLight)));

    localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
}

async function copyEmailToClipboard(email) {
    try {
        await navigator.clipboard.writeText(email);
    } catch (error) {
        const tempInput = document.createElement("textarea");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
    }
}

function showCopyToast(message) {
    const toast = document.getElementById("copy-toast");

    if (!toast) {
        return;
    }

    const toastText = toast.querySelector(".toast-text");

    if (toastText) {
        toastText.textContent = message;
    }

    toast.classList.add("show");

    window.setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

function setupEmailCopy() {
    const emailLinks = document.querySelectorAll(".email-copy");

    if (!emailLinks.length) {
        return;
    }

    emailLinks.forEach((emailLink) => {
        emailLink.addEventListener("click", async (event) => {
            event.preventDefault();
            const email = emailLink.dataset.email;

            try {
                await copyEmailToClipboard(email);
                showCopyToast("Email copied");
            } catch (error) {
                showCopyToast("Copy failed");
            }
        });
    });
}

function setupResumeButton() {
    const resumeLink = document.querySelector(".resume-link");

    if (!resumeLink) {
        return;
    }

    resumeLink.addEventListener("click", (event) => {
        event.preventDefault();
        showCopyToast("Resume opened");

        window.setTimeout(() => {
            window.open(resumeLink.href, "_blank");
        }, 250);
    });
}

function setupContactForm() {
    const contactForm = document.querySelector(".contact-form");

    if (!contactForm) {
        return;
    }

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            showCopyToast("Please complete all fields");
            return;
        }

        const formData = new FormData(contactForm);
        const name = (formData.get("name") || "").toString().trim();
        const email = (formData.get("email") || "").toString().trim();
        const message = (formData.get("message") || "").toString().trim();

        const subject = encodeURIComponent(`Portfolio inquiry from ${name || "Visitor"}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("carlos.alcantara.iii.27@gmail.com")}&su=${subject}&body=${body}`;
        const gmailWindow = window.open(gmailUrl, "_blank", "noopener,noreferrer");

        if (!gmailWindow) {
            window.location.href = `mailto:carlos.alcantara.iii.27@gmail.com?subject=${subject}&body=${body}`;
        }

        showCopyToast("Opening Gmail");
        contactForm.reset();
    });
}

function setupScrollTopButton() {
    const scrollButton = document.getElementById("scroll-top");

    if (!scrollButton) {
        return;
    }

    function updateScrollButton() {
        const visible = window.scrollY > window.innerHeight * 0.4;
        scrollButton.classList.toggle("visible", visible);
    }

    updateScrollButton();
    window.addEventListener("scroll", updateScrollButton);

    scrollButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

function setupCertificationsCarousel() {
    const carousel = document.querySelector(".certifications-carousel");

    if (!carousel) {
        return;
    }

    const cards = Array.from(carousel.querySelectorAll(".certification-card"));
    const previousButton = carousel.querySelector(".certification-previous");
    const nextButton = carousel.querySelector(".certification-next");
    let currentIndex = 0;

    function showCertification(index, direction = "next") {
        currentIndex = (index + cards.length) % cards.length;

        cards.forEach((card, cardIndex) => {
            const isActive = cardIndex === currentIndex;

            if (isActive) {
                // Clear the animation classes and force a reflow so the slide
                // animation replays even when the same card stays active
                // (e.g. when there is only one certification).
                card.classList.remove("slide-from-left", "slide-from-right");
                void card.offsetWidth;
            }

            card.classList.toggle("is-active", isActive);
            card.classList.toggle("slide-from-left", isActive && direction === "previous");
            card.classList.toggle("slide-from-right", isActive && direction === "next");
            card.setAttribute("aria-hidden", String(!isActive));
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            showCertification(currentIndex - 1, "previous");
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            showCertification(currentIndex + 1, "next");
        });
    }

    showCertification(currentIndex);
}

function setupProjectModal() {
    const modal = document.getElementById("project-modal");
    const lightbox = document.getElementById("project-image-lightbox");

    if (!modal) {
        return;
    }

    const title = document.getElementById("project-modal-title");
    const description = document.getElementById("project-modal-description");
    const gallery = document.getElementById("project-modal-gallery");
    const tagsList = document.getElementById("project-modal-tags");
    const githubLink = document.getElementById("project-modal-github");
    const closeButtons = modal.querySelectorAll("[data-close-modal], .project-modal-close, .project-modal-close-button");
    const projectButtons = document.querySelectorAll(".project-view-btn");
    const lightboxImage = lightbox ? lightbox.querySelector("img") : null;
    const lightboxClose = lightbox ? lightbox.querySelector(".project-image-lightbox-close") : null;

    function openImageLightbox(src, alt) {
        if (!lightbox || !lightboxImage) {
            return;
        }

        lightboxImage.src = src;
        lightboxImage.alt = alt;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeImageLightbox() {
        if (!lightbox) {
            return;
        }

        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        if (!modal.classList.contains("is-open")) {
            document.body.style.overflow = "";
        }
    }

    function openProjectModal(projectCard) {
        const projectData = {
            title: projectCard.dataset.title || "Project Details",
            description: projectCard.dataset.description || "",
            github: projectCard.dataset.github || "#",
            tags: (projectCard.dataset.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
            images: (projectCard.dataset.images || "").split(",").map((image) => image.trim()).filter(Boolean)
        };

        title.textContent = projectData.title;
        description.textContent = projectData.description;

        tagsList.innerHTML = projectData.tags
            .map((tag) => `<li>${tag}</li>`)
            .join("");

        githubLink.href = projectData.github;

        gallery.innerHTML = projectData.images.length
            ? projectData.images
                .map((image) => `<img src="${image}" alt="${projectData.title} preview" loading="lazy">`)
                .join("")
            : '<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" alt="Project preview" loading="lazy">';

        gallery.querySelectorAll("img").forEach((image) => {
            image.addEventListener("click", () => openImageLightbox(image.src, image.alt));
        });

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeProjectModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        closeImageLightbox();
        if (!lightbox || !lightbox.classList.contains("is-open")) {
            document.body.style.overflow = "";
        }
    }

    projectButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const projectCard = button.closest(".project-card");
            if (projectCard) {
                openProjectModal(projectCard);
            }
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeProjectModal);
    });

    if (lightboxClose) {
        lightboxClose.addEventListener("click", closeImageLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox || event.target.matches("[data-close-image-lightbox]")) {
                closeImageLightbox();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (lightbox && lightbox.classList.contains("is-open")) {
                closeImageLightbox();
                return;
            }

            if (modal.classList.contains("is-open")) {
                closeProjectModal();
            }
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target.matches("[data-close-modal]")) {
            closeProjectModal();
        }
    });
}

function setupScrollReveal() {
    const revealItems = document.querySelectorAll("main > section:not(#hero)");

    if (!revealItems.length) {
        return;
    }

    revealItems.forEach((item) => {
        item.classList.add("scroll-reveal");
    });

    if (!("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px"
    });

    revealItems.forEach((item) => revealObserver.observe(item));
}

function setupDotGrid() {
    const canvas = document.getElementById("dot-grid");

    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
        return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const SPACING = 14;          // distance between dots in the grid
    const BASE_RADIUS = 1;       // resting dot radius (px)
    const HOVER_RADIUS = 100;    // how far the cursor reaches
    const PUSH_DISTANCE = 24;    // max distance a dot is pushed away
    const EASE = 0.1;            // hover spring-back smoothing
    const GRID_SPEED = 16;       // whole-grid movement speed (px/s)

    /* =========================================================
       >> DOT COLORS — EDIT THESE TO CHANGE THE DOT LOOK
       ---------------------------------------------------------
       null = follow the site theme automatically (resting dots:
       --text in dark mode, --text-subtle in light mode; glow:
       --accent — all in style.css).
       Set a value to lock in your own instead:
           DOT_COLOR    resting dot color   e.g. "#888888"
           HOVER_COLOR  cursor glow color   e.g. "#00aaff"
           DOT_OPACITY  dot opacity (0-1)   e.g. 0.3
       ========================================================= */
    const DOT_COLOR = null;
    const HOVER_COLOR = null;
    const DOT_OPACITY = null;
    /* =========================================================
       >> END DOT COLORS
       ========================================================= */

    let dots = [];
    let hotDots = [];
    let width = 0;
    let height = 0;
    let frameId = null;
    let resizeTimer = null;
    let mouseX = -1000;
    let mouseY = -1000;
    let pointerActive = false;

    // Fallback colors — only used if the theme colors can't be read.
    // (To change dot colors, use the DOT_COLORS block above, not these.)
    const baseColor = { r: 245, g: 245, b: 245 };   // fallback resting dot color
    const accentColor = { r: 255, g: 0, b: 0 };     // fallback hover glow color
    let baseAlpha = 0.2;                            // fallback dot opacity

    // Parses "#rgb" or "#rrggbb" into {r, g, b}; returns `fallback` if invalid
    function parseHex(value, fallback) {
        let hex = (value || "").trim().replace(/^#/, "");

        if (hex.length === 3) {
            hex = hex.split("").map((char) => char + char).join("");
        }

        if (!/^[0-9a-f]{6}$/i.test(hex)) {
            return fallback;
        }

        const number = parseInt(hex, 16);

        return {
            r: (number >> 16) & 255,
            g: (number >> 8) & 255,
            b: number & 255
        };
    }

    // Rebuilds the dot colors. Called on load, on theme toggle, and on resize.
    // Order of precedence:
    //   1. DOT_COLOR / HOVER_COLOR / DOT_OPACITY overrides (see block above)
    //   2. theme colors from style.css:
    //        resting dots: --text (dark mode) / --text-subtle (light mode)
    //        hover glow:   --accent
    //   3. default fallbacks if neither is available
    function refreshColors() {
        const styles = getComputedStyle(document.body);
        const isLight = document.body.classList.contains("light-mode");

        // Light mode uses --text-subtle (a soft gray) instead of the text
        // color, so the dot pattern never competes with readable content
        const themeBase = parseHex(
            styles.getPropertyValue(isLight ? "--text-subtle" : "--text"),
            baseColor
        );
        const themeAccent = parseHex(styles.getPropertyValue("--accent"), accentColor);

        const forcedBase = parseHex(DOT_COLOR, null);
        const forcedAccent = parseHex(HOVER_COLOR, null);
        const finalBase = forcedBase || themeBase;
        const finalAccent = forcedAccent || themeAccent;

        baseColor.r = finalBase.r;
        baseColor.g = finalBase.g;
        baseColor.b = finalBase.b;

        accentColor.r = finalAccent.r;
        accentColor.g = finalAccent.g;
        accentColor.b = finalAccent.b;

        if (DOT_OPACITY !== null && DOT_OPACITY !== undefined && Number.isFinite(Number(DOT_OPACITY))) {
            // Your override: clamp to the valid 0-1 range
            baseAlpha = Math.max(0, Math.min(1, Number(DOT_OPACITY)));
        } else {
            // Theme default dot darkness: very faint in dark mode; in light
            // mode a soft gray at low opacity so dots stay behind the text
            baseAlpha = isLight ? 0.15 : 0.08;
        }
    }

    function resizeCanvas() {
        width = canvas.clientWidth || window.innerWidth;
        height = canvas.clientHeight || window.innerHeight;

        const density = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * density);
        canvas.height = Math.round(height * density);
        context.setTransform(density, 0, 0, density, 0, 0);

        buildGrid();
    }

    function buildGrid() {
        dots = [];

        // +3 = one extra column/row of margin on each edge, so the grid
        // never shows a bare edge while it scrolls
        const columns = Math.max(2, Math.ceil(width / SPACING) + 3);
        const rows = Math.max(2, Math.ceil(height / SPACING) + 3);
        const originX = (width - (columns - 1) * SPACING) / 2;
        const originY = (height - (rows - 1) * SPACING) / 2;

        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const x = originX + column * SPACING;
                const y = originY + row * SPACING;

                dots.push({
                    x,
                    y,
                    offsetX: 0,     // eased hover push only (px)
                    offsetY: 0,
                    intensity: 0,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }

    function render(time) {
        context.clearRect(0, 0, width, height);

        const seconds = time * 0.001;

        // THE WHOLE GRID MOVES: every dot rides one shared diagonal glide.
        // Wrapping every SPACING px is invisible — the lattice repeats
        // exactly, and buildGrid() keeps a one-cell margin on every edge.
        const gridShift = reducedMotion.matches
            ? 0
            : (seconds * GRID_SPEED) % SPACING;
        const gridShiftX = gridShift;
        const gridShiftY = gridShift;

        hotDots.length = 0;

        // COLOR 1/2 — resting dots: baseColor at baseAlpha opacity
        // (controlled by DOT_COLOR / DOT_OPACITY in the DOT_COLORS block)
        context.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseAlpha})`;
        context.beginPath();

        for (let index = 0; index < dots.length; index += 1) {
            const dot = dots[index];

            // This dot's home with the shared whole-grid movement applied
            const homeX = dot.x + gridShiftX;
            const homeY = dot.y + gridShiftY;

            // Only the hover push is a per-dot offset
            let pushX = 0;
            let pushY = 0;
            let intensity = 0;

            if (pointerActive && !reducedMotion.matches) {
                const dx = homeX - mouseX;
                const dy = homeY - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < HOVER_RADIUS) {
                    const falloff = 1 - distance / HOVER_RADIUS;

                    intensity = falloff * falloff;

                    if (distance > 0.001) {
                        const push = falloff * PUSH_DISTANCE;
                        pushX = (dx / distance) * push;
                        pushY = (dy / distance) * push;
                    }
                }
            }

            if (reducedMotion.matches) {
                // Static render: no residual push
                dot.offsetX = 0;
                dot.offsetY = 0;
            } else {
                // Ease the push so dots spring back smoothly after hover
                dot.offsetX += (pushX - dot.offsetX) * EASE;
                dot.offsetY += (pushY - dot.offsetY) * EASE;
            }
            dot.intensity = intensity;

            if (intensity > 0.02) {
                hotDots.push(dot);
                continue;
            }

            // Subtle idle breathing so the grid feels alive
            const breathe = reducedMotion.matches
                ? 0
                : Math.sin(seconds * 1.4 + dot.phase) * 0.2;
            const radius = BASE_RADIUS + breathe;
            // Grid motion applies instantly (easing it would stutter at the wrap)
            const drawX = homeX + dot.offsetX;
            const drawY = homeY + dot.offsetY;

            context.moveTo(drawX + radius, drawY);
            context.arc(drawX, drawY, radius, 0, Math.PI * 2);
        }

        context.fill();

        // COLOR 2/2 — dots near the cursor: fades baseColor toward accentColor
        // as intensity rises (controlled by DOT_COLOR / HOVER_COLOR above)
        for (let index = 0; index < hotDots.length; index += 1) {
            const dot = hotDots[index];
            const intensity = dot.intensity;
            const red = Math.round(baseColor.r + (accentColor.r - baseColor.r) * intensity);
            const green = Math.round(baseColor.g + (accentColor.g - baseColor.g) * intensity);
            const blue = Math.round(baseColor.b + (accentColor.b - baseColor.b) * intensity);
            // +0.87 keeps the hover glow at full strength even though the
            // resting dots are darker
            const alpha = Math.min(1, baseAlpha + intensity * 0.87);
            const radius = BASE_RADIUS + intensity * 2.5;
            const drawX = dot.x + gridShiftX + dot.offsetX;
            const drawY = dot.y + gridShiftY + dot.offsetY;

            context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            context.beginPath();
            context.arc(drawX, drawY, radius, 0, Math.PI * 2);
            context.fill();
        }
    }

    function loop(time) {
        render(time);
        frameId = window.requestAnimationFrame(loop);
    }

    function start() {
        if (frameId !== null) {
            return;
        }

        if (reducedMotion.matches) {
            // Static grid: no idle animation, no cursor motion
            render(0);
            return;
        }

        frameId = window.requestAnimationFrame(loop);
    }

    function stop() {
        if (frameId === null) {
            return;
        }

        window.cancelAnimationFrame(frameId);
        frameId = null;
    }

    window.addEventListener("pointermove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        pointerActive = true;
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => {
        pointerActive = false;
    });

    window.addEventListener("blur", () => {
        pointerActive = false;
    });

    window.addEventListener("resize", () => {
        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(() => {
            refreshColors();
            resizeCanvas();

            if (reducedMotion.matches) {
                render(0);
            }
        }, 150);
    });

    if (typeof reducedMotion.addEventListener === "function") {
        reducedMotion.addEventListener("change", () => {
            stop();
            start();
        });
    }

    // Re-read the theme colors whenever light/dark mode changes
    if ("MutationObserver" in window) {
        new MutationObserver(() => {
            refreshColors();

            if (reducedMotion.matches) {
                render(0);
            }
        }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    refreshColors();
    resizeCanvas();
    start();
}

function setupLogoRefresh() {
    const logoLink = document.querySelector(".logo a");

    if (!logoLink) {
        return;
    }

    // Clicking the <CARLOS ALCANTARA/> logo scrolls back to the top and
    // fully refreshes the page. (Without JavaScript the href="#hero"
    // fallback just scrolls home.)
    logoLink.addEventListener("click", (event) => {
        event.preventDefault();

        // Stop the browser from restoring the old scroll position after
        // the reload — otherwise it would bring the page back where it was
        try {
            window.history.scrollRestoration = "manual";
        } catch (error) {
            // Very old browsers: the explicit scroll below still runs
        }

        // Aim the URL at the hero so the fresh page opens at the very top
        try {
            window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search + "#hero"
            );
        } catch (error) {
            // Some browsers restrict history APIs on file:// URLs
            window.location.hash = "hero";
        }

        // Already at the top? Refresh right away
        if (window.scrollY === 0) {
            window.location.reload();
            return;
        }

        const reduceMotion =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Reduced motion: jump straight to the top and refresh
        if (reduceMotion) {
            window.scrollTo(0, 0);
            window.location.reload();
            return;
        }

        // Otherwise scroll back to the top visibly, then refresh once it
        // lands (timeout in case the browser never reports scrollend)
        let refreshed = false;
        const refresh = () => {
            if (refreshed) {
                return;
            }
            refreshed = true;
            window.location.reload();
        };

        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        window.addEventListener("scrollend", refresh, { once: true });
        document.addEventListener("scrollend", refresh, { once: true });
        window.setTimeout(refresh, 900);
    });
}

if (themeSwitches.length) {
    applySavedTheme();
    themeSwitches.forEach((btn) => btn.addEventListener("click", updateTheme));
}

setupEmailCopy();
setupResumeButton();
setupContactForm();
setupScrollTopButton();
setupCertificationsCarousel();
setupProjectModal();
setupScrollReveal();
setupMobileMenu();
setupDotGrid();
setupLogoRefresh();

function setupMobileMenu() {
    const menuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

    if (!menuButton || !mobileMenu) return;

    function openMenu() {
        mobileMenu.classList.add("open");
        document.body.classList.add("menu-open");
        // Icon swap (☰ ↔ ✕) is handled in CSS via [aria-expanded="true"]
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close menu");
        mobileMenu.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeMenu() {
        mobileMenu.classList.remove("open");
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    menuButton.addEventListener("click", () => {
        if (mobileMenu.classList.contains("open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    mobileMenu.addEventListener("click", (event) => {
        if (event.target.tagName === "A" || event.target === mobileMenu) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024 && mobileMenu.classList.contains("open")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
            closeMenu();
        }
    });
}

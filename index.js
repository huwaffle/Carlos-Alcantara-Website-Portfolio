const body = document.body;
const themeSwitches = Array.from(document.querySelectorAll(".theme-switch"));

function applySavedTheme() {
    const savedTheme = localStorage.getItem("portfolio-theme") || "dark";

    if (savedTheme === "light") {
        body.classList.add("light-mode");
        themeSwitches.forEach((btn) => btn.setAttribute("aria-pressed", "true"));
    }
}

// Set by setupThemeSlide(); slides the incoming theme across the screen
// and fires its callback at full cover (null when unavailable)
let themeSlideTrigger = null;

function commitTheme(isLight) {
    if (isLight) {
        body.classList.add("light-mode");
    } else {
        body.classList.remove("light-mode");
    }

    themeSwitches.forEach((btn) => btn.setAttribute("aria-pressed", String(isLight)));

    localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
}

function updateTheme() {
    const target = !body.classList.contains("light-mode");
    const reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Wipe the incoming theme's background across the screen; the class
    // swap happens behind the cover (falls back to a direct toggle when
    // the slide isn't available or motion is reduced)
    if (!reduceMotion && themeSlideTrigger) {
        themeSlideTrigger(target, () => commitTheme(target));
        return;
    }

    commitTheme(target);
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
    const CROSS_RAMP = 8;        // push ramps in from this close to the cursor (px)
    const EASE = 0.1;            // easing for the shared hover-strength fade
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
    // Shared, eased hover presence: 1 while the pointer is over the page,
    // eases back to 0 when it leaves (that fade is what springs dots home)
    let hoverStrength = 0;

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
                    pushX: 0,       // hover push for this frame (px)
                    pushY: 0,
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

        // Ease ONE shared hover strength (0 → 1 while the pointer is over
        // the page, back to 0 when it leaves). The push itself is a pure
        // function of each dot's CURRENT position — per-dot easing was
        // removed because dot objects swap visual spots at every wrap
        // (every SPACING px of travel), which desynced their state and
        // made a steady hover visibly "reset" about once a second.
        const targetStrength =
            pointerActive && !reducedMotion.matches ? 1 : 0;
        hoverStrength += (targetStrength - hoverStrength) * EASE;
        if (hoverStrength < 0.001) {
            hoverStrength = 0;
        }

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

            // Stateless push: a pure function of this dot's current
            // position, so the whole-grid wrap can never desync it.
            // The shared hoverStrength eased above provides the smooth
            // fade in/out (spring-back when the pointer leaves).
            let pushX = 0;
            let pushY = 0;
            let intensity = 0;

            if (
                !reducedMotion.matches &&
                (pointerActive || hoverStrength > 0)
            ) {
                const dx = homeX - mouseX;
                const dy = homeY - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < HOVER_RADIUS) {
                    const falloff = 1 - distance / HOVER_RADIUS;

                    // Tint follows the pointer directly; the push fades
                    // with the eased strength
                    intensity = pointerActive ? falloff * falloff : 0;

                    if (distance > 0.001 && hoverStrength > 0) {
                        // Ramp up from the cursor centre: without it, a dot
                        // crossing the exact cursor point would flip 180°
                        // and whip across it in a single frame
                        const ramp = distance < CROSS_RAMP
                            ? distance / CROSS_RAMP
                            : 1;
                        const push =
                            falloff * PUSH_DISTANCE * hoverStrength * ramp;
                        pushX = (dx / distance) * push;
                        pushY = (dy / distance) * push;
                    }
                }
            }
            dot.intensity = intensity;

            if (intensity > 0.02) {
                dot.pushX = pushX;
                dot.pushY = pushY;
                hotDots.push(dot);
                continue;
            }

            // Subtle idle breathing so the grid feels alive
            const breathe = reducedMotion.matches
                ? 0
                : Math.sin(seconds * 1.4 + dot.phase) * 0.2;
            const radius = BASE_RADIUS + breathe;
            const drawX = homeX + pushX;
            const drawY = homeY + pushY;

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
            const drawX = dot.x + gridShiftX + dot.pushX;
            const drawY = dot.y + gridShiftY + dot.pushY;

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

// Set by setupNavWave(); plays the shared dot-wave transition and fires
// its callback when the screen is fully covered (null when unavailable)
let dotWaveTrigger = null;

function setupLogoRefresh() {
    const logoLink = document.querySelector(".logo a");

    if (!logoLink) {
        return;
    }

    // Prep for a refresh that lands at the very top: stop the browser
    // from restoring the old scroll position and aim the URL at the hero
    function prepareTopReload() {
        try {
            window.history.scrollRestoration = "manual";
        } catch (error) {
            // Very old browsers: scroll restore stays as-is
        }

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
    }

    // Clicking the <CARLOS ALCANTARA/> logo plays the same left-to-right
    // dot wave as the nav, then refreshes the page behind the cover —
    // the fresh page flags itself and plays the reveal wave on boot.
    // (Without JavaScript the href="#hero" fallback just scrolls home.)
    logoLink.addEventListener("click", (event) => {
        event.preventDefault();
        prepareTopReload();

        const reduceMotion =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Wave path: refresh behind the fully covered screen
        if (!reduceMotion && dotWaveTrigger) {
            dotWaveTrigger(() => {
                // Flag the fresh page (read by the inline script in
                // index.html, which paints the cover before first paint)
                try {
                    window.sessionStorage.setItem("dot-wave-reveal", "1");
                } catch (error) {
                    // Storage unavailable — the refresh still works
                }

                window.location.reload();
            });
            return;
        }

        // Fallback (reduced motion / no wave): scroll home, then refresh
        if (window.scrollY === 0) {
            window.location.reload();
            return;
        }

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
setupNavWave();
setupThemeSlide();
setupPictureGallery();

function setupPictureGallery() {
    const gallery = document.querySelector(".about-gallery");

    if (!gallery) {
        return;
    }

    const images = Array.from(gallery.querySelectorAll(".gallery-img"));
    const prevButton = gallery.querySelector(".gallery-prev");
    const nextButton = gallery.querySelector(".gallery-next");
    const frame = gallery.querySelector(".gallery-frame");
    const waveCanvas = gallery.querySelector(".gallery-wave");

    if (images.length < 2 || !prevButton || !nextButton) {
        return;
    }

    // The dot wave runs INSIDE the picture box only — the rest of the
    // page stays fully visible while the picture swaps behind the cover
    const playPictureWave =
        frame && waveCanvas
            ? createDotWavePlayer(waveCanvas, () => ({
                  width: frame.clientWidth,
                  height: frame.clientHeight,
              }))
            : null;

    let activeIndex = 0;

    function showPicture(direction) {
        const nextIndex =
            (activeIndex + direction + images.length) % images.length;

        const swap = () => {
            images[activeIndex].classList.remove("is-active");
            images[nextIndex].classList.add("is-active");
            activeIndex = nextIndex;
        };

        const reduceMotion =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduceMotion || !playPictureWave) {
            swap();
            return;
        }

        // Same dot-wave look as the navbar, scoped to the picture box;
        // direction matches the arrow (next: left→right, prev: right→left)
        playPictureWave(swap, false, direction < 0);
    }

    prevButton.addEventListener("click", () => showPicture(-1));
    nextButton.addEventListener("click", () => showPicture(1));
}

function setupThemeSlide() {
    const panel = document.getElementById("theme-slide");

    if (!panel) {
        return;
    }

    // Slide timings: the incoming theme's background wipes across, holds
    // at full cover (the theme swap happens here), then keeps sliding off
    const IN = 240;                // slide in duration (ms)
    const HOLD = 80;               // full-cover pause (ms)
    const OUT = 240;               // slide out duration (ms)
    const OUT_START = IN + HOLD;
    const TOTAL = OUT_START + OUT;

    let slideActive = false;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function easeInCubic(t) {
        return t * t * t;
    }

    themeSlideTrigger = (target, onCover) => {
        if (slideActive) {
            return;
        }

        slideActive = true;

        // The wipe mirrors the switch: it starts on the thumb's current
        // side and travels the way the thumb moves — light: left to
        // right, dark: right to left — and keeps going straight through
        const from = target ? -100 : 100;

        panel.classList.remove("slide-to-light", "slide-to-dark");
        panel.classList.add(target ? "slide-to-light" : "slide-to-dark");

        let startTime = null;
        let covered = false;

        function step(time) {
            if (startTime === null) {
                startTime = time;
            }

            const elapsed = time - startTime;

            // Swap the theme exactly when the screen is fully covered
            if (!covered && elapsed >= IN) {
                covered = true;
                onCover();
            }

            if (elapsed >= TOTAL) {
                // Park off-screen on the side it entered from
                panel.style.transform = "translateX(" + from + "%)";
                slideActive = false;
                return;
            }

            let offset;

            if (elapsed < IN) {
                offset = from * (1 - easeOutCubic(elapsed / IN));
            } else if (elapsed < OUT_START) {
                offset = 0;
            } else {
                offset = -from * easeInCubic((elapsed - OUT_START) / OUT);
            }

            panel.style.transform = "translateX(" + offset + "%)";
            window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    };
}

// Shared dot-wave player: grows a lattice of accent dots to full cover on
// the given canvas, fires onCover at full cover, then washes away.
// getSize() supplies the area to cover — the viewport for the nav wave,
// the picture frame for the gallery.
function createDotWavePlayer(canvas, getSize) {
    const context = canvas.getContext("2d");

    // Dot-wave transition: a wavefront enters from the LEFT edge and
    // sweeps right, covering the area in dots; the change happens behind
    // the cover, then the wave keeps travelling right and washes away.
    const SPACING = 22;            // wave dot lattice (px)
    const COVER = SPACING * 0.78;  // radius that guarantees full coverage
    const WAVE_IN = 280;           // left-to-right front travel while growing (ms)
    const GROW = 130;              // per-dot grow duration (ms)
    const HOLD = 50;               // full-cover pause — the change happens here
    const WAVE_OUT = 240;          // left-to-right front travel while shrinking (ms)
    const SHRINK = 110;            // per-dot shrink duration (ms)
    const COVER_DONE = WAVE_IN + GROW;
    const OUT_START = COVER_DONE + HOLD;
    const TOTAL = OUT_START + WAVE_OUT + SHRINK;

    let waveActive = false;
    let dots = [];
    let width = 0;
    let height = 0;

    function clamp01(value) {
        return value < 0 ? 0 : value > 1 ? 1 : value;
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function buildWave() {
        const size = getSize();
        width = size.width;
        height = size.height;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Wave dots use the theme accent (red)
        const accent = getComputedStyle(document.documentElement)
            .getPropertyValue("--accent");
        context.fillStyle = (accent || "").trim() || "#ff0000";

        dots = [];

        for (let y = SPACING / 2; y < height + SPACING; y += SPACING) {
            for (let x = SPACING / 2; x < width + SPACING; x += SPACING) {
                dots.push({ x: x, y: y });
            }
        }
    }

    // Fully covered state in one synchronous draw (also guarantees the
    // cover is on screen before first paint for reveal-only runs)
    function drawCovered() {
        context.clearRect(0, 0, width, height);
        context.beginPath();

        for (let index = 0; index < dots.length; index += 1) {
            const dot = dots[index];
            context.moveTo(dot.x + COVER, dot.y);
            context.arc(dot.x, dot.y, COVER, 0, Math.PI * 2);
        }

        context.fill();
    }

    // Plays the wave. onCover fires exactly when the screen is fully
    // covered; startCovered boots already covered (reveal-only, for the
    // fresh page behind the logo's wave-refresh); fromRight makes the
    // front enter from the right edge instead of the left.
    function playWave(onCover, startCovered, fromRight) {
        if (waveActive) {
            return;
        }

        buildWave();
        waveActive = true;
        canvas.style.display = "block";

        if (startCovered) {
            drawCovered();
        }

        let startTime = null;
        let jumped = !onCover || !!startCovered;

        function step(time) {
            if (startTime === null) {
                // Reveal-only runs start mid-animation (already covered)
                startTime = time - (startCovered ? OUT_START : 0);
            }

            const elapsed = time - startTime;

            // Act exactly when the last dot has finished covering
            if (!jumped && elapsed >= COVER_DONE) {
                jumped = true;
                onCover();
            }

            if (elapsed >= TOTAL) {
                context.clearRect(0, 0, width, height);
                canvas.style.display = "none";
                waveActive = false;
                return;
            }

            context.clearRect(0, 0, width, height);
            context.beginPath();

            for (let index = 0; index < dots.length; index += 1) {
                const dot = dots[index];
                // Delay by horizontal position: the front enters from the
                // left (or the right for fromRight waves) and sweeps across
                const delay = (fromRight ? width - dot.x : dot.x) / width;
                let radius;

                if (elapsed < OUT_START) {
                    const progress = clamp01((elapsed - delay * WAVE_IN) / GROW);
                    radius = easeOutCubic(progress) * COVER;
                } else {
                    const progress = clamp01(
                        (elapsed - OUT_START - delay * WAVE_OUT) / SHRINK
                    );
                    radius = (1 - easeOutCubic(progress)) * COVER;
                }

                if (radius > 0.3) {
                    context.moveTo(dot.x + radius, dot.y);
                    context.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
                }
            }

            context.fill();
            window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    }

    // Lets callers see whether a wave is mid-flight (the nav links use it
    // to swallow clicks that would otherwise jump natively)
    playWave.isActive = () => waveActive;

    return playWave;
}

function setupNavWave() {
    const overlay = document.getElementById("wave-transition");
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    if (!overlay) {
        return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const playWave = createDotWavePlayer(overlay, () => ({
        width: window.innerWidth,
        height: window.innerHeight,
    }));

    function jumpTo(targetId) {
        const section = document.getElementById(targetId);

        if (!section) {
            return;
        }

        // Update the URL like a normal anchor click would
        try {
            if (window.location.hash !== "#" + targetId) {
                window.history.pushState(null, "", "#" + targetId);
            }
        } catch (error) {
            // file:// URLs can restrict the history API — the jump still works
        }

        // Instant jump — the dot cover hides it
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top, left: 0, behavior: "instant" });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            if (reducedMotion.matches) {
                // Reduced motion: plain anchor jump, no wave
                return;
            }

            if (playWave.isActive()) {
                // A wave is already playing — swallow the click
                event.preventDefault();
                return;
            }

            const href = link.getAttribute("href");
            const target = href && href.charAt(0) === "#" ? href.slice(1) : "";

            if (!target) {
                return;
            }

            event.preventDefault();
            playWave(() => jumpTo(target));
        });
    });

    // Shared with setupLogoRefresh — the logo plays this same wave
    dotWaveTrigger = playWave;

    // The logo's wave-refresh boots this page behind a cover (painted by
    // the inline script in index.html): play the reveal half now
    if (window.__dotWaveReveal) {
        window.__dotWaveReveal = false;

        if (window.__dotWaveRevealTimer) {
            clearTimeout(window.__dotWaveRevealTimer);
            window.__dotWaveRevealTimer = null;
        }

        playWave(null, true);
    }
}

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

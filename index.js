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

function setupEmailCopy() {
    const emailLinks = document.querySelectorAll(".email-copy");

    if (!emailLinks.length) {
        return;
    }

    emailLinks.forEach((emailLink) => {
        const email = emailLink.dataset.email;
        const defaultLabel =
            emailLink.getAttribute("aria-label") || "Copy email address";
        let resetTimer = null;

        emailLink.addEventListener("click", async (event) => {
            event.preventDefault();

            await copyEmailToClipboard(email);

            // Themed confirmation instead of a toast: the address dissolves
            // upward, "EMAIL COPIED" slides in, then it settles back on its
            // own after a beat.
            emailLink.classList.add("is-copied");
            emailLink.setAttribute("aria-label", "Email copied to clipboard");

            if (resetTimer) {
                window.clearTimeout(resetTimer);
            }

            resetTimer = window.setTimeout(() => {
                emailLink.classList.remove("is-copied");
                emailLink.setAttribute("aria-label", defaultLabel);
            }, 2200);
        });
    });
}

function setupResumeButton() {
    const resumeLinks = document.querySelectorAll(".resume-link");

    resumeLinks.forEach((resumeLink) => {
        resumeLink.addEventListener("click", (event) => {
            event.preventDefault();

            window.setTimeout(() => {
                window.open(resumeLink.href, "_blank");
            }, 250);
        });
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
            // Jump instead of gliding when the visitor asked for less motion
            behavior:
                window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth"
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
        githubLink.style.display = projectCard.dataset.github ? "" : "none";

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

const sectionViews = Array.from(document.querySelectorAll("main > section"));

// Set by setupPictureGallery(); rewinds the "Beyond Development" archive to
// its first picture each time the section is opened. Stays null until the
// gallery is set up, which is fine because the gallery starts on picture 1.
let aboutGalleryReset = null;

function showSection(id) {
    const target = sectionViews.find((section) => section.id === id) || sectionViews[0];

    if (!target) {
        return;
    }

    sectionViews.forEach((section) => {
        const isActive = section === target;
        section.classList.toggle("is-active", isActive);
        section.setAttribute("aria-hidden", String(!isActive));
    });

    // Opening the photo archive always starts over on the first picture —
    // the visitor's last position isn't saved or restored anywhere
    if (target.id === "about" && aboutGalleryReset) {
        aboutGalleryReset();
    }

    document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
        const isCurrent = link.getAttribute("href") === "#" + target.id;
        link.classList.toggle("is-current", isCurrent);

        if (isCurrent) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function setupSectionViews() {
    if (!sectionViews.length) {
        return;
    }

    showSection(window.location.hash.slice(1));

    window.addEventListener("hashchange", () => {
        showSection(window.location.hash.slice(1));
    });
}

/* The blocks that ease in one after another when their section opens.
   Leaf blocks only (no wrappers of other entries), so the fades can't
   stack on top of each other */
const CONTENT_REVEAL_SELECTOR = [
    ".hero-content > *",
    ".hero-image-wrap",
    ".project-card",
    ".timeline-item",
    ".certification-arrow",
    ".about-gallery",
    ".about-content",
    ".contact-stage",
    ".social-links .hero-social",
    ".contact-actions",
].join(", ");

/* Number each block per section, in DOM order, so the reveal ripples
   top-to-bottom. The CSS animation replays by itself every time the
   section is shown again */
function setupContentReveal() {
    document.querySelectorAll("main > section").forEach((section) => {
        section.querySelectorAll(CONTENT_REVEAL_SELECTOR).forEach((block, index) => {
            block.classList.add("content-reveal");
            block.style.setProperty("--reveal-index", String(index));
        });
    });
}


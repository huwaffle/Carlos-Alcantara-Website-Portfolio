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


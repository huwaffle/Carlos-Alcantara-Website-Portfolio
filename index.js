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


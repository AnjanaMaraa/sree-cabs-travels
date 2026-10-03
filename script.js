"use strict";

document.documentElement.classList.add("js");

const BUSINESS = {
    name: "DigiMaraa Travels",
    whatsapp: "917200251560",
    location: "Srivaikundam, Tuticorin-628 601, Tamilnadu, India"
};

const WHATSAPP_BASE_URL = "https://wa.me/";
const MOBILE_NAV_BREAKPOINT = 980;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-nav");
const toast = document.querySelector("[data-toast]");
const backToTopButton = document.querySelector("[data-back-to-top]");
let toastTimer;
let scrollFramePending = false;

function showToast(message) {
    if (!toast) {
        return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 5000);
}

function openWhatsApp(service) {
    const whatsappNumber = BUSINESS.whatsapp.replace(/\D/g, "");

    if (BUSINESS.whatsapp.includes("YOUR_PHONE_NUMBER") || whatsappNumber.length < 8) {
        showToast("WhatsApp is not configured yet. Replace YOUR_PHONE_NUMBER near the top of script.js to enable booking.");
        return;
    }

    const serviceName = String(service || "General cab booking").trim();
    const message = `Hi ${BUSINESS.name}, I would like to book a cab for ${serviceName}. Please share the details and availability.`;
    const whatsappUrl = `${WHATSAPP_BASE_URL}${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

function setMenuState(isOpen) {
    if (!header || !menuToggle) {
        return;
    }

    header.classList.toggle("menu-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

function closeMobileMenu(returnFocus = false) {
    if (!header?.classList.contains("menu-open")) {
        return;
    }

    setMenuState(false);

    if (returnFocus) {
        menuToggle.focus();
    }
}

function trapMenuFocus(event) {
    if (event.key !== "Tab" || !header?.classList.contains("menu-open") || !primaryNavigation || !menuToggle) {
        return;
    }

    const focusableElements = [menuToggle, ...primaryNavigation.querySelectorAll("a[href], button:not([disabled])")];
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

function updateScrollInterface() {
    const hasScrolled = window.scrollY > 24;

    header?.classList.toggle("is-scrolled", hasScrolled);
    backToTopButton?.classList.toggle("is-visible", window.scrollY > 650);
    scrollFramePending = false;
}

function requestScrollUpdate() {
    if (scrollFramePending) {
        return;
    }

    scrollFramePending = true;
    window.requestAnimationFrame(updateScrollInterface);
}

function scrollToTarget(target, updateHistory = true) {
    if (!target) {
        return;
    }

    target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: "start"
    });

    if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
    }

    target.focus({ preventScroll: true });

    if (updateHistory && window.location.hash !== `#${target.id}`) {
        window.history.pushState(null, "", `#${target.id}`);
    }
}

function initializeNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();
            closeMobileMenu();
            scrollToTarget(target);
        });
    });

    menuToggle?.addEventListener("click", () => {
        const shouldOpen = menuToggle.getAttribute("aria-expanded") !== "true";
        setMenuState(shouldOpen);

        if (shouldOpen) {
            window.setTimeout(() => primaryNavigation?.querySelector("a")?.focus(), 180);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu(true);
        }

        trapMenuFocus(event);
    });

    document.addEventListener("click", (event) => {
        if (!header?.classList.contains("menu-open")) {
            return;
        }

        if (!header.contains(event.target)) {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
            closeMobileMenu();
        }
    });
}

function initializeActiveNavigation() {
    const navigationLinks = [...document.querySelectorAll(".nav-link")];
    const linkedSections = navigationLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (!linkedSections.length || !("IntersectionObserver" in window)) {
        return;
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            navigationLinks.forEach((link) => {
                const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
                link.classList.toggle("is-active", isCurrent);

                if (isCurrent) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        });
    }, {
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0
    });

    linkedSections.forEach((section) => sectionObserver.observe(section));
}

function initializeRevealAnimations() {
    const revealElements = [...document.querySelectorAll("[data-reveal]")];

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
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
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08
    });

    revealElements.forEach((element) => revealObserver.observe(element));
}

function initializeFaqAccordion() {
    const faqItems = [...document.querySelectorAll(".faq-item")];

    faqItems.forEach((item) => {
        const questionButton = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        questionButton?.addEventListener("click", () => {
            const isCurrentlyOpen = questionButton.getAttribute("aria-expanded") === "true";

            faqItems.forEach((otherItem) => {
                const otherButton = otherItem.querySelector(".faq-question");
                const otherAnswer = otherItem.querySelector(".faq-answer");

                otherItem.classList.remove("is-open");
                otherButton?.setAttribute("aria-expanded", "false");

                if (otherAnswer) {
                    otherAnswer.hidden = true;
                }
            });

            if (!isCurrentlyOpen) {
                item.classList.add("is-open");
                questionButton.setAttribute("aria-expanded", "true");

                if (answer) {
                    answer.hidden = false;
                }
            }
        });
    });
}

function initializeWhatsAppButtons() {
    document.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const bookingButton = event.target.closest("[data-whatsapp]");

        if (!bookingButton) {
            return;
        }

        if (bookingButton.closest(".primary-nav")) {
            closeMobileMenu();
        }

        openWhatsApp(bookingButton.dataset.service);
    });
}

function initializeBackToTop() {
    backToTopButton?.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion.matches ? "auto" : "smooth"
        });
    });
}

function handleReducedMotionPreferenceChange() {
    if (prefersReducedMotion.matches) {
        document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
    }
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });

if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", handleReducedMotionPreferenceChange);
} else {
    prefersReducedMotion.addListener(handleReducedMotionPreferenceChange);
}

initializeNavigation();
initializeActiveNavigation();
initializeRevealAnimations();
initializeFaqAccordion();
initializeWhatsAppButtons();
initializeBackToTop();
updateScrollInterface();

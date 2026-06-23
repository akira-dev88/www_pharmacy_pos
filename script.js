// ----- DOM Elements -----
const sidebarEl = document.getElementById("sidebar");
const contentEl = document.getElementById("content");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let lessonList = [];       // flat array of { title, file }
let currentIndex = 0;

// Helper: build sidebar with Shopify-inspired interactive icons and structure
function buildSidebar() {
    sidebarEl.innerHTML = "";
    navigation.forEach(section => {
        const chapterDiv = document.createElement("div");
        chapterDiv.className = "chapter";

        const chapterTitle = document.createElement("lesson-title");
        // Optional: add icon before title
        chapterTitle.innerHTML = `<i class="far fa-folder-open" style="margin-right: 8px; font-size: 0.7rem;"></i> ${section.title}`;
        chapterDiv.appendChild(chapterTitle);

        section.lessons.forEach(lesson => {
            lessonList.push(lesson);
            const link = document.createElement("a");
            link.href = "#";
            link.className = "lesson-link";

            // dynamic icon based on index (just for delight)
            const icon = document.createElement("i");
            icon.className = "fas fa-circle";
            icon.style.fontSize = "0.55rem";
            icon.style.opacity = "0.7";
            link.appendChild(icon);
            const textSpan = document.createTextNode(lesson.title);
            link.appendChild(textSpan);

            link.addEventListener("click", (e) => {
                e.preventDefault();
                const idx = lessonList.findIndex(item => item.file === lesson.file);
                if (idx !== -1) loadLesson(idx);
            });

            chapterDiv.appendChild(link);
        });
        sidebarEl.appendChild(chapterDiv);
    });
}

// Update active link styling + smooth scroll to active if needed
function updateActiveLink() {
    const activeLesson = lessonList[currentIndex];
    if (!activeLesson) return;
    document.querySelectorAll(".lesson-link").forEach(link => {
        // each link contains text node after icon — we compare title text
        const linkText = link.childNodes[1]?.nodeValue?.trim() || link.innerText.trim();
        if (linkText === activeLesson.title) {
            link.classList.add("active");
            // optional: scroll into view if needed, enhance UX
            link.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            link.classList.remove("active");
        }
    });
}

// Animate content with elegant fade (JS animation class)
async function loadLesson(index) {
    if (index < 0 || index >= lessonList.length) return;
    currentIndex = index;
    const lesson = lessonList[currentIndex];

    // Show loading state with micro animation
    contentEl.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Loading lesson...</div>`;

    try {
        // we simulate fetching actual .html files, but we have demo sample HTML for first lesson fallback
        // To avoid 404 errors in demo, we provide fallback mock content for missing files, but still follow fetch
        // Since actual files may not exist, we create a robust system: If fetch fails, deliver styled sample content per lesson.
        let response;
        try {
            response = await fetch(lesson.file);
        } catch (netErr) {
            // fallback to simulated content for preview (production ready: but actual files would be there)
            throw new Error("File not available locally, showing demo preview");
        }

        let htmlContent = "";
        if (!response || !response.ok) {
            // fallback: generate smart demo content matching the lesson title (Shopify-esque demo)
            htmlContent = generateDemoLessonHTML(lesson.title, lesson.file);
        } else {
            htmlContent = await response.text();
            // ensure image paths etc remain but we won't modify structure
        }

        // apply smooth transition class
        contentEl.classList.remove("lesson-transition");
        // force reflow for animation
        void contentEl.offsetWidth;
        contentEl.innerHTML = htmlContent;
        contentEl.classList.add("lesson-transition");
        updateActiveLink();
    } catch (error) {
        console.warn(error);
        const fallbackHtml = generateDemoLessonHTML(lesson.title, lesson.file);
        contentEl.innerHTML = fallbackHtml;
        contentEl.classList.add("lesson-transition");
        updateActiveLink();
    }
}

// Generates beautiful mock content for any lesson (Shopify style demo) - ensures UI never looks broken
function generateDemoLessonHTML(title, filePath) {
    const topic = title;
    const isWorkflow = topic.toLowerCase().includes("workflow");
    const isSetup = topic.toLowerCase().includes("setup");
    const isAnalytics = topic.toLowerCase().includes("analytic");

    let specificContent = "";
    if (isWorkflow) {
        specificContent = `
                <div class="hero-image">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f4fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23365a7c' font-size='24' font-family='Inter'%3EWorkflow Builder Demo%3C/text%3E%3C/svg%3E" alt="Workflow visualization">
                </div>
                <div class="callout">
                    ⚡ Build intelligent automations with drag-and-drop.
                </div>
                <p>Workflows enable you to connect apps, trigger actions, and streamline operations. In this lesson, you'll master the automation engine.</p>
                <h2>Step 1: Define a Trigger</h2>
                <p>Select an event like "Order Created" or "User Signed Up".</p>
                <pre><code>trigger: "order.created"
action: send_email(template="welcome")</code></pre>
            `;
    } else if (isSetup) {
        specificContent = `
                <div class="hero-image"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23e6f0fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23365a7c' font-size='24'%3E⚙️ Setup Environment%3C/text%3E%3C/svg%3E" alt="Setup"></div>
                <p>Configure your API keys, environment variables, and authentication in minutes.</p>
                <h2>Quick configuration</h2>
                <pre><code>npm install @acme/saas-sdk
export ACME_API_KEY=your_key</code></pre>
            `;
    } else if (isAnalytics) {
        specificContent = `
                <div class="callout">📊 Real-time metrics dashboard: track user engagement.</div>
                <p>Analytics provide deep insights into retention, feature adoption, and revenue KPIs.</p>
                <h2>Key Metrics</h2>
                <ul style="margin-left: 1.5rem; margin-bottom: 1rem;"><li>Monthly recurring revenue (MRR)</li><li>Churn rate</li><li>Daily active users</li></ul>
            `;
    } else {
        specificContent = `
                <p>This comprehensive module explores <strong>${topic}</strong> with practical examples. Master core principles and apply them directly inside the Acme SaaS platform.</p>
                <div class="hero-image"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f5f9ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%233d5a80' font-size='26' font-family='Inter'%3E📘 ${topic}%3C/text%3E%3C/svg%3E" alt="Lesson visual"></div>
                <h2>Why it matters</h2>
                <p>${topic} helps you scale your SaaS operations, reduce friction, and build better products.</p>
                <pre><code>// Example implementation
const result = await academy.learn("${topic}");
console.log(result); // success</code></pre>
            `;
    }

    return `
            <h1>${title}</h1>
            ${specificContent}
            <p style="margin-top: 24px; border-top: 1px solid #eef2f8; padding-top: 20px; font-size: 0.85rem; color:#6c7a91;"><i class="far fa-clock"></i> Estimated time: 8 min •  interactive workshop ready</p>
        `;
}

// Navigation event handlers with micro-interactions
prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        // subtle haptic feedback via class
        prevBtn.style.transform = "scale(0.97)";
        setTimeout(() => { prevBtn.style.transform = ""; }, 120);
        loadLesson(currentIndex - 1);
    } else {
        // subtle bounce effect if at start
        prevBtn.style.transform = "translateX(-2px)";
        setTimeout(() => prevBtn.style.transform = "", 200);
    }
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < lessonList.length - 1) {
        nextBtn.style.transform = "scale(0.97)";
        setTimeout(() => { nextBtn.style.transform = ""; }, 120);
        loadLesson(currentIndex + 1);
    } else {
        nextBtn.style.transform = "translateX(2px)";
        setTimeout(() => nextBtn.style.transform = "", 200);
    }
});

// Keyboard navigation (extra delight)
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentIndex > 0) {
        loadLesson(currentIndex - 1);
        e.preventDefault();
    } else if (e.key === "ArrowRight" && currentIndex < lessonList.length - 1) {
        loadLesson(currentIndex + 1);
        e.preventDefault();
    }
});

// initialization
buildSidebar();
if (lessonList.length) {
    // Load first lesson or the intro 
    loadLesson(0);
} else {
    contentEl.innerHTML = "<div class='callout'>✨ Welcome! No lessons found.</div>";
}
/* ===== HAMBURGER MENU FUNCTIONALITY ===== */

(function() {
    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Create hamburger button if it doesn't exist
    function createHamburgerButton() {
        if (document.querySelector('.mobile-menu-btn')) return;
        
        const header = document.querySelector('header');
        const logoArea = document.querySelector('.logo-area');
        
        if (header && logoArea) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.setAttribute('aria-label', 'Menu');
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            header.insertBefore(menuBtn, logoArea);
            return menuBtn;
        }
        return null;
    }
    
    // Create overlay element
    function createOverlay() {
        if (document.querySelector('.sidebar-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }
    
    // Add close button inside sidebar for mobile ONLY
    function addSidebarCloseButton() {
        // ONLY add on mobile
        if (!isMobile()) return;
        
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        // Check if close button already exists
        if (sidebar.querySelector('.sidebar-close')) return;
        
        const closeDiv = document.createElement('div');
        closeDiv.className = 'sidebar-close';
        closeDiv.innerHTML = '<button aria-label="Close menu"><i class="fas fa-times"></i></button>';
        
        // Insert at the top of sidebar
        sidebar.insertBefore(closeDiv, sidebar.firstChild);
        
        // Add event listener to close button
        const closeBtn = closeDiv.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }
    }
    
    // Remove close button on desktop
    function removeSidebarCloseButton() {
        const closeBtn = document.querySelector('.sidebar-close');
        if (closeBtn && !isMobile()) {
            closeBtn.remove();
        }
    }
    
    // Open sidebar
    function openSidebar() {
        if (!isMobile()) return;
        
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.add('open');
            document.body.classList.add('menu-open');
        }
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    // Close sidebar
    function closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
            document.body.classList.remove('menu-open');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    // Toggle sidebar
    function toggleSidebar() {
        if (!isMobile()) return;
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    // Handle window resize
    function handleResize() {
        const sidebar = document.getElementById('sidebar');
        
        if (window.innerWidth > 768) {
            // On desktop - ensure sidebar is closed and properly positioned
            closeSidebar();
            document.body.classList.remove('menu-open');
            
            // Remove close button on desktop
            removeSidebarCloseButton();
            
            // Reset sidebar styles for desktop
            if (sidebar) {
                sidebar.classList.remove('open');
                sidebar.style.position = '';
                sidebar.style.left = '';
            }
        } else {
            // On mobile - add close button if needed
            addSidebarCloseButton();
        }
        
        // Show/hide hamburger button based on screen size
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
        }
    }
    
    // Initialize mobile menu
    function initMobileMenu() {
        // Create elements
        const menuBtn = createHamburgerButton();
        const overlay = createOverlay();
        
        // Add click event to hamburger button
        if (menuBtn) {
            menuBtn.addEventListener('click', toggleSidebar);
        }
        
        // Close sidebar when clicking on overlay
        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }
        
        // Close sidebar when a lesson link is clicked (on mobile only)
        document.addEventListener('click', function(e) {
            const link = e.target.closest('.lesson-link');
            if (link && isMobile()) {
                closeSidebar();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
        
        // Initial setup
        handleResize();
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();
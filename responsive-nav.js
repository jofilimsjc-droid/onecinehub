// Mobile Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileNavigation();
    setupViewportForWebView();
    handleOrientationChange();
});

function initializeMobileNavigation() {
    // Add mobile navigation toggle to admin panel
    if (document.querySelector('.sidebar')) {
        addMobileNavToggle();
    }
    
    // Initialize responsive tables
    makeTablesResponsive();
    
    // Initialize touch-friendly interactions
    optimizeForTouch();
}

function addMobileNavToggle() {
    const header = document.querySelector('header');
    const sidebar = document.querySelector('.sidebar');
    
    if (!header || !sidebar) return;
    
    // Create mobile nav toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-nav-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Add to header
    header.querySelector('.flex.items-center')?.prepend(toggleBtn);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-mobile-overlay';
    document.body.appendChild(overlay);
    
    // Toggle sidebar
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-menu-open');
        overlay.classList.toggle('active');
        document.body.classList.toggle('mobile-menu-open');
        
        // Change icon
        const icon = toggleBtn.querySelector('i');
        if (sidebar.classList.contains('mobile-menu-open')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
    
    // Close on overlay click
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-menu-open');
        overlay.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        toggleBtn.querySelector('i').className = 'fas fa-bars';
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('mobile-menu-open')) {
            sidebar.classList.remove('mobile-menu-open');
            overlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            toggleBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
}

function makeTablesResponsive() {
    // Wrap all tables in responsive container
    document.querySelectorAll('table').forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
    
    // Create mobile card view for small screens
    if (window.innerWidth <= 640) {
        createMobileCardView();
    }
}

function createMobileCardView() {
    // Convert tables to cards on mobile
    document.querySelectorAll('table').forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return;
        
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
    });
}

function optimizeForTouch() {
    // Increase touch target sizes for interactive elements
    document.querySelectorAll('button, .nav-link, .action-btn, [role="button"]').forEach(el => {
        if (window.innerWidth <= 768) {
            el.style.minHeight = '44px';
            el.style.minWidth = '44px';
        }
    });
    
    // Prevent zoom on double tap
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Improve scroll performance
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.modal-content') || e.target.closest('.table-responsive')) {
            e.stopPropagation();
        }
    }, { passive: true });
}

function setupViewportForWebView() {
    // Ensure proper viewport for WebView
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        document.head.appendChild(viewport);
    }
    
    // Add WebView specific styles
    const style = document.createElement('style');
    style.textContent = `
        /* WebView optimizations */
        body {
            -webkit-tap-highlight-color: rgba(229, 9, 20, 0.3);
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        input, textarea {
            -webkit-user-select: text;
            user-select: text;
            font-size: 16px !important; /* Prevent zoom on focus */
        }
        
        /* Hide scrollbars for cleaner look */
        ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--primary-red);
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

function handleOrientationChange() {
    window.addEventListener('resize', () => {
        // Debounce resize events
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(() => {
            makeTablesResponsive();
            optimizeForTouch();
        }, 250);
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            makeTablesResponsive();
            optimizeForTouch();
        }, 200);
    });
}

// Export functions for use in other scripts
window.responsiveUtils = {
    makeTablesResponsive,
    optimizeForTouch,
    setupViewportForWebView
};
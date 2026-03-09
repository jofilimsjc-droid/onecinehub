/**
 * Password Toggle Functionality for Admin Login
 * Handles show/hide password with multiple toggle methods
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePasswordToggle();
});

/**
 * Initialize all password toggle functionality
 */
function initializePasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    const toggleMainBtn = document.getElementById('togglePasswordMainBtn');
    const hideAllBtn = document.getElementById('hideAllBtn');
    const showAllBtn = document.getElementById('showAllBtn');
    
    if (!passwordInput || !toggleBtn) return;
    
    // Set initial state
    toggleBtn.setAttribute('data-state', 'hidden');
    toggleBtn.setAttribute('title', 'Show password (Ctrl+Shift+P)');
    
    // Event Listeners
    toggleBtn.addEventListener('click', function() {
        toggleSinglePassword(passwordInput, toggleBtn);
    });
    
    if (toggleMainBtn) {
        toggleMainBtn.addEventListener('click', function() {
            toggleSinglePassword(passwordInput, toggleBtn);
        });
    }
    
    if (hideAllBtn) {
        hideAllBtn.addEventListener('click', function() {
            setPasswordVisibility('hide');
        });
    }
    
    if (showAllBtn) {
        showAllBtn.addEventListener('click', function() {
            setPasswordVisibility('show');
        });
    }
    
    // Keyboard shortcut (Ctrl+Shift+P)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            toggleSinglePassword(passwordInput, toggleBtn);
        }
    });
    
    // Right-click toggle
    passwordInput.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        toggleSinglePassword(passwordInput, toggleBtn);
        return false;
    });
    
    // Check for browser autofill
    setTimeout(checkBrowserAutofill, 500);
}

/**
 * Toggle single password field
 */
function toggleSinglePassword(inputElement, toggleButton) {
    if (!inputElement || !toggleButton) return;
    
    const icon = toggleButton.querySelector('i');
    const isPassword = inputElement.type === 'password';
    
    // Toggle input type
    inputElement.type = isPassword ? 'text' : 'password';
    
    // Update icon
    if (icon) {
        if (isPassword) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            toggleButton.setAttribute('data-state', 'visible');
            toggleButton.setAttribute('title', 'Hide password (Ctrl+Shift+P)');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            toggleButton.setAttribute('data-state', 'hidden');
            toggleButton.setAttribute('title', 'Show password (Ctrl+Shift+P)');
        }
    }
    
    // Add animation
    inputElement.classList.add('password-toggle-animation');
    setTimeout(() => {
        inputElement.classList.remove('password-toggle-animation');
    }, 200);
    
    // Update floating buttons
    updateFloatingButtons(inputElement.type === 'password' ? 'hide' : 'show');
}

/**
 * Set password visibility to specific state
 */
function setPasswordVisibility(state) {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    
    if (!passwordInput || !toggleBtn) return;
    
    const shouldShow = state === 'show';
    const isCurrentlyHidden = passwordInput.type === 'password';
    
    if ((shouldShow && isCurrentlyHidden) || (!shouldShow && !isCurrentlyHidden)) {
        toggleSinglePassword(passwordInput, toggleBtn);
    }
}

/**
 * Update floating buttons active state
 */
function updateFloatingButtons(activeState) {
    const hideBtn = document.getElementById('hideAllBtn');
    const showBtn = document.getElementById('showAllBtn');
    
    if (!hideBtn || !showBtn) return;
    
    if (activeState === 'hide') {
        hideBtn.classList.add('active');
        showBtn.classList.remove('active');
    } else {
        showBtn.classList.add('active');
        hideBtn.classList.remove('active');
    }
}

/**
 * Check if browser autofilled and showed password
 */
function checkBrowserAutofill() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    
    if (!passwordInput || !toggleBtn) return;
    
    // Some browsers might change the input type
    if (passwordInput.type === 'text') {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
        toggleBtn.setAttribute('data-state', 'visible');
        toggleBtn.setAttribute('title', 'Hide password (Ctrl+Shift+P)');
        updateFloatingButtons('show');
    } else {
        updateFloatingButtons('hide');
    }
}

/**
 * Optional: Password strength indicator (can be enabled if needed)
 */
function enablePasswordStrength() {
    const passwordInput = document.getElementById('password');
    
    if (!passwordInput) return;
    
    // Create strength indicator element
    const strengthDiv = document.createElement('div');
    strengthDiv.className = 'password-strength';
    strengthDiv.innerHTML = `
        <div class="strength-bar">
            <div class="strength-bar-fill" id="strengthBarFill"></div>
        </div>
        <span class="strength-text" id="strengthText">Password strength</span>
    `;
    
    // Insert after password container
    passwordInput.parentElement.after(strengthDiv);
    
    // Add input event listener
    passwordInput.addEventListener('input', function(e) {
        checkPasswordStrength(e.target.value);
    });
}

/**
 * Check password strength (optional)
 */
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBarFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar || !strengthText) return;
    
    if (password.length === 0) {
        document.querySelector('.password-strength').style.display = 'none';
        return;
    }
    
    document.querySelector('.password-strength').style.display = 'block';
    
    let strength = 0;
    
    // Check criteria
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!%*?]+/)) strength++;
    
    // Remove all classes
    strengthBar.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    
    if (password.length < 6) {
        strengthBar.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak - Too short';
    } else if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak - Add complexity';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Medium - Good enough';
    } else {
        strengthBar.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Strong - Excellent';
    }
}

// Export functions if using modules (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleSinglePassword,
        setPasswordVisibility,
        updateFloatingButtons
    };
}
// public/js/auth.js

// Load hostels on registration page
async function loadHostels() {
    const hostelSelect = document.getElementById('hostel_id');
    if (!hostelSelect) return;
    
    try {
        const response = await fetch('/api/auth/hostels');
        const hostels = await response.json();
        
        // Clear existing options except the first one
        while (hostelSelect.options.length > 1) {
            hostelSelect.remove(1);
        }
        
        // Add hostel options
        hostels.forEach(hostel => {
            const option = document.createElement('option');
            option.value = hostel.name;
            option.textContent = hostel.name;
            hostelSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading hostels:', error);
        // Fallback: manually add the 4 hostels
        const hostelsList = ['Abrar Fahad Hall', 'Osman Hadi Hall', 'Mannan Hall', 'Zia Hall'];
        hostelsList.forEach(hostel => {
            const option = document.createElement('option');
            option.value = hostel;
            option.textContent = hostel;
            hostelSelect.appendChild(option);
        });
    }
}

// Handle login form submission
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/dashboard';
                    }
                }, 1000);
            } else {
                showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Handle registration form submission
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            full_name: document.getElementById('full_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            hostel_id: document.getElementById('hostel_id').value
        };
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Registration successful! Please login.', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Handle logout
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        });
    }
    
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        });
    }
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Protected pages that require authentication
    const protectedPages = ['/dashboard', '/admin'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.includes(currentPath)) {
        if (!token) {
            window.location.href = '/login';
            return false;
        }
        
        // Check role-based access
        if (currentPath === '/admin' && user.role !== 'admin') {
            window.location.href = '/dashboard';
            return false;
        }
        
        if (currentPath === '/dashboard' && user.role === 'admin') {
            window.location.href = '/admin';
            return false;
        }
    }
    
    return true;
}

// Display user info in dashboard
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById('userName');
    const userHostelElement = document.getElementById('userHostel');
    
    if (userNameElement) {
        userNameElement.textContent = user.full_name || user.username;
    }
    
    if (userHostelElement && user.hostel_name) {
        userHostelElement.textContent = `Hostel: ${user.hostel_name}`;
    }
}

function showMessage(message, type) {
    const container = type === 'success' ? 'successMessage' : 'errorMessage';
    const element = document.getElementById(container);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => {
            element.classList.remove('show');
        }, 3000);
    }
}

// Initialize all auth functionality
document.addEventListener('DOMContentLoaded', () => {
    loadHostels();
    initLoginForm();
    initRegisterForm();
    initLogout();
    checkAuth();
    displayUserInfo();
});
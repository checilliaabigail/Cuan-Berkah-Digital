// ============================================================
// AUTH.JS - Autentikasi & API Calls
// Cuan Berkah Digital
// ============================================================

const API_BASE = 'http://127.0.0.1:8000/api/auth';

// Cek apakah user sudah login
function isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return token !== null && token !== '';
}

// Ambil data user dari localStorage
function getUser() {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

// Ambil token
function getToken() {
    return localStorage.getItem('access_token');
}

// Register
async function registerUser(username, email, phone, password, passwordConfirm) {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                phone,
                password,
                password_confirm: passwordConfirm
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return { success: true, data };
        } else {
            let errorMsg = 'Register gagal. Coba lagi.';
            if (data.errors) {
                const firstKey = Object.keys(data.errors)[0];
                const firstMsg = data.errors[firstKey];
                errorMsg = Array.isArray(firstMsg) ? firstMsg[0] : firstMsg;
            } else if (data.error) {
                errorMsg = data.error;
            }
            return { success: false, error: errorMsg };
        }
    } catch (error) {
        return { success: false, error: 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.' };
    }
}

// Login
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, data };
        } else {
            const errorMsg = data.error || data.detail || 'Email atau password salah.';
            return { success: false, error: errorMsg };
        }
    } catch (error) {
        return { success: false, error: 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.' };
    }
}

// Logout
function logoutUser() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/frontend/login.html';
}

// Fetch dengan Authorization header
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const defaultOptions = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        }
    };
    const response = await fetch(url, defaultOptions);

    if (response.status === 401) {
        logoutUser();
        return null;
    }
    return response;
}
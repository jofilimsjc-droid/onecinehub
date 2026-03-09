<?php
require_once 'config.php';

// Redirect if already logged in
if (isAdminLoggedIn()) {
    redirect('admin_dashboard.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ONECINEHUB - Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <!-- Login Screen -->
    <div class="flex items-center justify-center min-h-screen">
        <div class="glass-card p-8 max-w-md w-full mx-4">
            <h2 class="text-4xl font-black mb-4 text-center gradient-text">Admin Login</h2>
            
            <?php if (isset($_SESSION['admin_error'])): ?>
                <div class="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
                    <?= htmlspecialchars($_SESSION['admin_error']) ?>
                </div>
                <?php unset($_SESSION['admin_error']); ?>
            <?php endif; ?>
            
            <form action="auth.php" method="POST" id="loginForm">
                <input type="hidden" name="action" value="admin_login">
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-2 text-gray-300">Email</label>
                    <input type="email" name="email" id="email" class="w-full" required>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-2 text-gray-300">Password</label>
                    <div class="password-container">
                        <input type="password" name="password" id="password" class="w-full" required>
                        <button type="button" class="password-toggle" id="togglePasswordBtn" data-state="hidden">
                            <i class="fa-regular fa-eye-slash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="remember-me">
                    <input type="checkbox" name="remember" id="remember">
                    <label for="remember">Remember me</label>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                </div>
                
                <button type="submit" class="action-btn w-full py-3">Login</button>
            </form>

    <script src="admin-password.js"></script>
</body>
</html>
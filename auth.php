<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('index.php');
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'register':
        handleRegister();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'admin_login':
        handleAdminLogin();
        break;
    case 'admin_logout':
        handleAdminLogout();
        break;
    default:
        redirect('index.php');
}

function handleLogin() {
    global $pdo;
    
    $emailOrUsername = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($emailOrUsername) || empty($password)) {
        $_SESSION['error'] = 'Please fill in all fields.';
        redirect('index.php');
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$emailOrUsername, $emailOrUsername]);
    $user = $stmt->fetch();
    
    if (!$user || $password !== $user['password']) {
        $_SESSION['error'] = 'Invalid email/username or password.';
        redirect('index.php');
    }
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    
    // Add welcome notification
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
    $stmt->execute([$user['id'], "Welcome back, {$user['username']}!"]);
    
    redirect('dashboard.php');
}

function handleRegister() {
    global $pdo;
    
    $username = sanitize($_POST['username'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
        $_SESSION['error'] = 'Please fill in all fields.';
        redirect('index.php');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !str_ends_with($email, '@gmail.com')) {
        $_SESSION['error'] = 'Invalid email. Only Gmail addresses are allowed.';
        redirect('index.php');
    }
    
    if (strlen($password) < 8) {
        $_SESSION['error'] = 'Password must be at least 8 characters long.';
        redirect('index.php');
    }
    
    if ($password !== $confirmPassword) {
        $_SESSION['error'] = 'Passwords do not match.';
        redirect('index.php');
    }
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        $_SESSION['error'] = 'User already exists with this email or username.';
        redirect('index.php');
    }
    
    // Create new user
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $password]);
    
    $_SESSION['success'] = 'Registration successful! Please log in.';
    redirect('index.php');
}

function handleLogout() {
    session_destroy();
    redirect('index.php');
}

function handleAdminLogin() {
    global $pdo;
    
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $_SESSION['admin_error'] = 'Please fill in all fields.';
        redirect('admin.php');
    }
    
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    
    if (!$admin || $password !== $admin['password']) {
        $_SESSION['admin_error'] = 'Invalid credentials.';
        redirect('admin.php');
    }
    
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_email'] = $admin['email'];
    
    redirect('admin_dashboard.php');
}

function handleAdminLogout() {
    unset($_SESSION['admin_id']);
    unset($_SESSION['admin_email']);
    redirect('admin.php');
}
?>
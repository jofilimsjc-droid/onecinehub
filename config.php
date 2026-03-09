<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'onecinehub');

// Application settings
define('SITE_URL', 'http://172.20.10.8/onecinehub');
define('SESSION_TIMEOUT', 3600); // 1 hour

// Start session
session_start();

// Database connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Helper functions
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isAdminLoggedIn() {
    return isset($_SESSION['admin_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: index.php');
        exit();
    }
}

function requireAdminLogin() {
    if (!isAdminLoggedIn()) {
        header('Location: admin.php');
        exit();
    }
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function redirect($url) {
    header("Location: $url");
    exit();
}
?>
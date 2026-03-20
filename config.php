<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'onecinehub_db');

// Application settings
if (!defined('SITE_URL')) {
    define('SITE_URL', 'http://192.168.1.8/onecinehub');
}

define('SESSION_TIMEOUT', 3600); // 1 hour

// Password reset (OTP) + SMTP email settings
// Note: Gmail does not allow sending "from" the user's own inbox account programmatically.
// This sends the OTP to the user's registered email address, using ONECINEHUB's SMTP account.
define('OTP_EXPIRY_MINUTES', (int)(getenv('OTP_EXPIRY_MINUTES') ?: 10));

define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 587));
define('SMTP_USERNAME', getenv('SMTP_USERNAME') ?: 'johmmarklim18@gmail.com');
define('SMTP_PASSWORD', getenv('SMTP_PASSWORD') ?: 'elca whpo udzd ojoq'); // Use Gmail App Password
define('SMTP_FROM_EMAIL', getenv('SMTP_FROM_EMAIL') ?: 'johmmarklim18@gmail.com');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'ONECINEHUB');
define('SMTP_USE_STARTTLS', true);

// Start session
session_start();

// Database connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    ensureSchema($pdo);
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

function ensureSchema(PDO $pdo) {
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'phone'");
        $col = $stmt->fetch();
        if (!$col) {
            $pdo->exec("ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL DEFAULT NULL");
        }
    } catch (Throwable $e) {
        // ignore errors
    }
}

function redirect($url) {
    header("Location: $url");
    exit();
}
?>
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'onecinehub');

// Application settings
define('SITE_URL', 'http://192.168.1.232/onecinehub');
define('SESSION_TIMEOUT', 3600); // 1 hour

// Start session
session_start();

// Database connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Lightweight schema sync for critical columns used by the app.
    // This keeps older DB dumps working without manual ALTERs.
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
    // users.phone (used by mobile/web settings screens)
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'phone'");
        $col = $stmt->fetch();
        if (!$col) {
            $pdo->exec("ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL DEFAULT NULL");
        }
    } catch (Throwable $e) {
        // If this fails (permissions, missing table), don't break the app startup.
    }
}

function redirect($url) {
    header("Location: $url");
    exit();
}
?>
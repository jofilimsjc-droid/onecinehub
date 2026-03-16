<?php
/**
 * Mobile API - Token-based auth for React Native / Expo
 * Supports all mobile app features with token-based authentication
 */
require_once 'config.php';

// Prevent any HTML error output
ob_start();

// Set JSON headers first
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Enable error reporting for debugging (but log instead of display)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set custom error handler to return JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
    exit;
});

// Set exception handler
set_exception_handler(function($exception) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
    exit;
});

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? '';

// Get token from header
$token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';

// Helper function to get user from token
function getUserFromToken($pdo, $token) {
    if (empty($token)) return null;
    
    $stmt = $pdo->prepare("
        SELECT u.* FROM users u
        JOIN user_tokens t ON u.id = t.user_id
        WHERE t.token = ? AND t.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    return $stmt->fetch();
}

// Get current user
$currentUser = null;
if (!empty($token)) {
    $currentUser = getUserFromToken($pdo, $token);
}

try {
    switch ($action) {
        // Auth actions
        case 'login':
            handleMobileLogin($input);
            break;
        case 'register':
            handleMobileRegister($input);
            break;
        case 'logout':
            handleMobileLogout($input);
            break;
        case 'check_auth':
            handleCheckAuth($currentUser);
            break;
            
        // Movie actions
        case 'get_movies':
            handleGetMovies();
            break;
        case 'get_movie':
            handleGetMovie($input);
            break;
        case 'get_cinemas':
            handleGetCinemas();
            break;
        case 'get_schedules':
            handleGetSchedules($input);
            break;
        case 'get_trailers':
            handleGetTrailers();
            break;
            
        // User actions
        case 'toggle_favorite':
            handleToggleFavorite($input, $currentUser);
            break;
        case 'get_notifications':
            handleGetNotifications($currentUser);
            break;
        case 'mark_notification_read':
            handleMarkNotificationRead($input, $currentUser);
            break;
        case 'mark_all_notifications_read':
            handleMarkAllNotificationsRead($currentUser);
            break;
            
        // Booking actions
        case 'create_booking':
            handleCreateBooking($input, $currentUser);
            break;
        case 'get_occupied_seats':
            handleGetOccupiedSeats($input);
            break;
        case 'get_booking_history':
            handleGetBookingHistory($currentUser);
            break;
            
        // Profile actions
        case 'update_profile':
            handleUpdateProfile($input, $currentUser);
            break;
        case 'change_password':
            handleChangePassword($input, $currentUser);
            break;
            
        default:
            jsonResponse(['success' => false, 'message' => 'Invalid action: ' . $action], 400);
    }
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
}

function handleMobileLogin($input) {
    global $pdo;
    
    $emailOrUsername = trim($input['email'] ?? $input['emailOrUsername'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($emailOrUsername) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'Please fill in all fields.'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$emailOrUsername, $emailOrUsername]);
    $user = $stmt->fetch();
    
    if (!$user || $password !== $user['password']) {
        jsonResponse(['success' => false, 'message' => 'Invalid email/username or password.'], 401);
    }
    
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
    
    // Create tokens table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $stmt = $pdo->prepare("INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], $token, $expiresAt]);
    
    unset($user['password']);
    if (isset($user['registration_date']) && !isset($user['created_at'])) {
        $user['created_at'] = $user['registration_date'];
    }
    jsonResponse([
        'success' => true,
        'user' => $user,
        'token' => $token,
        'message' => 'Login successful'
    ]);
}

function handleMobileRegister($input) {
    global $pdo;
    
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';
    
    // Validation
    if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
        jsonResponse(['success' => false, 'message' => 'Please fill in all fields.'], 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['success' => false, 'message' => 'Invalid email format.'], 400);
    }
    
    if (!str_ends_with(strtolower($email), '@gmail.com')) {
        jsonResponse(['success' => false, 'message' => 'Only Gmail addresses are allowed.'], 400);
    }
    
    if (strlen($password) < 8) {
        jsonResponse(['success' => false, 'message' => 'Password must be at least 8 characters long.'], 400);
    }
    
    if ($password !== $confirmPassword) {
        jsonResponse(['success' => false, 'message' => 'Passwords do not match.'], 400);
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username) || strlen($username) < 3 || strlen($username) > 50) {
        jsonResponse(['success' => false, 'message' => 'Invalid username. Use 3-50 characters, letters, numbers, underscores only.'], 400);
    }
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'User already exists with this email or username.'], 400);
    }
    
    // Insert user
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, registration_date) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$username, $email, $password]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
    
    $userId = $pdo->lastInsertId();
    
    // Get the created user
    $stmt = $pdo->prepare("SELECT id, username, email, phone, registration_date AS created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Failed to retrieve user data.'], 500);
    }
    
    // Create token
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
    
    // Create tokens table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $stmt = $pdo->prepare("INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $token, $expiresAt]);
    
    jsonResponse([
        'success' => true,
        'user' => $user,
        'token' => $token,
        'message' => 'Registration successful'
    ]);
}

function handleMobileLogout($input) {
    global $pdo;
    
    $token = $input['token'] ?? $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
    
    if (!empty($token)) {
        try {
            $stmt = $pdo->prepare("DELETE FROM user_tokens WHERE token = ?");
            $stmt->execute([$token]);
        } catch (PDOException $e) {
            // Ignore
        }
    }
    
    jsonResponse(['success' => true, 'message' => 'Logged out']);
}

function handleCheckAuth($currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse([
            'user' => null,
            'favorites' => [],
            'bookingHistory' => [],
            'notifications' => []
        ]);
    }
    
    $userId = $currentUser['id'];
    
    // Get favorites
    $stmt = $pdo->prepare("SELECT movie_id FROM favorites WHERE user_id = ?");
    $stmt->execute([$userId]);
    $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Get booking history
    $stmt = $pdo->prepare("
        SELECT b.*, m.title as movie_title, m.poster as movie_poster 
        FROM bookings b 
        JOIN movies m ON b.movie_id = m.id 
        WHERE b.user_id = ? 
        ORDER BY b.booking_date DESC
    ");
    $stmt->execute([$userId]);
    $bookings = $stmt->fetchAll();
    
    $bookingHistory = array_map(function($b) {
        return [
            'id' => $b['id'],
            'movie_id' => $b['movie_id'],
            'tx_number' => $b['tx_number'],
            'branch' => $b['branch'],
            'date' => $b['date'],
            'time' => $b['time'],
            'seats' => json_decode($b['seats'] ?? '[]', true),
            'total_price' => $b['total_price'],
            'movie' => [
                'id' => $b['movie_id'],
                'title' => $b['movie_title'],
                'poster' => $b['movie_poster'],
            ],
        ];
    }, $bookings);
    
    // Get notifications
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();
    
    unset($currentUser['password']);
    if (isset($currentUser['registration_date']) && !isset($currentUser['created_at'])) {
        $currentUser['created_at'] = $currentUser['registration_date'];
    }
    
    jsonResponse([
        'user' => $currentUser,
        'favorites' => $favorites,
        'bookingHistory' => $bookingHistory,
        'notifications' => $notifications,
    ]);
}

function handleGetMovies() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM movies ORDER BY created_at DESC");
    $movies = $stmt->fetchAll();
    jsonResponse($movies);
}

function handleGetMovie($input) {
    global $pdo;
    $id = $input['id'] ?? $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ?");
    $stmt->execute([$id]);
    $movie = $stmt->fetch();
    
    if ($movie) {
        jsonResponse($movie);
    } else {
        jsonResponse(['success' => false, 'message' => 'Movie not found'], 404);
    }
}

function handleGetCinemas() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM cinemas ORDER BY name");
    $cinemas = $stmt->fetchAll();
    jsonResponse($cinemas);
}

function handleGetSchedules($input) {
    global $pdo;
    $movieId = $input['movie_id'] ?? $_GET['movie_id'] ?? null;
    
    if ($movieId) {
        $stmt = $pdo->prepare("
            SELECT s.*, c.name as cinema_name, c.location as cinema_location 
            FROM schedules s 
            JOIN cinemas c ON s.cinema_id = c.id 
            WHERE s.movie_id = ? 
            ORDER BY s.date, s.created_at
        ");
        $stmt->execute([$movieId]);
    } else {
        $stmt = $pdo->query("
            SELECT s.*, m.title as movie_title, c.name as cinema_name 
            FROM schedules s 
            JOIN movies m ON s.movie_id = m.id 
            JOIN cinemas c ON s.cinema_id = c.id 
            ORDER BY s.date DESC
        ");
    }
    
    $schedules = $stmt->fetchAll();
    jsonResponse($schedules);
}

function handleGetTrailers() {
    global $pdo;
    $stmt = $pdo->query("
        SELECT t.*, m.title as movie_title, m.status as movie_status 
        FROM trailers t 
        JOIN movies m ON t.movie_id = m.id 
        ORDER BY t.created_at DESC
    ");
    $trailers = $stmt->fetchAll();
    jsonResponse($trailers);
}

function handleToggleFavorite($input, $currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $movieId = $input['movie_id'] ?? 0;
    $userId = $currentUser['id'];
    
    if (!$movieId) {
        jsonResponse(['success' => false, 'message' => 'Movie ID required'], 400);
    }
    
    // Check if already favorited
    $stmt = $pdo->prepare("SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?");
    $stmt->execute([$userId, $movieId]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Remove from favorites
        $stmt = $pdo->prepare("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?");
        $stmt->execute([$userId, $movieId]);
        jsonResponse(['success' => true, 'favorited' => false, 'message' => 'Removed from favorites']);
    } else {
        // Add to favorites
        $stmt = $pdo->prepare("INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)");
        $stmt->execute([$userId, $movieId]);
        jsonResponse(['success' => true, 'favorited' => true, 'message' => 'Added to favorites']);
    }
}

function handleGetNotifications($currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$currentUser['id']]);
    $notifications = $stmt->fetchAll();
    
    jsonResponse($notifications);
}

function handleMarkNotificationRead($input, $currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $notificationId = $input['notification_id'] ?? 0;
    
    if (!$notificationId) {
        jsonResponse(['success' => false, 'message' => 'Notification ID required'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
    $stmt->execute([$notificationId, $currentUser['id']]);
    
    jsonResponse(['success' => true]);
}

function handleMarkAllNotificationsRead($currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmt->execute([$currentUser['id']]);
    
    jsonResponse(['success' => true]);
}

function handleCreateBooking($input, $currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $movieId = $input['movie_id'] ?? 0;
    $cinemaId = $input['cinema_id'] ?? 0;
    $date = $input['date'] ?? '';
    $time = $input['time'] ?? '';
    $seats = $input['seats'] ?? [];
    $totalPrice = $input['total_price'] ?? 0;
    $paymentMethod = $input['payment_method'] ?? '';
    $branch = $input['branch'] ?? '';
    
    if (!$movieId || !$date || !$time || empty($seats)) {
        jsonResponse(['success' => false, 'message' => 'Missing required booking information'], 400);
    }
    
    // Generate transaction number
    $txNumber = 'OHC-' . time() . rand(100, 999);
    
    try {
        $pdo->beginTransaction();
        
        // Create booking
        $stmt = $pdo->prepare("
            INSERT INTO bookings (user_id, movie_id, cinema_id, tx_number, branch, date, time, seats, total_price, payment_method) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $currentUser['id'],
            $movieId,
            $cinemaId,
            $txNumber,
            $branch,
            $date,
            $time,
            json_encode($seats),
            $totalPrice,
            $paymentMethod
        ]);
        
        $bookingId = $pdo->lastInsertId();
        
        // Mark seats as occupied
        $scheduleKey = "{$movieId}_{$branch}_{$date}_{$time}";
        foreach ($seats as $seat) {
            $stmt = $pdo->prepare("
                INSERT INTO occupied_seats (schedule_key, seat_id, booking_id) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$scheduleKey, $seat, $bookingId]);
        }
        
        // Add notification
        $stmt = $pdo->prepare("SELECT title FROM movies WHERE id = ?");
        $stmt->execute([$movieId]);
        $movie = $stmt->fetch();
        
        $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
        $stmt->execute([
            $currentUser['id'],
            "Ticket for {$movie['title']} confirmed! Booking ID: {$txNumber}"
        ]);
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'tx_number' => $txNumber,
            'message' => 'Booking created successfully'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollback();
        jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

function handleGetOccupiedSeats($input) {
    global $pdo;
    
    $movieId = $input['movie_id'] ?? $_GET['movie_id'] ?? 0;
    $branch = $input['branch'] ?? $_GET['branch'] ?? '';
    $date = $input['date'] ?? $_GET['date'] ?? '';
    $time = $input['time'] ?? $_GET['time'] ?? '';
    
    if (!$movieId || !$branch || !$date || !$time) {
        jsonResponse([]);
        return;
    }
    
    $scheduleKey = "{$movieId}_{$branch}_{$date}_{$time}";
    
    $stmt = $pdo->prepare("SELECT seat_id FROM occupied_seats WHERE schedule_key = ?");
    $stmt->execute([$scheduleKey]);
    $occupiedSeats = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    jsonResponse($occupiedSeats);
}

function handleGetBookingHistory($currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $stmt = $pdo->prepare("
        SELECT b.*, m.title as movie_title, m.poster as movie_poster 
        FROM bookings b 
        JOIN movies m ON b.movie_id = m.id 
        WHERE b.user_id = ? 
        ORDER BY b.booking_date DESC
    ");
    $stmt->execute([$currentUser['id']]);
    $bookings = $stmt->fetchAll();
    
    $bookingHistory = array_map(function($b) {
        return [
            'id' => $b['id'],
            'movie_id' => $b['movie_id'],
            'tx_number' => $b['tx_number'],
            'branch' => $b['branch'],
            'date' => $b['date'],
            'time' => $b['time'],
            'seats' => json_decode($b['seats'] ?? '[]', true),
            'total_price' => $b['total_price'],
            'movie' => [
                'id' => $b['movie_id'],
                'title' => $b['movie_title'],
                'poster' => $b['movie_poster'],
            ],
        ];
    }, $bookings);
    
    jsonResponse($bookingHistory);
}

function handleUpdateProfile($input, $currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $username = trim($input['username'] ?? '');
    $phone = isset($input['phone']) ? trim((string)$input['phone']) : null;
    if ($username === '') {
        jsonResponse(['success' => false, 'message' => 'Username is required'], 400);
    }
    
    $userId = $currentUser['id'];
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id <> ?");
    $stmt->execute([$username, $userId]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Username already exists'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE users SET username = ?, phone = ? WHERE id = ?");
    $stmt->execute([$username, $phone !== '' ? $phone : null, $userId]);
    
    $stmt = $pdo->prepare("SELECT id, username, email, phone, registration_date AS created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    jsonResponse(['success' => true, 'message' => 'Profile updated', 'user' => $user]);
}

function handleChangePassword($input, $currentUser) {
    global $pdo;
    
    if (!$currentUser) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';
    
    if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
        jsonResponse(['success' => false, 'message' => 'All password fields are required'], 400);
    }
    if (strlen($newPassword) < 8) {
        jsonResponse(['success' => false, 'message' => 'Password must be at least 8 characters'], 400);
    }
    if ($newPassword !== $confirmPassword) {
        jsonResponse(['success' => false, 'message' => 'Passwords do not match'], 400);
    }
    
    $userId = $currentUser['id'];
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    
    if (!$row || $row['password'] !== $currentPassword) {
        jsonResponse(['success' => false, 'message' => 'Current password is incorrect'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$newPassword, $userId]);
    
    jsonResponse(['success' => true, 'message' => 'Password updated']);
}

?>


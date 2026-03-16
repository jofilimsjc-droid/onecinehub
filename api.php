<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Handle JSON POST requests where action is in the body
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input && isset($input['action'])) {
        $action = $input['action'];
    }
}

switch ($action) {
    case 'check_auth':
        handleCheckAuth();
        break;
    case 'get_movies':
        handleGetMovies();
        break;
    case 'get_movie':
        handleGetMovie();
        break;
    case 'get_cinemas':
        handleGetCinemas();
        break;
    case 'get_schedules':
        handleGetSchedules();
        break;
    case 'get_trailers':
        handleGetTrailers();
        break;
    case 'toggle_favorite':
        handleToggleFavorite();
        break;
    case 'get_notifications':
        handleGetNotifications();
        break;
    case 'mark_notification_read':
        handleMarkNotificationRead();
        break;
    case 'mark_notifications_read':
        // Backward compatibility with web dashboard
        handleMarkAllNotificationsRead();
        break;
    case 'mark_all_notifications_read':
        handleMarkAllNotificationsRead();
        break;
    case 'create_booking':
        handleCreateBooking();
        break;
    case 'get_occupied_seats':
        handleGetOccupiedSeats();
        break;
    case 'update_profile':
        handleUpdateProfile();
        break;
    case 'change_password':
        handleChangePassword();
        break;
    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action: ' . $action], 400);
}

function handleCheckAuth() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['user' => null, 'favorites' => [], 'bookingHistory' => [], 'notifications' => []]);
    }
    
    $userId = $_SESSION['user_id'];
    
    // DB uses `registration_date`; expose it as `created_at` for clients.
    $stmt = $pdo->prepare("SELECT id, username, email, phone, registration_date AS created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    $stmt = $pdo->prepare("SELECT movie_id FROM favorites WHERE user_id = ?");
    $stmt->execute([$userId]);
    $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
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
    
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();
    
    jsonResponse([
        'user' => $user,
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

function handleGetMovie() {
    global $pdo;
    $id = $_GET['id'] ?? 0;
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

function handleGetSchedules() {
    global $pdo;
    $movieId = $_GET['movie_id'] ?? null;
    
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

function handleToggleFavorite() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $movieId = $input['movie_id'] ?? 0;
    $userId = $_SESSION['user_id'];
    
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

function handleGetNotifications() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$_SESSION['user_id']]);
    $notifications = $stmt->fetchAll();
    
    jsonResponse($notifications);
}

function handleMarkNotificationRead() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $notificationId = $input['notification_id'] ?? 0;
    
    if (!$notificationId) {
        jsonResponse(['success' => false, 'message' => 'Notification ID required'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
    $stmt->execute([$notificationId, $_SESSION['user_id']]);
    
    jsonResponse(['success' => true]);
}

function handleMarkAllNotificationsRead() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    
    jsonResponse(['success' => true]);
}

function handleCreateBooking() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $movieId = $input['movie_id'] ?? 0;
    $cinemaId = $input['cinema_id'] ?? 0;
    $date = $input['date'] ?? '';
    $time = $input['time'] ?? '';
    $seats = $input['seats'] ?? [];
    $totalPrice = $input['total_price'] ?? 0;
    $paymentMethod = $input['payment_method'] ?? '';
    $branch = $input['branch'] ?? '';
    
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
            $_SESSION['user_id'],
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
        $stmt = $pdo->prepare("
            SELECT title FROM movies WHERE id = ?
        ");
        $stmt->execute([$movieId]);
        $movie = $stmt->fetch();
        
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, message) 
            VALUES (?, ?)
        ");
        $stmt->execute([
            $_SESSION['user_id'],
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

function handleGetOccupiedSeats() {
    global $pdo;
    
    $movieId = $_GET['movie_id'] ?? 0;
    $branch = $_GET['branch'] ?? '';
    $date = $_GET['date'] ?? '';
    $time = $_GET['time'] ?? '';
    
    $scheduleKey = "{$movieId}_{$branch}_{$date}_{$time}";
    
    $stmt = $pdo->prepare("SELECT seat_id FROM occupied_seats WHERE schedule_key = ?");
    $stmt->execute([$scheduleKey]);
    $occupiedSeats = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    jsonResponse($occupiedSeats);
}

function handleUpdateProfile() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $username = trim($input['username'] ?? '');
    $phone = isset($input['phone']) ? trim((string)$input['phone']) : null;
    
    if ($username === '') {
        jsonResponse(['success' => false, 'message' => 'Username is required'], 400);
    }
    
    $userId = $_SESSION['user_id'];
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id <> ?");
    $stmt->execute([$username, $userId]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Username already exists'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE users SET username = ?, phone = ? WHERE id = ?");
    $stmt->execute([$username, $phone !== '' ? $phone : null, $userId]);
    $_SESSION['username'] = $username;
    
    $stmt = $pdo->prepare("SELECT id, username, email, phone, registration_date AS created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    jsonResponse(['success' => true, 'message' => 'Profile updated', 'user' => $user]);
}

function handleChangePassword() {
    global $pdo;
    
    if (!isLoggedIn()) {
        jsonResponse(['success' => false, 'message' => 'Not logged in'], 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
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
    
    $userId = $_SESSION['user_id'];
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


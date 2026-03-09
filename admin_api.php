<?php
require_once 'config.php';
requireAdminLogin();

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

switch ($action) {
    case 'create':
        handleCreate($input);
        break;
    case 'update':
        handleUpdate($input);
        break;
    case 'delete':
        handleDelete($input);
        break;
    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

function handleCreate($input) {
    global $pdo;
    $type = $input['type'] ?? '';

    try {
        switch ($type) {
            case 'movie':
                // Validate required fields for movie
                if (empty($input['title']) || empty($input['poster']) || empty($input['genre']) ||
                    empty($input['duration']) || empty($input['rating']) || empty($input['synopsis']) ||
                    empty($input['cast']) || empty($input['status'])) {
                    throw new Exception('All movie fields are required');
                }

                $stmt = $pdo->prepare("
                    INSERT INTO movies (title, poster, genre, duration, rating, synopsis, cast, release_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['title'],
                    $input['poster'],
                    $input['genre'],
                    $input['duration'],
                    $input['rating'],
                    $input['synopsis'],
                    $input['cast'],
                    $input['release_date'] ?: null,
                    $input['status']
                ]);
                break;

            case 'cinema':
                // Validate required fields for cinema
                if (empty($input['name']) || empty($input['location']) || empty($input['address']) || !isset($input['halls'])) {
                    throw new Exception('Cinema name, location, address, and halls are required');
                }

                $stmt = $pdo->prepare("
                    INSERT INTO cinemas (name, location, address, halls, amenities)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['name'],
                    $input['location'],
                    $input['address'],
                    $input['halls'],
                    json_encode(['AC', 'Sound System'])
                ]);
                break;
                
            case 'schedule':
                $stmt = $pdo->prepare("
                    INSERT INTO schedules (movie_id, cinema_id, hall, date, show_times, price) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['movie_id'],
                    $input['cinema_id'],
                    $input['hall'],
                    $input['date'],
                    json_encode($input['show_times']),
                    $input['price']
                ]);
                break;
                
            case 'trailer':
                $url = convertYouTubeUrl($input['url']);
                $stmt = $pdo->prepare("
                    INSERT INTO trailers (movie_id, url)
                    VALUES (?, ?)
                ");
                $stmt->execute([
                    $input['movie_id'],
                    $url
                ]);
                break;

            case 'admin':
                // Validate required fields for admin
                if (empty($input['email']) || empty($input['password'])) {
                    throw new Exception('Email and password are required');
                }
                if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                    throw new Exception('Invalid email format');
                }
                if (strlen($input['password']) < 8) {
                    throw new Exception('Password must be at least 8 characters');
                }
                $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO admins (email, password) VALUES (?, ?)");
                $stmt->execute([$input['email'], $hashedPassword]);
                break;

            default:
                throw new Exception('Invalid type');
        }
        
        jsonResponse(['success' => true, 'message' => ucfirst($type) . ' created successfully']);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

function handleUpdate($input) {
    global $pdo;
    $type = $input['type'] ?? '';
    $id = $input['id'] ?? 0;
    
    try {
        switch ($type) {
            case 'movie':
                $stmt = $pdo->prepare("
                    UPDATE movies 
                    SET title=?, poster=?, genre=?, duration=?, rating=?, synopsis=?, cast=?, release_date=?, status=? 
                    WHERE id=?
                ");
                $stmt->execute([
                    $input['title'],
                    $input['poster'],
                    $input['genre'],
                    $input['duration'],
                    $input['rating'],
                    $input['synopsis'],
                    $input['cast'],
                    $input['release_date'] ?: null,
                    $input['status'],
                    $id
                ]);
                break;
                
            case 'cinema':
                // Validate required fields for cinema update
                if (empty($input['name']) || empty($input['location']) || empty($input['address']) || !isset($input['halls'])) {
                    throw new Exception('Cinema name, location, address, and halls are required');
                }

                $stmt = $pdo->prepare("
                    UPDATE cinemas
                    SET name=?, location=?, address=?, halls=?
                    WHERE id=?
                ");
                $stmt->execute([
                    $input['name'],
                    $input['location'],
                    $input['address'],
                    $input['halls'],
                    $id
                ]);
                break;
                
            case 'schedule':
                $stmt = $pdo->prepare("
                    UPDATE schedules
                    SET movie_id=?, cinema_id=?, hall=?, date=?, show_times=?, price=?
                    WHERE id=?
                ");
                $stmt->execute([
                    $input['movie_id'],
                    $input['cinema_id'],
                    $input['hall'],
                    $input['date'],
                    json_encode($input['show_times']),
                    $input['price'],
                    $id
                ]);
                break;

            case 'trailer':
                $url = convertYouTubeUrl($input['url']);
                $stmt = $pdo->prepare("
                    UPDATE trailers
                    SET movie_id=?, url=?
                    WHERE id=?
                ");
                $stmt->execute([
                    $input['movie_id'],
                    $url,
                    $id
                ]);
                break;

            case 'admin':
                // Validate required fields for admin update
                if (empty($input['email'])) {
                    throw new Exception('Email is required');
                }
                if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                    throw new Exception('Invalid email format');
                }
                if (!empty($input['password'])) {
                    if (strlen($input['password']) < 8) {
                        throw new Exception('Password must be at least 8 characters');
                    }
                    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("UPDATE admins SET email = ?, password = ? WHERE id = ?");
                    $stmt->execute([$input['email'], $hashedPassword, $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE admins SET email = ? WHERE id = ?");
                    $stmt->execute([$input['email'], $id]);
                }
                break;

            default:
                throw new Exception('Invalid type');
        }
        
        jsonResponse(['success' => true, 'message' => ucfirst($type) . ' updated successfully']);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

function handleDelete($input) {
    global $pdo;
    $type = $input['type'] ?? '';
    $id = $input['id'] ?? 0;
    
    try {
        switch ($type) {
            case 'movie':
                $stmt = $pdo->prepare("DELETE FROM movies WHERE id = ?");
                break;
            case 'cinema':
                $stmt = $pdo->prepare("DELETE FROM cinemas WHERE id = ?");
                break;
            case 'schedule':
                $stmt = $pdo->prepare("DELETE FROM schedules WHERE id = ?");
                break;
            case 'user':
                $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
                break;
            case 'trailer':
                $stmt = $pdo->prepare("DELETE FROM trailers WHERE id = ?");
                break;
            case 'admin':
                $stmt = $pdo->prepare("DELETE FROM admins WHERE id = ?");
                break;
            default:
                throw new Exception('Invalid type');
        }
        
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse(['success' => true, 'message' => ucfirst($type) . ' deleted successfully']);
        } else {
            jsonResponse(['success' => false, 'message' => ucfirst($type) . ' not found'], 404);
        }
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

function convertYouTubeUrl($url) {
    // Handle standard YouTube watch URL
    if (strpos($url, 'youtube.com/watch?v=') !== false) {
        parse_str(parse_url($url, PHP_URL_QUERY), $params);
        if (isset($params['v'])) {
            return 'https://www.youtube.com/embed/' . $params['v'];
        }
    }
    // Handle youtu.be short URL
    elseif (strpos($url, 'youtu.be/') !== false) {
        $path = parse_url($url, PHP_URL_PATH);
        $videoId = basename($path);
        if ($videoId) {
            return 'https://www.youtube.com/embed/' . $videoId;
        }
    }
    // If already in embed format or invalid, return as is
    return $url;
}
?>

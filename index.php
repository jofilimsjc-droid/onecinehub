<?php
require_once 'config.php';

// Get movies and trailers for guest view
$stmt = $pdo->query("SELECT * FROM movies WHERE status = 'nowShowing' ORDER BY created_at DESC");
$nowShowingMovies = $stmt->fetchAll();

$stmt = $pdo->query("SELECT * FROM movies WHERE status = 'comingSoon' ORDER BY release_date ASC");
$comingSoonMovies = $stmt->fetchAll();

$stmt = $pdo->query("
    SELECT t.*, m.title as movie_title, m.genre, m.duration, m.rating, m.synopsis, m.status as movie_status
    FROM trailers t
    JOIN movies m ON t.movie_id = m.id
    WHERE m.status = 'nowShowing'
    ORDER BY t.created_at DESC
");
$trailers = $stmt->fetchAll();

// Check if user is logged in
$currentUser = null;
if (isLoggedIn()) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $currentUser = $stmt->fetch();
}

// Check for registration success message
$registrationSuccess = isset($_GET['register']) && $_GET['register'] === 'success';
$registrationError = isset($_GET['error']) ? $_GET['error'] : '';

// If registration was successful, show success notification
if ($registrationSuccess) {
    echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                showNotification(
                    '🎉 Registration Successful!',
                    'Your account has been created successfully. You can now sign in with your credentials.',
                    'success',
                    8000
                );
                
                // Also show a second notification with tips after 1 second
                setTimeout(function() {
                    showNotification(
                        '💡 Quick Tip',
                        'You can now sign in and start booking your favorite movies!',
                        'info',
                        6000
                    );
                }, 1500);
            }, 500);
        });
    </script>";
}

// If there was an error in registration
if ($registrationError) {
    $errorMessage = 'Registration failed. Please try again.';
    if ($registrationError === 'username_exists') {
        $errorMessage = 'Username already exists. Please choose a different username.';
    } elseif ($registrationError === 'email_exists') {
        $errorMessage = 'Email already registered. Please use a different email or sign in.';
    } elseif ($registrationError === 'invalid_email') {
        $errorMessage = 'Please use a valid Gmail address.';
    } elseif ($registrationError === 'weak_password') {
        $errorMessage = 'Password does not meet security requirements.';
    } elseif ($registrationError === 'database') {
        $errorMessage = 'Database error. Please try again later.';
    }
    
    echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            showNotification(
                '❌ Registration Failed',
                '$errorMessage',
                'error',
                7000
            );
        });
    </script>";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ONECINEHUB - Your Ultimate Cinema Destination</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link rel="stylesheet" href="client.css">
    <style>
        /* Minimal inline styles for password toggle */
        .password-container {
            position: relative;
            width: 100%;
        }
        
        .password-container input {
            width: 100%;
            padding-right: 45px;
        }
        
        .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #b3b3b3;
            background: transparent;
            border: none;
            font-size: 1.2rem;
            z-index: 10;
        }
        
        .password-toggle:hover {
            color: #e50914;
        }

        /* Register form specific styles */
        .register-container {
            max-width: 500px;
            margin: 0 auto;
        }

        .guideline-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #b3b3b3;
            font-size: 0.85rem;
            margin-bottom: 6px;
        }

        .guideline-item.valid {
            color: #10b981;
        }

        .password-requirements {
            display: flex;
            gap: 15px;
            margin-top: 5px;
            flex-wrap: wrap;
        }

        .requirement-badge {
            background: rgba(229, 9, 20, 0.1);
            border: 1px solid rgba(229, 9, 20, 0.2);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 0.75rem;
            color: #b3b3b3;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .requirement-badge.valid {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
            color: #10b981;
        }

        .terms-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 20px 0;
        }

        .terms-checkbox input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #e50914;
        }

        .terms-checkbox label {
            color: #b3b3b3;
            font-size: 0.9rem;
        }

        .terms-checkbox label a {
            color: #e50914;
            text-decoration: none;
            font-weight: 600;
        }

        .terms-checkbox label a:hover {
            text-decoration: underline;
        }

        .email-hint {
            font-size: 0.8rem;
            color: #6b7280;
            margin-top: 4px;
        }

        /* Label with icon */
        .label-with-icon {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .label-with-icon i {
            color: #f54b54;
            font-size: 1rem;
            width: 20px;
        }

        .label-with-icon span {
            font-weight: 600;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* H1 Effects - Only for the main ONECINEHUB logo */
        .main-logo {
            background: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            position: relative;
            display: inline-block;
            animation: logoGlow 3s ease-in-out infinite;
            text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
            transition: all 0.3s ease;
        }

        .main-logo:hover {
            transform: scale(1.05);
            text-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
            animation: none;
        }

        @keyframes logoGlow {
            0% {
                text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
                letter-spacing: 0px;
            }
            50% {
                text-shadow: 0 0 25px rgba(229, 9, 20, 0.7), 0 0 40px rgba(229, 9, 20, 0.4);
                letter-spacing: 2px;
            }
            100% {
                text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
                letter-spacing: 0px;
            }
        }

        .main-logo::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: logoShine 5s infinite;
            pointer-events: none;
        }

        @keyframes logoShine {
            0% {
                left: -100%;
            }
            20% {
                left: 100%;
            }
            100% {
                left: 100%;
            }
        }

        /* Regular gradient text for other headings (no effects) */
        .gradient-text {
            background: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* ===== NOTIFICATION STYLES ===== */
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .notification {
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border-left: 4px solid #10b981;
            border-radius: 12px;
            padding: 16px 20px;
            min-width: 320px;
            max-width: 400px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.2) inset;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideInRight 0.5s ease forwards, notificationPulse 2s ease-in-out infinite;
            position: relative;
            overflow: hidden;
        }

        .notification::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
            animation: notificationShine 3s infinite;
            pointer-events: none;
        }

        @keyframes notificationShine {
            0% {
                left: -100%;
            }
            20% {
                left: 100%;
            }
            100% {
                left: 100%;
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes notificationPulse {
            0%, 100% {
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.2) inset;
            }
            50% {
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7), 0 0 0 2px rgba(16, 185, 129, 0.4) inset, 0 0 30px rgba(16, 185, 129, 0.3);
            }
        }

        .notification.success {
            border-left-color: #10b981;
        }

        .notification.error {
            border-left-color: #ef4444;
        }

        .notification.warning {
            border-left-color: #f59e0b;
        }

        .notification.info {
            border-left-color: #3b82f6;
        }

        .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            animation: iconPop 0.5s ease;
        }

        .notification.success .notification-icon {
            color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }

        .notification.error .notification-icon {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }

        .notification.warning .notification-icon {
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
        }

        .notification.info .notification-icon {
            color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
        }

        @keyframes iconPop {
            0% {
                transform: scale(0);
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
            }
        }

        .notification-content {
            flex: 1;
        }

        .notification-title {
            font-weight: 700;
            font-size: 1rem;
            margin-bottom: 4px;
            color: #ffffff;
        }

        .notification-message {
            font-size: 0.9rem;
            color: #b3b3b3;
            line-height: 1.4;
        }

        .notification-close {
            color: #6b7280;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }

        .notification-close:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
            transform: rotate(90deg);
        }

        .notification-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #10b981, #34d399);
            animation: progressShrink 5s linear forwards;
        }

        .notification.error .notification-progress {
            background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .notification.warning .notification-progress {
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }

        .notification.info .notification-progress {
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
        }

        /* Special style for loading notification - 10 seconds */
        .notification.info.loading-notification .notification-progress {
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
            animation: progressShrink10 8s linear forwards;
            height: 4px;
        }

        @keyframes progressShrink10 {
            from {
                width: 100%;
            }
            to {
                width: 0%;
            }
        }

        .notification.info.loading-notification {
            border-left-width: 6px;
            border-left-color: #8b5cf6;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.3) inset;
        }

        .notification.info.loading-notification .notification-icon {
            color: #8b5cf6;
            background: rgba(139, 92, 246, 0.1);
            animation: loadingSpin 2s linear infinite;
        }

        @keyframes loadingSpin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        /* Auto-hide notification */
        .notification.auto-hide {
            cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .notification-container {
                top: 10px;
                right: 10px;
                left: 10px;
            }
            
            .notification {
                min-width: auto;
                max-width: 100%;
                padding: 12px 15px;
            }
            
            .main-logo {
                animation: logoGlow 4s ease-in-out infinite;
            }
            
            @keyframes logoGlow {
                0%, 100% {
                    text-shadow: 0 0 5px rgba(229, 9, 20, 0.3);
                    letter-spacing: 0px;
                }
                50% {
                    text-shadow: 0 0 15px rgba(229, 9, 20, 0.6);
                    letter-spacing: 1px;
                }
            }
        }

        /* ===== TERMS OF AGREEMENT MODAL STYLES ===== */
        .terms-modal {
            max-width: 800px;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 1px solid rgba(229, 9, 20, 0.2);
        }

        .terms-content {
            max-height: 60vh;
            overflow-y: auto;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .terms-section {
            margin-bottom: 30px;
            animation: fadeInUp 0.5s ease forwards;
            opacity: 0;
        }

        .terms-section:nth-child(1) { animation-delay: 0.1s; }
        .terms-section:nth-child(2) { animation-delay: 0.2s; }
        .terms-section:nth-child(3) { animation-delay: 0.3s; }
        .terms-section:nth-child(4) { animation-delay: 0.4s; }
        .terms-section:nth-child(5) { animation-delay: 0.5s; }
        .terms-section:nth-child(6) { animation-delay: 0.6s; }
        .terms-section:nth-child(7) { animation-delay: 0.7s; }
        .terms-section:nth-child(8) { animation-delay: 0.8s; }
        .terms-section:nth-child(9) { animation-delay: 0.9s; }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .terms-section h3 {
            color: #e50914;
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid rgba(229, 9, 20, 0.2);
            padding-bottom: 8px;
        }

        .terms-section h3 i {
            font-size: 1.2rem;
            color: #ff6b6b;
        }

        .terms-section p {
            color: #b3b3b3;
            line-height: 1.7;
            margin-bottom: 10px;
            font-size: 0.95rem;
        }

        .terms-section ul {
            list-style: none;
            padding: 0;
        }

        .terms-section ul li {
            color: #b3b3b3;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
            line-height: 1.6;
            font-size: 0.95rem;
        }

        .terms-section ul li::before {
            content: '•';
            color: #e50914;
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 1.2rem;
        }

        .terms-section ul li strong {
            color: #ff6b6b;
        }

        .highlight {
            color: #e50914;
            font-weight: 600;
        }

        .terms-footer {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .terms-btn {
            padding: 10px 20px;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .terms-btn.accept {
            background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
            color: white;
            border: none;
        }

        .terms-btn.accept:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(229, 9, 20, 0.5);
        }

        .terms-btn.decline {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #b3b3b3;
        }

        .terms-btn.decline:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            border-color: rgba(229, 9, 20, 0.3);
        }
    </style>
</head>
<body>
    <!-- Notification Container -->
    <div id="notificationContainer" class="notification-container"></div>

    <?php if (!$currentUser): ?>
    <!-- Guest View -->
    <div id="guest-view">
        <header class="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300" id="main-header">
            <div class="container mx-auto px-6 md:px-10 py-5 flex justify-between items-center">
                <h1 class="text-3xl md:text-4xl font-black main-logo tracking-wider">ONECINEHUB</h1>
                <div class="flex gap-3">
                    <button id="loginBtn" class="text-white font-bold py-2.5 px-6 rounded-lg border-2 border-white/30 hover:bg-white hover:text-black transition-all duration-300">Sign In</button>
                    <button id="registerBtn" class="action-btn">Create Account</button>
                </div>
            </div>
        </header>

        <main>
            <section id="hero-section" class="hero-section min-h-screen flex items-center relative">
                <div class="hero-overlay absolute inset-0"></div>
                <!-- Background Trailer Container -->
                <div id="trailer-background" class="absolute inset-0 w-full h-full">
                    <?php if (!empty($trailers)): ?>
                        <?php foreach ($trailers as $index => $trailer): ?>
                            <iframe
                                id="trailer-bg-<?= $index ?>"
                                class="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-1000"
                                src="<?= htmlspecialchars($trailer['url']) ?>?autoplay=1&mute=1&loop=1&playlist=<?= htmlspecialchars(str_replace('https://www.youtube.com/embed/', '', $trailer['url'])) ?>&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
                                frameborder="0"
                                allow="autoplay; encrypted-media"
                                allowfullscreen
                                style="pointer-events: none;">
                            </iframe>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
                <div class="container mx-auto px-6 md:px-10 relative z-10">
                    <div id="hero-content" class="max-w-2xl">
                        <?php if (!empty($trailers)): ?>
                            <h2 id="hero-title" class="text-5xl md:text-7xl font-black mb-6 leading-tight gradient-text transition-all duration-1000"></h2>
                            <p id="hero-details" class="text-xl md:text-2xl text-gray-300 mb-4 max-w-lg transition-all duration-1000"></p>
                            <p id="hero-synopsis" class="text-lg text-gray-400 mb-8 max-w-lg line-clamp-3 transition-all duration-1000"></p>
                            <div class="flex flex-col sm:flex-row gap-4">
                                <button id="watch-trailer-btn" onclick="openTrailerModal('')" class="action-btn px-8 py-4 text-lg transition-all duration-1000">
                                    <i class="fas fa-play mr-2"></i> Watch Trailer
                                </button>
                                <button onclick="document.getElementById('loginBtn').click()" class="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all">
                                    <i class="fas fa-ticket-alt mr-2"></i> Browse Movies
                                </button>
                            </div>
                        <?php else: ?>
                            <h2 class="text-5xl md:text-7xl font-black mb-6 leading-tight gradient-text">Welcome to ONECINEHUB</h2>
                            <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-lg">Discover amazing movies and book your tickets today!</p>
                            <button class="action-btn px-8 py-4 text-lg" onclick="document.getElementById('loginBtn').click()">
                                <i class="fas fa-sign-in-alt mr-2"></i> Sign In to Book
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            </section>

            <section class="bg-gradient-to-b from-black/70 to-black py-20">
                <div class="container mx-auto px-6 md:px-10">
                    <div class="flex justify-center space-x-12 mb-16">
                        <button id="showNowShowing" class="tab active text-3xl font-black">NOW SHOWING</button>
                        <button id="showComingSoon" class="tab text-3xl font-black text-gray-500">COMING SOON</button>
                    </div>

                    <section id="now-showing-content-guest">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            <?php if (!empty($nowShowingMovies)): ?>
                                <?php foreach ($nowShowingMovies as $movie): ?>
                                    <div class="movie-card" data-movie-id="<?= $movie['id'] ?>">
                                        <img src="<?= htmlspecialchars($movie['poster']) ?>" alt="<?= htmlspecialchars($movie['title']) ?>" class="w-full h-auto aspect-[2/3] object-cover">
                                        <div class="overlay">
                                            <h4 class="font-black text-xl mb-3"><?= htmlspecialchars($movie['title']) ?></h4>
                                            <p class="text-sm text-gray-300 mb-4"><?= htmlspecialchars($movie['genre']) ?> • <?= htmlspecialchars($movie['duration']) ?></p>
                                            <div class="flex justify-between items-center w-full gap-3">
                                                <button class="buy-ticket-btn action-btn !text-xs !py-1 !px-3" onclick="handleGuestBuyTicket(<?= $movie['id'] ?>)">
                                                    <i class="fas fa-ticket-alt mr-2"></i> Buy Ticket
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <div class="col-span-full text-center text-gray-400 py-12">
                                    <i class="fas fa-film text-6xl mb-4"></i>
                                    <p>No movies currently showing</p>
                                </div>
                            <?php endif; ?>
                        </div>
                    </section>

                    <section id="coming-soon-content-guest" class="hidden">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            <?php if (!empty($comingSoonMovies)): ?>
                                <?php foreach ($comingSoonMovies as $movie): ?>
                                    <div class="movie-card">
                                        <img src="<?= htmlspecialchars($movie['poster']) ?>" alt="<?= htmlspecialchars($movie['title']) ?>" class="w-full h-auto aspect-[2/3] object-cover">
                                        <div class="absolute top-3 right-3">
                                            <span class="status-badge badge-coming-soon">Coming Soon</span>
                                        </div>
                                        <div class="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                                            <p class="text-xs font-bold"><?= $movie['release_date'] ? date('M j, Y', strtotime($movie['release_date'])) : 'TBA' ?></p>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <div class="col-span-full text-center text-gray-400 py-12">
                                    <i class="fas fa-calendar text-6xl mb-4"></i>
                                    <p>No upcoming movies</p>
                                </div>
                            <?php endif; ?>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    </div>
    <?php else: ?>
    <!-- Dashboard View -->
    <div id="client-dashboard">
        <script>window.location.href = 'dashboard.php';</script>
    </div>
    <?php endif; ?>

    <!-- Login Modal with Password Toggle -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <button class="close-button" id="closeLogin">&times;</button>
            <h2 class="text-3xl font-black mb-2 text-center gradient-text">Welcome Back</h2>
            <p class="text-center text-gray-400 mb-8">Sign in to continue your journey</p>
            <form id="login-form" action="auth.php" method="POST">
                <input type="hidden" name="action" value="login">
                <div class="mb-5">
                    <div class="label-with-icon">
                        <i class="fas fa-user"></i>
                        <span>Email or Username</span>
                    </div>
                    <input name="email" class="w-full rounded-lg py-3 px-4" type="text" placeholder="Enter your email or username" required>
                </div>
                <div class="mb-6">
                    <div class="label-with-icon">
                        <i class="fas fa-lock"></i>
                        <span>Password</span>
                    </div>
                    <div class="password-container">
                        <input name="password" id="login-password" class="w-full rounded-lg py-3 px-4" type="password" placeholder="Enter your password" required>
                        <button type="button" class="password-toggle" onclick="togglePassword('login-password', this)">
                            <i class="fa-regular fa-eye-slash"></i>
                        </button>
                    </div>
                </div>
                <button type="submit" class="action-btn w-full py-3 text-base">Sign In</button>
            </form>
            <p class="text-center text-gray-400 mt-6">New to ONECINEHUB? <a href="#" id="showRegisterFromLogin" class="text-red-500 font-bold hover:underline">Create an account</a></p>
        </div>
    </div>

    <!-- Register Modal with New Design -->
    <div id="registerModal" class="modal">
        <div class="modal-content register-container">
            <button class="close-button" id="closeRegister">&times;</button>
            <h2 class="text-3xl font-black mb-2 text-center gradient-text">Join Us</h2>
            <p class="text-center text-gray-400 mb-6">Create your account today</p>
            
            <form id="register-form" action="auth.php" method="POST" onsubmit="return validateRegisterForm(event)">
                <input type="hidden" name="action" value="register">
                
                <!-- Username Field -->
                <div class="mb-5">
                    <div class="label-with-icon">
                        <i class="fas fa-user-circle"></i>
                        <span>Username</span>
                    </div>
                    <input name="username" id="register-username" class="w-full rounded-lg py-3 px-4" type="text" placeholder="Choose a username (3-50 characters)" required oninput="validateUsername()">
                    <div class="guideline-item" id="username-guideline">
                        <span>Letters, numbers, and underscores only</span>
                    </div>
                </div>
                
                <!-- Email Field -->
                <div class="mb-5">
                    <div class="label-with-icon">
                        <i class="fas fa-envelope"></i>
                        <span>Email</span>
                    </div>
                    <input name="email" id="register-email" class="w-full rounded-lg py-3 px-4" type="email" placeholder="example@gmail.com" required oninput="validateEmail()">
                    <p class="email-hint">Use your Gmail address</p>
                </div>
                
                <!-- Password Field -->
                <div class="mb-5">
                    <div class="label-with-icon">
                        <i class="fas fa-key"></i>
                        <span>Password</span>
                    </div>
                    <div class="password-container">
                        <input name="password" id="register-password" class="w-full rounded-lg py-3 px-4" type="password" placeholder="Create a password" required oninput="validatePassword()">
                        <button type="button" class="password-toggle" onclick="togglePassword('register-password', this)">
                            <i class="fa-regular fa-eye-slash"></i>
                        </button>
                    </div>
                    
                    <!-- Password Requirements Badges -->
                    <div class="password-requirements mt-2">
                        <span class="requirement-badge" id="req-uppercase">
                            <i class="fas fa-arrow-up"></i> Uppercase
                        </span>
                        <span class="requirement-badge" id="req-lowercase">
                            <i class="fas fa-arrow-down"></i> Lowercase
                        </span>
                        <span class="requirement-badge" id="req-number">
                            <i class="fas fa-hashtag"></i> Number
                        </span>
                        <span class="requirement-badge" id="req-special">
                            <i class="fas fa-star"></i> Special
                        </span>
                    </div>
                </div>
                
                <!-- Confirm Password Field -->
                <div class="mb-5">
                    <div class="label-with-icon">
                        <i class="fas fa-check-circle"></i>
                        <span>Confirm Password</span>
                    </div>
                    <div class="password-container">
                        <input name="confirm_password" id="register-confirm-password" class="w-full rounded-lg py-3 px-4" type="password" placeholder="Confirm your password" required oninput="validatePasswordMatch()">
                        <button type="button" class="password-toggle" onclick="togglePassword('register-confirm-password', this)">
                            <i class="fa-regular fa-eye-slash"></i>
                        </button>
                    </div>
                    <div class="guideline-item" id="match-guideline">
                        <span>Passwords must match</span>
                    </div>
                </div>
                
                <!-- Terms and Conditions -->
                <div class="terms-checkbox">
                    <input type="checkbox" id="terms" required>
                    <label for="terms">I agree to the <a href="#" onclick="event.preventDefault(); openTermsModal(); return false;">Terms of Service</a> and <a href="#" onclick="event.preventDefault(); openTermsModal(); return false;">Privacy Policy</a></label>
                </div>
                
                <button type="submit" class="action-btn w-full py-3 text-base" id="register-submit-btn">Create Account</button>
            </form>
            
            <p class="text-center text-gray-400 mt-6">Already have an account? <a href="#" id="showLoginFromRegister" class="text-red-500 font-bold hover:underline">Sign in here</a></p>
        </div>
    </div>

    <!-- Terms of Agreement Modal -->
    <div id="termsModal" class="modal">
        <div class="modal-content terms-modal">
            <button class="close-button" id="closeTerms">&times;</button>
            <h2 class="text-3xl font-black mb-2 text-center gradient-text">Terms of Agreement</h2>
            <p class="text-center text-gray-400 mb-6">Please read carefully before proceeding</p>
            
            <div class="terms-content">
                <div class="terms-section">
                    <h3><i class="fas fa-scroll"></i> 1. Acceptance of Terms</h3>
                    <p>By accessing and using ONECINEHUB, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-user-circle"></i> 2. Account Registration</h3>
                    <ul>
                        <li>You must be at least <strong>13 years old</strong> to create an account</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                        <li>You agree to provide accurate and complete information during registration</li>
                        <li>One person may not maintain multiple accounts without permission</li>
                        <li>You are responsible for all activities that occur under your account</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-ticket-alt"></i> 3. Ticket Purchases</h3>
                    <ul>
                        <li>All ticket sales are <strong>final and non-refundable</strong> unless the event is cancelled</li>
                        <li>Ticket prices are subject to change without prior notice</li>
                        <li>You must present your digital ticket at the cinema entrance</li>
                        <li>Tickets are for personal use only and cannot be resold</li>
                        <li>Cinema reserves the right to refuse admission with valid reason</li>
                        <li>Age restrictions must be followed for age-rated movies</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-film"></i> 4. Content Usage</h3>
                    <ul>
                        <li>All movie content, trailers, and images are for personal viewing only</li>
                        <li>Downloading or copying content is strictly prohibited</li>
                        <li>Movie trailers are provided for informational purposes</li>
                        <li>You may not reproduce, distribute, or create derivative works from our content</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-shield-alt"></i> 5. Privacy Policy</h3>
                    <ul>
                        <li>We collect personal information to provide and improve our services</li>
                        <li>Your data is stored securely and never shared with third parties without consent</li>
                        <li>We use cookies to enhance your browsing experience</li>
                        <li>You can request deletion of your account and data at any time</li>
                        <li>Email communications may be sent for service updates and promotions</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-exclamation-triangle"></i> 6. Prohibited Activities</h3>
                    <ul>
                        <li>Using automated systems or bots to access the service</li>
                        <li>Attempting to bypass security measures or access restricted areas</li>
                        <li>Harassing other users or staff members</li>
                        <li>Posting inappropriate or offensive content</li>
                        <li>Using the service for any illegal activities</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-gavel"></i> 7. Termination</h3>
                    <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice. You may terminate your account at any time by contacting support.</p>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-clock"></i> 8. Changes to Terms</h3>
                    <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms. We will notify users of significant changes via email.</p>
                </div>

                <div class="terms-section">
                    <h3><i class="fas fa-envelope"></i> 9. Contact Information</h3>
                    <p>For questions about these terms, please contact us at:</p>
                    <ul>
                        <li>Email: <strong>support@onecinehub.com</strong></li>
                        <li>Phone: <strong>(02) 1234-5678</strong></li>
                        <li>Office: <strong>123 Cinema Ave, Manila, Philippines</strong></li>
                    </ul>
                </div>
            </div>

            <div class="terms-footer">
                <button class="terms-btn decline" onclick="closeTermsModal()">Close</button>
                <button class="terms-btn accept" onclick="acceptTerms()">I Accept</button>
            </div>
        </div>
    </div>

    <!-- Trailer Modal -->
    <div id="trailerModal" class="modal">
        <div class="modal-content" style="max-width: 800px;">
            <button class="close-button" id="closeTrailer">&times;</button>
            <h2 class="text-3xl font-black mb-4 text-center gradient-text">Watch Trailer</h2>
            <div class="trailer-container">
                <iframe id="trailer-iframe" src="" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    </div>

    <script>
        // Password Toggle Function
        function togglePassword(inputId, toggleBtn) {
            const input = document.getElementById(inputId);
            const icon = toggleBtn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
                toggleBtn.setAttribute('title', 'Hide password');
            } else {
                input.type = 'password';
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
                toggleBtn.setAttribute('title', 'Show password');
            }
        }

        // ===== NOTIFICATION FUNCTIONS =====
        function showNotification(title, message, type = 'success', duration = 5000) {
            const container = document.getElementById('notificationContainer');
            const notificationId = 'notification-' + Date.now();
            
            // Get icon based on type
            let iconClass = 'fa-circle-check';
            if (type === 'error') iconClass = 'fa-circle-exclamation';
            else if (type === 'warning') iconClass = 'fa-triangle-exclamation';
            else if (type === 'info') iconClass = 'fa-circle-info';
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type} auto-hide`;
            notification.id = notificationId;
            
            // Add special class for loading notification with 10 seconds
            if (type === 'info' && title.includes('Creating Account')) {
                notification.classList.add('loading-notification');
            }
            
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <div class="notification-close" onclick="closeNotification('${notificationId}')">
                    <i class="fas fa-times"></i>
                </div>
                <div class="notification-progress"></div>
            `;
            
            // Add to container
            container.appendChild(notification);
            
            // Auto close after duration
            setTimeout(() => {
                closeNotification(notificationId);
            }, duration);
            
            // Click to close
            notification.addEventListener('click', function(e) {
                if (!e.target.closest('.notification-close')) {
                    closeNotification(notificationId);
                }
            });
            
            return notificationId;
        }

        function closeNotification(id) {
            const notification = document.getElementById(id);
            if (notification) {
                notification.style.animation = 'slideInRight 0.3s reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }

        // ===== TERMS OF AGREEMENT FUNCTIONS =====
        function openTermsModal() {
            document.getElementById('termsModal').style.display = 'block';
        }

        function closeTermsModal() {
            document.getElementById('termsModal').style.display = 'none';
        }

        function acceptTerms() {
            // Check the terms checkbox
            document.getElementById('terms').checked = true;
            
            // Show success notification
            showNotification(
                '✓ Terms Accepted',
                'You have successfully agreed to the Terms of Service and Privacy Policy.',
                'success',
                3000
            );
            
            // Close modal
            closeTermsModal();
        }

        // Validation Functions for Registration
        function validateUsername() {
            const username = document.getElementById('register-username').value;
            const guideline = document.getElementById('username-guideline');
            
            // Check if username contains only letters, numbers, and underscores
            const isValid = /^[a-zA-Z0-9_]+$/.test(username) && username.length >= 3 && username.length <= 50;
            
            if (isValid) {
                guideline.classList.add('valid');
            } else {
                guideline.classList.remove('valid');
            }
        }

        function validateEmail() {
            const email = document.getElementById('register-email').value;
            
            // Check if it's a Gmail address
            const isValid = email.toLowerCase().endsWith('@gmail.com') && email.length > 10;
            
            // Visual feedback
            const emailInput = document.getElementById('register-email');
            if (isValid) {
                emailInput.style.borderColor = '#10b981';
            } else {
                emailInput.style.borderColor = '';
            }
        }

        function validatePassword() {
            const password = document.getElementById('register-password').value;
            
            // Check uppercase
            const reqUppercase = document.getElementById('req-uppercase');
            if (/[A-Z]/.test(password)) {
                reqUppercase.classList.add('valid');
            } else {
                reqUppercase.classList.remove('valid');
            }
            
            // Check lowercase
            const reqLowercase = document.getElementById('req-lowercase');
            if (/[a-z]/.test(password)) {
                reqLowercase.classList.add('valid');
            } else {
                reqLowercase.classList.remove('valid');
            }
            
            // Check number
            const reqNumber = document.getElementById('req-number');
            if (/[0-9]/.test(password)) {
                reqNumber.classList.add('valid');
            } else {
                reqNumber.classList.remove('valid');
            }
            
            // Check special character
            const reqSpecial = document.getElementById('req-special');
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                reqSpecial.classList.add('valid');
            } else {
                reqSpecial.classList.remove('valid');
            }
            
            // Check password match
            validatePasswordMatch();
        }

        function validatePasswordMatch() {
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const matchGuide = document.getElementById('match-guideline');
            
            if (password && confirmPassword && password === confirmPassword) {
                matchGuide.classList.add('valid');
            } else {
                matchGuide.classList.remove('valid');
            }
        }

        function validateRegisterForm(event) {
            event.preventDefault();
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // Validate username
            if (!/^[a-zA-Z0-9_]+$/.test(username) || username.length < 3 || username.length > 50) {
                showNotification(
                    '❌ Invalid Username',
                    'Please enter a valid username (3-50 characters, letters, numbers, and underscores only)',
                    'error'
                );
                return false;
            }
            
            // Validate email
            if (!email.toLowerCase().endsWith('@gmail.com')) {
                showNotification(
                    '❌ Invalid Email',
                    'Please use a valid Gmail address',
                    'error'
                );
                return false;
            }
            
            // Validate password
            if (password.length < 8) {
                showNotification(
                    '❌ Weak Password',
                    'Password must be at least 8 characters long',
                    'error'
                );
                return false;
            }
            
            if (!/[A-Z]/.test(password)) {
                showNotification(
                    '❌ Weak Password',
                    'Password must contain at least one uppercase letter',
                    'error'
                );
                return false;
            }
            
            if (!/[a-z]/.test(password)) {
                showNotification(
                    '❌ Weak Password',
                    'Password must contain at least one lowercase letter',
                    'error'
                );
                return false;
            }
            
            if (!/[0-9]/.test(password)) {
                showNotification(
                    '❌ Weak Password',
                    'Password must contain at least one number',
                    'error'
                );
                return false;
            }
            
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                showNotification(
                    '❌ Weak Password',
                    'Password must contain at least one special character',
                    'error'
                );
                return false;
            }
            
            // Validate password match
            if (password !== confirmPassword) {
                showNotification(
                    '❌ Password Mismatch',
                    'Passwords do not match',
                    'error'
                );
                return false;
            }
            
            // Validate terms
            if (!terms) {
                showNotification(
                    '❌ Terms Required',
                    'You must agree to the Terms of Service and Privacy Policy',
                    'error'
                );
                return false;
            }
            
            // Show loading notification - 10 SECONDS
            showNotification(
                '⏳ Creating Account',
                'Please wait 8 seconds while we create your account...',
                'info',
                10000 // 8 seconds
            );
            
            // Submit form after 2 seconds para may time makita ang loading
            setTimeout(() => {
                document.getElementById('register-form').submit();
            }, 2000);
            
            return true;
        }

        // Trailer rotation data
        const trailers = <?php echo json_encode($trailers); ?>;
        let currentTrailerIndex = 0;
        let trailerInterval;

        // Initialize trailer rotation
        function initTrailerRotation() {
            if (trailers.length === 0) return;

            // Show first trailer immediately
            showTrailer(0);

            // Start rotation every 7 seconds
            trailerInterval = setInterval(() => {
                currentTrailerIndex = (currentTrailerIndex + 1) % trailers.length;
                showTrailer(currentTrailerIndex);
            }, 7000);
        }

        function showTrailer(index) {
            const trailer = trailers[index];

            // Hide all trailer iframes
            document.querySelectorAll('[id^="trailer-bg-"]').forEach(iframe => {
                iframe.style.opacity = '0';
            });

            // Show current trailer
            const currentIframe = document.getElementById(`trailer-bg-${index}`);
            if (currentIframe) {
                currentIframe.style.opacity = '1';
            }

            // Update hero content with fade effect
            const titleElement = document.getElementById('hero-title');
            const detailsElement = document.getElementById('hero-details');
            const synopsisElement = document.getElementById('hero-synopsis');
            const watchBtn = document.getElementById('watch-trailer-btn');

            // Add fade out effect
            [titleElement, detailsElement, synopsisElement, watchBtn].forEach(el => {
                if (el) el.style.opacity = '0';
            });

            setTimeout(() => {
                // Update content
                if (titleElement) titleElement.textContent = trailer.movie_title;
                if (detailsElement) detailsElement.textContent = `${trailer.genre} • ${trailer.duration} • ${trailer.rating}`;
                if (synopsisElement) synopsisElement.textContent = trailer.synopsis;
                if (watchBtn) watchBtn.onclick = () => openTrailerModal(trailer.url);

                // Fade in
                [titleElement, detailsElement, synopsisElement, watchBtn].forEach(el => {
                    if (el) el.style.opacity = '1';
                });
            }, 500);
        }

        // Modal controls
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'block';
        });

        document.getElementById('registerBtn')?.addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'block';
            // Reset validation when opening modal
            setTimeout(() => {
                validateUsername();
                validateEmail();
                validatePassword();
            }, 100);
        });

        document.getElementById('closeLogin')?.addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'none';
        });

        document.getElementById('closeRegister')?.addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'none';
        });

        document.getElementById('closeTerms')?.addEventListener('click', () => {
            closeTermsModal();
        });

        document.getElementById('closeTrailer')?.addEventListener('click', () => {
            document.getElementById('trailerModal').style.display = 'none';
            document.getElementById('trailer-iframe').src = '';
        });

        document.getElementById('showRegisterFromLogin').onclick = (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'block';
            // Reset validation
            setTimeout(() => {
                validateUsername();
                validateEmail();
                validatePassword();
            }, 100);
        };

        document.getElementById('showLoginFromRegister').onclick = (e) => {
            e.preventDefault();
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
        };

        // Tab switching
        document.getElementById('showNowShowing')?.addEventListener('click', () => {
            document.getElementById('showNowShowing').classList.add('active');
            document.getElementById('showComingSoon').classList.remove('active');
            document.getElementById('now-showing-content-guest').classList.remove('hidden');
            document.getElementById('coming-soon-content-guest').classList.add('hidden');
        });

        document.getElementById('showComingSoon')?.addEventListener('click', () => {
            document.getElementById('showComingSoon').classList.add('active');
            document.getElementById('showNowShowing').classList.remove('active');
            document.getElementById('coming-soon-content-guest').classList.remove('hidden');
            document.getElementById('now-showing-content-guest').classList.add('hidden');
        });

        function handleGuestBuyTicket(movieId) {
            document.getElementById('loginBtn').click();
            localStorage.setItem('intendedAction', 'buyTicket');
            localStorage.setItem('intendedMovieId', movieId);
        }

        function openTrailerModal(trailerUrl) {
            if (!trailerUrl) {
                alert('Trailer not available');
                return;
            }
            document.getElementById('trailer-iframe').src = trailerUrl;
            document.getElementById('trailerModal').style.display = 'block';
        }

        // Close modals when clicking outside
        window.onclick = (e) => {
            const modals = ['loginModal', 'registerModal', 'trailerModal', 'termsModal'];
            modals.forEach((id) => {
                const modal = document.getElementById(id);
                if (e.target == modal) {
                    modal.style.display = 'none';
                    if (id === 'trailerModal') {
                        document.getElementById('trailer-iframe').src = '';
                    }
                }
            });
        };

        // Initialize tooltips and validation
        document.addEventListener('DOMContentLoaded', function() {
            initTrailerRotation();
            
            // Set initial titles for password toggles
            document.querySelectorAll('.password-toggle').forEach(btn => {
                btn.setAttribute('title', 'Show password');
            });
            
            // Initialize validation if register modal exists
            if (document.getElementById('registerModal')) {
                validateUsername();
                validateEmail();
                validatePassword();
            }
        });
    </script>
</body>
</html>
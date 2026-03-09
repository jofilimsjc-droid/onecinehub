<?php
require_once 'config.php';
requireAdminLogin();

// Handle AJAX requests
if (isset($_GET['action'])) {
    handleAjaxRequest();
    exit();
}

function handleAjaxRequest() {
    global $pdo;
    $action = $_GET['action'];
    
    switch ($action) {
        case 'get_stats':
            $stats = getStats();
            jsonResponse($stats);
            break;
        case 'get_movies':
            $movies = getMovies();
            jsonResponse($movies);
            break;
        case 'get_cinemas':
            $cinemas = getCinemas();
            jsonResponse($cinemas);
            break;
        case 'get_schedules':
            $schedules = getSchedules();
            jsonResponse($schedules);
            break;
        case 'get_users':
            $users = getUsers();
            jsonResponse($users);
            break;
        case 'get_trailers':
            $trailers = getTrailers();
            jsonResponse($trailers);
            break;
        case 'get_analytics':
            $analytics = getAnalytics();
            jsonResponse($analytics);
            break;
    }
}

function getStats() {
    global $pdo;
    
    $stmt = $pdo->query("SELECT COUNT(*) as total, 
                        SUM(CASE WHEN status = 'nowShowing' THEN 1 ELSE 0 END) as now_showing,
                        SUM(CASE WHEN status = 'comingSoon' THEN 1 ELSE 0 END) as coming_soon
                        FROM movies");
    $movieStats = $stmt->fetch();
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM cinemas");
    $cinemaStats = $stmt->fetch();
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $userStats = $stmt->fetch();
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM schedules");
    $scheduleStats = $stmt->fetch();
    
    return [
        'movies' => $movieStats,
        'cinemas' => $cinemaStats['total'],
        'users' => $userStats['total'],
        'schedules' => $scheduleStats['total']
    ];
}

function getMovies() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM movies ORDER BY created_at DESC");
    return $stmt->fetchAll();
}

function getCinemas() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM cinemas ORDER BY created_at DESC");
    return $stmt->fetchAll();
}

function getSchedules() {
    global $pdo;
    $stmt = $pdo->query("
        SELECT s.*, m.title as movie_title, c.name as cinema_name 
        FROM schedules s 
        JOIN movies m ON s.movie_id = m.id 
        JOIN cinemas c ON s.cinema_id = c.id 
        ORDER BY s.date DESC, s.created_at DESC
    ");
    return $stmt->fetchAll();
}

function getUsers() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM users ORDER BY registration_date DESC");
    return $stmt->fetchAll();
}

function getTrailers() {
    global $pdo;
    $stmt = $pdo->query("
        SELECT t.*, m.title as movie_title, m.status as movie_status 
        FROM trailers t 
        JOIN movies m ON t.movie_id = m.id 
        ORDER BY t.created_at DESC
    ");
    return $stmt->fetchAll();
}

function getAnalytics() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT COUNT(*) as total_transactions, 
               COALESCE(SUM(total_price), 0) as total_revenue 
        FROM bookings
    ");
    $revenue = $stmt->fetch();
    
    $stmt = $pdo->query("
        SELECT m.title, COUNT(b.id) as booking_count, SUM(b.total_price) as revenue
        FROM bookings b 
        JOIN movies m ON b.movie_id = m.id 
        GROUP BY m.id, m.title 
        ORDER BY booking_count DESC 
        LIMIT 5
    ");
    $popularMovies = $stmt->fetchAll();
    
    $stmt = $pdo->query("
        SELECT b.*, m.title as movie_title 
        FROM bookings b 
        JOIN movies m ON b.movie_id = m.id 
        ORDER BY b.booking_date DESC 
        LIMIT 10
    ");
    $recentTransactions = $stmt->fetchAll();
    
    return [
        'revenue' => $revenue,
        'popular_movies' => $popularMovies,
        'recent_transactions' => $recentTransactions
    ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ONECINEHUB - Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="admin.css">
    <style>
        /* Sidebar styles */
        .sidebar {
            transition: transform 0.3s ease;
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            width: 250px;
            z-index: 1000;
            background: rgba(10, 10, 10, 0.95);
            border-right: 1px solid rgba(229, 9, 20, 0.1);
            transform: translateX(0);
        }
        
        .sidebar.hidden {
            transform: translateX(-100%);
        }
        
        /* Hide button styles - inside sidebar only */
        .hide-sidebar-btn {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(229, 9, 20, 0.1);
            border: 1px solid rgba(229, 9, 20, 0.3);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #b3b3b3;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.95rem;
            z-index: 1001;
        }
        
        .hide-sidebar-btn:hover {
            background: rgba(229, 9, 20, 0.2);
            color: #e50914;
            border-color: #e50914;
        }
        
        .hide-sidebar-btn i {
            font-size: 1.1rem;
        }
        
        /* Show button - appears in main content area when sidebar is hidden */
        .show-sidebar-btn {
            position: fixed;
            left: 20px;
            top: 80px;
            width: 45px;
            height: 45px;
            background: #e50914;
            border-radius: 8px;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            font-size: 1.3rem;
            z-index: 1002;
            transition: all 0.3s ease;
            border: none;
            box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
        }
        
        .show-sidebar-btn:hover {
            background: #ff0a16;
            transform: scale(1.1);
        }
        
        .show-sidebar-btn.visible {
            display: flex;
        }
        
        /* Main content adjustment */
        main {
            transition: margin-left 0.3s ease;
            margin-left: 250px;
        }
        
        main.sidebar-hidden {
            margin-left: 0;
        }
        
        /* Header - completely independent */
        header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 999;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(229, 9, 20, 0.1);
        }
        
        #header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.5rem;
            margin-left: 250px;
            transition: margin-left 0.3s ease;
        }
        
        #header-content.sidebar-hidden {
            margin-left: 0;
        }
        
        /* Navigation links */
        .nav-link {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.5rem;
            color: #b3b3b3;
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
            cursor: pointer;
            border-radius: 0 8px 8px 0;
            margin: 0.25rem 0;
        }
        
        .nav-link:hover,
        .nav-link.active {
            color: #ffffff;
            background: linear-gradient(135deg, rgba(229, 9, 20, 0.15) 0%, rgba(229, 9, 20, 0.08) 100%);
            border-left-color: #e50914;
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(229, 9, 20, 0.2);
        }
        
        /* Base gradient text - no effects */
        .gradient-text {
            background: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* H1 specific styles with effects - ONLY for the main title */
        h1.gradient-text {
            position: relative;
            display: inline-block;
            animation: glowPulse 3s ease-in-out infinite;
            text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
            transition: all 0.3s ease;
        }
        
        h1.gradient-text:hover {
            transform: scale(1.05);
            text-shadow: 0 0 20px rgba(229, 9, 20, 0.5), 0 0 30px rgba(229, 9, 20, 0.3);
            animation: none;
        }
        
        @keyframes glowPulse {
            0% {
                text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
                letter-spacing: 0px;
            }
            50% {
                text-shadow: 0 0 25px rgba(229, 9, 20, 0.7), 0 0 40px rgba(229, 9, 20, 0.4);
                letter-spacing: 1px;
            }
            100% {
                text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
                letter-spacing: 0px;
            }
        }
        
        h1.gradient-text::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: shine 5s infinite;
            pointer-events: none;
        }
        
        @keyframes shine {
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
        
        /* Action button */
        .action-btn {
            background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
            color: white;
            padding: 0.875rem 1.75rem;
            border-radius: 10px;
            font-weight: 700;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .action-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(229, 9, 20, 0.7);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }
            
            .sidebar.visible-mobile {
                transform: translateX(0);
            }
            
            #header-content {
                margin-left: 0 !important;
            }
            
            main {
                margin-left: 0 !important;
            }
            
            .show-sidebar-btn {
                display: flex;
                top: 70px;
            }
            
            h1.gradient-text {
                animation: glowPulse 4s ease-in-out infinite;
                font-size: 1.5rem;
            }
            
            @keyframes glowPulse {
                0%, 100% {
                    text-shadow: 0 0 5px rgba(229, 9, 20, 0.3);
                    letter-spacing: 0px;
                }
                50% {
                    text-shadow: 0 0 15px rgba(229, 9, 20, 0.6);
                    letter-spacing: 0.5px;
                }
            }
        }
    </style>
</head>
<body>
    <!-- Header - Completely independent, no buttons here -->
    <header>
        <div class="flex items-center justify-between px-6 py-4" id="header-content">
            <h1 class="text-2xl font-black gradient-text">ONECINEHUB Admin</h1>
            <form action="auth.php" method="POST" style="display: inline;">
                <input type="hidden" name="action" value="admin_logout">
                <button type="submit" class="action-btn px-6 py-2">
                    <i class="fas fa-sign-out-alt mr-2"></i> Logout
                </button>
            </form>
        </div>
    </header>

    <!-- Show Sidebar Button (appears in main content area when sidebar is hidden) -->
    <button class="show-sidebar-btn" id="showSidebarBtn" title="Show Sidebar">
        <i class="fas fa-chevron-right"></i>
    </button>

    <!-- Sidebar with hide button only -->
    <nav class="sidebar" id="sidebar">
        <div class="p-6 h-full flex flex-col relative">
            <div class="flex-1">
                <h2 class="text-xl font-bold mb-6 gradient-text">Navigation</h2>
                <a data-section="dashboard" class="nav-link active">
                    <i class="fas fa-home"></i>
                    <span>Dashboard</span>
                </a>
                <a data-section="movies" class="nav-link">
                    <i class="fas fa-film"></i>
                    <span>Movies Management</span>
                </a>
                <a data-section="schedules" class="nav-link">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Movie Schedules Management</span>
                </a>
                <a data-section="cinemas" class="nav-link">
                    <i class="fas fa-building"></i>
                    <span>Cinemas Management</span>
                </a>
                <a data-section="users" class="nav-link">
                    <i class="fas fa-users"></i>
                    <span>Users Management</span>
                </a>
                <a data-section="analytics" class="nav-link">
                    <i class="fas fa-chart-bar"></i>
                    <span>Analytics Dashboard</span>
                </a>
                <a data-section="trailers" class="nav-link">
                    <i class="fas fa-video"></i>
                    <span>Trailer Management</span>
                </a>
            </div>
            
            <!-- Hide button - only button in sidebar -->
            <div class="hide-sidebar-btn" id="hideSidebarBtn">
                <i class="fas fa-eye-slash"></i>
                <span>Hide Navigation</span>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="min-h-screen pt-20 p-8" id="main-content">
        <div id="content-area" class="max-w-7xl mx-auto">
            <!-- Content will be loaded here -->
        </div>
    </main>

    <!-- Include all modals and forms -->
    <?php include 'admin_modals.php'; ?>

    <script src="admin_dashboard.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('sidebar');
            const hideBtn = document.getElementById('hideSidebarBtn');
            const showBtn = document.getElementById('showSidebarBtn');
            const mainContent = document.getElementById('main-content');
            const headerContent = document.getElementById('header-content');
            
            // Check localStorage for sidebar state
            const sidebarHidden = localStorage.getItem('adminSidebarHidden');
            
            if (sidebarHidden === 'true') {
                sidebar.classList.add('hidden');
                mainContent.classList.add('sidebar-hidden');
                headerContent.classList.add('sidebar-hidden');
                showBtn.classList.add('visible');
            }
            
            // Hide sidebar completely - using the hide button inside sidebar
            hideBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                sidebar.classList.add('hidden');
                mainContent.classList.add('sidebar-hidden');
                headerContent.classList.add('sidebar-hidden');
                showBtn.classList.add('visible');
                
                localStorage.setItem('adminSidebarHidden', 'true');
            });
            
            // Show sidebar (when hidden) - using the show button in main content
            showBtn.addEventListener('click', function() {
                sidebar.classList.remove('hidden');
                showBtn.classList.remove('visible');
                mainContent.classList.remove('sidebar-hidden');
                headerContent.classList.remove('sidebar-hidden');
                
                localStorage.setItem('adminSidebarHidden', 'false');
            });
            
            // Keyboard shortcut: Ctrl+B to toggle sidebar
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'b') {
                    e.preventDefault();
                    if (sidebar.classList.contains('hidden')) {
                        showBtn.click();
                    } else {
                        hideBtn.click();
                    }
                }
            });
            
            // Add title attributes for better UX
            hideBtn.setAttribute('title', 'Hide Sidebar (Ctrl+B)');
            showBtn.setAttribute('title', 'Show Sidebar (Ctrl+B)');
        });
    </script>
</body>
</html>
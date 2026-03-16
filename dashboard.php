<?php
require_once 'config.php';
requireLogin();

// Get user data
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$currentUser = $stmt->fetch();

// Get user's favorites
$stmt = $pdo->prepare("
    SELECT m.* FROM movies m 
    JOIN favorites f ON m.id = f.movie_id 
    WHERE f.user_id = ? AND m.status = 'nowShowing'
");
$stmt->execute([$_SESSION['user_id']]);
$favoriteMovies = $stmt->fetchAll();

// Get user's booking history
$stmt = $pdo->prepare("
    SELECT b.*, m.title as movie_title, m.poster as movie_poster 
    FROM bookings b 
    JOIN movies m ON b.movie_id = m.id 
    WHERE b.user_id = ? 
    ORDER BY b.booking_date DESC
");
$stmt->execute([$_SESSION['user_id']]);
$bookingHistory = $stmt->fetchAll();

// Get user's notifications
$stmt = $pdo->prepare("
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 10
");
$stmt->execute([$_SESSION['user_id']]);
$notifications = $stmt->fetchAll();

$unreadCount = count(array_filter($notifications, fn($n) => !$n['is_read']));

// Get all unique genres from movies
$stmt = $pdo->query("SELECT DISTINCT genre FROM movies WHERE status = 'nowShowing' OR status = 'comingSoon' ORDER BY genre");
$allGenres = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ONECINEHUB - Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link rel="stylesheet" href="client.css">
    <style>
        /* Genre filter styles */
        .genre-filter-btn {
            padding: 0.5rem 1.5rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.3s ease;
            white-space: nowrap;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #9CA3AF;
        }
        
        .genre-filter-btn:hover {
            background: rgba(229, 9, 20, 0.1);
            border-color: rgba(229, 9, 20, 0.3);
            color: white;
        }
        
        .genre-filter-btn.active {
            background: #E50914;
            border-color: #E50914;
            color: white;
        }
        
        .genre-filter-container {
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            padding-bottom: 0.5rem;
            scrollbar-width: thin;
            scrollbar-color: #E50914 #1F1F1F;
        }
        
        .genre-filter-container::-webkit-scrollbar {
            height: 4px;
        }
        
        .genre-filter-container::-webkit-scrollbar-track {
            background: #1F1F1F;
            border-radius: 10px;
        }
        
        .genre-filter-container::-webkit-scrollbar-thumb {
            background: #E50914;
            border-radius: 10px;
        }
        
        .movie-grid {
            transition: opacity 0.3s ease;
        }
        
        .movie-grid.filtering {
            opacity: 0.6;
        }
        
        .no-results {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .genre-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 600;
            border: 1px solid rgba(229, 9, 20, 0.3);
            color: #E50914;
            z-index: 5;
        }
        
        /* Home page card styles */
        .feature-card {
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: rgba(229, 9, 20, 0.5);
            box-shadow: 0 20px 30px -10px rgba(229, 9, 20, 0.2);
        }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(229, 9, 20, 0.1) 0%, transparent 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .feature-card:hover::before {
            opacity: 1;
        }
        
        .feature-card i {
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover i {
            transform: scale(1.1);
            color: #E50914;
        }
        
        .feature-card .card-arrow {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
            color: #E50914;
        }
        
        .feature-card:hover .card-arrow {
            opacity: 1;
            transform: translateX(0);
        }
        
        /* Stats cards */
        .stat-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            background: rgba(229, 9, 20, 0.05);
            border-color: rgba(229, 9, 20, 0.2);
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #fff, #E50914);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
        }
    </style>
</head>
<body>
    <div id="client-dashboard">
        <header class="dashboard-header sticky top-0 z-50">
            <div class="container mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
                <div class="flex items-center gap-12">
                    <h1 class="text-2xl md:text-3xl font-black gradient-text tracking-wider">ONECINEHUB</h1>
<nav class="hidden md:flex items-center gap-10 text-sm font-bold dashboard-nav">
                        <a data-view="home" class="text-gray-400 cursor-pointer">HOME</a>
                        <a data-view="booking" class="active cursor-pointer">MOVIES</a>
                        <a data-view="history" class="text-gray-400 cursor-pointer">HISTORY</a>
                        <a data-view="favorites" class="text-gray-400 cursor-pointer">FAVORITES</a>
                    </nav>
                </div>
                <div class="flex items-center gap-6">
                    <button id="notification-bell" class="text-gray-400 text-2xl hover:text-red-500 relative transition-colors">
                        <i class="fas fa-bell"></i>
                        <span id="notification-badge" class="notification-badge" style="display: <?= $unreadCount > 0 ? 'flex' : 'none' ?>"><?= $unreadCount ?></span>
                    </button>
                    <div class="relative" id="user-profile">
                        <button class="flex items-center gap-3 hover:text-white transition-colors cursor-pointer" id="profile-toggle">
                            <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-black text-lg"><?= strtoupper(substr($currentUser['username'], 0, 1)) ?></div>
                            <span class="hidden sm:block text-sm font-bold"><?= htmlspecialchars($currentUser['username']) ?></span>
                            <i class="fas fa-chevron-down text-xs"></i>
                        </button>
                        <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-medium-bg border border-white/10 rounded-lg shadow-lg py-2 z-50">
                            <button onclick="renderPage('settings')" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                                <i class="fas fa-cog text-blue-400"></i>
                                Settings
                            </button>
                            <form action="auth.php" method="POST" style="display: inline; width: 100%;">
                                <input type="hidden" name="action" value="logout">
                                <button type="submit" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                                    <i class="fas fa-sign-out-alt text-red-500"></i>
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main id="dashboard-main-content" class="container mx-auto px-6 lg:px-10 py-10 content-enter min-h-screen">
            <!-- Content will be loaded here -->
        </main>
    </div>

    <!-- Notifications Panel -->
    <div id="notifications-panel" class="hidden fixed top-20 right-6 glass-card w-80 sm:w-96 z-50 p-5 shadow-2xl">
        <h3 class="font-black text-lg mb-4">Notifications</h3>
        <ul id="notifications-list" class="space-y-3 max-h-96 overflow-y-auto">
            <?php if (!empty($notifications)): ?>
                <?php foreach ($notifications as $index => $notification): ?>
                    <li class="text-sm pb-3 <?= $index !== count($notifications) - 1 ? 'border-b border-white/10' : '' ?>">
                        <p class="font-bold mb-1"><?= htmlspecialchars($notification['message']) ?></p>
                        <p class="text-xs text-gray-400"><?= date('M j, Y g:i A', strtotime($notification['created_at'])) ?></p>
                    </li>
                <?php endforeach; ?>
            <?php else: ?>
                <li class="text-gray-400 text-sm text-center py-4">No new notifications.</li>
            <?php endif; ?>
        </ul>
    </div>

    <script>
        const currentUser = <?= json_encode($currentUser) ?>;
        const favoriteMovies = <?= json_encode($favoriteMovies) ?>;
        const bookingHistory = <?= json_encode($bookingHistory) ?>;
        const notifications = <?= json_encode($notifications) ?>;
        const allGenres = <?= json_encode($allGenres) ?>;
        
        let currentView = 'booking';
        let currentGenre = 'all';
        let moviesData = {
            nowShowing: [],
            comingSoon: []
        };
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            renderPage('booking');
            setupEventListeners();
        });
        
        function setupEventListeners() {
            // Navigation
            document.querySelectorAll('.dashboard-nav a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    renderPage(e.target.dataset.view);
                });
            });
            
            // Profile dropdown
            document.getElementById('profile-toggle').addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('profile-dropdown').classList.toggle('hidden');
            });
            
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('profile-dropdown');
                const toggle = document.getElementById('profile-toggle');
                if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
            
            // Notifications
            document.getElementById('notification-bell').addEventListener('click', toggleNotifications);
            
            document.addEventListener('click', (e) => {
                const panel = document.getElementById('notifications-panel');
                const bell = document.getElementById('notification-bell');
                if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
                    panel.classList.add('hidden');
                }
            });
        }
        
function renderPage(view) {
            currentView = view;
            
            // Update navigation
            document.querySelectorAll('.dashboard-nav a').forEach(link => {
                link.classList.remove('active');
                link.classList.add('text-gray-400');
                if (link.dataset.view === view) {
                    link.classList.add('active');
                    link.classList.remove('text-gray-400');
                }
            });
            
            const mainContent = document.getElementById('dashboard-main-content');
            
            switch (view) {
                case 'home':
                    mainContent.innerHTML = renderHomeView();
                    break;
                case 'booking':
                    renderBookingView();
                    break;
                case 'favorites':
                    mainContent.innerHTML = renderFavoritesView();
                    break;
                case 'history':
                    mainContent.innerHTML = renderHistoryView();
                    break;
                case 'settings':
                    mainContent.innerHTML = renderSettingsView();
                    break;
            }
        }
        
        function renderHomeView() {
            // Calculate some stats
            const totalBookings = bookingHistory.length;
            const totalFavorites = favoriteMovies.length;
            const nowShowingCount = moviesData.nowShowing ? moviesData.nowShowing.length : 0;
            const upcomingCount = moviesData.comingSoon ? moviesData.comingSoon.length : 0;
            
            return `
                <div class="max-w-6xl mx-auto">
                    <!-- Welcome Section -->
                    <div class="text-center mb-12 animate__animated animate__fadeIn">
                        <h2 class="text-5xl font-black mb-4 gradient-text">Welcome to ONECINEHUB!</h2>
                        <p class="text-xl text-gray-300 mb-4">Your one-stop destination for an unparalleled cinematic experience.</p>
                        <div class="flex justify-center gap-4">
                            <span class="px-4 py-2 bg-red-500/10 rounded-full text-sm">
                                <i class="fas fa-star text-yellow-500 mr-2"></i>
                                Member since ${new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Stats Overview -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        <div class="stat-card" onclick="renderPage('booking')" style="cursor: pointer;">
                            <i class="fas fa-film text-3xl text-red-500 mb-3"></i>
                            <div class="stat-value">${nowShowingCount}</div>
                            <div class="text-sm text-gray-400">Now Showing</div>
                        </div>
                        <div class="stat-card" onclick="renderPage('booking'); setTimeout(() => document.getElementById('db-coming-soon-btn').click(), 100);" style="cursor: pointer;">
                            <i class="fas fa-calendar text-3xl text-red-500 mb-3"></i>
                            <div class="stat-value">${upcomingCount}</div>
                            <div class="text-sm text-gray-400">Coming Soon</div>
                        </div>
                        <div class="stat-card" onclick="renderPage('history')" style="cursor: pointer;">
                            <i class="fas fa-ticket-alt text-3xl text-red-500 mb-3"></i>
                            <div class="stat-value">${totalBookings}</div>
                            <div class="text-sm text-gray-400">Your Bookings</div>
                        </div>
                        <div class="stat-card" onclick="renderPage('favorites')" style="cursor: pointer;">
                            <i class="fas fa-heart text-3xl text-red-500 mb-3"></i>
                            <div class="stat-value">${totalFavorites}</div>
                            <div class="text-sm text-gray-400">Favorites</div>
                        </div>
                    </div>
                    
                    <!-- Feature Cards -->
                    <h3 class="text-2xl font-bold mb-6">Quick Actions</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Latest Movies Card -->
                        <div class="glass-card p-8 text-center feature-card" onclick="renderPage('booking')">
                            <i class="fas fa-film text-5xl text-red-500 mb-4"></i>
                            <h3 class="font-bold text-xl mb-2">Latest Movies</h3>
                            <p class="text-gray-400 mb-4">Watch blockbusters first</p>
                            <div class="flex justify-center gap-2 text-sm text-red-400">
                                <span>${nowShowingCount} now showing</span>
                                <span>•</span>
                                <span>${upcomingCount} upcoming</span>
                            </div>
                            <div class="card-arrow">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                        
                        <!-- Premium Seats Card -->
                        <div class="glass-card p-8 text-center feature-card" onclick="showSeatFeatures()">
                            <i class="fas fa-couch text-5xl text-red-500 mb-4"></i>
                            <h3 class="font-bold text-xl mb-2">Premium Seats</h3>
                            <p class="text-gray-400 mb-4">Comfort redefined</p>
                            <div class="flex flex-wrap justify-center gap-2 text-xs">
                                <span class="px-2 py-1 bg-red-500/20 rounded"><i class="fas fa-couch mr-1"></i> Recliners</span>
                                <span class="px-2 py-1 bg-red-500/20 rounded"><i class="fas fa-ruler-horizontal mr-1"></i> Extra Legroom</span>
                                <span class="px-2 py-1 bg-red-500/20 rounded"><i class="fas fa-gamepad mr-1"></i> VIP Lounge</span>
                            </div>
                            <div class="card-arrow">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                        
                        <!-- Easy Booking Card -->
                        <div class="glass-card p-8 text-center feature-card" onclick="showBookingGuide()">
                            <i class="fas fa-ticket-alt text-5xl text-red-500 mb-4"></i>
                            <h3 class="font-bold text-xl mb-2">Easy Booking</h3>
                            <p class="text-gray-400 mb-4">Book in seconds</p>
                            <div class="flex items-center justify-center gap-4 text-sm text-gray-300">
                                <span><i class="fas fa-mouse-pointer text-red-500"></i> 1 Click</span>
                                <span><i class="fas fa-chair text-red-500"></i> Select Seats</span>
                                <span><i class="fas fa-credit-card text-red-500"></i> Pay</span>
                            </div>
                            <div class="card-arrow">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Activity Section (if any) -->
                    ${bookingHistory.length > 0 ? `
                        <div class="mt-12">
                            <h3 class="text-2xl font-bold mb-6">Recent Activity</h3>
                            <div class="glass-card p-6">
                                <div class="space-y-4">
                                    ${bookingHistory.slice(0, 3).map(booking => `
                                        <div class="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                            <div class="flex items-center gap-4">
                                                <img src="${booking.movie_poster}" class="w-16 h-24 object-cover rounded" alt="${booking.movie_title}">
                                                <div>
                                                    <h4 class="font-bold">${booking.movie_title}</h4>
                                                    <p class="text-sm text-gray-400">${new Date(booking.date).toLocaleDateString()} • ${booking.time}</p>
                                                </div>
                                            </div>
                                            <button onclick="downloadTicket('${booking.tx_number}')" class="text-red-500 hover:text-red-400">
                                                <i class="fas fa-download"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                                ${bookingHistory.length > 3 ? `
                                    <div class="text-center mt-4">
                                        <button onclick="renderPage('history')" class="text-red-500 hover:text-red-400 text-sm">
                                            View All History <i class="fas fa-arrow-right ml-2"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Genre Quick Links -->
                    <div class="mt-12">
                        <h3 class="text-2xl font-bold mb-6">Browse by Genre</h3>
                        <div class="flex flex-wrap gap-3">
                            ${allGenres.slice(0, 8).map(genre => `
                                <button onclick="renderPage('booking'); setTimeout(() => filterByGenre('${genre}'), 200)" 
                                    class="px-4 py-2 bg-white/5 hover:bg-red-500/20 rounded-full text-sm transition-all hover:scale-105">
                                    ${genre}
                                </button>
                            `).join('')}
                            ${allGenres.length > 8 ? `
                                <button onclick="renderPage('booking')" class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-full text-sm">
                                    +${allGenres.length - 8} more
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Function to show seat features modal
        function showSeatFeatures() {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="glass-card max-w-2xl w-full p-8 relative animate__animated animate__fadeInUp">
                    <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2 class="text-3xl font-black mb-6 gradient-text">Premium Seat Experience</h2>
                    <div class="grid grid-cols-2 gap-6">
                        <div class="text-center">
                            <i class="fas fa-couch text-5xl text-red-500 mb-3"></i>
                            <h3 class="font-bold">Luxury Recliners</h3>
                            <p class="text-sm text-gray-400">Fully reclinable seats with footrests</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-volume-up text-5xl text-red-500 mb-3"></i>
                            <h3 class="font-bold">Dolby Atmos</h3>
                            <p class="text-sm text-gray-400">Immersive sound experience</p>
                        </div>
                    </div>
                    <button onclick="renderPage('booking'); this.closest('.fixed').remove()" class="action-btn w-full mt-6">
                        Book Premium Seats Now
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Function to show booking guide
        function showBookingGuide() {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="glass-card max-w-2xl w-full p-8 relative animate__animated animate__fadeInUp">
                    <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2 class="text-3xl font-black mb-6 gradient-text">How to Book</h2>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">1</div>
                            <p>Browse movies in the <span class="text-red-500">MOVIES</span> section</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">2</div>
                            <p>Click <span class="text-red-500">Buy Ticket</span> on your chosen movie</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">3</div>
                            <p>Select your preferred <span class="text-red-500">date, time, and seats</span></p>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">4</div>
                            <p>Complete payment and get your <span class="text-red-500">e-ticket</span></p>
                        </div>
                    </div>
                    <button onclick="renderPage('booking'); this.closest('.fixed').remove()" class="action-btn w-full mt-6">
                        Start Booking
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        async function renderBookingView() {
            try {
                const response = await fetch('api.php?action=get_movies');
                moviesData.allMovies = await response.json();
                
                moviesData.nowShowing = moviesData.allMovies.filter(m => m.status === 'nowShowing');
                moviesData.comingSoon = moviesData.allMovies.filter(m => m.status === 'comingSoon');
                
                renderMoviesWithGenreFilter('nowShowing');
                
            } catch (error) {
                console.error('Error loading movies:', error);
            }
        }
        
        function renderMoviesWithGenreFilter(status) {
            const movies = status === 'nowShowing' ? moviesData.nowShowing : moviesData.comingSoon;
            const filteredMovies = currentGenre === 'all' 
                ? movies 
                : movies.filter(m => m.genre && m.genre.toLowerCase().includes(currentGenre.toLowerCase()));
            
            const mainContent = document.getElementById('dashboard-main-content');
            
            // Generate genre filter buttons
            const genreButtons = `
                <button class="genre-filter-btn ${currentGenre === 'all' ? 'active' : ''}" onclick="filterByGenre('all')">All</button>
                ${allGenres.map(genre => `
                    <button class="genre-filter-btn ${currentGenre === genre ? 'active' : ''}" onclick="filterByGenre('${genre}')">
                        ${genre}
                    </button>
                `).join('')}
            `;
            
            mainContent.innerHTML = `
                <div class="flex flex-col md:flex-row justify-between items-center mb-10">
                    <h2 class="text-4xl font-black gradient-text mb-6 md:mb-0">Browse Movies</h2>
                    <nav class="flex items-center gap-8 text-lg font-black dashboard-sub-nav">
                        <button id="db-now-showing-btn" class="active text-white">NOW SHOWING</button>
                        <button id="db-coming-soon-btn" class="text-gray-500">COMING SOON</button>
                    </nav>
                </div>
                
                <!-- Genre Filter Section -->
                <div class="mb-8">
                    <div class="flex items-center gap-4 mb-4">
                        <i class="fas fa-filter text-red-500"></i>
                        <span class="font-bold text-gray-300">Filter by Genre:</span>
                        <span id="movie-count" class="text-sm text-gray-400">${filteredMovies.length} movies</span>
                    </div>
                    <div class="genre-filter-container">
                        ${genreButtons}
                    </div>
                </div>
                
                <!-- Now Showing Section -->
                <section id="db-now-showing-content" class="${status === 'nowShowing' ? '' : 'hidden'}">
                    <div id="now-showing-grid" class="movie-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        ${renderMovieGrid('nowShowing', filteredMovies)}
                    </div>
                </section>
                
                <!-- Coming Soon Section -->
                <section id="db-coming-soon-content" class="${status === 'comingSoon' ? '' : 'hidden'}">
                    <div id="coming-soon-grid" class="movie-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        ${renderComingSoonGrid('comingSoon', filteredMovies)}
                    </div>
                </section>
            `;
            
            // Add event listeners for tab switching
            document.getElementById('db-now-showing-btn').addEventListener('click', () => {
                document.getElementById('db-now-showing-btn').classList.add('active', 'text-white');
                document.getElementById('db-now-showing-btn').classList.remove('text-gray-500');
                document.getElementById('db-coming-soon-btn').classList.remove('active', 'text-white');
                document.getElementById('db-coming-soon-btn').classList.add('text-gray-500');
                document.getElementById('db-now-showing-content').classList.remove('hidden');
                document.getElementById('db-coming-soon-content').classList.add('hidden');
                filterByGenre(currentGenre, 'nowShowing');
            });
            
            document.getElementById('db-coming-soon-btn').addEventListener('click', () => {
                document.getElementById('db-coming-soon-btn').classList.add('active', 'text-white');
                document.getElementById('db-coming-soon-btn').classList.remove('text-gray-500');
                document.getElementById('db-now-showing-btn').classList.remove('active', 'text-white');
                document.getElementById('db-now-showing-btn').classList.add('text-gray-500');
                document.getElementById('db-coming-soon-content').classList.remove('hidden');
                document.getElementById('db-now-showing-content').classList.add('hidden');
                filterByGenre(currentGenre, 'comingSoon');
            });
        }
        
        function renderMovieGrid(status, movies) {
            if (movies.length === 0) {
                return `
                    <div class="col-span-full text-center text-gray-400 py-12 no-results">
                        <i class="fas fa-film text-6xl mb-4 opacity-50"></i>
                        <p class="text-xl mb-2">No movies found in this genre</p>
                        <p class="text-sm text-gray-500">Try selecting a different genre</p>
                    </div>
                `;
            }
            
            return movies.map(movie => {
                const userFavorites = favoriteMovies.map(f => f.id);
                const isFavorited = userFavorites.includes(movie.id);
                
                return `
                    <div class="client-movie-card cursor-pointer relative" data-movie-id="${movie.id}" onclick="viewMovieDetails(${movie.id})">
                        <div class="genre-badge">
                            <i class="fas fa-tag mr-1"></i>${movie.genre || 'General'}
                        </div>
                        <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
                        <div class="overlay">
                            <h4 class="font-black text-xl mb-3">${movie.title}</h4>
                            <p class="text-sm text-gray-300 mb-4">${movie.genre || 'General'} • ${movie.duration || 'N/A'}</p>
                            <div class="flex justify-between items-center w-full gap-3">
                                <button class="buy-ticket-btn action-btn !text-xs !py-1 !px-3" onclick="event.stopPropagation(); startBooking(${movie.id})">
                                    <i class="fas fa-ticket-alt mr-2"></i> Buy Ticket
                                </button>
                                <i class="fas fa-heart fav-icon ${isFavorited ? 'favorited' : ''} !text-2xl" onclick="event.stopPropagation(); toggleFavorite(${movie.id}, this)"></i>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function renderComingSoonGrid(status, movies) {
            if (movies.length === 0) {
                return `
                    <div class="col-span-full text-center text-gray-400 py-12 no-results">
                        <i class="fas fa-calendar text-6xl mb-4 opacity-50"></i>
                        <p class="text-xl mb-2">No upcoming movies in this genre</p>
                        <p class="text-sm text-gray-500">Try selecting a different genre</p>
                    </div>
                `;
            }
            
            return movies.map(movie => `
                <div class="client-movie-card relative">
                    <div class="genre-badge">
                        <i class="fas fa-tag mr-1"></i>${movie.genre || 'General'}
                    </div>
                    <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
                    <div class="absolute top-3 right-3">
                        <span class="status-badge badge-coming-soon">Coming Soon</span>
                    </div>
                    <div class="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p class="text-xs font-bold">${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'}</p>
                    </div>
                </div>
            `).join('');
        }
        
        function filterByGenre(genre, specificStatus = null) {
            currentGenre = genre;
            
            // Update active state of genre buttons
            document.querySelectorAll('.genre-filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.trim() === (genre === 'all' ? 'All' : genre)) {
                    btn.classList.add('active');
                }
            });
            
            // Determine which status is currently active
            const isNowShowing = !document.getElementById('db-now-showing-content').classList.contains('hidden');
            const status = specificStatus || (isNowShowing ? 'nowShowing' : 'comingSoon');
            
            // Get the appropriate movie list
            const movies = status === 'nowShowing' ? moviesData.nowShowing : moviesData.comingSoon;
            
            // Filter movies by genre
            const filteredMovies = genre === 'all' 
                ? movies 
                : movies.filter(m => m.genre && m.genre.toLowerCase().includes(genre.toLowerCase()));
            
            // Update movie count
            const movieCountEl = document.getElementById('movie-count');
            if (movieCountEl) {
                movieCountEl.textContent = `${filteredMovies.length} movies`;
            }
            
            // Add filtering animation
            const gridElement = status === 'nowShowing' 
                ? document.getElementById('now-showing-grid')
                : document.getElementById('coming-soon-grid');
            
            if (gridElement) {
                gridElement.classList.add('filtering');
                
                // Update grid content
                if (status === 'nowShowing') {
                    gridElement.innerHTML = renderMovieGrid(status, filteredMovies);
                } else {
                    gridElement.innerHTML = renderComingSoonGrid(status, filteredMovies);
                }
                
                // Remove animation class
                setTimeout(() => {
                    gridElement.classList.remove('filtering');
                }, 300);
            }
        }
        
        function createMovieCard(movie) {
            const userFavorites = favoriteMovies.map(f => f.id);
            const isFavorited = userFavorites.includes(movie.id);
            
            return `
                <div class="client-movie-card cursor-pointer" data-movie-id="${movie.id}" onclick="viewMovieDetails(${movie.id})">
                    <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
                    <div class="overlay">
                        <h4 class="font-black text-xl mb-3">${movie.title}</h4>
                        <p class="text-sm text-gray-300 mb-4">${movie.genre} • ${movie.duration}</p>
                        <div class="flex justify-between items-center w-full gap-3">
                            <button class="buy-ticket-btn action-btn !text-xs !py-1 !px-3" onclick="event.stopPropagation(); startBooking(${movie.id})">
                                <i class="fas fa-ticket-alt mr-2"></i> Buy Ticket
                            </button>
                            <i class="fas fa-heart fav-icon ${isFavorited ? 'favorited' : ''} !text-2xl" onclick="event.stopPropagation(); toggleFavorite(${movie.id}, this)"></i>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function createComingSoonCard(movie) {
            return `
                <div class="client-movie-card">
                    <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
                    <div class="absolute top-3 right-3">
                        <span class="status-badge badge-coming-soon">Coming Soon</span>
                    </div>
                    <div class="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p class="text-xs font-bold">${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'}</p>
                    </div>
                </div>
            `;
        }
        
        function renderFavoritesView() {
            if (favoriteMovies.length === 0) {
                return `
                    <div class="text-center py-20">
                        <i class="fas fa-heart text-6xl text-gray-600 mb-6"></i>
                        <h2 class="text-4xl font-black mb-4">My Favorites</h2>
                        <p class="text-xl text-gray-400">Use the <i class="fas fa-heart text-red-500"></i> icon on movies to add them to your favorites.</p>
                    </div>
                `;
            }
            
            const cards = favoriteMovies.map(createMovieCard).join('');
            
            return `
                <h2 class="text-4xl font-black mb-8 gradient-text">My Favorites</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">${cards}</div>
            `;
        }
        
        function renderHistoryView() {
            if (bookingHistory.length === 0) {
                return `
                    <div class="text-center py-20">
                        <i class="fas fa-history text-6xl text-gray-600 mb-6"></i>
                        <h2 class="text-4xl font-black mb-4">My Booking History</h2>
                        <p class="text-xl text-gray-400">You haven't booked any tickets yet.</p>
                    </div>
                `;
            }
            
            const items = bookingHistory.map(item => `
                <div class="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-red-500/30 transition-all">
                    <img src="${item.movie_poster}" class="w-24 h-36 object-cover rounded-lg shadow-lg" alt="${item.movie_title}">
                    <div class="flex-grow">
                        <h3 class="font-black text-2xl mb-2">${item.movie_title}</h3>
                        <div class="space-y-1 text-gray-300">
                            <p><i class="fas fa-map-marker-alt w-5 text-red-500"></i> ${item.branch}</p>
                            <p><i class="fas fa-calendar w-5 text-red-500"></i> ${new Date(item.date).toLocaleDateString()}</p>
                            <p><i class="fas fa-clock w-5 text-red-500"></i> ${item.time}</p>
                            <p><i class="fas fa-chair w-5 text-red-500"></i> Seats: ${JSON.parse(item.seats).join(', ')}</p>
                        </div>
                        <p class="text-xs text-gray-500 mt-3 font-mono">Booking ID: ${item.tx_number}</p>
                    </div>
                    <button onclick="downloadTicket('${item.tx_number}')" class="action-btn flex items-center gap-2 whitespace-nowrap">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `).join('');
            
            return `
                <h2 class="text-4xl font-black mb-8 gradient-text">My Booking History</h2>
                <div class="space-y-6">${items}</div>
            `;
        }
        
        function toggleNotifications() {
            const panel = document.getElementById('notifications-panel');
            panel.classList.toggle('hidden');
            
            if (!panel.classList.contains('hidden')) {
                // Mark notifications as read
                fetch('api.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'mark_notifications_read'
                    })
                });
                
                // Update badge
                document.getElementById('notification-badge').style.display = 'none';
            }
        }
        
        async function toggleFavorite(movieId, iconElement) {
            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'toggle_favorite',
                        movie_id: movieId
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    iconElement.classList.toggle('favorited');
                    if (result.favorited) {
                        // Add to favorites array
                        const movieResponse = await fetch(`api.php?action=get_movie&id=${movieId}`);
                        const movie = await movieResponse.json();
                        favoriteMovies.push(movie);
                    } else {
                        // Remove from favorites array
                        const index = favoriteMovies.findIndex(m => m.id == movieId);
                        if (index > -1) {
                            favoriteMovies.splice(index, 1);
                        }
                    }
                    
                    // Refresh favorites view if currently viewing
                    if (currentView === 'favorites') {
                        renderPage('favorites');
                    }
                }
            } catch (error) {
                console.error('Error toggling favorite:', error);
            }
        }
        
        function viewMovieDetails(movieId) {
            window.location.href = `movie_details.php?id=${movieId}`;
        }
        
        function startBooking(movieId) {
            window.location.href = `booking.php?movie_id=${movieId}`;
        }
        
        function downloadTicket(txNumber) {
            const booking = bookingHistory.find(b => b.tx_number === txNumber);
            if (!booking) return;
            
            // Generate PDF ticket using jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(26);
            doc.setTextColor(229, 9, 20);
            doc.text('ONECINEHUB E-TICKET', 105, 20, null, null, 'center');
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Booking ID: ${txNumber}`, 105, 28, null, null, 'center');
            
            doc.setLineWidth(0.5);
            doc.setDrawColor(229, 9, 20);
            doc.line(20, 35, 190, 35);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(0);
            doc.text(booking.movie_title, 20, 50);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(60);
            doc.text(`Cinema: ${booking.branch}`, 20, 65);
            doc.text(`Date: ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 75);
            doc.text(`Showtime: ${booking.time}`, 20, 85);
            doc.text(`Seats: ${JSON.parse(booking.seats).join(', ')}`, 20, 95);
            doc.text(`Total Price: PHP ${parseFloat(booking.total_price).toFixed(2)}`, 20, 105);
            
            doc.setLineWidth(0.3);
            doc.setDrawColor(200);
            doc.line(20, 115, 190, 115);
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text('Present this ticket at the cinema entrance', 105, 125, null, null, 'center');
            doc.text('Thank you for choosing ONECINEHUB!', 105, 132, null, null, 'center');
            
doc.save(`ONECINEHUB-Ticket-${txNumber}.pdf`);
        }
        
        // Settings View
        function renderSettingsView() {
            return `
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-4xl font-black mb-8 gradient-text">Account Settings</h2>
                    
                    <!-- Success/Error Messages -->
                    <div id="settings-message" class="hidden mb-6 p-4 rounded-lg"></div>
                    
                    <!-- Profile Section -->
                    <div class="glass-card p-8 mb-8">
                        <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
                            <i class="fas fa-user text-red-500"></i>
                            Profile Information
                        </h3>
                        <form id="profile-form" onsubmit="updateProfile(event)">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                    <input type="text" id="settings-username" value="${currentUser.username || ''}" 
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input type="email" id="settings-email" value="${currentUser.email || ''}" 
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                    <input type="tel" id="settings-phone" value="${currentUser.phone || ''}" 
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        placeholder="Enter your phone number">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                                    <input type="text" value="${currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}" 
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400" readonly>
                                </div>
                            </div>
                            <button type="submit" class="action-btn">
                                <i class="fas fa-save mr-2"></i> Save Changes
                            </button>
                        </form>
                    </div>
                    
                    <!-- Change Password Section -->
                    <div class="glass-card p-8">
                        <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
                            <i class="fas fa-lock text-red-500"></i>
                            Change Password
                        </h3>
                        <form id="password-form" onsubmit="changePassword(event)">
                            <div class="space-y-6 mb-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                                    <input type="password" id="current-password" 
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                    <input type="password" id="new-password" 
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        required minlength="8">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                                    <input type="password" id="confirm-password" 
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        required>
                                </div>
                            </div>
                            <button type="submit" class="action-btn">
                                <i class="fas fa-key mr-2"></i> Change Password
                            </button>
                        </form>
                    </div>
                </div>
            `;
        }
        
        async function updateProfile(e) {
            e.preventDefault();
            const username = document.getElementById('settings-username').value;
            const email = document.getElementById('settings-email').value;
            const phone = document.getElementById('settings-phone').value;
            
            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'update_profile',
                        username,
                        email,
                        phone
                    })
                });
                
                const result = await response.json();
                const messageEl = document.getElementById('settings-message');
                
                if (result.success) {
                    messageEl.className = 'mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-400';
                    messageEl.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + result.message;
                    currentUser.username = username;
                    currentUser.email = email;
                    currentUser.phone = phone;
                } else {
                    messageEl.className = 'mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400';
                    messageEl.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>' + result.message;
                }
                messageEl.classList.remove('hidden');
                
                setTimeout(() => {
                    messageEl.classList.add('hidden');
                }, 5000);
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        }
        
        async function changePassword(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                const messageEl = document.getElementById('settings-message');
                messageEl.className = 'mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400';
                messageEl.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>New passwords do not match';
                messageEl.classList.remove('hidden');
                return;
            }
            
            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'change_password',
                        current_password: currentPassword,
                        new_password: newPassword,
                        confirm_password: confirmPassword
                    })
                });
                
                const result = await response.json();
                const messageEl = document.getElementById('settings-message');
                
                if (result.success) {
                    messageEl.className = 'mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-400';
                    messageEl.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + result.message;
                    document.getElementById('password-form').reset();
                } else {
                    messageEl.className = 'mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400';
                    messageEl.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>' + result.message;
                }
                messageEl.classList.remove('hidden');
                
                setTimeout(() => {
                    messageEl.classList.add('hidden');
                }, 5000);
            } catch (error) {
                console.error('Error changing password:', error);
            }
        }
    </script>
</body>
</html>
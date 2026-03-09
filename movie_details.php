<?php
require_once 'config.php';
requireLogin();

$movieId = $_GET['id'] ?? 0;

// Get movie details
$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ? AND status = 'nowShowing'");
$stmt->execute([$movieId]);
$movie = $stmt->fetch();

if (!$movie) {
    redirect('dashboard.php');
}

// Check if user has favorited this movie
$stmt = $pdo->prepare("SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?");
$stmt->execute([$_SESSION['user_id'], $movieId]);
$isFavorited = $stmt->fetch() ? true : false;

// Get trailer for this movie
$stmt = $pdo->prepare("SELECT * FROM trailers WHERE movie_id = ?");
$stmt->execute([$movieId]);
$trailer = $stmt->fetch();

// Get current user
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$currentUser = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($movie['title']) ?> | ONECINEHUB</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="client.css">
</head>
<body>
    <div class="min-h-screen bg-dark-bg">
        <!-- Header -->
        <header class="dashboard-header sticky top-0 z-50">
            <div class="container mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
                <div class="flex items-center gap-12">
                    <h1 class="text-2xl md:text-3xl font-black gradient-text tracking-wider">ONECINEHUB</h1>
                    <nav class="hidden md:flex items-center gap-10 text-sm font-bold">
                        <a href="dashboard.php" class="text-gray-400 hover:text-white transition-colors"></a>
                    </nav>
                </div>
                <div class="flex items-center gap-6">
                    <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-black text-lg"><?= strtoupper(substr($currentUser['username'], 0, 1)) ?></div>
                    <span class="hidden sm:block text-sm font-bold"><?= htmlspecialchars($currentUser['username']) ?></span>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-6 lg:px-10 py-10">
            <button onclick="history.back()" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                <i class="fas fa-arrow-left"></i> Back to Movies
            </button>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div class="lg:col-span-1">
                    <img src="<?= htmlspecialchars($movie['poster']) ?>" alt="<?= htmlspecialchars($movie['title']) ?>" class="rounded-xl w-full shadow-2xl aspect-[2/3] object-cover border-4 border-white/10">
                </div>

                <div class="lg:col-span-2">
                    <div class="flex items-start gap-6 mb-4">
                        <h2 class="text-5xl lg:text-6xl font-black flex-grow leading-tight"><?= htmlspecialchars($movie['title']) ?></h2>
                        <i onclick="toggleFavorite(<?= $movie['id'] ?>, this)" class="fas fa-heart fav-icon <?= $isFavorited ? 'favorited' : '' ?> flex-shrink-0 mt-2 cursor-pointer"></i>
                    </div>

                    <div class="flex items-center flex-wrap gap-4 mb-6">
                        <span class="text-lg font-bold text-gray-300"><?= htmlspecialchars($movie['genre']) ?></span>
                        <span class="text-gray-600">•</span>
                        <span class="text-lg font-bold text-gray-300"><?= htmlspecialchars($movie['duration']) ?></span>
                        <span class="text-gray-600">•</span>
                        <span class="border-2 border-red-500 px-4 py-1 rounded-lg font-black text-red-500"><?= htmlspecialchars($movie['rating']) ?></span>
                    </div>

                    <div class="glass-card p-6 mb-6">
                        <h3 class="text-2xl font-black mb-3 text-red-500">Synopsis</h3>
                        <p class="text-lg leading-relaxed text-gray-300"><?= htmlspecialchars($movie['synopsis']) ?></p>
                    </div>

                    <div class="glass-card p-6 mb-6">
                        <h3 class="text-2xl font-black mb-3 text-red-500">Cast</h3>
                        <p class="text-lg text-gray-300"><?= htmlspecialchars($movie['cast']) ?></p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4 mb-8">
                        <a href="booking.php?movie_id=<?= $movie['id'] ?>" class="action-btn flex-1 text-xl py-5 text-center">
                            <i class="fas fa-ticket-alt mr-3"></i> Get Tickets
                        </a>
                        <?php if ($trailer): ?>
                            <button onclick="openTrailerModal('<?= htmlspecialchars($trailer['url']) ?>')" class="flex-1 text-xl py-5 bg-transparent border-2 border-white/30 hover:bg-white/10 text-white rounded-lg transition-all">
                                <i class="fas fa-play mr-3"></i> Watch Trailer
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </main>
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
        function openTrailerModal(trailerUrl) {
            if (!trailerUrl) {
                alert('Trailer not available');
                return;
            }
            document.getElementById('trailer-iframe').src = trailerUrl;
            document.getElementById('trailerModal').style.display = 'block';
        }

        document.getElementById('closeTrailer').addEventListener('click', () => {
            document.getElementById('trailerModal').style.display = 'none';
            document.getElementById('trailer-iframe').src = '';
        });

        window.onclick = (e) => {
            if (e.target == document.getElementById('trailerModal')) {
                document.getElementById('trailerModal').style.display = 'none';
                document.getElementById('trailer-iframe').src = '';
            }
        };

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
                }
            } catch (error) {
                console.error('Error toggling favorite:', error);
            }
        }
    </script>
</body>
</html>
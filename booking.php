<?php
require_once 'config.php';
requireLogin();

$movieId = $_GET['movie_id'] ?? 0;

// Get movie details
$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ? AND status = 'nowShowing'");
$stmt->execute([$movieId]);
$movie = $stmt->fetch();

if (!$movie) {
    redirect('dashboard.php');
}

// Get available cinemas for this movie
$stmt = $pdo->prepare("
    SELECT DISTINCT c.* 
    FROM cinemas c 
    JOIN schedules s ON c.id = s.cinema_id 
    WHERE s.movie_id = ?
");
$stmt->execute([$movieId]);
$cinemas = $stmt->fetchAll();

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
    <title>Book Tickets - <?= htmlspecialchars($movie['title']) ?> | ONECINEHUB</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
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
            <!-- Movie Header -->
            <div class="glass-card p-6 flex items-center gap-6 mb-10 border-l-4 border-red-500">
                <img src="<?= htmlspecialchars($movie['poster']) ?>" alt="<?= htmlspecialchars($movie['title']) ?>" class="w-20 h-30 object-cover rounded-lg shadow-lg hidden sm:block">
                <div>
                    <h2 class="text-2xl font-black mb-1"><?= htmlspecialchars($movie['title']) ?></h2>
                    <p class="text-gray-300"><?= htmlspecialchars($movie['genre']) ?> • <?= htmlspecialchars($movie['duration']) ?> • <?= htmlspecialchars($movie['rating']) ?></p>
                </div>
            </div>

            <!-- Booking Steps -->
            <div id="booking-content">
                <!-- Step 1: Select Cinema -->
                <div id="step-1" class="booking-step">
                    <h2 class="text-3xl font-black mb-6">Select Cinema</h2>
                    <?php if (empty($cinemas)): ?>
                        <div class="text-center py-20">
                            <i class="fas fa-map-marker-alt text-6xl text-gray-600 mb-6"></i>
                            <h2 class="text-4xl font-black mb-4">No Cinemas Available</h2>
                            <p class="text-xl text-gray-400">There are currently no cinemas showing this movie.</p>
                            <a href="dashboard.php" class="action-btn mt-6 inline-block">Back to Movies</a>
                        </div>
                    <?php else: ?>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <?php foreach ($cinemas as $cinema): ?>
                                <button onclick="selectCinema(<?= (int)$cinema['id'] ?>, '<?= htmlspecialchars($cinema['name']) ?>')" class="glass-card p-6 text-left hover:border-red-500/50 transition-all group">
                                    <i class="fas fa-building text-3xl text-red-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h3 class="font-black text-xl mb-2"><?= htmlspecialchars($cinema['name']) ?></h3>
                                    <p class="text-gray-400 mb-2"><?= htmlspecialchars($cinema['location']) ?></p>
                                    <p class="text-sm text-gray-500"><?= htmlspecialchars($cinema['address']) ?></p>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Step 2: Select Date & Time -->
                <div id="step-2" class="booking-step hidden">
                    <button onclick="goToStep(1)" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                        <i class="fas fa-arrow-left"></i> Back to Cinemas
                    </button>
                    <h2 class="text-3xl font-black mb-6">Select Date & Time</h2>
                    <div id="date-time-content">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>

                <!-- Step 3: Select Seats -->
                <div id="step-3" class="booking-step hidden">
                    <button onclick="goToStep(2)" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                        <i class="fas fa-arrow-left"></i> Back to Showtimes
                    </button>
                    <h2 class="text-3xl font-black mb-6">Select Seats</h2>
                    <div id="seat-selection-content">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>

                <!-- Step 4: Payment -->
                <div id="step-4" class="booking-step hidden">
                    <button onclick="goToStep(3)" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                        <i class="fas fa-arrow-left"></i> Back to Seat Selection
                    </button>
                    <h2 class="text-3xl font-black mb-6">Payment</h2>
                    <div id="payment-content">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>

                <!-- Step 5: Confirmation -->
                <div id="step-5" class="booking-step hidden">
                    <div id="confirmation-content">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        const movie = <?= json_encode($movie) ?>;
        const cinemas = <?= json_encode($cinemas) ?>;
        
        let bookingData = {
            movieId: movie.id,
            movie: movie,
            cinemaId: null,
            cinemaName: '',
            date: '',
            time: '',
            seats: [],
            totalPrice: 0,
            paymentMethod: ''
        };
        
        let currentStep = 1;
        
        function goToStep(step) {
            document.querySelectorAll('.booking-step').forEach(el => el.classList.add('hidden'));
            document.getElementById(`step-${step}`).classList.remove('hidden');
            currentStep = step;
        }
        
        async function selectCinema(cinemaId, cinemaName) {
            bookingData.cinemaId = cinemaId;
            bookingData.cinemaName = cinemaName;
            
            try {
                const response = await fetch(`api.php?action=get_schedules&movie_id=${movie.id}`);
                const schedules = await response.json();
                
                const cinemaSchedules = schedules.filter(s => s.cinema_id == cinemaId);
                
                if (cinemaSchedules.length === 0) {
                    document.getElementById('date-time-content').innerHTML = `
                        <div class="text-center py-20">
                            <i class="fas fa-calendar-times text-6xl text-gray-600 mb-6"></i>
                            <h2 class="text-4xl font-black mb-4">No Showtimes Available</h2>
                            <p class="text-xl text-gray-400">There are currently no scheduled showtimes for this movie at the selected cinema.</p>
                        </div>
                    `;
                } else {
                    renderDateTimeSelection(cinemaSchedules);
                }
                
                goToStep(2);
            } catch (error) {
                console.error('Error loading schedules:', error);
            }
        }
        
        function renderDateTimeSelection(schedules) {
            const dates = [...new Set(schedules.map(s => s.date))].sort();
            
            let html = `
                <h3 class="text-xl font-bold mb-4">Select Date</h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-10">
            `;
            
            dates.forEach((date, index) => {
                const dateObj = new Date(date);
                const isSelected = index === 0;
                if (isSelected) bookingData.date = date;
                
                html += `
                    <button onclick="selectDate('${date}')" class="date-btn glass-card p-4 text-center ${isSelected ? 'border-red-500 border-2' : ''}" data-date="${date}">
                        <p class="text-xs text-gray-400 uppercase mb-1">${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p class="text-2xl font-black">${dateObj.getDate()}</p>
                        <p class="text-xs text-gray-400">${dateObj.toLocaleDateString('en-US', { month: 'short' })}</p>
                    </button>
                `;
            });
            
            html += `
                </div>
                <h3 class="text-xl font-bold mb-4">Select Time</h3>
                <div id="showtimes-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"></div>
            `;
            
            document.getElementById('date-time-content').innerHTML = html;
            renderShowtimes(schedules, bookingData.date);
        }
        
        function selectDate(date) {
            bookingData.date = date;
            
            document.querySelectorAll('.date-btn').forEach(btn => {
                btn.classList.remove('border-red-500', 'border-2');
                if (btn.dataset.date === date) {
                    btn.classList.add('border-red-500', 'border-2');
                }
            });
            
            fetch(`api.php?action=get_schedules&movie_id=${movie.id}`)
                .then(res => res.json())
                .then(schedules => {
                    const cinemaSchedules = schedules.filter(s => s.cinema_id == bookingData.cinemaId);
                    renderShowtimes(cinemaSchedules, date);
                });
        }
        
        function renderShowtimes(schedules, date) {
            const scheduleForDate = schedules.find(s => s.date === date);
            const showTimes = scheduleForDate ? JSON.parse(scheduleForDate.show_times || '[]') : [];
            
            const grid = document.getElementById('showtimes-grid');
            grid.innerHTML = showTimes.map(time => `
                <button onclick="selectTime('${time}', ${scheduleForDate ? scheduleForDate.price : 350})" class="glass-card p-6 text-center hover:border-red-500/50 transition-all group">
                    <i class="fas fa-clock text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform"></i>
                    <p class="font-black text-xl">${time}</p>
                    <p class="text-xs text-gray-400 mt-1">Hall 1</p>
                </button>
            `).join('');
        }
        
        async function selectTime(time, price) {
            bookingData.time = time;
            bookingData.totalPrice = price;
            
            try {
                const response = await fetch(`api.php?action=get_occupied_seats&movie_id=${movie.id}&branch=${encodeURIComponent(bookingData.cinemaName)}&date=${bookingData.date}&time=${encodeURIComponent(time)}`);
                const occupiedSeats = await response.json();
                renderSeatSelection(occupiedSeats);
                goToStep(3);
            } catch (error) {
                console.error('Error loading occupied seats:', error);
            }
        }
        
        function renderSeatSelection(occupiedSeats) {
            const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
            const seatsHtml = rows.map(row => {
                let rowSeats = '';
                for (let i = 1; i <= 14; i++) {
                    const seatId = `${row}${i}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    rowSeats += `<div class="seat ${isOccupied ? 'occupied' : ''}" data-seat="${seatId}" ${isOccupied ? '' : `onclick="toggleSeat(this)"`}>${seatId}</div>`;
                    if (i === 3 || i === 11) rowSeats += '<div class="seat aisle"></div>';
                }
                return `<div class="seat-row"><div class="seat-row-label">${row}</div>${rowSeats}<div class="seat-row-label">${row}</div></div>`;
            }).join('');
            
            document.getElementById('seat-selection-content').innerHTML = `
                <div class="glass-card p-6 sm:p-8 lg:p-10">
                    <div class="seat-map-screen"></div>
                    <div class="seat-map-container mb-10">${seatsHtml}</div>
                    <div class="bg-dark-bg rounded-xl p-6 flex flex-wrap justify-between items-center gap-6">
                        <div class="flex items-center gap-10 flex-wrap">
                            <div>
                                <p class="text-gray-400 text-xs uppercase mb-2 font-bold">Your Selection</p>
                                <p id="seat-selection-summary" class="font-black text-2xl">None</p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs uppercase mb-2 font-bold">Total Price</p>
                                <p id="seat-price-summary" class="font-black text-3xl text-red-500">₱0.00</p>
                            </div>
                        </div>
                        <button id="proceed-to-payment-btn" class="action-btn px-10 py-4 text-lg whitespace-nowrap" disabled onclick="goToPayment()">
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            `;
        }
        
        function toggleSeat(seatElement) {
            seatElement.classList.toggle('selected');
            const seatId = seatElement.dataset.seat;
            
            if (bookingData.seats.includes(seatId)) {
                bookingData.seats = bookingData.seats.filter(s => s !== seatId);
            } else {
                bookingData.seats.push(seatId);
            }
            
            const seatCount = bookingData.seats.length;
            document.getElementById('seat-selection-summary').textContent = seatCount ? bookingData.seats.sort().join(', ') : 'None';
            document.getElementById('seat-price-summary').textContent = seatCount ? `₱${(seatCount * bookingData.totalPrice).toFixed(2)}` : '₱0.00';
            document.getElementById('proceed-to-payment-btn').disabled = seatCount === 0;
        }
        
        function goToPayment() {
            bookingData.totalPrice = bookingData.seats.length * bookingData.totalPrice;
            renderPayment();
            goToStep(4);
        }
        
        function renderPayment() {
            document.getElementById('payment-content').innerHTML = `
                <div class="glass-card p-8 sm:p-10">
                    <h2 class="text-4xl font-black mb-10 text-center gradient-text">Payment</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h3 class="font-black text-2xl mb-6 pb-4 border-b border-white/10">Booking Summary</h3>
                            <div class="space-y-5 text-base">
                                <div class="flex justify-between items-center text-2xl">
                                    <span class="font-black">Total:</span>
                                    <span class="text-red-500 font-black">₱${bookingData.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 class="font-black text-2xl mb-6 pb-4 border-b border-white/10">Payment Method</h3>
                            <div class="space-y-4 mb-8">
                                <button class="payment-method-btn w-full text-left p-5 glass-card border-2 border-transparent hover:border-red-500/50 transition-all flex items-center gap-4" onclick="selectPaymentMethod('GCash', this)">GCash</button>
                                <button class="payment-method-btn w-full text-left p-5 glass-card border-2 border-transparent hover:border-red-500/50 transition-all flex items-center gap-4" onclick="selectPaymentMethod('PayMaya', this)">PayMaya</button>
                                <button class="payment-method-btn w-full text-left p-5 glass-card border-2 border-transparent hover:border-red-500/50 transition-all flex items-center gap-4" onclick="selectPaymentMethod('Credit/Debit Card', this)">Credit/Debit Card</button>
                            </div>
                            <div id="payment-form-container"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function selectPaymentMethod(method, buttonElement) {
            document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('border-red-500', 'border-2'));
            buttonElement.classList.add('border-red-500', 'border-2');
            bookingData.paymentMethod = method;
            document.getElementById('payment-form-container').innerHTML = `
                <button onclick="confirmPayment()" class="action-btn w-full mt-6 py-4 text-lg">
                    <i class="fas fa-check-circle mr-2"></i> Confirm Payment
                </button>
            `;
        }
        
        async function confirmPayment() {
            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'create_booking',
                        movie_id: bookingData.movieId,
                        cinema_id: bookingData.cinemaId,
                        date: bookingData.date,
                        time: bookingData.time,
                        seats: bookingData.seats,
                        total_price: bookingData.totalPrice,
                        payment_method: bookingData.paymentMethod,
                        branch: bookingData.cinemaName
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    bookingData.txNumber = result.tx_number;
                    document.getElementById('confirmation-content').innerHTML = `<div class="text-center py-20"><h2 class="text-4xl font-black mb-4 gradient-text">Booking Successful!</h2><p class="text-gray-400">Booking ID: ${bookingData.txNumber}</p><a href="dashboard.php" class="action-btn mt-6 inline-block">Back</a></div>`;
                    goToStep(5);
                } else {
                    alert('Error creating booking: ' + result.message);
                }
            } catch (error) {
                console.error('Error creating booking:', error);
                alert('Error creating booking. Please try again.');
            }
        }
    </script>
</body>
</html>


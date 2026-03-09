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
                                <button onclick="selectCinema(<?= $cinema['id'] ?>, '<?= htmlspecialchars($cinema['name']) ?>')" class="glass-card p-6 text-left hover:border-red-500/50 transition-all group">
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
            // Hide all steps
            document.querySelectorAll('.booking-step').forEach(el => {
                el.classList.add('hidden');
            });
            
            // Show target step
            document.getElementById(`step-${step}`).classList.remove('hidden');
            currentStep = step;
        }
        
        async function selectCinema(cinemaId, cinemaName) {
            bookingData.cinemaId = cinemaId;
            bookingData.cinemaName = cinemaName;
            
            // Load schedules for this cinema and movie
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
                const isSelected = index === 0; // Select first date by default
                if (isSelected) bookingData.date = date;
                
                html += `
                    <button onclick="selectDate('${date}', this)" 
                        class="date-btn glass-card p-4 text-center ${isSelected ? 'border-red-500 border-2' : ''} hover:border-red-500/50 transition-all"
                        data-date="${date}">
                        <p class="text-xs text-gray-400 uppercase mb-1">${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p class="text-2xl font-black">${dateObj.getDate()}</p>
                        <p class="text-xs text-gray-400">${dateObj.toLocaleDateString('en-US', { month: 'short' })}</p>
                    </button>
                `;
            });
            
            html += `
                </div>
                <h3 class="text-xl font-bold mb-4">Select Time</h3>
                <div id="showtimes-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            `;
            
            // Show times for first date by default
            const firstDateSchedule = schedules.find(s => s.date === dates[0]);
            if (firstDateSchedule) {
                const showTimes = JSON.parse(firstDateSchedule.show_times);
                showTimes.forEach(time => {
                    html += `
                        <button onclick="selectTime('${time}', ${firstDateSchedule.price})" class="glass-card p-6 text-center hover:border-red-500/50 transition-all group">
                            <i class="fas fa-clock text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform"></i>
                            <p class="font-black text-xl">${time}</p>
                            <p class="text-xs text-gray-400 mt-1">Hall ${firstDateSchedule.hall}</p>
                            <p class="text-xs text-green-400 mt-1">₱${parseFloat(firstDateSchedule.price).toFixed(2)}</p>
                        </button>
                    `;
                });
            }
            
            html += '</div>';
            
            document.getElementById('date-time-content').innerHTML = html;
        }
        
        function selectDate(date, buttonElement) {
            // Update button states
            document.querySelectorAll('.date-btn').forEach(btn => {
                btn.classList.remove('border-red-500', 'border-2');
            });
            buttonElement.classList.add('border-red-500', 'border-2');
            
            bookingData.date = date;
            
            // Update showtimes for selected date
            updateShowtimes(date);
        }
        
        async function updateShowtimes(date) {
            try {
                const response = await fetch(`api.php?action=get_schedules&movie_id=${movie.id}`);
                const schedules = await response.json();
                
                const schedule = schedules.find(s => s.cinema_id == bookingData.cinemaId && s.date === date);
                
                if (schedule) {
                    const showTimes = JSON.parse(schedule.show_times);
                    let html = '';
                    
                    showTimes.forEach(time => {
                        html += `
                            <button onclick="selectTime('${time}', ${schedule.price})" class="glass-card p-6 text-center hover:border-red-500/50 transition-all group">
                                <i class="fas fa-clock text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform"></i>
                                <p class="font-black text-xl">${time}</p>
                                <p class="text-xs text-gray-400 mt-1">Hall ${schedule.hall}</p>
                                <p class="text-xs text-green-400 mt-1">₱${parseFloat(schedule.price).toFixed(2)}</p>
                            </button>
                        `;
                    });
                    
                    document.getElementById('showtimes-grid').innerHTML = html;
                }
            } catch (error) {
                console.error('Error updating showtimes:', error);
            }
        }
        
        function selectTime(time, price) {
            bookingData.time = time;
            bookingData.ticketPrice = parseFloat(price);
            
            renderSeatSelection();
            goToStep(3);
        }
        
        async function renderSeatSelection() {
            // Get occupied seats
            try {
                const response = await fetch(`api.php?action=get_occupied_seats&movie_id=${bookingData.movieId}&branch=${encodeURIComponent(bookingData.cinemaName)}&date=${bookingData.date}&time=${bookingData.time}`);
                const occupiedSeats = await response.json();
                
                const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                let html = `
                    <div class="glass-card p-6 sm:p-8 lg:p-10">
                        <div class="seat-map-screen"></div>
                        <div class="seat-map-container mb-10">
                `;
                
                rows.forEach(row => {
                    html += `<div class="seat-row"><div class="seat-row-label">${row}</div>`;
                    
                    for (let i = 1; i <= 14; i++) {
                        const seatId = `${row}${i}`;
                        const isOccupied = occupiedSeats.includes(seatId);
                        
                        if (i === 4 || i === 12) {
                            html += '<div class="seat aisle"></div>';
                        }
                        
                        html += `<div class="seat ${isOccupied ? 'occupied' : ''}" data-seat="${seatId}" ${isOccupied ? '' : `onclick="toggleSeat(this)"`}>${seatId}</div>`;
                    }
                    
                    html += `<div class="seat-row-label">${row}</div></div>`;
                });
                
                html += `
                        </div>
                        <div class="border-t border-white/10 pt-8">
                            <div class="flex items-center justify-center flex-wrap gap-8 text-sm mb-8">
                                <span class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-lg" style="background-color: var(--green);"></div>
                                    <span class="font-bold">Available</span>
                                </span>
                                <span class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-lg" style="background-color: var(--selected-seat);"></div>
                                    <span class="font-bold">Selected</span>
                                </span>
                                <span class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-lg" style="background-color: var(--occupied-seat);"></div>
                                    <span class="font-bold">Reserved</span>
                                </span>
                            </div>
                            
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
                                <button id="proceed-to-payment-btn" class="action-btn px-10 py-4 text-lg whitespace-nowrap" disabled onclick="proceedToPayment()">
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('seat-selection-content').innerHTML = html;
            } catch (error) {
                console.error('Error loading occupied seats:', error);
            }
        }
        
        function toggleSeat(seatElement) {
            if (seatElement.classList.contains('occupied') || seatElement.classList.contains('aisle')) return;
            
            seatElement.classList.toggle('selected');
            const seatId = seatElement.dataset.seat;
            
            if (bookingData.seats.includes(seatId)) {
                bookingData.seats = bookingData.seats.filter(s => s !== seatId);
            } else {
                bookingData.seats.push(seatId);
            }
            
            updateSeatSummary();
        }
        
        function updateSeatSummary() {
            const selectionSummaryEl = document.getElementById('seat-selection-summary');
            const priceSummaryEl = document.getElementById('seat-price-summary');
            const proceedBtn = document.getElementById('proceed-to-payment-btn');
            const seatCount = bookingData.seats.length;
            
            if (seatCount === 0) {
                selectionSummaryEl.textContent = 'None';
                priceSummaryEl.textContent = '₱0.00';
                proceedBtn.disabled = true;
                bookingData.totalPrice = 0;
            } else {
                bookingData.totalPrice = seatCount * bookingData.ticketPrice;
                const sortedSeats = bookingData.seats.sort();
                selectionSummaryEl.textContent = sortedSeats.join(', ');
                priceSummaryEl.textContent = `₱${bookingData.totalPrice.toFixed(2)}`;
                proceedBtn.disabled = false;
            }
        }
        
        function proceedToPayment() {
            renderPaymentForm();
            goToStep(4);
        }
        
        function renderPaymentForm() {
            const html = `
                <div class="glass-card p-8 sm:p-10">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h3 class="font-black text-2xl mb-6 pb-4 border-b border-white/10">Booking Summary</h3>
                            <div class="space-y-5 text-base">
                                <div class="flex items-start gap-4">
                                    <i class="fas fa-film text-red-500 text-xl w-6"></i>
                                    <div>
                                        <p class="text-gray-400 text-sm mb-1">Movie</p>
                                        <p class="font-bold text-lg">${bookingData.movie.title}</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-4">
                                    <i class="fas fa-map-marker-alt text-red-500 text-xl w-6"></i>
                                    <div>
                                        <p class="text-gray-400 text-sm mb-1">Cinema</p>
                                        <p class="font-bold text-lg">${bookingData.cinemaName}</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-4">
                                    <i class="fas fa-calendar-alt text-red-500 text-xl w-6"></i>
                                    <div>
                                        <p class="text-gray-400 text-sm mb-1">Date & Time</p>
                                        <p class="font-bold text-lg">${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                        <p class="text-gray-300">${bookingData.time}</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-4">
                                    <i class="fas fa-chair text-red-500 text-xl w-6"></i>
                                    <div>
                                        <p class="text-gray-400 text-sm mb-1">Seats</p>
                                        <p class="font-mono bg-dark-bg px-4 py-2 rounded-lg text-lg font-bold">${bookingData.seats.join(', ')}</p>
                                    </div>
                                </div>
                                <hr class="border-white/10 my-6">
                                <div class="flex justify-between items-center text-2xl">
                                    <span class="font-black">Total:</span>
                                    <span class="text-red-500 font-black">₱${bookingData.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-black text-2xl mb-6 pb-4 border-b border-white/10">Payment Method</h3>
                            <div class="space-y-4 mb-8">
                                <button class="payment-method-btn w-full text-left p-5 glass-card border-2 border-transparent hover:border-red-500/50 transition-all flex items-center gap-4 group" 
                                    data-method="GCash" onclick="selectPaymentMethod('GCash', this)">
                                    <div class="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center group-hover:from-red-500/30 group-hover:to-red-700/30 transition-all">
                                        <i class="fas fa-mobile-alt text-red-500 text-xl"></i>
                                    </div>
                                    <span class="font-black text-lg">GCash</span>
                                </button>
                                <button class="payment-method-btn w-full text-left p-5 glass-card border-2 border-transparent hover:border-red-500/50 transition-all flex items-center gap-4 group" 
                                    data-method="PayMaya" onclick="selectPaymentMethod('PayMaya', this)">
                                    <div class="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center group-hover:from-red-500/30 group-hover:to-red-700/30 transition-all">
                                        <i class="fas fa-wallet text-red-500 text-xl"></i>
                                    </div>
                                    <span class="font-black text-lg">PayMaya</span>
                                </button>
                                <button class="payment-method-btn w-full text-left p-5 glass-card border-2 border-transparent hover:border-red-500/50 transition-all flex items-center gap-4 group" 
                                    data-method="Credit/Debit Card" onclick="selectPaymentMethod('Credit/Debit Card', this)">
                                    <div class="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center group-hover:from-red-500/30 group-hover:to-red-700/30 transition-all">
                                        <i class="fas fa-credit-card text-red-500 text-xl"></i>
                                    </div>
                                    <span class="font-black text-lg">Credit/Debit Card</span>
                                </button>
                            </div>
                            <div id="payment-form-container"></div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('payment-content').innerHTML = html;
        }
        
        function selectPaymentMethod(method, buttonElement) {
            document.querySelectorAll('.payment-method-btn').forEach(btn => {
                btn.classList.remove('border-red-500', 'border-2');
            });
            buttonElement.classList.add('border-red-500', 'border-2');
            
            bookingData.paymentMethod = method;
            
            let form = '';
            if (method === 'GCash' || method === 'PayMaya') {
                form = `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold mb-2">${method} Number</label>
                            <input type="tel" placeholder="09XX XXX XXXX" required
                                class="w-full bg-light-bg border-2 border-white/10 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                    </div>
                `;
            } else {
                form = `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold mb-2">Card Number</label>
                            <input type="text" placeholder="1234 5678 9012 3456" required
                                class="w-full bg-light-bg border-2 border-white/10 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold mb-2">Expiry (MM/YY)</label>
                                <input type="text" placeholder="MM/YY" required
                                    class="w-full bg-light-bg border-2 border-white/10 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            </div>
                            <div>
                                <label class="block text-sm font-bold mb-2">CVV</label>
                                <input type="text" placeholder="123" required
                                    class="w-full bg-light-bg border-2 border-white/10 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            </div>
                        </div>
                    </div>
                `;
            }
            
            document.getElementById('payment-form-container').innerHTML = form + `
                <button onclick="confirmPayment()" class="action-btn w-full mt-6 py-4 text-lg">
                    <i class="fas fa-check-circle mr-2"></i> Confirm Payment
                </button>
            `;
        }
        
        async function confirmPayment() {
            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
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
                    renderConfirmation();
                    goToStep(5);
                } else {
                    alert('Error creating booking: ' + result.message);
                }
            } catch (error) {
                console.error('Error creating booking:', error);
                alert('Error creating booking. Please try again.');
            }
        }
        
        function renderConfirmation() {
            const html = `
                <div class="max-w-2xl mx-auto text-center">
                    <div class="mb-8">
                        <div class="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-check-circle text-6xl text-green-500"></i>
                        </div>
                        <h2 class="text-5xl font-black mb-4 gradient-text">Booking Successful!</h2>
                        <p class="text-xl text-gray-400">Your e-ticket is ready</p>
                    </div>
                    
                    <div class="glass-card p-8 text-left mb-8">
                        <div class="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
                            <img src="${bookingData.movie.poster}" class="w-20 h-30 object-cover rounded-lg shadow-lg">
                            <div>
                                <h3 class="font-black text-2xl mb-1">${bookingData.movie.title}</h3>
                                <p class="text-gray-400">${bookingData.cinemaName}</p>
                            </div>
                        </div>
                        
                        <div class="space-y-3 mb-6">
                            <p class="flex justify-between"><span class="text-gray-400">Date:</span><span class="font-bold">${new Date(bookingData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                            <p class="flex justify-between"><span class="text-gray-400">Time:</span><span class="font-bold">${bookingData.time}</span></p>
                            <p class="flex justify-between"><span class="text-gray-400">Seats:</span><span class="font-bold font-mono">${bookingData.seats.join(', ')}</span></p>
                            <p class="flex justify-between"><span class="text-gray-400">Total Paid:</span><span class="font-bold text-red-500">₱${bookingData.totalPrice.toFixed(2)}</span></p>
                        </div>
                        
                        <div class="bg-dark-bg rounded-lg p-6 text-center">
                            <p class="text-gray-400 text-sm mb-2 uppercase font-bold tracking-wider">Booking ID</p>
                            <p class="font-mono text-3xl font-black bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">${bookingData.txNumber}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="dashboard.php" class="action-btn bg-gray-700 hover:bg-gray-600 px-8 py-4 text-lg inline-block">
                            <i class="fas fa-home mr-2"></i> Back to Home
                        </a>
                        <button onclick="downloadTicket()" class="action-btn px-8 py-4 text-lg">
                            <i class="fas fa-download mr-2"></i> Download Ticket
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('confirmation-content').innerHTML = html;
        }
        
        function downloadTicket() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(26);
            doc.setTextColor(229, 9, 20);
            doc.text('ONECINEHUB E-TICKET', 105, 20, null, null, 'center');
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Booking ID: ${bookingData.txNumber}`, 105, 28, null, null, 'center');
            
            doc.setLineWidth(0.5);
            doc.setDrawColor(229, 9, 20);
            doc.line(20, 35, 190, 35);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(0);
            doc.text(bookingData.movie.title, 20, 50);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(60);
            doc.text(`Cinema: ${bookingData.cinemaName}`, 20, 65);
            doc.text(`Date: ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 75);
            doc.text(`Showtime: ${bookingData.time}`, 20, 85);
            doc.text(`Seats: ${bookingData.seats.join(', ')}`, 20, 95);
            doc.text(`Total Price: PHP ${bookingData.totalPrice.toFixed(2)}`, 20, 105);
            
            doc.setLineWidth(0.3);
            doc.setDrawColor(200);
            doc.line(20, 115, 190, 115);
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text('Present this ticket at the cinema entrance', 105, 125, null, null, 'center');
            doc.text('Thank you for choosing ONECINEHUB!', 105, 132, null, null, 'center');
            
            doc.save(`ONECINEHUB-Ticket-${bookingData.txNumber}.pdf`);
        }
    </script>
</body>
</html>
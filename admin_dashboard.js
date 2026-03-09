let currentSection = 'dashboard';
let editingId = null;
let deleteCallback = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadSection('dashboard');
    setupEventListeners();

    // Form submission handlers
    const movieForm = document.getElementById('movie-form');
    if (movieForm) {
        movieForm.addEventListener('submit', handleMovieSubmit);
    }

    const cinemaForm = document.getElementById('cinema-form');
    if (cinemaForm) {
        cinemaForm.addEventListener('submit', handleCinemaSubmit);
    }

    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleScheduleSubmit);
    }

    const trailerForm = document.getElementById('trailer-form');
    if (trailerForm) {
        trailerForm.addEventListener('submit', handleTrailerSubmit);
    }
});

function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });

    // Modal close handlers
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };

    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (deleteCallback) {
                deleteCallback();
            }
        });
    }

    // Schedule cinema change handler
    const scheduleCinemaSelect = document.getElementById('schedule-cinema');
    if (scheduleCinemaSelect) {
        scheduleCinemaSelect.addEventListener('change', updateHallOptions);
    }
}

function switchSection(section) {
    currentSection = section;
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
    
    loadSection(section);
}

async function loadSection(section) {
    const contentArea = document.getElementById('content-area');
    
    switch (section) {
        case 'dashboard':
            await renderDashboard();
            break;
        case 'movies':
            await renderMovies();
            break;
        case 'cinemas':
            await renderCinemas();
            break;
        case 'schedules':
            await renderSchedules();
            break;
        case 'users':
            await renderUsers();
            break;
        case 'analytics':
            await renderAnalytics();
            break;
        case 'trailers':
            await renderTrailers();
            break;
    }
}

async function renderDashboard() {
    const stats = await fetchData('get_stats');
    
    document.getElementById('content-area').innerHTML = `
        <h2 class="text-3xl font-black mb-8 gradient-text">Dashboard Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-film text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${stats.movies.total}</span>
                </div>
                <p class="text-gray-400 font-semibold">Total Movies</p>
                <p class="text-sm text-gray-500 mt-1">${stats.movies.now_showing} showing, ${stats.movies.coming_soon} coming</p>
            </div>
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-building text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${stats.cinemas}</span>
                </div>
                <p class="text-gray-400 font-semibold">Cinema Locations</p>
            </div>
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-users text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${stats.users}</span>
                </div>
                <p class="text-gray-400 font-semibold">Registered Users</p>
                <p class="text-sm text-gray-500 mt-1">Total accounts</p>
            </div>
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-calendar-alt text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${stats.schedules}</span>
                </div>
                <p class="text-gray-400 font-semibold">Total Schedules</p>
                <p class="text-sm text-gray-500 mt-1">Movie showtimes</p>
            </div>
        </div>
        <div class="glass-card p-6">
            <h3 class="text-2xl font-black mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onclick="switchSection('movies')" class="action-btn py-4">
                    <i class="fas fa-film mr-2"></i> Manage Movies
                </button>
                <button onclick="switchSection('schedules')" class="action-btn py-4">
                    <i class="fas fa-calendar-alt mr-2"></i> Manage Schedules
                </button>
                <button onclick="switchSection('cinemas')" class="action-btn py-4">
                    <i class="fas fa-building mr-2"></i> Manage Cinemas
                </button>
                <button onclick="switchSection('users')" class="action-btn py-4">
                    <i class="fas fa-users mr-2"></i> View Users
                </button>
            </div>
        </div>
    `;
}

async function renderMovies() {
    const movies = await fetchData('get_movies');
    const nowShowing = movies.filter(m => m.status === 'nowShowing');
    const comingSoon = movies.filter(m => m.status === 'comingSoon');
    
    document.getElementById('content-area').innerHTML = `
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black gradient-text">Movies Management</h2>
                <button onclick="openMovieModal()" class="action-btn px-4 py-2">
                    <i class="fas fa-plus mr-2"></i> Add Movie
                </button>
            </div>
            <h3 class="text-xl font-bold mb-4">Now Showing (${nowShowing.length})</h3>
            <div class="overflow-x-auto mb-8">
                <table>
                    <thead>
                        <tr>
                            <th>Poster</th>
                            <th>Title</th>
                            <th>Genre</th>
                            <th>Duration</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nowShowing.map(m => `
                            <tr>
                                <td><img src="${m.poster}" alt="${m.title}" class="w-12 h-16 object-cover rounded"></td>
                                <td class="font-bold">${m.title}</td>
                                <td>${m.genre}</td>
                                <td>${m.duration}</td>
                                <td>${m.rating}</td>
                                <td>
                                    <button onclick="editMovie(${m.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2">Edit</button>
                                    <button onclick="confirmDelete('movie', ${m.id}, '${m.title}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${nowShowing.length === 0 ? '<tr><td colspan="6" class="text-center text-gray-400 py-8">No movies</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
            <h3 class="text-xl font-bold mb-4">Coming Soon (${comingSoon.length})</h3>
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Poster</th>
                            <th>Title</th>
                            <th>Release Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comingSoon.map(m => `
                            <tr>
                                <td><img src="${m.poster}" alt="${m.title}" class="w-12 h-16 object-cover rounded"></td>
                                <td class="font-bold">${m.title}</td>
                                <td>${m.release_date ? new Date(m.release_date).toLocaleDateString() : 'TBA'}</td>
                                <td>
                                    <button onclick="editMovie(${m.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2">Edit</button>
                                    <button onclick="confirmDelete('movie', ${m.id}, '${m.title}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${comingSoon.length === 0 ? '<tr><td colspan="4" class="text-center text-gray-400 py-8">No upcoming movies</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderCinemas() {
    const cinemas = await fetchData('get_cinemas');
    
    document.getElementById('content-area').innerHTML = `
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black gradient-text">Cinemas Management</h2>
                <button onclick="openCinemaModal()" class="action-btn px-4 py-2">
                    <i class="fas fa-plus mr-2"></i> Add Cinema
                </button>
            </div>
            <h3 class="text-xl font-bold mb-4">Cinema Locations (${cinemas.length})</h3>
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Address</th>
                            <th>Halls</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cinemas.map(c => `
                            <tr>
                                <td class="font-bold">${c.name}</td>
                                <td>${c.location}</td>
                                <td>${c.address}</td>
                                <td>${c.halls}</td>
                                <td>
                                    <button onclick="editCinema(${c.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2">Edit</button>
                                    <button onclick="confirmDelete('cinema', ${c.id}, '${c.name}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${cinemas.length === 0 ? '<tr><td colspan="5" class="text-center text-gray-400 py-8">No cinemas</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderSchedules() {
    const schedules = await fetchData('get_schedules');
    
    document.getElementById('content-area').innerHTML = `
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black gradient-text">Movie Schedules Management</h2>
                <button onclick="openScheduleModal()" class="action-btn px-4 py-2">
                    <i class="fas fa-plus mr-2"></i> Add Schedule
                </button>
            </div>
            <h3 class="text-xl font-bold mb-4">Movie Schedules (${schedules.length} total)</h3>
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Movie</th>
                            <th>Cinema</th>
                            <th>Hall</th>
                            <th>Date</th>
                            <th>Show Times</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedules.map(s => `
                            <tr>
                                <td class="font-bold">${s.movie_title}</td>
                                <td>${s.cinema_name}</td>
                                <td>Hall ${s.hall}</td>
                                <td>${new Date(s.date).toLocaleDateString()}</td>
                                <td>${JSON.parse(s.show_times).join(', ')}</td>
                                <td>₱${parseFloat(s.price).toFixed(2)}</td>
                                <td>
                                    <button onclick="editSchedule(${s.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2">Edit</button>
                                    <button onclick="confirmDelete('schedule', ${s.id}, '${s.movie_title} - ${s.cinema_name}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${schedules.length === 0 ? '<tr><td colspan="7" class="text-center text-gray-400 py-8">No schedules</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderUsers() {
    const users = await fetchData('get_users');
    
    document.getElementById('content-area').innerHTML = `
        <div class="glass-card p-6">
            <h2 class="text-2xl font-black gradient-text mb-6">Users Management</h2>
            <h3 class="text-xl font-bold mb-4">Registered Users (${users.length})</h3>
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Registration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td class="font-bold">${u.username}</td>
                                <td>${u.email}</td>
                                <td>${new Date(u.registration_date).toLocaleDateString()}</td>
                                <td>
                                    <button onclick="confirmDelete('user', ${u.id}, '${u.username}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${users.length === 0 ? '<tr><td colspan="4" class="text-center text-gray-400 py-8">No users registered</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderTrailers() {
    const trailers = await fetchData('get_trailers');
    
    document.getElementById('content-area').innerHTML = `
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black gradient-text">Trailer Management</h2>
                <button onclick="openTrailerModal()" class="action-btn px-4 py-2">
                    <i class="fas fa-plus mr-2"></i> Upload Trailer
                </button>
            </div>
            <h3 class="text-xl font-bold mb-4">Uploaded Trailers (${trailers.length})</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${trailers.map((trailer, index) => `
                    <div class="glass-card p-4">
                        <div class="aspect-video mb-4">
                            <iframe src="${trailer.url}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe>
                        </div>
                        <div class="mb-4">
                            <h4 class="font-bold text-lg text-white mb-2">${trailer.movie_title}</h4>
                            <p class="text-sm text-gray-400 line-clamp-2">Trailer for ${trailer.movie_status} movie</p>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500">Movie trailer</span>
                            <button onclick="confirmDelete('trailer', ${trailer.id}, '${trailer.movie_title}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
                ${trailers.length === 0 ? `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-video text-6xl text-gray-600 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-400 mb-2">No Trailers Uploaded</h3>
                        <p class="text-gray-500 mb-6">Upload your first movie trailer to get started</p>
                        <button onclick="openTrailerModal()" class="action-btn px-6 py-3">
                            <i class="fas fa-plus mr-2"></i> Upload First Trailer
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

async function renderAnalytics() {
    const analytics = await fetchData('get_analytics');
    
    document.getElementById('content-area').innerHTML = `
        <div class="glass-card p-6">
            <h2 class="text-2xl font-black gradient-text mb-6">Analytics Dashboard</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-peso-sign text-4xl text-green-500"></i>
                        <span class="text-3xl font-black">₱${parseFloat(analytics.revenue.total_revenue).toFixed(2)}</span>
                    </div>
                    <p class="text-gray-400 font-semibold">Total Revenue</p>
                    <p class="text-sm text-gray-500 mt-1">From all transactions</p>
                </div>
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-shopping-cart text-4xl text-blue-500"></i>
                        <span class="text-3xl font-black">${analytics.revenue.total_transactions}</span>
                    </div>
                    <p class="text-gray-400 font-semibold">Total Transactions</p>
                    <p class="text-sm text-gray-500 mt-1">Completed bookings</p>
                </div>
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-film text-4xl text-purple-500"></i>
                        <span class="text-3xl font-black">${analytics.popular_movies.length}</span>
                    </div>
                    <p class="text-gray-400 font-semibold">Movies with Sales</p>
                    <p class="text-sm text-gray-500 mt-1">Different movies booked</p>
                </div>
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-chart-line text-4xl text-orange-500"></i>
                        <span class="text-3xl font-black">${analytics.revenue.total_transactions > 0 ? (analytics.revenue.total_revenue / analytics.revenue.total_transactions).toFixed(2) : '0.00'}</span>
                    </div>
                    <p class="text-gray-400 font-semibold">Avg Transaction</p>
                    <p class="text-sm text-gray-500 mt-1">Revenue per booking</p>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="glass-card p-6">
                    <h3 class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-trophy text-yellow-500 mr-2"></i> Most Popular Movies
                    </h3>
                    <div class="space-y-3">
                        ${analytics.popular_movies.map((movie, index) => `
                            <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl font-bold text-gray-400">#${index + 1}</span>
                                    <div>
                                        <p class="font-semibold">${movie.title}</p>
                                        <p class="text-sm text-gray-400">${movie.booking_count} bookings</p>
                                    </div>
                                </div>
                                <span class="text-green-400 font-bold">₱${parseFloat(movie.revenue).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        ${analytics.popular_movies.length === 0 ? '<p class="text-center text-gray-400 py-8">No transaction data available</p>' : ''}
                    </div>
                </div>
                <div class="glass-card p-6">
                    <h3 class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-clock text-blue-500 mr-2"></i> Recent Transactions
                    </h3>
                    <div class="space-y-3">
                        ${analytics.recent_transactions.map(t => `
                            <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <div>
                                    <p class="font-semibold">${t.movie_title}</p>
                                    <p class="text-sm text-gray-400">${t.tx_number}</p>
                                </div>
                                <span class="text-green-400 font-bold">₱${parseFloat(t.total_price).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        ${analytics.recent_transactions.length === 0 ? '<p class="text-center text-gray-400 py-8">No transactions found</p>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Modal functions
function openMovieModal() {
    editingId = null;
    document.getElementById('movie-modal-title').textContent = 'Add Movie';
    document.getElementById('movie-form').reset();
    showModal('movie-modal');
}

function editMovie(id) {
    editingId = id;
    document.getElementById('movie-modal-title').textContent = 'Edit Movie';

    // Fetch movie data and populate form
    fetch(`admin_dashboard.php?action=get_movies`)
        .then(response => response.json())
        .then(movies => {
            const movie = movies.find(m => m.id == id);
            if (movie) {
                document.getElementById('movie-id').value = movie.id;
                document.getElementById('movie-title').value = movie.title;
                document.getElementById('movie-poster').value = movie.poster;
                document.getElementById('movie-genre').value = movie.genre;
                document.getElementById('movie-duration').value = movie.duration;
                document.getElementById('movie-rating').value = movie.rating;
                document.getElementById('movie-synopsis').value = movie.synopsis;
                document.getElementById('movie-cast').value = movie.cast;
                document.getElementById('movie-release-date').value = movie.release_date || '';
                document.getElementById('movie-status').value = movie.status;
            }
        })
        .catch(error => console.error('Error fetching movie:', error));

    showModal('movie-modal');
}

function editCinema(id) {
    editingId = id;
    document.getElementById('cinema-modal-title').textContent = 'Edit Cinema';

    // Fetch cinema data and populate form
    fetch(`admin_dashboard.php?action=get_cinemas`)
        .then(response => response.json())
        .then(cinemas => {
            const cinema = cinemas.find(c => c.id == id);
            if (cinema) {
                document.getElementById('cinema-id').value = cinema.id;
                document.getElementById('cinema-name').value = cinema.name;
                document.getElementById('cinema-location').value = cinema.location;
                document.getElementById('cinema-address').value = cinema.address;
                document.getElementById('cinema-halls').value = cinema.halls;
            }
        })
        .catch(error => console.error('Error fetching cinema:', error));

    showModal('cinema-modal');
}

function editSchedule(id) {
    editingId = id;
    document.getElementById('schedule-modal-title').textContent = 'Edit Movie Schedule';

    // Fetch schedule data and populate form
    fetch(`admin_dashboard.php?action=get_schedules`)
        .then(response => response.json())
        .then(schedules => {
            const schedule = schedules.find(s => s.id == id);
            if (schedule) {
                document.getElementById('schedule-id').value = schedule.id;
                document.getElementById('schedule-movie').value = schedule.movie_id;
                document.getElementById('schedule-cinema').value = schedule.cinema_id;
                document.getElementById('schedule-date').value = schedule.date;
                document.getElementById('schedule-price').value = schedule.price;

                // Populate show times
                const showTimes = JSON.parse(schedule.show_times);
                const container = document.getElementById('showtimes-container');
                container.innerHTML = '';
                showTimes.forEach(time => {
                    container.innerHTML += `
                        <div class="flex gap-2 mb-2">
                            <input type="time" class="flex-1" value="${time}" required>
                            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
                        </div>
                    `;
                });

                // Update hall options after setting cinema
                updateHallOptions().then(() => {
                    document.getElementById('schedule-hall').value = schedule.hall;
                });
            }
        })
        .catch(error => console.error('Error fetching schedule:', error));

    loadScheduleOptions();
    showModal('schedule-modal');
}

function editTrailer(id) {
    editingId = id;
    document.getElementById('trailer-modal-title').textContent = 'Edit Trailer';

    // Fetch trailer data and populate form
    fetch(`admin_dashboard.php?action=get_trailers`)
        .then(response => response.json())
        .then(trailers => {
            const trailer = trailers.find(t => t.id == id);
            if (trailer) {
                document.getElementById('trailer-movie').value = trailer.movie_id;
                document.getElementById('trailer-url').value = trailer.url;
            }
        })
        .catch(error => console.error('Error fetching trailer:', error));

    loadTrailerOptions();
    showModal('trailer-modal');
}

function openCinemaModal() {
    editingId = null;
    document.getElementById('cinema-modal-title').textContent = 'Add Cinema';
    document.getElementById('cinema-form').reset();
    showModal('cinema-modal');
}

function openScheduleModal() {
    editingId = null;
    document.getElementById('schedule-modal-title').textContent = 'Add Movie Schedule';
    document.getElementById('schedule-form').reset();
    loadScheduleOptions();
    showModal('schedule-modal');
}

function openTrailerModal() {
    editingId = null;
    document.getElementById('trailer-modal-title').textContent = 'Upload Trailer';
    document.getElementById('trailer-form').reset();
    loadTrailerOptions();
    showModal('trailer-modal');
}

async function loadScheduleOptions() {
    const movies = await fetchData('get_movies');
    const cinemas = await fetchData('get_cinemas');
    
    const movieSelect = document.getElementById('schedule-movie');
    movieSelect.innerHTML = '<option value="">Select Movie</option>';
    movies.filter(m => m.status === 'nowShowing').forEach(movie => {
        movieSelect.innerHTML += `<option value="${movie.id}">${movie.title}</option>`;
    });
    
    const cinemaSelect = document.getElementById('schedule-cinema');
    cinemaSelect.innerHTML = '<option value="">Select Cinema</option>';
    cinemas.forEach(cinema => {
        cinemaSelect.innerHTML += `<option value="${cinema.id}">${cinema.name}</option>`;
    });
}

async function loadTrailerOptions() {
    const movies = await fetchData('get_movies');
    
    const movieSelect = document.getElementById('trailer-movie');
    movieSelect.innerHTML = '<option value="">Select Movie (Now Showing only)</option>';
    movies.filter(m => m.status === 'nowShowing').forEach(movie => {
        movieSelect.innerHTML += `<option value="${movie.id}">${movie.title}</option>`;
    });
}

async function updateHallOptions() {
    const cinemaSelect = document.getElementById('schedule-cinema');
    const hallSelect = document.getElementById('schedule-hall');
    
    if (!cinemaSelect || !hallSelect) return;
    
    const selectedCinemaId = cinemaSelect.value;
    if (!selectedCinemaId) {
        hallSelect.innerHTML = '<option value="">Select Hall</option>';
        return;
    }
    
    try {
        const cinemas = await fetchData('get_cinemas');
        const selectedCinema = cinemas.find(c => c.id == selectedCinemaId);
        if (selectedCinema) {
            hallSelect.innerHTML = '<option value="">Select Hall</option>';
            for (let i = 1; i <= selectedCinema.halls; i++) {
                hallSelect.innerHTML += `<option value="${i}">Hall ${i}</option>`;
            }
        }
    } catch (error) {
        console.error('Error updating hall options:', error);
    }
}

function addShowtime() {
    const container = document.getElementById('showtimes-container');
    container.innerHTML += `
        <div class="flex gap-2 mb-2">
            <input type="time" class="flex-1" placeholder="Show Time" required>
            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
        </div>
    `;
}

function removeShowtime(button) {
    const container = document.getElementById('showtimes-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

function addQuickTime(time) {
    const container = document.getElementById('showtimes-container');
    const existingTimes = Array.from(container.querySelectorAll('input[type="time"]')).map(input => input.value);
    if (existingTimes.includes(time)) {
        return;
    }
    
    container.innerHTML += `
        <div class="flex gap-2 mb-2">
            <input type="time" class="flex-1" value="${time}" required>
            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
        </div>
    `;
}

function clearAllShowtimes() {
    const container = document.getElementById('showtimes-container');
    container.innerHTML = `
        <div class="flex gap-2 mb-2">
            <input type="time" class="flex-1" placeholder="Show Time" required>
            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
        </div>
    `;
}

function confirmDelete(type, id, name) {
    document.getElementById('delete-message').textContent = `Are you sure you want to delete "${name}"?`;
    deleteCallback = () => {
        deleteItem(type, id);
        closeModal('delete-modal');
    };
    showModal('delete-modal');
}

function showModal(id) {
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// API functions
async function fetchData(action) {
    try {
        const response = await fetch(`admin_dashboard.php?action=${action}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function deleteItem(type, id) {
    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete',
                type: type,
                id: id
            })
        });
        
        const result = await response.json();
        if (result.success) {
            loadSection(currentSection);
        } else {
            alert('Error deleting item: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
    }
}



async function handleMovieSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const movieData = {
        action: editingId ? 'update' : 'create',
        type: 'movie',
        title: formData.get('title'),
        poster: formData.get('poster'),
        genre: formData.get('genre'),
        duration: formData.get('duration'),
        rating: formData.get('rating'),
        synopsis: formData.get('synopsis'),
        cast: formData.get('cast'),
        release_date: formData.get('release_date') || null,
        status: formData.get('status')
    };

    if (editingId) {
        movieData.id = editingId;
    }

    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData)
        });

        const result = await response.json();
        if (result.success) {
            closeModal('movie-modal');
            loadSection('movies');
        } else {
            alert('Error saving movie: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving movie:', error);
        alert('Error saving movie');
    }
}

async function handleCinemaSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const cinemaData = {
        action: editingId ? 'update' : 'create',
        type: 'cinema',
        name: formData.get('name'),
        location: formData.get('location'),
        address: formData.get('address'),
        halls: parseInt(formData.get('halls'))
    };

    if (editingId) {
        cinemaData.id = editingId;
    }

    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cinemaData)
        });

        const result = await response.json();
        if (result.success) {
            closeModal('cinema-modal');
            loadSection('cinemas');
        } else {
            alert('Error saving cinema: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving cinema:', error);
        alert('Error saving cinema');
    }
}

async function handleScheduleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const showTimes = Array.from(document.querySelectorAll('#showtimes-container input[type="time"]'))
        .map(input => input.value)
        .filter(time => time);

    const scheduleData = {
        action: editingId ? 'update' : 'create',
        type: 'schedule',
        movie_id: parseInt(formData.get('movie')),
        cinema_id: parseInt(formData.get('cinema')),
        hall: parseInt(formData.get('hall')),
        date: formData.get('date'),
        show_times: showTimes,
        price: parseFloat(formData.get('price'))
    };

    if (editingId) {
        scheduleData.id = editingId;
    }

    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleData)
        });

        const result = await response.json();
        if (result.success) {
            closeModal('schedule-modal');
            loadSection('schedules');
        } else {
            alert('Error saving schedule: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Error saving schedule');
    }
}

async function handleTrailerSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const trailerData = {
        action: editingId ? 'update' : 'create',
        type: 'trailer',
        movie_id: parseInt(formData.get('movie')),
        url: formData.get('url')
    };

    if (editingId) {
        trailerData.id = editingId;
    }

    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trailerData)
        });

        const result = await response.json();
        if (result.success) {
            closeModal('trailer-modal');
            loadSection('trailers');
        } else {
            alert('Error saving trailer: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving trailer:', error);
        alert('Error saving trailer');
    }
}

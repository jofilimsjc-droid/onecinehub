let movies = []
let cinemas = []
let users = []
let schedules = []
let trailers = []
let transactions = []
let editingId = null
let deleteCallback = null

async function loadData() {
  try {
    movies = await fetchData('get_movies')
    cinemas = await fetchData('get_cinemas')
    users = await fetchData('get_users')
    schedules = await fetchData('get_schedules')
    trailers = await fetchData('get_trailers')
    transactions = await fetchData('get_analytics').then(data => data.recent_transactions || [])
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

function convertToEmbedUrl(url) {
  if (!url) return ""
  let videoId = ""
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0].split("&")[0]
  } else if (url.includes("youtube.com/watch")) {
    const urlParams = new URLSearchParams(url.split("?")[1])
    videoId = urlParams.get("v")
  } else if (url.includes("youtube.com/embed/")) {
    videoId = url.split("youtube.com/embed/")[1].split("?")[0].split("&")[0]
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }
  return url
}

// CRUD Movies
async function addMovie(data) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', type: 'movie', ...data })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderMovies()
    } else {
      alert('Error adding movie: ' + result.message)
    }
  } catch (error) {
    console.error('Error adding movie:', error)
    alert('Error adding movie')
  }
}

async function updateMovie(id, data) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', type: 'movie', id: id, ...data })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderMovies()
    } else {
      alert('Error updating movie: ' + result.message)
    }
  } catch (error) {
    console.error('Error updating movie:', error)
    alert('Error updating movie')
  }
}

async function deleteMovie(id) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'movie', id: id })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderMovies()
    } else {
      alert('Error deleting movie: ' + result.message)
    }
  } catch (error) {
    console.error('Error deleting movie:', error)
    alert('Error deleting movie')
  }
}

// CRUD Cinemas
async function addCinema(data) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', type: 'cinema', ...data })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderCinemas()
    } else {
      alert('Error adding cinema: ' + result.message)
    }
  } catch (error) {
    console.error('Error adding cinema:', error)
    alert('Error adding cinema')
  }
}

async function updateCinema(id, data) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', type: 'cinema', id: id, ...data })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderCinemas()
    } else {
      alert('Error updating cinema: ' + result.message)
    }
  } catch (error) {
    console.error('Error updating cinema:', error)
    alert('Error updating cinema')
  }
}

async function deleteCinema(id) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'cinema', id: id })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderCinemas()
    } else {
      alert('Error deleting cinema: ' + result.message)
    }
  } catch (error) {
    console.error('Error deleting cinema:', error)
    alert('Error deleting cinema')
  }
}

// Delete User
async function deleteUser(id) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'user', id: id })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderUsers()
    } else {
      alert('Error deleting user: ' + result.message)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Error deleting user')
  }
}

// CRUD Schedules
async function addSchedule(data) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', type: 'schedule', ...data })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderSchedules()
    } else {
      alert('Error adding schedule: ' + result.message)
    }
  } catch (error) {
    console.error('Error adding schedule:', error)
    alert('Error adding schedule')
  }
}

async function updateSchedule(id, data) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', type: 'schedule', id: id, ...data })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderSchedules()
    } else {
      alert('Error updating schedule: ' + result.message)
    }
  } catch (error) {
    console.error('Error updating schedule:', error)
    alert('Error updating schedule')
  }
}

async function deleteSchedule(id) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'schedule', id: id })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderSchedules()
    } else {
      alert('Error deleting schedule: ' + result.message)
    }
  } catch (error) {
    console.error('Error deleting schedule:', error)
    alert('Error deleting schedule')
  }
}

async function addTrailer(data) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', type: 'trailer', ...data })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderTrailerManagement()
    } else {
      alert('Error adding trailer: ' + result.message)
    }
  } catch (error) {
    console.error('Error adding trailer:', error)
    alert('Error adding trailer')
  }
}

async function deleteTrailer(id) {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'trailer', id: id })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderTrailerManagement()
    } else {
      alert('Error deleting trailer: ' + result.message)
    }
  } catch (error) {
    console.error('Error deleting trailer:', error)
    alert('Error deleting trailer')
  }
}

async function clearAll() {
  try {
    const response = await fetch('admin_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_all' })
    })
    const result = await response.json()
    if (result.success) {
      await loadData()
      renderDashboard()
    } else {
      alert('Error clearing data: ' + result.message)
    }
  } catch (error) {
    console.error('Error clearing data:', error)
    alert('Error clearing data')
  }
}

// Render Functions
function renderDashboard() {
  const nowShowing = movies.filter((m) => m.status === "nowShowing").length
  const comingSoon = movies.filter((m) => m.status === "comingSoon").length
  const totalSchedules = schedules.length

  document.getElementById("content-area").innerHTML = `
        <h2 class="text-3xl font-black mb-8 gradient-text">Dashboard Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-film text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${movies.length}</span>
                </div>
                <p class="text-gray-400 font-semibold">Total Movies</p>
                <p class="text-sm text-gray-500 mt-1">${nowShowing} showing, ${comingSoon} coming</p>
            </div>
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-building text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${cinemas.length}</span>
                </div>
                <p class="text-gray-400 font-semibold">Cinema Locations</p>
            </div>
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-users text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${users.length}</span>
                </div>
                <p class="text-gray-400 font-semibold">Registered Users</p>
                <p class="text-sm text-gray-500 mt-1">Total accounts</p>
            </div>
            <div class="stat-card">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-calendar-alt text-4xl text-red-500"></i>
                    <span class="text-3xl font-black">${totalSchedules}</span>
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
        <div class="glass-card p-6 mt-6">
            <h3 class="text-2xl font-black mb-4">Data Management</h3>
            <button onclick="confirmClearAll()" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold">
                <i class="fas fa-trash-alt mr-2"></i> Clear All Data
            </button>
            <p class="text-sm text-gray-400 mt-2">This will remove all movies, cinemas, schedules, users, and trailers. Changes sync to client instantly.</p>
        </div>
    `
}

function renderMovies() {
  const nowShowing = movies.filter((m) => m.status === "nowShowing")
  const comingSoon = movies.filter((m) => m.status === "comingSoon")

  document.getElementById("content-area").innerHTML = `
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
                        ${nowShowing
                          .map(
                            (m) => `
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
                        `,
                          )
                          .join("")}
                        ${nowShowing.length === 0 ? '<tr><td colspan="6" class="text-center text-gray-400 py-8">No movies</td></tr>' : ""}
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
                        ${comingSoon
                          .map(
                            (m) => `
                            <tr>
                                <td><img src="${m.poster}" alt="${m.title}" class="w-12 h-16 object-cover rounded"></td>
                                <td class="font-bold">${m.title}</td>
                                <td>${m.releaseDate ? new Date(m.releaseDate).toLocaleDateString() : "TBA"}</td>
                                <td>
                                    <button onclick="editMovie(${m.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2">Edit</button>
                                    <button onclick="confirmDelete('movie', ${m.id}, '${m.title}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                        ${comingSoon.length === 0 ? '<tr><td colspan="4" class="text-center text-gray-400 py-8">No upcoming movies</td></tr>' : ""}
                    </tbody>
                </table>
            </div>
        </div>
    `
}

function renderCinemas() {
  document.getElementById("content-area").innerHTML = `
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cinemas
                          .map(
                            (c) => `
                            <tr>
                                <td class="font-bold">${c.name}</td>
                                <td>${c.location}</td>
                                <td>${c.address}</td>
                                <td>
                                    <button onclick="editCinema(${c.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2">Edit</button>
                                    <button onclick="confirmDelete('cinema', ${c.id}, '${c.name}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                        ${cinemas.length === 0 ? '<tr><td colspan="4" class="text-center text-gray-400 py-8">No cinemas</td></tr>' : ""}
                    </tbody>
                </table>
            </div>
        </div>
    `
}

function renderUsers() {
  document.getElementById("content-area").innerHTML = `
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
                        ${users
                          .map(
                            (u) => `
                            <tr>
                                <td class="font-bold">${u.username}</td>
                                <td>${u.email}</td>
                                <td>${new Date(u.registrationDate).toLocaleDateString()}</td>
                                <td>
                                    <button onclick="confirmDelete('user', '${u.email}', '${u.username}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                        ${users.length === 0 ? '<tr><td colspan="4" class="text-center text-gray-400 py-8">No users registered</td></tr>' : ""}
                    </tbody>
                </table>
            </div>
        </div>
    `
}

function renderTrailerManagement() {
  document.getElementById("content-area").innerHTML = `
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black gradient-text">Trailer Management</h2>
                <button onclick="openTrailerModal()" class="action-btn px-4 py-2">
                    <i class="fas fa-plus mr-2"></i> Upload Trailer
                </button>
            </div>
            <h3 class="text-xl font-bold mb-4">Uploaded Trailers (${trailers.length})</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${trailers
                  .map((trailer, index) => {
                    const movie = movies.find((m) => m.id === trailer.movieId)
                    return `
                        <div class="glass-card p-4">
                            <div class="aspect-video mb-4">
                                <iframe src="${trailer.url}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe>
                            </div>
                            <div class="mb-4">
                                <h4 class="font-bold text-lg text-white mb-2">${movie ? movie.title : "Unknown Movie"}</h4>
                                <div class="flex items-center gap-4 text-sm text-gray-300 mb-2">
                                    <span><i class="fas fa-tag mr-1 text-red-400"></i>${movie ? movie.genre : "N/A"}</span>
                                    <span><i class="fas fa-clock mr-1 text-red-400"></i>${movie ? movie.duration : "N/A"}</span>
                                    <span><i class="fas fa-star mr-1 text-red-400"></i>${movie ? movie.rating : "N/A"}</span>
                                </div>
                                <p class="text-sm text-gray-400 line-clamp-2">${movie ? movie.synopsis : "No description available"}</p>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500">Trailer for ${movie ? movie.status : "unknown"} movie</span>
                                <button onclick="confirmDelete('trailer', ${index}, '${movie ? movie.title : "Unknown Movie"}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `
                  })
                  .join("")}
                ${
                  trailers.length === 0
                    ? `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-video text-6xl text-gray-600 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-400 mb-2">No Trailers Uploaded</h3>
                        <p class="text-gray-500 mb-6">Upload your first movie trailer to get started</p>
                        <button onclick="openTrailerModal()" class="action-btn px-6 py-3">
                            <i class="fas fa-plus mr-2"></i> Upload First Trailer
                        </button>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `
}

function renderAnalytics() {
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalPrice || 0), 0)
  const totalTransactions = transactions.length

  const movieStats = {}
  transactions.forEach((t) => {
    const movieTitle = t.movie ? t.movie.title : "Unknown Movie"
    if (!movieStats[movieTitle]) {
      movieStats[movieTitle] = { count: 0, revenue: 0 }
    }
    movieStats[movieTitle].count++
    movieStats[movieTitle].revenue += t.totalPrice || 0
  })

  const popularMovies = Object.entries(movieStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  const revenueByMovie = Object.entries(movieStats)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)

  const recentTransactions = transactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 10)

  document.getElementById("content-area").innerHTML = `
        <div class="glass-card p-6">
            <h2 class="text-2xl font-black gradient-text mb-6">Analytics Dashboard</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-peso-sign text-4xl text-green-500"></i>
                        <span class="text-3xl font-black">₱${totalRevenue.toFixed(2)}</span>
                    </div>
                    <p class="text-gray-400 font-semibold">Total Revenue</p>
                    <p class="text-sm text-gray-500 mt-1">From all transactions</p>
                </div>
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-shopping-cart text-4xl text-blue-500"></i>
                        <span class="text-3xl font-black">${totalTransactions}</span>
                    </div>
                    <p class="text-gray-400 font-semibold">Total Transactions</p>
                    <p class="text-sm text-gray-500 mt-1">Completed bookings</p>
                </div>
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-film text-4xl text-purple-500"></i>
                        <span class="text-3xl font-black">${Object.keys(movieStats).length}</span>
                    </div>
                    <p class="text-gray-400 font-semibold">Movies with Sales</p>
                    <p class="text-sm text-gray-500 mt-1">Different movies booked</p>
                </div>
                <div class="stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-chart-line text-4xl text-orange-500"></i>
                        <span class="text-3xl font-black">${totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : "0.00"}</span>
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
                        ${popularMovies
                          .map(
                            ([movie, stats], index) => `
                            <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl font-bold text-gray-400">#${index + 1}</span>
                                    <div>
                                        <p class="font-semibold">${movie}</p>
                                        <p class="text-sm text-gray-400">${stats.count} bookings</p>
                                    </div>
                                </div>
                                <span class="text-green-400 font-bold">₱${stats.revenue.toFixed(2)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                        ${popularMovies.length === 0 ? '<p class="text-center text-gray-400 py-8">No transaction data available</p>' : ""}
                    </div>
                </div>
                <div class="glass-card p-6">
                    <h3 class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-money-bill-wave text-green-500 mr-2"></i> Revenue by Movie
                    </h3>
                    <div class="space-y-3">
                        ${revenueByMovie
                          .map(
                            ([movie, stats], index) => `
                            <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl font-bold text-gray-400">#${index + 1}</span>
                                    <div>
                                        <p class="font-semibold">${movie}</p>
                                        <p class="text-sm text-gray-400">${stats.count} bookings</p>
                                    </div>
                                </div>
                                <span class="text-green-400 font-bold">₱${stats.revenue.toFixed(2)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                        ${revenueByMovie.length === 0 ? '<p class="text-center text-gray-400 py-8">No transaction data available</p>' : ""}
                    </div>
                </div>
            </div>
            <div class="glass-card p-6 mt-8">
                <h3 class="text-xl font-bold mb-4 flex items-center">
                    <i class="fas fa-clock text-blue-500 mr-2"></i> Recent Transactions
                </h3>
                <div class="overflow-x-auto">
                    <table>
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Movie</th>
                                <th>Cinema</th>
                                <th>Date</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentTransactions
                              .map(
                                (t) => `
                                <tr>
                                    <td class="font-mono text-sm">${t.txNumber || "N/A"}</td>
                                    <td class="font-bold">${t.movie ? t.movie.title : "Unknown Movie"}</td>
                                    <td>${t.branch || "N/A"}</td>
                                    <td>${t.date ? new Date(t.date).toLocaleDateString() : "N/A"}</td>
                                    <td class="font-bold text-green-500">₱${t.totalPrice ? t.totalPrice.toFixed(2) : "0.00"}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                            ${recentTransactions.length === 0 ? '<tr><td colspan="5" class="text-center text-gray-400 py-8">No transactions found</td></tr>' : ""}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}

function renderSchedules() {
  const groupedSchedules = {}
  schedules.forEach((schedule) => {
    const movie = movies.find((m) => m.id === schedule.movieId)
    const cinema = cinemas.find((c) => c.id === schedule.cinemaId)
    const key = `${schedule.movieId}-${schedule.cinemaId}`

    if (!groupedSchedules[key]) {
      groupedSchedules[key] = {
        movie: movie,
        cinema: cinema,
        schedules: [],
      }
    }
    groupedSchedules[key].schedules.push(schedule)
  })

  document.getElementById("content-area").innerHTML = `
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black gradient-text">Movie Schedules Management</h2>
                <button onclick="openScheduleModal()" class="action-btn px-4 py-2">
                    <i class="fas fa-plus mr-2"></i> Add Schedule
                </button>
            </div>
            <h3 class="text-xl font-bold mb-4">Movie Schedules (${schedules.length} total)</h3>
            <div class="space-y-6">
                ${Object.values(groupedSchedules)
                  .map(
                    (group) => `
                    <div class="glass-card p-6 border-l-4 border-red-500">
                        <div class="flex items-start gap-4 mb-4">
                            <img src="${group.movie?.poster || "https://placehold.co/80x120/333/fff?text=No+Image"}" 
                                 class="w-16 h-24 object-cover rounded-lg shadow-lg" alt="${group.movie?.title}">
                            <div class="flex-grow">
                                <h4 class="text-xl font-bold text-white mb-1">${group.movie?.title || "Unknown Movie"}</h4>
                                <div class="flex items-center gap-2 text-gray-400 mb-2">
                                    <i class="fas fa-map-marker-alt text-red-500"></i>
                                    <span>${group.cinema?.name || "Unknown Cinema"}</span>
                                </div>
                                <div class="flex items-center gap-4 text-sm text-gray-400">
                                    <span><i class="fas fa-clock mr-1"></i> ${group.schedules.length} schedule(s)</span>
                                    <span><i class="fas fa-calendar mr-1"></i> ${new Set(group.schedules.map((s) => s.date)).size} date(s)</span>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="editSchedule(${group.schedules[0].id})" class="text-blue-400 hover:text-blue-300 p-2">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="confirmDelete('schedule', ${group.schedules[0].id}, '${group.movie?.title} - ${group.cinema?.name}')" class="text-red-400 hover:text-red-300 p-2">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="space-y-3">
                            ${group.schedules
                              .map(
                                (schedule) => `
                                <div class="bg-gray-800/50 p-4 rounded-lg">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center gap-2">
                                            <i class="fas fa-calendar-alt text-red-500"></i>
                                            <span class="font-semibold">${new Date(schedule.date).toLocaleDateString(
                                              "en-US",
                                              {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                              },
                                            )}</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-sm text-gray-400">
                                            <span>Hall ${schedule.hall}</span>
                                            <span>•</span>
                                            <span>₱${schedule.price}</span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                        ${schedule.showTimes
                                          .map(
                                            (time) => `
                                            <div class="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
                                                <i class="fas fa-clock text-red-400 text-sm mb-1"></i>
                                                <p class="font-bold text-sm text-white">${time}</p>
                                                <p class="text-xs text-gray-400">Available</p>
                                            </div>
                                        `,
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
                ${
                  schedules.length === 0
                    ? `
                    <div class="text-center py-12">
                        <i class="fas fa-calendar-alt text-6xl text-gray-600 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-400 mb-2">No Schedules Created</h3>
                        <p class="text-gray-500 mb-6">Create your first movie schedule to start managing showtimes</p>
                        <button onclick="openScheduleModal()" class="action-btn px-6 py-3">
                            <i class="fas fa-plus mr-2"></i> Add First Schedule
                        </button>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `
}

// Modal Functions
function openMovieModal() {
  editingId = null
  document.getElementById("movie-modal-title").textContent = "Add Movie"
  document.getElementById("movie-form").reset()
  showModal("movie-modal")
}

function editMovie(id) {
  const movie = movies.find((m) => m.id === id)
  if (!movie) return

  editingId = id
  document.getElementById("movie-modal-title").textContent = "Edit Movie"
  document.getElementById("movie-id").value = movie.id
  document.getElementById("movie-title").value = movie.title
  document.getElementById("movie-poster").value = movie.poster
  document.getElementById("movie-genre").value = movie.genre
  document.getElementById("movie-duration").value = movie.duration
  document.getElementById("movie-rating").value = movie.rating
  document.getElementById("movie-synopsis").value = movie.synopsis
  document.getElementById("movie-cast").value = movie.cast
  document.getElementById("movie-release-date").value = movie.releaseDate || ""
  document.getElementById("movie-status").value = movie.status
  showModal("movie-modal")
}

function openCinemaModal() {
  editingId = null
  document.getElementById("cinema-modal-title").textContent = "Add Cinema"
  document.getElementById("cinema-form").reset()
  showModal("cinema-modal")
}

function editCinema(id) {
  const cinema = cinemas.find((c) => c.id === id)
  if (!cinema) return

  editingId = id
  document.getElementById("cinema-modal-title").textContent = "Edit Cinema"
  document.getElementById("cinema-id").value = cinema.id
  document.getElementById("cinema-name").value = cinema.name
  document.getElementById("cinema-location").value = cinema.location
  document.getElementById("cinema-address").value = cinema.address
  document.getElementById("cinema-halls").value = cinema.halls || 4
  showModal("cinema-modal")
}

function openScheduleModal() {
  editingId = null
  document.getElementById("schedule-modal-title").textContent = "Add Movie Schedule"
  document.getElementById("schedule-form").reset()

  const movieSelect = document.getElementById("schedule-movie")
  movieSelect.innerHTML = '<option value="">Select Movie</option>'
  movies
    .filter((m) => m.status === "nowShowing")
    .forEach((movie) => {
      movieSelect.innerHTML += `<option value="${movie.id}">${movie.title}</option>`
    })

  const cinemaSelect = document.getElementById("schedule-cinema")
  cinemaSelect.innerHTML = '<option value="">Select Cinema</option>'
  cinemas.forEach((cinema) => {
    cinemaSelect.innerHTML += `<option value="${cinema.id}">${cinema.name}</option>`
  })

  const hallSelect = document.getElementById("schedule-hall")
  hallSelect.innerHTML = '<option value="">Select Hall</option>'

  const container = document.getElementById("showtimes-container")
  container.innerHTML = `
        <div class="flex gap-2 mb-2">
            <input type="time" class="flex-1" placeholder="Show Time" required>
            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
        </div>
    `

  showModal("schedule-modal")
}

function updateHallOptions() {
  const cinemaSelect = document.getElementById("schedule-cinema")
  const hallSelect = document.getElementById("schedule-hall")
  const selectedCinemaId = cinemaSelect.value

  if (!selectedCinemaId) {
    hallSelect.innerHTML = '<option value="">Select Hall</option>'
    return
  }

  const cinema = cinemas.find((c) => c.id == selectedCinemaId)
  if (!cinema) return

  hallSelect.innerHTML = '<option value="">Select Hall</option>'
  for (let i = 1; i <= cinema.halls; i++) {
    hallSelect.innerHTML += `<option value="${i}">Hall ${i}</option>`
  }
}

function openTrailerModal() {
  editingId = null
  document.getElementById("trailer-modal-title").textContent = "Upload Trailer"
  document.getElementById("trailer-form").reset()

  const movieSelect = document.getElementById("trailer-movie")
  movieSelect.innerHTML = '<option value="">Select Movie (Now Showing only)</option>'
  const nowShowingMovies = movies.filter((m) => m.status === "nowShowing")
  nowShowingMovies.forEach((movie) => {
    movieSelect.innerHTML += `<option value="${movie.id}">${movie.title}</option>`
  })

  showModal("trailer-modal")
}

function editSchedule(id) {
  const schedule = schedules.find((s) => s.id === id)
  if (!schedule) return

  editingId = id
  document.getElementById("schedule-modal-title").textContent = "Edit Movie Schedule"

  const movieSelect = document.getElementById("schedule-movie")
  movieSelect.innerHTML = '<option value="">Select Movie</option>'
  movies
    .filter((m) => m.status === "nowShowing")
    .forEach((movie) => {
      movieSelect.innerHTML += `<option value="${movie.id}" ${movie.id === schedule.movieId ? "selected" : ""}>${movie.title}</option>`
    })

  const cinemaSelect = document.getElementById("schedule-cinema")
  cinemaSelect.innerHTML = '<option value="">Select Cinema</option>'
  cinemas.forEach((cinema) => {
    cinemaSelect.innerHTML += `<option value="${cinema.id}" ${cinema.id === schedule.cinemaId ? "selected" : ""}>${cinema.name}</option>`
  })

  updateHallOptions()
  document.getElementById("schedule-hall").value = schedule.hall || ""

  document.getElementById("schedule-date").value = schedule.date
  document.getElementById("schedule-price").value = schedule.price

  const container = document.getElementById("showtimes-container")
  container.innerHTML = ""
  schedule.showTimes.forEach((time) => {
    container.innerHTML += `
            <div class="flex gap-2 mb-2">
                <input type="time" class="flex-1" value="${time}" required>
                <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
            </div>
        `
  })

  showModal("schedule-modal")
}

function addShowtime() {
  const container = document.getElementById("showtimes-container")
  container.innerHTML += `
        <div class="flex gap-2 mb-2">
            <input type="time" class="flex-1" placeholder="Show Time" required>
            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
        </div>
    `
}

function removeShowtime(button) {
  const container = document.getElementById("showtimes-container")
  if (container.children.length > 1) {
    button.parentElement.remove()
  }
}

function addQuickTime(time) {
  const container = document.getElementById("showtimes-container")
  const existingTimes = Array.from(container.querySelectorAll('input[type="time"]')).map((input) => input.value)
  if (existingTimes.includes(time)) {
    return
  }

  container.innerHTML += `
        <div class="flex gap-2 mb-2">
            <input type="time" class="flex-1" value="${time}" required>
            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
        </div>
    `
}

function clearAllShowtimes() {
  const container = document.getElementById("showtimes-container")
  container.innerHTML = `
        <div class="flex gap-2 mb-2">
            <input type="time" class="flex-1" placeholder="Show Time" required>
            <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
        </div>
    `
}

function confirmDelete(type, id, name) {
  document.getElementById("delete-message").textContent = `Are you sure you want to delete "${name}"?`
  deleteCallback = () => {
    if (type === "movie") deleteMovie(id)
    else if (type === "cinema") deleteCinema(id)
    else if (type === "user") deleteUser(id)
    else if (type === "schedule") deleteSchedule(id)
    else if (type === "trailer") deleteTrailer(id)
    closeModal("delete-modal")
  }
  showModal("delete-modal")
}

function confirmClearAll() {
  document.getElementById("delete-message").textContent =
    "Are you sure you want to clear ALL data? This will remove all movies, cinemas, schedules, users, and trailers. This action cannot be undone."
  deleteCallback = () => {
    movies = []
    cinemas = []
    schedules = []
    users = []
    trailers = []
    saveMovies()
    saveCinemas()
    saveSchedules()
    saveUsers()
    saveTrailers()
    renderDashboard()
    closeModal("delete-modal")
  }
  showModal("delete-modal")
}

function showModal(id) {
  document.getElementById(id).style.display = "block"
}

function closeModal(id) {
  document.getElementById(id).style.display = "none"
}

function switchSection(section) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
    if (link.dataset.section === section) {
      link.classList.add("active")
    }
  })

  loadData()

  if (section === "dashboard") renderDashboard()
  else if (section === "movies") renderMovies()
  else if (section === "schedules") renderSchedules()
  else if (section === "cinemas") renderCinemas()
  else if (section === "users") renderUsers()
  else if (section === "analytics") renderAnalytics()
  else if (section === "trailers") renderTrailerManagement()
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadData()

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const email = document.getElementById("admin-email").value
    const password = document.getElementById("admin-password").value

    if (email === "admin@gmail.com" && password === "admin2025") {
      document.getElementById("login-screen").style.display = "none"
      document.getElementById("admin-panel").classList.remove("hidden")
      renderDashboard()
    } else {
      alert("Invalid credentials")
    }
  })

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => switchSection(link.dataset.section))
  })

  document.getElementById("logout-btn").addEventListener("click", () => {
    document.getElementById("admin-panel").classList.add("hidden")
    document.getElementById("login-screen").style.display = "flex"
    document.getElementById("login-form").reset()
  })

  document.getElementById("movie-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const data = {
      title: document.getElementById("movie-title").value,
      poster: document.getElementById("movie-poster").value,
      genre: document.getElementById("movie-genre").value,
      duration: document.getElementById("movie-duration").value,
      rating: document.getElementById("movie-rating").value,
      synopsis: document.getElementById("movie-synopsis").value,
      cast: document.getElementById("movie-cast").value,
      releaseDate: document.getElementById("movie-release-date").value || null,
      status: document.getElementById("movie-status").value,
    }

    if (editingId) {
      updateMovie(editingId, data)
    } else {
      addMovie(data)
    }
    closeModal("movie-modal")
  })

  document.getElementById("cinema-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const data = {
      name: document.getElementById("cinema-name").value,
      location: document.getElementById("cinema-location").value,
      address: document.getElementById("cinema-address").value,
      halls: Number.parseInt(document.getElementById("cinema-halls").value) || 4,
      rating: "4.2",
      distance: "1.2 km",
      amenities: ["AC", "Sound System"],
    }

    if (editingId) {
      updateCinema(editingId, data)
    } else {
      addCinema(data)
    }
    closeModal("cinema-modal")
  })

  document.getElementById("schedule-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const showTimes = Array.from(document.querySelectorAll('#showtimes-container input[type="time"]'))
      .map((input) => input.value)
      .filter((time) => time)

    if (showTimes.length === 0) {
      alert("Please add at least one show time")
      return
    }

    const movieId = Number.parseInt(document.getElementById("schedule-movie").value)
    const cinemaId = Number.parseInt(document.getElementById("schedule-cinema").value)
    const hall = Number.parseInt(document.getElementById("schedule-hall").value)
    const date = document.getElementById("schedule-date").value
    const price = Number.parseFloat(document.getElementById("schedule-price").value)

    if (!hall) {
      alert("Please select a hall")
      return
    }

    const data = {
      movieId: movieId,
      cinemaId: cinemaId,
      hall: hall,
      date: date,
      showTimes: showTimes.sort(),
      price: price,
    }

    if (editingId) {
      updateSchedule(editingId, data)
    } else {
      addSchedule(data)
    }
    closeModal("schedule-modal")
  })

  document.getElementById("confirm-delete-btn").addEventListener("click", () => {
    if (deleteCallback) deleteCallback()
  })

  document.getElementById("trailer-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const movieId = Number.parseInt(document.getElementById("trailer-movie").value)
    const url = document.getElementById("trailer-url").value.trim()

    if (!movieId) {
      alert("Please select a movie.")
      return
    }
    if (!url) {
      alert("Please enter a trailer URL.")
      return
    }

    const data = {
      movieId: movieId,
      url: convertToEmbedUrl(url),
    }

    trailers.push(data)
    saveTrailers()
    renderTrailerManagement()
    closeModal("trailer-modal")
  })

  window.onclick = (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  }
})


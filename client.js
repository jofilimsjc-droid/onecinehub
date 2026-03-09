const { jsPDF } = window.jspdf
let movies = []
let cinemas = []
let schedules = []
let users = []
let bookingHistory = []
let favorites = []
let notifications = []
let bookingState = {}
let currentUser = null
let occupiedSeats = {}
let trailers = []
let heroInterval

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

async function loadData() {
  try {
    // Load movies
    const moviesResponse = await fetch('api.php?action=get_movies')
    movies = await moviesResponse.json()

    // Load cinemas
    const cinemasResponse = await fetch('api.php?action=get_cinemas')
    cinemas = await cinemasResponse.json()

    // Load schedules
    const schedulesResponse = await fetch('api.php?action=get_schedules')
    schedules = await schedulesResponse.json()

    // Load trailers
    const trailersResponse = await fetch('api.php?action=get_trailers')
    trailers = await trailersResponse.json()

    // Check if user is logged in
    const userCheckResponse = await fetch('api.php?action=check_auth')
    if (userCheckResponse.ok) {
      const userData = await userCheckResponse.json()
      currentUser = userData.user
      favorites = userData.favorites || []
      bookingHistory = userData.bookingHistory || []
      notifications = userData.notifications || []
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

function saveUserData() {
  // Data is now saved server-side, no need for localStorage
}

function getNowShowingMovies() {
  return movies.filter((m) => m.status === "nowShowing")
}

function getComingSoonMovies() {
  return movies.filter((m) => m.status === "comingSoon")
}

function handleStorageChange(e) {
  if (e.key && e.key.startsWith("admin")) {
    loadData()
    refreshCurrentView()
  }
}

function handleDataUpdate(e) {
  const { type, data } = e.detail
  if (type === "movies") {
    movies = data
    refreshCurrentView()
  } else if (type === "cinemas") {
    cinemas = data
    refreshCurrentView()
  } else if (type === "schedules") {
    schedules = data
    refreshCurrentView()
  } else if (type === "users") {
    users = data
  }
}

function refreshCurrentView() {
  if (!currentUser) {
    setupGuestView()
  } else {
    const dashboard = document.getElementById("client-dashboard")
    if (!dashboard.classList.contains("hidden")) {
      const activeNav = document.querySelector(".dashboard-nav a.active")
      if (activeNav) {
        const view = activeNav.dataset.view
        if (view === "booking") {
          const activeTab = document.querySelector("#db-now-showing-btn.active") ? "nowShowing" : "comingSoon"
          renderPage("booking", { tab: activeTab })
        } else {
          renderPage(view)
        }
      }
    }
  }
}

function getAvailableShowtimes(movieId, cinemaName, date) {
  const cinema = cinemas.find((c) => c.name === cinemaName)
  if (!cinema) return []

  const matchingSchedules = schedules.filter(
    (s) =>
      s.movieId == movieId &&
      s.cinemaId == cinema.id &&
      new Date(s.date).toDateString() === new Date(date).toDateString(),
  )
  return matchingSchedules.length > 0 ? matchingSchedules[0].showTimes : []
}

function hasValidSchedules(movieId) {
  return cinemas.length > 0 && schedules.some((s) => s.movieId === movieId)
}

function createGuestMovieCard(movie) {
  const hasSchedules = hasValidSchedules(movie.id)
  return `
        <div class="movie-card" data-movie-id="${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
            <div class="overlay">
                <h4 class="font-black text-xl mb-3">${movie.title}</h4>
                <p class="text-sm text-gray-300 mb-4">${movie.genre} • ${movie.duration}</p>
                <div class="flex justify-between items-center w-full gap-3">
                    <button class="buy-ticket-btn action-btn !text-xs !py-1 !px-3 ${!hasSchedules ? "disabled" : ""}" ${!hasSchedules ? `title="No showtimes available"` : ""}>
                        <i class="fas fa-ticket-alt mr-2"></i> Buy Ticket
                    </button>
                </div>
            </div>
        </div>
    `
}

function createComingSoonCard(movie) {
  return `
        <div class="movie-card">
            <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
            <div class="absolute top-3 right-3">
                <span class="status-badge badge-coming-soon">Coming Soon</span>
            </div>
            <div class="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                <p class="text-xs font-bold">${movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "TBA"}</p>
            </div>
        </div>
    `
}

function setupGuestView() {
  const nowShowingMovies = getNowShowingMovies()
  const comingSoonMovies = getComingSoonMovies()

  const nowShowingGrid = document.querySelector("#now-showing-content-guest .grid")
  const comingSoonGrid = document.querySelector("#coming-soon-content-guest .grid")

  if (nowShowingGrid) {
    nowShowingGrid.innerHTML =
      nowShowingMovies.length > 0
        ? nowShowingMovies.map(createGuestMovieCard).join("")
        : '<div class="col-span-full text-center text-gray-400 py-12"><i class="fas fa-film text-6xl mb-4"></i><p>No movies currently showing</p></div>'
  }

  if (comingSoonGrid) {
    comingSoonGrid.innerHTML =
      comingSoonMovies.length > 0
        ? comingSoonMovies.map(createComingSoonCard).join("")
        : '<div class="col-span-full text-center text-gray-400 py-12"><i class="fas fa-calendar text-6xl mb-4"></i><p>No upcoming movies</p></div>'
  }

  document.querySelectorAll("#now-showing-content-guest .movie-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".buy-ticket-btn")) {
        const movieId = Number.parseInt(card.dataset.movieId)
        handleGuestMovieClick(movieId)
      }
    })
  })

  setupHeroBanner(nowShowingMovies)
}

function setupHeroBanner(nowShowingMovies) {
  const heroSection = document.getElementById("hero-section")
  const heroContent = document.getElementById("hero-content")

  const filteredTrailers = trailers
    .map((t) => ({ trailer: t, movie: movies.find((m) => m.id === t.movieId) }))
    .filter((item) => item.movie && item.movie.status === "nowShowing")

  if (filteredTrailers.length > 0) {
    let currentIndex = 0

    function updateHero() {
      const { trailer, movie } = filteredTrailers[currentIndex]
      if (heroContent) {
        heroContent.innerHTML = `
                    <h2 class="text-5xl md:text-7xl font-black mb-6 leading-tight gradient-text">${movie.title}</h2>
                    <p class="text-xl md:text-2xl text-gray-300 mb-4 max-w-lg">${movie.genre} • ${movie.duration} • ${movie.rating}</p>
                    <p class="text-lg text-gray-400 mb-8 max-w-lg line-clamp-3">${movie.synopsis}</p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="openTrailerModal('${trailer.url}')" class="action-btn px-8 py-4 text-lg">
                            <i class="fas fa-play mr-2"></i> Watch Trailer
                        </button>
                        <button onclick="currentUser ? renderPage('booking') : (document.getElementById('loginBtn').click(), localStorage.setItem('intendedAction', 'viewMovies'))" class="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all">
                            <i class="fas fa-ticket-alt mr-2"></i> Browse Movies
                        </button>
                    </div>
                `
      }
      const embedUrl = `${trailer.url}?autoplay=1&mute=1&loop=1&playlist=${trailer.url.split("/embed/")[1].split("?")[0]}&controls=0`
      heroSection.style.backgroundImage = ""
      heroSection.innerHTML = `
                <div class="hero-overlay absolute inset-0"></div>
                <div class="trailer-container absolute inset-0">
                    <iframe src="${embedUrl}" class="w-full h-full" title="Featured Trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="container mx-auto px-6 md:px-10 relative z-10">
                    <div id="hero-content" class="max-w-2xl"></div>
                </div>
            `
      const newHeroContent = heroSection.querySelector("#hero-content")
      if (newHeroContent) {
        newHeroContent.innerHTML = heroContent.innerHTML
      }
    }

    updateHero()
    heroInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % filteredTrailers.length
      updateHero()
    }, 10000)
    return
  }

  if (nowShowingMovies.length === 0) {
    if (heroContent) {
      heroContent.innerHTML = `
                <h2 class="text-5xl md:text-7xl font-black mb-6 leading-tight gradient-text">Welcome to ONECINEHUB</h2>
                <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-lg">Discover amazing movies and book your tickets today!</p>
                <button class="action-btn px-8 py-4 text-lg" onclick="document.getElementById('loginBtn').click()">
                    <i class="fas fa-sign-in-alt mr-2"></i> Sign In to Book
                </button>
            `
    }
    heroSection.style.backgroundImage = ""
    return
  }

  const featured = nowShowingMovies[0]
  const managedTrailer = trailers.find((t) => t.movieId === featured.id)
  if (heroContent) {
    heroContent.innerHTML = `
            <h2 class="text-5xl md:text-7xl font-black mb-6 leading-tight">${featured.title}</h2>
            <p class="text-xl md:text-2xl text-gray-300 mb-4 max-w-lg">${featured.genre} • ${featured.duration} • ${featured.rating}</p>
            <p class="text-lg text-gray-400 mb-8 max-w-lg line-clamp-3">${featured.synopsis}</p>
            <div class="flex flex-col sm:flex-row gap-4">
                <button onclick="handleGuestBuyTicket(${featured.id})" class="action-btn px-8 py-4 text-lg">
                    <i class="fas fa-ticket-alt mr-2"></i> Get Tickets
                </button>
                ${managedTrailer ? `<button onclick="openTrailerModal('${managedTrailer.url}')" class="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all">Watch Trailer</button>` : ""}
            </div>
        `
  }
  heroSection.style.backgroundImage = `url(${featured.poster})`
}

document.addEventListener("DOMContentLoaded", () => {
  loadData()
  setupModalControls()
  setupGuestView()
  setupScrollHeader()

  document.getElementById("showNowShowing").addEventListener("click", () => {
    document.getElementById("showNowShowing").classList.add("active")
    document.getElementById("showComingSoon").classList.remove("active")
    document.getElementById("now-showing-content-guest").classList.remove("hidden")
    document.getElementById("coming-soon-content-guest").classList.add("hidden")
  })
  document.getElementById("showComingSoon").addEventListener("click", () => {
    document.getElementById("showComingSoon").classList.add("active")
    document.getElementById("showNowShowing").classList.remove("active")
    document.getElementById("coming-soon-content-guest").classList.remove("hidden")
    document.getElementById("now-showing-content-guest").classList.add("hidden")
  })

  window.addEventListener("storage", handleStorageChange)
  window.addEventListener("dataUpdated", handleDataUpdate)

  document.getElementById("login-form").addEventListener("submit", handleLogin)
  document.getElementById("register-form").addEventListener("submit", handleRegister)
})

async function handleLogin(e) {
  e.preventDefault()
  const emailOrUsername = document.getElementById("login-email").value.trim()
  const password = document.getElementById("login-password").value

  if (!emailOrUsername || !password) {
    alert("Please fill in all fields.")
    return
  }

  try {
    const response = await fetch('auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        emailOrUsername: emailOrUsername,
        password: password
      })
    })

    const result = await response.json()

    if (result.success) {
      currentUser = result.user
      await loadData()
      document.getElementById("loginModal").style.display = "none"
      document.getElementById("login-form").reset()

      const intendedAction = localStorage.getItem("intendedAction")
      const intendedMovieId = Number.parseInt(localStorage.getItem("intendedMovieId"))
      localStorage.removeItem("intendedAction")
      localStorage.removeItem("intendedMovieId")

      if (intendedAction === "buyTicket" && intendedMovieId) {
        startBookingProcess(intendedMovieId)
      } else if (intendedMovieId) {
        renderPage("details", { movieId: intendedMovieId })
      } else {
        loadClientDashboard()
      }
    } else {
      alert(result.message || "Login failed.")
    }
  } catch (error) {
    console.error('Login error:', error)
    alert("An error occurred during login. Please try again.")
  }
}

async function handleRegister(e) {
  e.preventDefault()
  const username = document.getElementById("register-fullname").value.trim()
  const email = document.getElementById("register-email").value.trim()
  const password = document.getElementById("register-password").value
  const confirmPassword = document.getElementById("register-confirm-password").value

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill in all fields.")
    return
  }

  if (!email.endsWith("@gmail.com")) {
    alert("Invalid email. Only Gmail addresses are allowed.")
    return
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.")
    return
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.")
    return
  }

  try {
    const response = await fetch('auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        username: username,
        email: email,
        password: password
      })
    })

    const result = await response.json()

    if (result.success) {
      alert("Registration Successful! Please log in.")
      document.getElementById("registerModal").style.display = "none"
      document.getElementById("loginModal").style.display = "block"
      document.getElementById("register-form").reset()

      document.getElementById("login-email").value = email
      document.getElementById("login-password").value = password

      const intendedAction = localStorage.getItem("intendedAction")
      const intendedMovieId = localStorage.getItem("intendedMovieId")
      if (intendedAction || intendedMovieId) {
        // Intent will be handled after login
      }
    } else {
      alert(result.message || "Registration failed.")
    }
  } catch (error) {
    console.error('Registration error:', error)
    alert("An error occurred during registration. Please try again.")
  }
}

function setupScrollHeader() {
  const header = document.getElementById("main-header")
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      header.style.backgroundColor = "rgba(10, 10, 10, 0.95)"
    } else {
      header.style.backgroundColor = "transparent"
    }
  })
}

function setupModalControls() {
  document.getElementById("loginBtn")?.addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "block"
  })

  document.getElementById("registerBtn")?.addEventListener("click", () => {
    document.getElementById("registerModal").style.display = "block"
  })

  document.getElementById("closeLogin")?.addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none"
  })

  document.getElementById("closeRegister")?.addEventListener("click", () => {
    document.getElementById("registerModal").style.display = "none"
  })

  document.getElementById("closeTrailer")?.addEventListener("click", () => {
    document.getElementById("trailerModal").style.display = "none"
    document.getElementById("trailer-iframe").src = ""
  })

  window.onclick = (e) => {
    const modals = ["loginModal", "registerModal", "trailerModal"]
    modals.forEach((id) => {
      if (e.target == document.getElementById(id)) {
        document.getElementById(id).style.display = "none"
        if (id === "trailerModal") {
          document.getElementById("trailer-iframe").src = ""
        }
      }
    })
  }

  document.getElementById("showRegisterFromLogin").onclick = (e) => {
    e.preventDefault()
    document.getElementById("loginModal").style.display = "none"
    document.getElementById("registerModal").style.display = "block"
  }

  document.getElementById("showLoginFromRegister").onclick = (e) => {
    e.preventDefault()
    document.getElementById("registerModal").style.display = "none"
    document.getElementById("loginModal").style.display = "block"
  }
}

function handleGuestMovieClick(movieId) {
  if (currentUser) {
    renderPage("details", { movieId: movieId })
  } else {
    document.getElementById("loginBtn").click()
    localStorage.setItem("intendedMovieId", movieId)
  }
}

function handleGuestBuyTicket(movieId) {
  if (currentUser) {
    startBookingProcess(movieId)
  } else {
    document.getElementById("loginBtn").click()
    localStorage.setItem("intendedAction", "buyTicket")
    localStorage.setItem("intendedMovieId", movieId)
  }
}

function openTrailerModal(trailerUrl) {
  if (!trailerUrl) {
    alert("Trailer not available")
    return
  }
  document.getElementById("trailer-iframe").src = convertToEmbedUrl(trailerUrl)
  document.getElementById("trailerModal").style.display = "block"
}

function loadClientDashboard() {
  if (!currentUser) {
    alert("Please log in first.")
    return
  }
  document.getElementById("guest-view").style.display = "none"
  renderPage("booking")
  addNotification(`Welcome back, ${currentUser.username}!`)
}

function renderPage(view, options = {}) {
  document.getElementById("guest-view").style.display = "none"
  const dashboard = document.getElementById("client-dashboard")
  dashboard.classList.remove("hidden")

  let mainContentHTML
  switch (view) {
    case "home":
      mainContentHTML = renderHomeView()
      break
    case "booking":
      mainContentHTML = renderBookingView(options.tab || "nowShowing")
      break
    case "favorites":
      mainContentHTML = renderFavoritesView()
      break
    case "history":
      mainContentHTML = renderHistoryView()
      break
    case "details":
      mainContentHTML = renderMovieDetails(options.movieId)
      break
    case "booking-process":
      mainContentHTML = renderBookingPage(options.step || 1)
      break
    default:
      mainContentHTML = renderBookingView()
  }

  dashboard.innerHTML = `
        <header class="dashboard-header sticky top-0 z-50">
            <div class="container mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
                <div class="flex items-center gap-12">
                    <h1 class="text-2xl md:text-3xl font-black gradient-text tracking-wider">ONECINEHUB</h1>
                    <nav class="hidden md:flex items-center gap-10 text-sm font-bold dashboard-nav">
                        <a data-view="home" class="${view === "home" ? "active" : "text-gray-400"}">HOME</a>
                        <a data-view="booking" class="${view === "booking" || view === "details" || view === "booking-process" ? "active" : "text-gray-400"}">MOVIES</a>
                        <a data-view="history" class="${view === "history" ? "active" : "text-gray-400"}">HISTORY</a>
                        <a data-view="favorites" class="${view === "favorites" ? "active" : "text-gray-400"}">FAVORITES</a>
                    </nav>
                </div>
                <div class="flex items-center gap-6">
                    <button id="notification-bell" class="text-gray-400 text-2xl hover:text-red-500 relative transition-colors">
                        <i class="fas fa-bell"></i>
                        <span id="notification-badge" class="notification-badge">${notifications.filter((n) => !n.read).length}</span>
                    </button>
                    <div class="relative" id="user-profile">
                        <button class="flex items-center gap-3 hover:text-white transition-colors cursor-pointer" id="profile-toggle">
                            <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-black text-lg">${currentUser.username.charAt(0).toUpperCase()}</div>
                            <span class="hidden sm:block text-sm font-bold">${currentUser.username}</span>
                            <i class="fas fa-chevron-down text-xs"></i>
                        </button>
                        <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-medium-bg border border-white/10 rounded-lg shadow-lg py-2 z-50">
                            <button onclick="logout()" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                                <i class="fas fa-sign-out-alt text-red-500"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <main id="dashboard-main-content" class="container mx-auto px-6 lg:px-10 py-10 content-enter min-h-screen">
            ${mainContentHTML}
        </main>
    `

  addDashboardEventListeners()
  updateNotificationBadge()
}

function addDashboardEventListeners() {
  document.querySelectorAll(".dashboard-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      renderPage(e.target.dataset.view)
    })
  })

  document.getElementById("notification-bell").addEventListener("click", toggleNotifications)

  const profileToggle = document.getElementById("profile-toggle")
  const profileDropdown = document.getElementById("profile-dropdown")
  if (profileToggle && profileDropdown) {
    profileToggle.addEventListener("click", (e) => {
      e.stopPropagation()
      profileDropdown.classList.toggle("hidden")
    })

    document.addEventListener("click", (e) => {
      if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add("hidden")
      }
    })
  }

  const mainContent = document.getElementById("dashboard-main-content")
  if (mainContent) {
    mainContent.addEventListener("click", (e) => {
      const target = e.target
      const movieCard = target.closest(".client-movie-card")

      if (target.matches("#db-now-showing-btn")) {
        renderPage("booking", { tab: "nowShowing" })
      } else if (target.matches("#db-coming-soon-btn")) {
        renderPage("booking", { tab: "comingSoon" })
      } else if (target.closest(".buy-ticket-btn")) {
        e.stopPropagation()
        startBookingProcess(Number.parseInt(movieCard.dataset.movieId))
      } else if (target.closest(".fav-icon")) {
        e.stopPropagation()
        toggleFavorite(Number.parseInt(movieCard.dataset.movieId), target.closest(".fav-icon"))
      } else if (movieCard && movieCard.dataset.movieId) {
        const movieId = Number.parseInt(movieCard.dataset.movieId)
        if (getNowShowingMovies().find((m) => m.id === movieId)) {
          renderPage("details", { movieId: movieId })
        }
      }
    })
  }
}

function renderHomeView() {
  return `
        <div class="text-center max-w-3xl mx-auto py-20">
            <h2 class="text-5xl font-black mb-6 gradient-text">Welcome to ONECINEHUB!</h2>
            <p class="text-xl text-gray-300 mb-10">Your one-stop destination for an unparalleled cinematic experience.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="glass-card p-8 text-center">
                    <i class="fas fa-film text-5xl text-red-500 mb-4"></i>
                    <h3 class="font-bold text-xl mb-2">Latest Movies</h3>
                    <p class="text-gray-400">Watch blockbusters first</p>
                </div>
                <div class="glass-card p-8 text-center">
                    <i class="fas fa-couch text-5xl text-red-500 mb-4"></i>
                    <h3 class="font-bold text-xl mb-2">Premium Seats</h3>
                    <p class="text-gray-400">Comfort redefined</p>
                </div>
                <div class="glass-card p-8 text-center">
                    <i class="fas fa-ticket-alt text-5xl text-red-500 mb-4"></i>
                    <h3 class="font-bold text-xl mb-2">Easy Booking</h3>
                    <p class="text-gray-400">Book in seconds</p>
                </div>
            </div>
        </div>
    `
}

function renderHistoryView() {
  if (bookingHistory.length === 0) {
    return `
            <div class="text-center py-20">
                <i class="fas fa-history text-6xl text-gray-600 mb-6"></i>
                <h2 class="text-4xl font-black mb-4">My Booking History</h2>
                <p class="text-xl text-gray-400">You haven't booked any tickets yet.</p>
            </div>
        `
  }

  const items = bookingHistory
    .map(
      (item) => `
        <div class="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-red-500/30 transition-all">
            <img src="${item.movie.poster}" class="w-24 h-36 object-cover rounded-lg shadow-lg" alt="${item.movie.title}">
            <div class="flex-grow">
                <h3 class="font-black text-2xl mb-2">${item.movie.title}</h3>
                <div class="space-y-1 text-gray-300">
                    <p><i class="fas fa-map-marker-alt w-5 text-red-500"></i> ${item.branch}</p>
                    <p><i class="fas fa-calendar w-5 text-red-500"></i> ${new Date(item.date).toLocaleDateString()}</p>
                    <p><i class="fas fa-clock w-5 text-red-500"></i> ${item.time}</p>
                    <p><i class="fas fa-chair w-5 text-red-500"></i> Seats: ${item.seats.join(", ")}</p>
                </div>
                <p class="text-xs text-gray-500 mt-3 font-mono">Booking ID: ${item.txNumber}</p>
            </div>
            <button onclick="downloadTicketById('${item.txNumber}')" class="action-btn flex items-center gap-2 whitespace-nowrap">
                <i class="fas fa-download"></i> Download
            </button>
        </div>
    `,
    )
    .join("")

  return `
        <h2 class="text-4xl font-black mb-8 gradient-text">My Booking History</h2>
        <div class="space-y-6">${items}</div>
    `
}

function renderFavoritesView() {
  if (favorites.length === 0) {
    return `
            <div class="text-center py-20">
                <i class="fas fa-heart text-6xl text-gray-600 mb-6"></i>
                <h2 class="text-4xl font-black mb-4">My Favorites</h2>
                <p class="text-xl text-gray-400">Use the <i class="fas fa-heart text-red-500"></i> icon on movies to add them to your favorites.</p>
            </div>
        `
  }

  const favoritedMovies = getNowShowingMovies().filter((m) => favorites.includes(m.id))
  const cards = favoritedMovies.map((movie) => createMovieCard(movie)).join("")

  return `
        <h2 class="text-4xl font-black mb-8 gradient-text">My Favorites</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">${cards}</div>
    `
}

function renderBookingView(activeTab) {
  const nowShowing = getNowShowingMovies()
    .map((movie) => createMovieCard(movie))
    .join("")
  const comingSoon = getComingSoonMovies()
    .map(
      (movie) => `
        <div class="client-movie-card" data-movie-id="${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
            <div class="absolute top-3 right-3">
                <span class="status-badge badge-coming-soon">Coming Soon</span>
            </div>
            <div class="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                <p class="text-xs font-bold">${movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "TBA"}</p>
            </div>
        </div>
    `,
    )
    .join("")

  return `
        <div class="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 class="text-4xl font-black gradient-text mb-6 md:mb-0">Browse Movies</h2>
            <nav class="flex items-center gap-8 text-lg font-black dashboard-sub-nav">
                <button id="db-now-showing-btn" class="${activeTab === "nowShowing" ? "active text-white" : "text-gray-500"}">NOW SHOWING</button>
                <button id="db-coming-soon-btn" class="${activeTab === "comingSoon" ? "active text-white" : "text-gray-500"}">COMING SOON</button>
            </nav>
        </div>
        
        <section id="db-now-showing-content" class="${activeTab === "nowShowing" ? "" : "hidden"}">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">${nowShowing.length > 0 ? nowShowing : '<div class="col-span-full text-center text-gray-400 py-12"><i class="fas fa-film text-6xl mb-4"></i><p>No movies currently showing</p></div>'}</div>
        </section>
        
        <section id="db-coming-soon-content" class="${activeTab === "comingSoon" ? "" : "hidden"}">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">${comingSoon.length > 0 ? comingSoon : '<div class="col-span-full text-center text-gray-400 py-12"><i class="fas fa-calendar text-6xl mb-4"></i><p>No upcoming movies</p></div>'}</div>
        </section>
    `
}

function renderMovieDetails(movieId) {
  const movie = getNowShowingMovies().find((m) => m.id == movieId)
  if (!movie) return `<p>Movie not found.</p>`

  const isFavorited = favorites.includes(movie.id)
  const managedTrailer = trailers.find((t) => t.movieId === movie.id)

  return `
        <button onclick="renderPage('booking')" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
            <i class="fas fa-arrow-left"></i> Back to Movies
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-1">
                <img src="${movie.poster}" alt="${movie.title}" class="rounded-xl w-full shadow-2xl aspect-[2/3] object-cover border-4 border-white/10">
            </div>

            <div class="lg:col-span-2">
                <div class="flex items-start gap-6 mb-4">
                    <h2 class="text-5xl lg:text-6xl font-black flex-grow leading-tight">${movie.title}</h2>
                    <i onclick="toggleFavorite(${movie.id}, this)" class="fas fa-heart fav-icon ${isFavorited ? "favorited" : ""} flex-shrink-0 mt-2"></i>
                </div>

                <div class="flex items-center flex-wrap gap-4 mb-6">
                    <span class="text-lg font-bold text-gray-300">${movie.genre}</span>
                    <span class="text-gray-600">•</span>
                    <span class="text-lg font-bold text-gray-300">${movie.duration}</span>
                    <span class="text-gray-600">•</span>
                    <span class="border-2 border-red-500 px-4 py-1 rounded-lg font-black text-red-500">${movie.rating}</span>
                </div>

                <div class="glass-card p-6 mb-6">
                    <h3 class="text-2xl font-black mb-3 text-red-500">Synopsis</h3>
                    <p class="text-lg leading-relaxed text-gray-300">${movie.synopsis}</p>
                </div>

                <div class="glass-card p-6 mb-6">
                    <h3 class="text-2xl font-black mb-3 text-red-500">Cast</h3>
                    <p class="text-lg text-gray-300">${movie.cast}</p>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 mb-8">
                    <button onclick="startBookingProcess(${movie.id})" class="action-btn flex-1 text-xl py-5">
                        <i class="fas fa-ticket-alt mr-3"></i> Get Tickets
                    </button>
                    ${
                      managedTrailer
                        ? `<button onclick="openTrailerModal('${managedTrailer.url}')" class="flex-1 text-xl py-5 bg-transparent border-2 border-white/30 hover:bg-white/10 text-white rounded-lg transition-all">
                        <i class="fas fa-play mr-3"></i> Watch Trailer
                    </button>`
                        : ""
                    }
                </div>
            </div>
        </div>
    `
}

function createMovieCard(movie) {
  const isFavorited = favorites.includes(movie.id)
  const hasSchedules = hasValidSchedules(movie.id)
  return `
        <div class="client-movie-card" data-movie-id="${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}" class="w-full h-auto aspect-[2/3] object-cover">
            <div class="overlay">
                <h4 class="font-black text-xl mb-3">${movie.title}</h4>
                <p class="text-sm text-gray-300 mb-4">${movie.genre} • ${movie.duration}</p>

                <div class="flex justify-between items-center w-full gap-3">
                    <button class="buy-ticket-btn action-btn !text-xs !py-1 !px-3 ${!hasSchedules ? "disabled" : ""}" onclick="${hasSchedules ? `startBookingProcess(${movie.id})` : ""}" ${!hasSchedules ? `title="No showtimes available"` : ""}>
                        <i class="fas fa-ticket-alt mr-2"></i> Buy Ticket
                    </button>
                    <i class="fas fa-heart fav-icon ${isFavorited ? "favorited" : ""} !text-2xl"></i>
                </div>
            </div>
        </div>
    `
}

function toggleFavorite(movieId, iconElement) {
  if (favorites.includes(movieId)) {
    favorites = favorites.filter((id) => id !== movieId)
    iconElement.classList.remove("favorited")
    addNotification("Removed from favorites")
  } else {
    favorites.push(movieId)
    iconElement.classList.add("favorited")
    addNotification("Added to favorites!")
  }
  saveUserData()
}

function startBookingProcess(movieId) {
  const movie = getNowShowingMovies().find((m) => m.id == movieId)
  if (!movie) return

  bookingState = {
    movieId: movieId,
    movie: movie,
    seats: [],
  }
  localStorage.setItem("bookingState", JSON.stringify(bookingState))
  renderPage("booking-process", { step: 1 })
}

function renderBookingProcessHeader() {
  const { movie, branch, date, time } = bookingState
  return `
        <div class="glass-card p-6 flex items-center gap-6 mb-10 border-l-4 border-red-500">
            <img src="${movie.poster}" alt="${movie.title}" class="w-20 h-30 object-cover rounded-lg shadow-lg hidden sm:block">
            <div>
                <h2 class="text-2xl font-black mb-1">${movie.title}</h2>
                ${branch ? `<p class="text-gray-300"><i class="fas fa-map-marker-alt text-red-500 mr-2"></i>${branch}${date ? ` | ${new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : ""}${time ? ` at ${time}` : ""}</p>` : ""}
            </div>
        </div>
    `
}

function renderBookingPage(step) {
  let content = ""
  const header = step > 1 ? renderBookingProcessHeader() : ""

  try {
    switch (step) {
      case 1:
        const availableCinemas = cinemas.filter((c) =>
          schedules.some((s) => s.movieId == bookingState.movieId && s.cinemaId == c.id),
        )
        if (availableCinemas.length === 0) {
          content = `
                        <div class="text-center py-20">
                            <i class="fas fa-map-marker-alt text-6xl text-gray-600 mb-6"></i>
                            <h2 class="text-4xl font-black mb-4">No Cinemas Available</h2>
                            <p class="text-xl text-gray-400">There are currently no cinemas showing this movie.</p>
                            <button onclick="renderPage('booking')" class="action-btn mt-6">Back to Movies</button>
                        </div>
                    `
        } else {
          content = `
                        <h2 class="text-3xl font-black mb-6">Select Cinema</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${availableCinemas
                              .map(
                                (c) => `
                                <button onclick="handleBookingStep(1, {'branch': '${c.name}'})" class="glass-card p-6 text-left hover:border-red-500/50 transition-all group">
                                    <i class="fas fa-building text-3xl text-red-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h3 class="font-black text-xl mb-2">${c.name}</h3>
                                    <p class="text-gray-400 mb-2">${c.location}</p>
                                    <p class="text-sm text-gray-500">${c.address}</p>
                                </button>
                            `,
                              )
                              .join("")}
                        </div>
                    `
        }
        break
      case 2:
        const cinema = cinemas.find((c) => c.name === bookingState.branch)
        const availableSchedules = schedules.filter(
          (s) => s.movieId == bookingState.movieId && s.cinemaId == cinema?.id,
        )
        const availableDates = [...new Set(availableSchedules.map((s) => new Date(s.date).toDateString()))]
          .map((dateStr) => new Date(dateStr))
          .sort((a, b) => a - b)

        if (availableDates.length === 0) {
          content = `
                        <button onclick="renderPage('booking-process', {step: 1})" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                            <i class="fas fa-arrow-left"></i> Back to Cinemas
                        </button>
                        ${header}
                        <div class="text-center py-20">
                            <i class="fas fa-calendar-times text-6xl text-gray-600 mb-6"></i>
                            <h2 class="text-4xl font-black mb-4">No Showtimes Available</h2>
                            <p class="text-xl text-gray-400">There are currently no scheduled showtimes for this movie at the selected cinema.</p>
                        </div>
                    `
        } else {
          bookingState.date = bookingState.date || availableDates[0].toDateString()
          const showtimes = getAvailableShowtimes(bookingState.movieId, bookingState.branch, bookingState.date)

          content = `
                        <button onclick="renderPage('booking-process', {step: 1})" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                            <i class="fas fa-arrow-left"></i> Back to Cinemas
                        </button>
                        ${header}

                        <h2 class="text-3xl font-black mb-6">Select Date</h2>
                        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-10">
                            ${availableDates
                              .map(
                                (d) => `
                                <button onclick="handleDateSelect(this, '${d.toDateString()}')"
                                    class="date-btn glass-card p-4 text-center ${d.toDateString() === bookingState.date ? "border-red-500 border-2" : ""} hover:border-red-500/50 transition-all"
                                    data-date="${d.toDateString()}">
                                    <p class="text-xs text-gray-400 uppercase mb-1">${d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                                    <p class="text-2xl font-black">${d.getDate()}</p>
                                    <p class="text-xs text-gray-400">${d.toLocaleDateString("en-US", { month: "short" })}</p>
                                </button>
                            `,
                              )
                              .join("")}
                        </div>

                        <h2 class="text-3xl font-black mb-6">Select Time</h2>
                        <div id="showtimes-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            ${showtimes
                              .map(
                                (t) => `
                                <button onclick="handleBookingStep(2, {'time': '${t}'})" class="glass-card p-6 text-center hover:border-red-500/50 transition-all group">
                                    <i class="fas fa-clock text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="font-black text-xl">${t}</p>
                                    <p class="text-xs text-gray-400 mt-1">Hall 1</p>
                                </button>
                            `,
                              )
                              .join("")}
                        </div>
                    `
        }
        break

      case 3:
        const scheduleKey = `${bookingState.movieId}_${bookingState.branch}_${bookingState.date}_${bookingState.time}`
        const occupiedSeatsForSchedule = occupiedSeats[scheduleKey] || []

        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
        const seatRows = rows
          .map((row) => {
            const rowSeats = []
            for (let i = 1; i <= 14; i++) {
              const seatId = `${row}${i}`
              const isOccupied = occupiedSeatsForSchedule.includes(seatId)
              rowSeats.push(
                `<div class="seat ${isOccupied ? "occupied" : ""}" data-seat="${seatId}" ${isOccupied ? "" : `onclick="toggleSeat(this)"`}>${seatId}</div>`,
              )
              if (i === 3 || i === 11) rowSeats.push('<div class="seat aisle"></div>')
            }
            return `<div class="seat-row"><div class="seat-row-label">${row}</div>${rowSeats.join("")}<div class="seat-row-label">${row}</div></div>`
          })
          .join("")

        content = `
                    <button onclick="renderPage('booking-process', {step: 2})" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                        <i class="fas fa-arrow-left"></i> Back to Showtimes
                    </button>
                    ${header}
                    
                    <div class="glass-card p-6 sm:p-8 lg:p-10">
                        <div class="seat-map-screen"></div>
                        <div class="seat-map-container mb-10">${seatRows}</div>
                        
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
                                <button id="proceed-to-payment-btn" class="action-btn px-10 py-4 text-lg whitespace-nowrap" disabled onclick="handleBookingStep(3)">
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                `
        break

      case 4:
        content = `
                    <button onclick="renderPage('booking-process', {step: 3})" class="mb-8 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg font-bold">
                        <i class="fas fa-arrow-left"></i> Back to Seat Selection
                    </button>
                    ${header}
                    
                    <div class="glass-card p-8 sm:p-10">
                        <h2 class="text-4xl font-black mb-10 text-center gradient-text">Payment</h2>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <h3 class="font-black text-2xl mb-6 pb-4 border-b border-white/10">Booking Summary</h3>
                                <div class="space-y-5 text-base">
                                    <div class="flex items-start gap-4">
                                        <i class="fas fa-film text-red-500 text-xl w-6"></i>
                                        <div>
                                            <p class="text-gray-400 text-sm mb-1">Movie</p>
                                            <p class="font-bold text-lg">${bookingState.movie.title}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-4">
                                        <i class="fas fa-map-marker-alt text-red-500 text-xl w-6"></i>
                                        <div>
                                            <p class="text-gray-400 text-sm mb-1">Cinema</p>
                                            <p class="font-bold text-lg">${bookingState.branch}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-4">
                                        <i class="fas fa-calendar-alt text-red-500 text-xl w-6"></i>
                                        <div>
                                            <p class="text-gray-400 text-sm mb-1">Date & Time</p>
                                            <p class="font-bold text-lg">${new Date(bookingState.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                                            <p class="text-gray-300">${bookingState.time}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-4">
                                        <i class="fas fa-chair text-red-500 text-xl w-6"></i>
                                        <div>
                                            <p class="text-gray-400 text-sm mb-1">Seats</p>
                                            <p class="font-mono bg-dark-bg px-4 py-2 rounded-lg text-lg font-bold">${bookingState.seats.join(", ")}</p>
                                        </div>
                                    </div>
                                    <hr class="border-white/10 my-6">
                                    <div class="flex justify-between items-center text-2xl">
                                        <span class="font-black">Total:</span>
                                        <span class="text-red-500 font-black">₱${bookingState.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 class="font-black text-2xl mb-6 pb-4 border-b border-white/10">Payment Method</h3>
                                <div class="space-y-4 mb-8">
                                    ${["GCash", "PayMaya", "Credit/Debit Card"]
                                      .map(
                                        (m) => `
                                        <button class="payment-method-btn w-full text-left p-5 glass-card border-2 border-transparent hover:border-red-500/50 transition-all flex items-center gap-4 group" 
                                            data-method="${m}" onclick="showPaymentForm('${m}', this)">
                                            <div class="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center group-hover:from-red-500/30 group-hover:to-red-700/30 transition-all">
                                                <i class="fas ${m === "GCash" ? "fa-mobile-alt" : m === "PayMaya" ? "fa-wallet" : "fa-credit-card"} text-red-500 text-xl"></i>
                                            </div>
                                            <span class="font-black text-lg">${m}</span>
                                        </button>
                                    `,
                                      )
                                      .join("")}
                                </div>
                                <div id="payment-form-container"></div>
                            </div>
                        </div>
                    </div>
                `
        break

      case 5:
        const txNumber = `OHC-${Date.now()}`
        bookingState.txNumber = txNumber
        bookingHistory.push({ ...bookingState })

        const adminTransactions = JSON.parse(localStorage.getItem("adminTransactions") || "[]")
        adminTransactions.push({
          txNumber: txNumber,
          movie: bookingState.movie,
          branch: bookingState.branch,
          date: bookingState.date,
          time: bookingState.time,
          seats: bookingState.seats,
          totalPrice: bookingState.totalPrice,
          timestamp: new Date().toISOString(),
        })
        localStorage.setItem("adminTransactions", JSON.stringify(adminTransactions))

        const bookingScheduleKey = `${bookingState.movieId}_${bookingState.branch}_${bookingState.date}_${bookingState.time}`
        if (!occupiedSeats[bookingScheduleKey]) {
          occupiedSeats[bookingScheduleKey] = []
        }
        occupiedSeats[bookingScheduleKey].push(...bookingState.seats)
        localStorage.setItem("occupiedSeats", JSON.stringify(occupiedSeats))

        saveUserData()
        addNotification(`Ticket for ${bookingState.movie.title} confirmed!`)

        content = `
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
                                <img src="${bookingState.movie.poster}" class="w-20 h-30 object-cover rounded-lg shadow-lg">
                                <div>
                                    <h3 class="font-black text-2xl mb-1">${bookingState.movie.title}</h3>
                                    <p class="text-gray-400">${bookingState.branch}</p>
                                </div>
                            </div>
                            
                            <div class="space-y-3 mb-6">
                                <p class="flex justify-between"><span class="text-gray-400">Date:</span><span class="font-bold">${new Date(bookingState.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></p>
                                <p class="flex justify-between"><span class="text-gray-400">Time:</span><span class="font-bold">${bookingState.time}</span></p>
                                <p class="flex justify-between"><span class="text-gray-400">Seats:</span><span class="font-bold font-mono">${bookingState.seats.join(", ")}</span></p>
                                <p class="flex justify-between"><span class="text-gray-400">Total Paid:</span><span class="font-bold text-red-500">₱${bookingState.totalPrice.toFixed(2)}</span></p>
                            </div>
                            
                            <div class="bg-dark-bg rounded-lg p-6 text-center">
                                <p class="text-gray-400 text-sm mb-2 uppercase font-bold tracking-wider">Booking ID</p>
                                <p class="font-mono text-3xl font-black bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">${txNumber}</p>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row justify-center gap-4">
                            <button onclick="renderPage('booking')" class="action-btn bg-gray-700 hover:bg-gray-600 px-8 py-4 text-lg">
                                <i class="fas fa-home mr-2"></i> Back to Home
                            </button>
                            <button onclick="downloadTicketById('${txNumber}')" class="action-btn px-8 py-4 text-lg">
                                <i class="fas fa-download mr-2"></i> Download Ticket
                            </button>
                        </div>
                    </div>
                `
        localStorage.removeItem("bookingState")
        bookingState = {}
        break
    }
  } catch (error) {
    console.error("Error rendering booking page:", error)
    content = `
            <div class="text-center py-20">
                <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-6"></i>
                <h2 class="text-4xl font-black mb-4">Something went wrong</h2>
                <p class="text-xl text-gray-400">Please try again later.</p>
                <button onclick="renderPage('booking')" class="action-btn mt-6">Back to Movies</button>
            </div>
        `
  }

  return content
}

function handleBookingStep(currentStep, data) {
  Object.assign(bookingState, data)
  localStorage.setItem("bookingState", JSON.stringify(bookingState))
  renderPage("booking-process", { step: currentStep + 1 })
}

function handleDateSelect(button, dateString) {
  document.querySelectorAll(".date-btn").forEach((btn) => {
    btn.classList.remove("border-red-500", "border-2")
  })
  button.classList.add("border-red-500", "border-2")
  bookingState.date = dateString

  const showtimes = getAvailableShowtimes(bookingState.movieId, bookingState.branch, dateString)
  const grid = document.getElementById("showtimes-grid")
  if (grid) {
    grid.innerHTML = showtimes
      .map(
        (t) => `
            <button onclick="handleBookingStep(2, {'time': '${t}'})" class="glass-card p-6 text-center hover:border-red-500/50 transition-all group">
                <i class="fas fa-clock text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform"></i>
                <p class="font-black text-xl">${t}</p>
                <p class="text-xs text-gray-400 mt-1">Hall 1</p>
            </button>
        `,
      )
      .join("")
  }
}

function toggleSeat(seatElement) {
  if (seatElement.classList.contains("occupied") || seatElement.classList.contains("aisle")) return

  seatElement.classList.toggle("selected")
  const seatId = seatElement.dataset.seat

  if (bookingState.seats.includes(seatId)) {
    bookingState.seats = bookingState.seats.filter((s) => s !== seatId)
  } else {
    bookingState.seats.push(seatId)
  }

  updateSeatSummary()
}

function updateSeatSummary() {
  const selectionSummaryEl = document.getElementById("seat-selection-summary")
  const priceSummaryEl = document.getElementById("seat-price-summary")
  const proceedBtn = document.getElementById("proceed-to-payment-btn")
  const seatCount = bookingState.seats.length

  if (seatCount === 0) {
    selectionSummaryEl.textContent = "None"
    priceSummaryEl.textContent = "₱0.00"
    proceedBtn.disabled = true
  } else {
    const cinema = cinemas.find((c) => c.name === bookingState.branch)
    const schedule = schedules.find(
      (s) =>
        s.movieId == bookingState.movieId &&
        s.cinemaId == cinema.id &&
        new Date(s.date).toDateString() === new Date(bookingState.date).toDateString(),
    )
    const price = schedule ? schedule.price : 350
    bookingState.totalPrice = seatCount * price
    const sortedSeats = bookingState.seats.sort()
    selectionSummaryEl.textContent = sortedSeats.join(", ")
    priceSummaryEl.textContent = `₱${bookingState.totalPrice.toFixed(2)}`
    proceedBtn.disabled = false
  }
}

function showPaymentForm(method, buttonElement) {
  document.querySelectorAll(".payment-method-btn").forEach((btn) => {
    btn.classList.remove("border-red-500", "border-2")
  })
  buttonElement.classList.add("border-red-500", "border-2")

  const container = document.getElementById("payment-form-container")
  bookingState.paymentMethod = method

  let form = ""
  if (method === "GCash" || method === "PayMaya") {
    form = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold mb-2">${method} Number</label>
                    <input type="tel" placeholder="09XX XXX XXXX" required
                        class="w-full bg-light-bg border-2 border-white/10 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                </div>
            </div>
        `
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
        `
  }

  container.innerHTML =
    form +
    `
        <button onclick="confirmPayment()" class="action-btn w-full mt-6 py-4 text-lg">
            <i class="fas fa-check-circle mr-2"></i> Confirm Payment
        </button>
    `
}

function confirmPayment() {
  const scheduleKey = `${bookingState.movieId}_${bookingState.branch}_${bookingState.date}_${bookingState.time}`
  const currentOccupied = occupiedSeats[scheduleKey] || []
  const stillAvailable = bookingState.seats.every((seat) => !currentOccupied.includes(seat))

  if (!stillAvailable) {
    showErrorModal(
      "Seats no longer available",
      "Some of the seats you selected are no longer available. Please go back and select different seats.",
    )
    return
  }

  handleBookingStep(4)
}

function showErrorModal(title, message) {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
        <div class="modal-content">
            <button class="close-button" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <h2 class="text-3xl font-black mb-4 text-center gradient-text">${title}</h2>
            <p class="text-center text-gray-400 mb-8">${message}</p>
            <button onclick="renderPage('booking-process', {step: 3})" class="action-btn w-full py-3 text-base">Back to Seat Selection</button>
        </div>
    `
  document.body.appendChild(modal)
  modal.style.display = "block"
}

function downloadTicketById(txNumber) {
  const bookingData = bookingHistory.find((b) => b.txNumber === txNumber)
  if (!bookingData) {
    console.error("Booking not found!")
    return
  }

  const doc = new jsPDF()
  const { movie, branch, date, time, seats, totalPrice } = bookingData

  doc.setFont("helvetica", "bold")
  doc.setFontSize(26)
  doc.setTextColor(229, 9, 20)
  doc.text("ONECINEHUB E-TICKET", 105, 20, null, null, "center")

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Booking ID: ${txNumber}`, 105, 28, null, null, "center")

  doc.setLineWidth(0.5)
  doc.setDrawColor(229, 9, 20)
  doc.line(20, 35, 190, 35)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(0)
  doc.text(movie.title, 20, 50)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.setTextColor(60)
  doc.text(`Cinema: ${branch}`, 20, 65)
  doc.text(
    `Date: ${new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    20,
    75,
  )
  doc.text(`Showtime: ${time}`, 20, 85)
  doc.text(`Seats: ${seats.join(", ")}`, 20, 95)
  doc.text(`Total Price: PHP ${totalPrice.toFixed(2)}`, 20, 105)

  doc.setLineWidth(0.3)
  doc.setDrawColor(200)
  doc.line(20, 115, 190, 115)

  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text("Present this ticket at the cinema entrance", 105, 125, null, null, "center")
  doc.text("Thank you for choosing ONECINEHUB!", 105, 132, null, null, "center")

  doc.save(`ONECINEHUB-Ticket-${txNumber}.pdf`)
}

function addNotification(message) {
  notifications.unshift({ message, date: new Date(), read: false })
  if (notifications.length > 10) notifications.pop()
  saveUserData()
  updateNotificationBadge()
}

function updateNotificationBadge() {
  const badge = document.getElementById("notification-badge")
  if (badge) {
    const newNotifs = notifications.filter((n) => !n.read).length
    if (newNotifs > 0) {
      badge.style.display = "flex"
      badge.textContent = newNotifs
    } else {
      badge.style.display = "none"
    }
  }
}

function toggleNotifications() {
  const panel = document.getElementById("notifications-panel")
  panel.classList.toggle("hidden")

  if (!panel.classList.contains("hidden")) {
    const list = document.getElementById("notifications-list")
    if (notifications.length > 0) {
      list.innerHTML = notifications
        .map(
          (n, i) => `
                <li class="text-sm pb-3 ${i !== notifications.length - 1 ? "border-b border-white/10" : ""}">
                    <p class="font-bold mb-1">${n.message}</p>
                    <p class="text-xs text-gray-400">${new Date(n.date).toLocaleString()}</p>
                </li>
            `,
        )
        .join("")
    } else {
      list.innerHTML = `<li class="text-gray-400 text-sm text-center py-4">No new notifications.</li>`
    }
    notifications.forEach((n) => (n.read = true))
    saveUserData()
    updateNotificationBadge()
  }
}

function logout() {
  document.getElementById("client-dashboard").classList.add("hidden")
  document.getElementById("guest-view").style.display = "block"

  localStorage.removeItem("currentUser")
  localStorage.removeItem("bookingState")
  currentUser = null
  favorites = []
  bookingHistory = []
  notifications = []
  bookingState = {}

  setupGuestView()
  addNotification("You have been logged out successfully.")
}

document.addEventListener("click", (e) => {
  const panel = document.getElementById("notifications-panel")
  const bell = document.getElementById("notification-bell")
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.classList.add("hidden")
  }
})

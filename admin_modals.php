<!-- Movie Modal -->
<div id="movie-modal" class="modal">
    <div class="modal-content">
        <span class="close-btn" onclick="closeModal('movie-modal')">&times;</span>
        <h2 id="movie-modal-title" class="text-2xl font-black mb-4 gradient-text">Add Movie</h2>
        <form id="movie-form">
            <input type="hidden" id="movie-id">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-film mr-2 text-red-400"></i>Title</label>
                    <input type="text" id="movie-title" name="title" required>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-clock mr-2 text-red-400"></i>Duration</label>
                    <input type="text" id="movie-duration" name="duration" placeholder="2h 15m" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-tag mr-2 text-red-400"></i>Genre</label>
                    <select id="movie-genre" name="genre" required>
                        <option value="">Select Genre</option>
                        <option value="Action">Action</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Animation">Animation</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Crime">Crime</option>
                        <option value="Documentary">Documentary</option>
                        <option value="Drama">Drama</option>
                        <option value="Family">Family</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Horror">Horror</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Romance">Romance</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Thriller">Thriller</option>
                        <option value="War">War</option>
                        <option value="Western">Western</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-star mr-2 text-red-400"></i>Rating</label>
                    <input type="text" id="movie-rating" name="rating" placeholder="PG-13" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-image mr-2 text-red-400"></i>Poster URL</label>
                <input type="text" id="movie-poster" name="poster" placeholder="https://..." required>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-users mr-2 text-red-400"></i>Cast</label>
                <input type="text" id="movie-cast" name="cast" placeholder="Actor 1, Actor 2" required>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-align-left mr-2 text-red-400"></i>Synopsis</label>
                <textarea id="movie-synopsis" name="synopsis" rows="4" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-calendar mr-2 text-red-400"></i>Release Date (Coming Soon only)</label>
                    <input type="date" id="movie-release-date" name="release_date">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-info-circle mr-2 text-red-400"></i>Status</label>
                <select id="movie-status" name="status" required>
                    <option value="nowShowing">Now Showing</option>
                    <option value="comingSoon">Coming Soon</option>
                </select>
            </div>
            <div class="flex gap-4 mt-8">
                <button type="submit" class="action-btn flex-1 py-3 text-lg font-semibold">
                    <i class="fas fa-save mr-2"></i>Save Movie
                </button>
                <button type="button" onclick="closeModal('movie-modal')" class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-times mr-2"></i>Cancel
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Cinema Modal -->
<div id="cinema-modal" class="modal">
    <div class="modal-content">
        <span class="close-btn" onclick="closeModal('cinema-modal')">&times;</span>
        <h2 id="cinema-modal-title" class="text-2xl font-black mb-4 gradient-text">Add Cinema</h2>
        <form id="cinema-form">
            <input type="hidden" id="cinema-id">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-building mr-2 text-red-400"></i>Name</label>
                    <input type="text" id="cinema-name" name="name" required>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-map-marker-alt mr-2 text-red-400"></i>Location</label>
                    <input type="text" id="cinema-location" name="location" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-address-book mr-2 text-red-400"></i>Address</label>
                <input type="text" id="cinema-address" name="address" required>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-building mr-2 text-red-400"></i>Halls</label>
                <input type="number" id="cinema-halls" name="halls" min="1" value="4" required>
            </div>
            <div class="flex gap-4 mt-8">
                <button type="submit" class="action-btn flex-1 py-3 text-lg font-semibold">
                    <i class="fas fa-save mr-2"></i>Save Cinema
                </button>
                <button type="button" onclick="closeModal('cinema-modal')" class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-times mr-2"></i>Cancel
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Schedule Modal -->
<div id="schedule-modal" class="modal">
    <div class="modal-content">
        <span class="close-btn" onclick="closeModal('schedule-modal')">&times;</span>
        <h2 id="schedule-modal-title" class="text-2xl font-black mb-4 gradient-text">Add Movie Schedule</h2>
        <form id="schedule-form">
            <input type="hidden" id="schedule-id">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-film mr-2 text-red-400"></i>Movie</label>
                    <select id="schedule-movie" name="movie" required>
                        <option value="">Select Movie</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-building mr-2 text-red-400"></i>Cinema</label>
                    <select id="schedule-cinema" name="cinema" required onchange="updateHallOptions()">
                        <option value="">Select Cinema</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-door-open mr-2 text-red-400"></i>Hall</label>
                    <select id="schedule-hall" name="hall" required>
                        <option value="">Select Hall</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-money-bill-wave mr-2 text-red-400"></i>Ticket Price (₱)</label>
                    <input type="number" id="schedule-price" name="price" min="0" step="0.01" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-calendar mr-2 text-red-400"></i>Date</label>
                <input type="date" id="schedule-date" name="date" required>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fas fa-clock mr-2 text-red-400"></i>Show Times</label>
                <div class="mb-3">
                    <p class="text-sm text-gray-400 mb-3">Quick Add Common Times:</p>
                    <div class="grid grid-cols-3 gap-2 mb-4">
                        <button type="button" onclick="addQuickTime('10:00')" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-all duration-300">
                            <i class="fas fa-plus mr-1"></i>10:00 AM
                        </button>
                        <button type="button" onclick="addQuickTime('13:00')" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-all duration-300">
                            <i class="fas fa-plus mr-1"></i>1:00 PM
                        </button>
                        <button type="button" onclick="addQuickTime('15:30')" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-all duration-300">
                            <i class="fas fa-plus mr-1"></i>3:30 PM
                        </button>
                        <button type="button" onclick="addQuickTime('18:00')" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-all duration-300">
                            <i class="fas fa-plus mr-1"></i>6:00 PM
                        </button>
                        <button type="button" onclick="addQuickTime('20:30')" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-all duration-300">
                            <i class="fas fa-plus mr-1"></i>8:30 PM
                        </button>
                        <button type="button" onclick="addQuickTime('22:00')" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-all duration-300">
                            <i class="fas fa-plus mr-1"></i>10:00 PM
                        </button>
                    </div>
                </div>
                <div id="showtimes-container" class="space-y-2">
                    <div class="flex gap-2">
                        <input type="time" class="flex-1" placeholder="Show Time" required>
                        <button type="button" onclick="removeShowtime(this)" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="flex gap-3 mt-4">
                    <button type="button" onclick="addShowtime()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300">
                        <i class="fas fa-plus mr-2"></i> Add Show Time
                    </button>
                    <button type="button" onclick="clearAllShowtimes()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300">
                        <i class="fas fa-trash mr-2"></i> Clear All
                    </button>
                </div>
            </div>
            <div class="flex gap-4 mt-8">
                <button type="submit" class="action-btn flex-1 py-3 text-lg font-semibold">
                    <i class="fas fa-save mr-2"></i>Save Schedule
                </button>
                <button type="button" onclick="closeModal('schedule-modal')" class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-times mr-2"></i>Cancel
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Trailer Modal -->
<div id="trailer-modal" class="modal">
    <div class="modal-content">
        <span class="close-btn" onclick="closeModal('trailer-modal')">&times;</span>
        <h2 id="trailer-modal-title" class="text-2xl font-black mb-4 gradient-text">Upload Trailer</h2>
        <form id="trailer-form">
            <div class="form-group">
                <label class="form-label"><i class="fas fa-film mr-2 text-red-400"></i>Select Movie (Now Showing only)</label>
                <select id="trailer-movie" name="movie" required>
                    <option value="">Select Movie</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label"><i class="fab fa-youtube mr-2 text-red-400"></i>Trailer URL (YouTube)</label>
                <input type="url" id="trailer-url" name="url" placeholder="https://www.youtube.com/watch?v=..." required>
            </div>
            <div class="flex gap-4 mt-8">
                <button type="submit" class="action-btn flex-1 py-3 text-lg font-semibold">
                    <i class="fas fa-upload mr-2"></i>Upload Trailer
                </button>
                <button type="button" onclick="closeModal('trailer-modal')" class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-times mr-2"></i>Cancel
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Delete Modal -->
<div id="delete-modal" class="modal">
    <div class="modal-content max-w-md">
        <span class="close-btn" onclick="closeModal('delete-modal')">&times;</span>
        <h2 class="text-2xl font-black mb-4 text-center gradient-text">Confirm Delete</h2>
        <p id="delete-message" class="text-center text-gray-300 mb-6">Are you sure?</p>
        <div class="flex gap-4 justify-center">
            <button id="confirm-delete-btn" class="action-btn px-8 py-2">Delete</button>
            <button onclick="closeModal('delete-modal')" class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-2 rounded">Cancel</button>
        </div>
    </div>
</div>
export type MovieStatus = 'nowShowing' | 'comingSoon';

export type Movie = {
  id: number;
  title: string;
  poster: string;
  genre: string;
  duration: string;
  rating: string;
  synopsis: string;
  cast: string;
  release_date?: string | null;
  status: MovieStatus;
  created_at?: string;
};

export type Trailer = {
  id: number;
  movie_id: number;
  url: string;
  created_at?: string;
};

export type Cinema = {
  id: number;
  name: string;
  location: string;
  address: string;
};

export type Schedule = {
  id: number;
  movie_id: number;
  cinema_id: number;
  hall: number;
  date: string; // YYYY-MM-DD
  show_times: string[] | string;
  price: number;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  created_at?: string;
};

export type BookingHistoryItem = {
  id: number;
  movie_id: number;
  tx_number: string;
  branch: string;
  date: string;
  time: string;
  seats: string[];
  total_price: number;
  movie: {
    id: number;
    title: string;
    poster: string;
  };
};

export type Notification = {
  id: number;
  user_id: number;
  message: string;
  is_read: 0 | 1;
  created_at: string;
};

export type CheckAuthResponse = {
  user: AuthUser | null;
  favorites: number[];
  bookingHistory: BookingHistoryItem[];
  notifications: Notification[];
};


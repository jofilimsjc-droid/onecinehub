export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  MainTabs: undefined;
  MovieDetail: { movie: any; trailerUrl?: string; isFavorited?: boolean };
  Booking: { movie: any };
  History: undefined;
  Favorites: undefined;
  Search: undefined;
  Notifications: undefined;
  Settings: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
};

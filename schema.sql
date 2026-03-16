-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2026 at 10:33 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `onecinehub`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `created_at`) VALUES
(1, 'admin@gmail.com', 'admin2025', '2025-10-28 10:19:41');

-- --------------------------------------------------------

--
-- Table structure for table `admin_sessions`
--

CREATE TABLE `admin_sessions` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `cinema_id` int(11) NOT NULL,
  `tx_number` varchar(50) NOT NULL,
  `branch` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `seats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`seats`)),
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `booking_date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `movie_id`, `cinema_id`, `tx_number`, `branch`, `date`, `time`, `seats`, `total_price`, `payment_method`, `booking_date`) VALUES
(2, 7, 11, 3, 'OHC-1773106430255', 'Ayala Mall Cloverleaf', '2026-03-30', '10:00:00', '[\"A1\"]', 50.00, 'GCash', '2026-03-10 01:33:50'),
(3, 7, 12, 1, 'OHC-1773106518383', 'Robinson ', '2026-03-11', '10:00:00', '[\"A1\"]', 50.00, 'PayMaya', '2026-03-10 01:35:18'),
(4, 7, 12, 1, 'OHC-1773106530584', 'Robinson ', '2026-03-11', '22:00:00', '[\"A1\"]', 50.00, 'GCash', '2026-03-10 01:35:30'),
(5, 8, 11, 2, 'OHC-1773106827474', 'SM San Lazaro', '2026-03-11', '10:00:00', '[\"A1\"]', 50.00, 'GCash', '2026-03-10 01:40:27'),
(6, 8, 11, 2, 'OHC-1773107334903', 'SM San Lazaro', '2026-03-11', '10:00:00', '[\"A5\"]', 50.00, 'GCash', '2026-03-10 01:48:54'),
(7, 7, 11, 2, 'OHC-1773146094615', 'SM San Lazaro', '2026-03-11', '10:00:00', '[\"A2\"]', 50.00, 'GCash', '2026-03-10 12:34:54'),
(8, 9, 11, 3, 'OHC-1773147465591', 'Ayala Mall Cloverleaf', '2026-03-30', '18:00:00', '[\"D7\",\"D8\"]', 100.00, 'GCash', '2026-03-10 12:57:45'),
(9, 9, 12, 1, 'OHC-1773147921527', 'Robinson ', '2026-03-11', '10:00:00', '[\"A2\"]', 50.00, 'GCash', '2026-03-10 13:05:21'),
(10, 7, 26, 3, 'OHC-1773622539728', 'Ayala Mall Cloverleaf', '2026-03-16', '10:00:00', '[\"A1\"]', 1.00, 'GCash', '2026-03-16 00:55:39'),
(11, 7, 26, 3, 'OHC-1773635192147', 'Ayala Mall Cloverleaf', '2026-03-16', '10:00:00', '[\"A2\"]', 1.00, 'GCash', '2026-03-16 04:26:32'),
(12, 11, 26, 3, 'OHC-1773635696803', 'Ayala Mall Cloverleaf', '2026-03-16', '10:00:00', '[\"A3\"]', 1.00, 'GCash', '2026-03-16 04:34:56');

-- --------------------------------------------------------

--
-- Table structure for table `cinemas`
--

CREATE TABLE `cinemas` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `halls` int(11) DEFAULT 4,
  `rating` decimal(2,1) DEFAULT 4.2,
  `distance` varchar(50) DEFAULT '1.2 km',
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cinemas`
--

INSERT INTO `cinemas` (`id`, `name`, `location`, `address`, `halls`, `rating`, `distance`, `amenities`, `created_at`) VALUES
(1, 'Robinson ', 'Quezon City', 'Upper Ground Level, Robinsons Magnolia Aurora Blvd, corner Doña Hemady St, Quezon City, 1115 Metro Manila', 4, 4.2, '1.2 km', '[\"AC\", \"Sound System\"]', '2025-11-20 04:46:50'),
(2, 'SM San Lazaro', 'Manila', 'Tayuman St. 432 Metro Manila', 1, 4.2, '1.2 km', '[\"AC\",\"Sound System\"]', '2026-03-10 01:11:39'),
(3, 'Ayala Mall Cloverleaf', 'Balintawak', ' A. Bonifacio Ave, Quezon City, 1115 Metro Manila', 2, 4.2, '1.2 km', '[\"AC\",\"Sound System\"]', '2026-03-10 01:32:00');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `movie_id`, `created_at`) VALUES
(5, 7, 11, '2026-03-10 01:33:55'),
(6, 8, 16, '2026-03-10 01:38:46'),
(7, 8, 11, '2026-03-10 01:46:11'),
(9, 8, 14, '2026-03-10 01:49:15'),
(10, 9, 11, '2026-03-10 12:58:25'),
(11, 10, 14, '2026-03-12 15:20:19'),
(12, 7, 15, '2026-03-16 00:50:04'),
(13, 7, 14, '2026-03-16 04:21:59'),
(14, 7, 13, '2026-03-16 04:22:06'),
(15, 7, 8, '2026-03-16 04:23:20'),
(16, 11, 26, '2026-03-16 04:34:39');

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `poster` text NOT NULL,
  `genre` varchar(100) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `rating` varchar(20) NOT NULL,
  `synopsis` text NOT NULL,
  `cast` text NOT NULL,
  `release_date` date DEFAULT NULL,
  `status` enum('nowShowing','comingSoon') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`id`, `title`, `poster`, `genre`, `duration`, `rating`, `synopsis`, `cast`, `release_date`, `status`, `created_at`) VALUES
(6, 'A Special Memory', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001468?width=200', 'Drama', '2h 4m', 'PG', 'The film is a remake of the Japanese series Pure Soul, focusing on a couple whose love is tested by the onset of Alzheimer’s disease, shifting from a sweet romance to an emotional journey of memory loss.', 'Carlo Aquino, Bela Padilla', '2026-03-10', 'nowShowing', '2026-03-10 01:02:36'),
(7, 'FDCP WORLD 2 - The Blue Trail', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001469?width=200', 'Drama', '1h 27m', 'PG', 'In the name of economic recovery, the Brazilian Government created a perennial system of compulsory vertical isolation for seniors over 80 to be confined in a colony. Teca is 77 and lives in the village of Muriti, in the Amazon, when she is surprised by the announcement of the age reduction, including her age group. Cornered, Teca makes an intriguing journey hidden from the officers amidst rivers, boats and the underworld to clandestinely try to fulfill her last dream, to take a plane ride.', 'Denise Weinberg, Rodrigo Santoro, Miriam Socarras', '2026-03-11', 'comingSoon', '2026-03-10 01:04:56'),
(8, 'Captured', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001463?width=200', 'Horror', '1h 15m', 'SPG', 'High school senior Sato Misaki lives with her single mother and, not wanting to burden her family financially, decides to forgo higher education and find a job in her hometown. ', 'Nakashima Runa, Wada Masanari, Miyaji Mao', '2026-03-04', 'nowShowing', '2026-03-10 01:06:03'),
(9, 'Crime 101', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001446?width=200', 'Action', '2h 20m', 'PG-13', 'A master thief and an insurance broker join forces for a big heist, while a determined detective pursues them to prevent the multi-million dollar crime.', 'Halle Berry, Chris Hemsworth, Mark Ruffalo', '2026-03-10', 'nowShowing', '2026-03-10 01:07:11'),
(10, 'Hoppers', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001450?width=200', 'Animation', '1h 44m', 'PG', 'In “Hoppers,” scientists have discovered how to “hop” human consciousness into lifelike robotic animals, allowing people to communicate with animals as animals! Using the new technology, Mabel (Piper Curda) will uncover mysteries within the animal world that are beyond anything she could have imagined.', 'Bobby Moynihan, Jon Hamm, Piper Curda', '2026-03-10', 'nowShowing', '2026-03-10 01:08:09'),
(11, 'Demon Slayer - Kimetsu no Yaiba- Infinity Castle', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001198?width=200', 'Animation', '2h 35m', 'PG-13', 'Tanjiro Kamado – a boy who joined an organization dedicated to hunting down demons called the Demon Slayer Corps after his younger sister Nezuko was turned into a demon. While growing stronger and deepening his friendships and bonds with fellow corps members, Tanjiro has battled many demons with his comrades, Zenitsu Agatsuma and Inosuke Hashibira. Along the way, his journey has led him to fight alongside the Demon Slayer Corps’ highest-ranking swordsmen, the Hashira, including Flame Hashira Kyojuro Rengoku aboard the Mugen Train, Sound Hashira Tengen Uzui within the Entertainment District, as well as Mist Hashira Muichiro Tokito and Love Hashira Mitsuri Kanroji at the Swordsmith Village. ', 'Yoshitsugu Matsuoka, Natsuki Hanae, Akari Kito, Hiro Shimono', '2026-03-10', 'nowShowing', '2026-03-10 01:09:17'),
(12, 'Lord of the Rings: The Two Towers', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001460?width=200', 'Action', '3h 43m', 'PG', 'While Frodo and Sam edge closer to Mordor with the help of the shifty Gollum, the divided fellowship makes a stand against Sauron\'s new ally, Saruman, and his hordes of Isengard.\n', 'Elijah Wood, Ian McKellen, Viggo Mortensen', '2026-03-10', 'nowShowing', '2026-03-10 01:10:22'),
(13, 'Goat', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001435?width=200', 'Animation', '1h 42m', 'PG', 'A small goat with big dreams gets a once-in-a-lifetime shot to join the pros and play roarball, a high-intensity, co-ed, full-contact sport dominated by the fastest, fiercest animals in the world.\n', 'Caleb McLaughlin, Gabrielle Union, Nick Kroll', '2026-03-10', 'nowShowing', '2026-03-10 01:17:57'),
(14, 'FDCP WORLD 2 - Don\'t Tell Mother', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001471?width=200', 'Drama', '1h 28m', 'PG', 'Aakash, a 9-year-old boy is subjected to physical violence at school by his Math teacher and ends up hiding it from his strict but caring mother. When tragedy arises, irreplaceable bonds are forged between Aakash, his mother and his innocent younger brother, Adi in this tender family drama set in the 90s Bangalore.\n', 'Siddrath Swaroop, Aishwarya Dinesh, Anirudh P Keserker', '2026-03-10', 'nowShowing', '2026-03-10 01:19:19'),
(15, 'Scared To Death', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001478?width=200', 'Horror', '1h 33m', 'SPG', 'Jasper, a young filmmaker, seizes a chance to direct when his crew attends a seance in a haunted children\'s shelter. Trapped inside, they\'re haunted by ghostly orphans and a sinister force.\n', 'Bill Moseley, Lin Shaye, Rae Dawn Chong', '2026-03-10', 'nowShowing', '2026-03-10 01:20:12'),
(16, 'Panda Plan: The Magical Tribe', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001454?width=200', 'Comedy', '1h 40m', 'G', 'Giant Panda Hu Hu and Jackie Chan accidentally stumble into a mysterious primitive tribe, beginning an unprecedented and hilarious adventure.\n', 'Jackie Chan, Li Ma, Shan Qiao', '2026-03-10', 'nowShowing', '2026-03-10 01:22:01'),
(17, 'Wuthering Heights', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001434?width=200', 'Drama', '2h 16m', 'PG-13', 'A passionate and tumultuous love story set against the backdrop of the Yorkshire moors, exploring the intense and destructive relationship between Heathcliff and Catherine Earnshaw.', 'Margot Robbie, Jacob Elordi, Owen Cooper', '2026-03-12', 'comingSoon', '2026-03-10 01:23:01'),
(18, 'Until She Remembers', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001443?width=200', 'Drama', '1h 47m', 'PG', 'When a struggling high school student is confronted with the painful fracture of her family, she seeks refuge far from the noise of her parents’ world. In the company of her grandmother and an old friend, she begins to see life from a distance---both tender and selfless.', 'Charo Santos-Concio, Angel Aquino, Albert Martinez, Boots Anson-Roa, Barbie Forteza, Eric Quizon', '2026-03-12', 'comingSoon', '2026-03-10 01:24:23'),
(19, 'This Is Not a Test', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001466?width=200', 'Thriller', '1h 42m', 'SPG', 'Follows Sloane and four other students who take shelter in their high school during a zombie outbreak.\n', 'Luke Macfarlane, Missy Peregrym, Olivia Holt', '2026-03-12', 'comingSoon', '2026-03-10 01:25:12'),
(20, 'The Bride!', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001451?width=200', 'Horror', '2h 5m', 'SPG', 'In 1930s Chicago, Frankenstein asks Dr. Euphronius to help create a companion. They give life to a murdered woman as the Bride, sparking romance, police interest, and radical social change.\n', 'Jake Gyllenhaal, Christian Bale, Jessie Buckley', '2026-03-12', 'comingSoon', '2026-03-10 01:26:11'),
(21, 'Sisa', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001452?width=200', 'Drama', '1h 54m', 'PG', '1902. The American occupation of the Philippines is met with fierce resistance, and the land is awash in blood and betrayal. Amidst this turmoil, one woman lives a double life. To the world, she\'s simply \"Sisa,\" a madwoman driven to the fringes of sanity by unimaginable loss.', 'Eugene Domingo, Hilda Koronel, Jennica Garcia', '2026-03-12', 'comingSoon', '2026-03-10 01:27:15'),
(22, 'Scream 7', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001447?width=200', 'Horror', '1h 54m', 'SPG', 'When a new Ghostface killer emerges in the town where Sidney Prescott has built a new life, her darkest fears are realized as her daughter becomes the next target.\n', 'Neve Campbell, Courtney Cox, Isabel May', '2026-03-12', 'comingSoon', '2026-03-10 01:28:06'),
(23, 'GiantTBC', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001480?width=200', 'Drama', '2h 0m', 'To be Confirmed', 'Inspired by the real-life story of Prince Naseem \"Naz\" Hamed, a British-Yemeni boxer, and his journey from humble beginnings to becoming a world champion and his training under Brendan Ingle, who played a crucial role in his success.\n', 'Pierce Brosnan, Amir El-Masry, Rocco Haynes', NULL, 'comingSoon', '2026-03-10 01:28:58'),
(24, 'Mudborn', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001465?width=200', 'Horror', '1h 51m', 'SPG', 'A pregnant woman unknowingly brought home a haunted leads to supernatural possession and terror, prompting her husband to seek help from a psychic.\n', 'Yo Yang, Cecilia Choi, Derek Chang', '2026-03-18', 'comingSoon', '2026-03-10 01:30:05'),
(25, 'Project Hail Mary', 'https://smcine-digital-cdn.app.vista.co/media/entity/get/FilmPosterGraphic/HO00001473?width=200', 'Sci-Fi', '2h 37m', 'PG', 'Science teacher Ryland Grace wakes up alone on a spaceship light-years from Earth. As his memory returns, he uncovers a mission to stop a mysterious substance killing the sun, and save Earth. An unexpected friendship may be the key.\n', 'Ryan Gosling, Milana Vayntrub, James Wright', '2026-03-20', 'comingSoon', '2026-03-10 01:31:04'),
(26, 'Strong Man ', 'https://scontent.fmnl17-8.fna.fbcdn.net/v/t1.15752-9/646528237_3101757140008982_8789125947685119695_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHK2ArsHdHVQKRu0NuM08DHOEGcdRCmQzc4QZx1EKZDN6838gkTVOh6W0mYzaDcrX6lkl63q9sZZSTAmURdgCdn&_nc_ohc=LyFVWMX8fHQQ7kNvwE1lVaG&_nc_oc=AdncdPa32vhRlCGcGfLOPD_VvMyOKPh80pKJy_qBdwYqCRkto-MBKcwXG0IJACM_13w&_nc_zt=23&_nc_ht=scontent.fmnl17-8.fna&_nc_ss=8&oh=03_Q7cD4wFgBeQDO37U0FdIXUUbKinWVqxMAlSNMdVmBa6SF0ga-w&oe=69D796CC', 'Action', '10h 59mins', 'SPG', 'Isang lalaki na nag nanais na lumaki ang katawa para sa kanyang EA', 'Clark Dela Cruz', '2026-04-02', 'nowShowing', '2026-03-10 15:36:57');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 'Welcome back, Johm Mark Lim!', 0, '2025-10-28 10:34:48'),
(2, 2, 'Welcome back, Carl Cerilo!', 0, '2025-10-28 10:40:51'),
(3, 4, 'Welcome back, jake!', 0, '2025-11-20 04:42:36'),
(4, 5, 'Welcome back, budong!', 0, '2025-12-21 14:17:49'),
(5, 6, 'Welcome back, solle!', 1, '2025-12-21 16:50:01'),
(6, 6, 'Welcome back, solle!', 1, '2025-12-21 16:50:01'),
(7, 5, 'Welcome back, budong!', 0, '2025-12-21 16:56:45'),
(8, 1, 'Welcome back, Johm Mark Lim!', 0, '2026-03-09 17:10:21'),
(9, 7, 'Ticket for Richard confirmed! Booking ID: OHC-1773104289790', 1, '2026-03-10 00:58:09'),
(10, 7, 'Ticket for Demon Slayer - Kimetsu no Yaiba- Infinity Castle confirmed! Booking ID: OHC-1773106430255', 1, '2026-03-10 01:33:50'),
(11, 7, 'Ticket for Lord of the Rings: The Two Towers confirmed! Booking ID: OHC-1773106518383', 1, '2026-03-10 01:35:18'),
(12, 7, 'Ticket for Lord of the Rings: The Two Towers confirmed! Booking ID: OHC-1773106530584', 1, '2026-03-10 01:35:30'),
(13, 8, 'Welcome back, rei!', 0, '2026-03-10 01:37:31'),
(14, 8, 'Ticket for Demon Slayer - Kimetsu no Yaiba- Infinity Castle confirmed! Booking ID: OHC-1773106827474', 0, '2026-03-10 01:40:27'),
(15, 8, 'Ticket for Demon Slayer - Kimetsu no Yaiba- Infinity Castle confirmed! Booking ID: OHC-1773107334903', 0, '2026-03-10 01:48:54'),
(16, 7, 'Ticket for Demon Slayer - Kimetsu no Yaiba- Infinity Castle confirmed! Booking ID: OHC-1773146094615', 1, '2026-03-10 12:34:54'),
(17, 9, 'Ticket for Demon Slayer - Kimetsu no Yaiba- Infinity Castle confirmed! Booking ID: OHC-1773147465591', 1, '2026-03-10 12:57:45'),
(18, 9, 'Ticket for Lord of the Rings: The Two Towers confirmed! Booking ID: OHC-1773147921527', 0, '2026-03-10 13:05:21'),
(19, 7, 'Welcome back, ceero!', 1, '2026-03-12 14:39:02'),
(20, 10, 'Welcome back, pakang!', 0, '2026-03-12 15:15:52'),
(21, 7, 'Welcome back, ceero!', 1, '2026-03-16 00:47:53'),
(22, 7, 'Ticket for Strong Man  confirmed! Booking ID: OHC-1773622539728', 1, '2026-03-16 00:55:39'),
(23, 7, 'Ticket for Strong Man  confirmed! Booking ID: OHC-1773635192147', 0, '2026-03-16 04:26:32'),
(24, 11, 'Ticket for Strong Man  confirmed! Booking ID: OHC-1773635696803', 1, '2026-03-16 04:34:56'),
(25, 11, 'Welcome back, Messiah!', 1, '2026-03-16 04:35:48');

-- --------------------------------------------------------

--
-- Table structure for table `occupied_seats`
--

CREATE TABLE `occupied_seats` (
  `id` int(11) NOT NULL,
  `schedule_key` varchar(255) NOT NULL,
  `seat_id` varchar(10) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `occupied_seats`
--

INSERT INTO `occupied_seats` (`id`, `schedule_key`, `seat_id`, `booking_id`, `created_at`) VALUES
(3, '11_Ayala Mall Cloverleaf_2026-03-30_10:00', 'A1', 2, '2026-03-10 01:33:50'),
(4, '12_Robinson _2026-03-11_10:00', 'A1', 3, '2026-03-10 01:35:18'),
(5, '12_Robinson _2026-03-11_22:00', 'A1', 4, '2026-03-10 01:35:30'),
(6, '11_SM San Lazaro_2026-03-11_10:00', 'A1', 5, '2026-03-10 01:40:27'),
(7, '11_SM San Lazaro_2026-03-11_10:00', 'A5', 6, '2026-03-10 01:48:54'),
(8, '11_SM San Lazaro_2026-03-11_10:00', 'A2', 7, '2026-03-10 12:34:54'),
(9, '11_Ayala Mall Cloverleaf_2026-03-30_18:00', 'D7', 8, '2026-03-10 12:57:45'),
(10, '11_Ayala Mall Cloverleaf_2026-03-30_18:00', 'D8', 8, '2026-03-10 12:57:45'),
(11, '12_Robinson _2026-03-11_10:00', 'A2', 9, '2026-03-10 13:05:21'),
(12, '26_Ayala Mall Cloverleaf_2026-03-16_10:00', 'A1', 10, '2026-03-16 00:55:39'),
(13, '26_Ayala Mall Cloverleaf_2026-03-16_10:00', 'A2', 11, '2026-03-16 04:26:32'),
(14, '26_Ayala Mall Cloverleaf_2026-03-16_10:00', 'A3', 12, '2026-03-16 04:34:56');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `cinema_id` int(11) NOT NULL,
  `hall` int(11) NOT NULL,
  `date` date NOT NULL,
  `show_times` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`show_times`)),
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `movie_id`, `cinema_id`, `hall`, `date`, `show_times`, `price`, `created_at`) VALUES
(6, 12, 1, 2, '2026-03-11', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:11:11'),
(7, 11, 2, 1, '2026-03-11', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:12:10'),
(8, 11, 2, 1, '2026-03-12', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:13:57'),
(9, 11, 1, 2, '2026-03-11', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:15:08'),
(10, 11, 2, 1, '2026-03-13', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:15:35'),
(11, 11, 2, 1, '2026-03-14', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:16:02'),
(12, 11, 1, 3, '2026-10-08', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:16:36'),
(13, 11, 3, 2, '2026-03-30', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 50.00, '2026-03-10 01:33:01'),
(14, 26, 3, 1, '2026-03-16', '[\"10:00\",\"13:00\",\"15:30\",\"18:00\",\"20:30\",\"22:00\"]', 1.00, '2026-03-16 00:55:20');

-- --------------------------------------------------------

--
-- Table structure for table `trailers`
--

CREATE TABLE `trailers` (
  `id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `url` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trailers`
--

INSERT INTO `trailers` (`id`, `movie_id`, `url`, `created_at`) VALUES
(4, 6, 'https://www.youtube.com/embed/Kmvdv-4OKes', '2026-03-10 01:03:17'),
(5, 11, 'https://www.youtube.com/embed/x7uLutVRBfI', '2026-03-10 01:18:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `registration_date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `registration_date`) VALUES
(1, 'Johm Mark Lim', 'jom@gmail.com', 'asdasdasd', '2025-10-28 10:34:41'),
(2, 'Carl Cerilo', 'carl@gmail.com', 'asdasdasd', '2025-10-28 10:40:35'),
(3, 'juaquin bordado', 'bordado@gmail.com', 'asdasdasd', '2025-11-13 06:17:19'),
(4, 'jake', 'jake@gmail.com', 'jakejake', '2025-11-20 04:42:17'),
(5, 'budong', 'budong@gmail.com', 'asdasdasd', '2025-12-21 14:17:40'),
(6, 'solle', 'proofreadmopaperko@gmail.com', 'fuckthegovernment', '2025-12-21 16:45:28'),
(7, 'ceero', 'ceero@gmail.com', 'Asdasd@1', '2026-03-09 17:14:26'),
(8, 'rei', 'rei@gmail.com', 'Asdasd@1', '2026-03-10 01:36:52'),
(9, 'napakaganda', 'emekagorl@gmail.com', '*Emem006', '2026-03-10 12:55:33'),
(10, 'pakang', 'pakang@gmail.com', 'Asdasd@1', '2026-03-12 15:15:39'),
(11, 'Messiah', 'mj@gmail.com', 'Asdasd@1', '2026-03-16 04:34:30');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_tokens`
--

INSERT INTO `user_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(3, 7, 'edb5a002f6c77fe8d7ae3e99700f125650b0b34b413f56abd0563bb93792540e', '2026-04-08 18:01:54', '2026-03-10 01:01:54'),
(10, 9, '6f07a7fcc640a27f9a40fed3c345899c9df1d5bec6c9b7fdd44b57bb9c800289', '2026-04-09 05:55:33', '2026-03-10 12:55:33'),
(13, 7, '1118a1b2d06befbb4ba4181526c3f7aca7f1fba395c07f70d1e5537d277631a4', '2026-04-14 17:49:58', '2026-03-16 00:49:58'),
(14, 11, '4364b185de644406fb33684d293be17f05d846712833ffb64c4d8c680b45f7dc', '2026-04-14 21:34:30', '2026-03-16 04:34:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tx_number` (`tx_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `movie_id` (`movie_id`),
  ADD KEY `cinema_id` (`cinema_id`);

--
-- Indexes for table `cinemas`
--
ALTER TABLE `cinemas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`movie_id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Indexes for table `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `occupied_seats`
--
ALTER TABLE `occupied_seats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_schedule_key` (`schedule_key`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `movie_id` (`movie_id`),
  ADD KEY `cinema_id` (`cinema_id`);

--
-- Indexes for table `trailers`
--
ALTER TABLE `trailers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `cinemas`
--
ALTER TABLE `cinemas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `occupied_seats`
--
ALTER TABLE `occupied_seats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `trailers`
--
ALTER TABLE `trailers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `occupied_seats`
--
ALTER TABLE `occupied_seats`
  ADD CONSTRAINT `occupied_seats_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trailers`
--
ALTER TABLE `trailers`
  ADD CONSTRAINT `trailers_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

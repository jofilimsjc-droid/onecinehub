-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: fdb1033.awardspace.net
-- Generation Time: Feb 04, 2026 at 03:15 AM
-- Server version: 8.0.32
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `4685778_onecinehub`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
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
  `id` int NOT NULL,
  `admin_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `cinema_id` int NOT NULL,
  `tx_number` varchar(50) NOT NULL,
  `branch` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `seats` json NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cinemas`
--

CREATE TABLE `cinemas` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `halls` int DEFAULT '4',
  `rating` decimal(2,1) DEFAULT '4.2',
  `distance` varchar(50) DEFAULT '1.2 km',
  `amenities` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cinemas`
--

INSERT INTO `cinemas` (`id`, `name`, `location`, `address`, `halls`, `rating`, `distance`, `amenities`, `created_at`) VALUES
(1, 'gateway ', 'araneta cubao', 'qwertyuiop', 4, 4.2, '1.2 km', '[\"AC\", \"Sound System\"]', '2025-11-20 04:46:50');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `movie_id`, `created_at`) VALUES
(2, 4, 2, '2025-11-20 04:48:54');

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `poster` text NOT NULL,
  `genre` varchar(100) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `rating` varchar(20) NOT NULL,
  `synopsis` text NOT NULL,
  `cast` text NOT NULL,
  `release_date` date DEFAULT NULL,
  `status` enum('nowShowing','comingSoon') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`id`, `title`, `poster`, `genre`, `duration`, `rating`, `synopsis`, `cast`, `release_date`, `status`, `created_at`) VALUES
(1, 'Quezon', 'https://www.smcinema.com/CDN/media/entity/get/FilmPosterGraphic/HO00001230?referenceScheme=HeadOffice&allowPlaceHolder=true&height=500', 'Action', '2 hours 17 minutes', 'PG-12', 'The final film in the trilogy that includes Heneral Luna (2015) and Goyo: Ang Batang Heneral (2018), Quezon is a historical biopic about President Manuel Quezon’s relentless pursuit of power. As he fights for Philippine independence, he masters the brutal game of politics—using charm and favoritism as both weapons and currency—to outmaneuver his rivals. In his quest to build a nation, he leaves behind a legacy of patronage and political loyalty that endures to this day.\n\n', 'Cerilo, Lim, Romasanta, Dela Cruz, Belmonte, Botulan', '2025-11-14', 'nowShowing', '2025-10-28 10:33:43'),
(2, 'Hotdog', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8SEhUQEBAQExMXDxISFRYVEhEVFRgQFhUWFxYTGBcYHiggGBslHRUVITEhJSkrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGy0lICItLS0rLi0tLS0tKy4tLS8tLS0tLS0tLS0uLS0tLy0tLS8vLS0tLS0tKy0tLS0tLS0tLf/AABEIALcBEwMBEQACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBAgQDB//EAD8QAAIBAgIFBwoFAwQDAAAAAAABAgMRBCEFEjFBUQYiYXGBkdETFjJSU6GiscHSFVRykuEjQmMUgvDxM2LC/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAEDAgQFBgf/xAA2EQEAAQMBBAYJBAIDAQAAAAAAAQIDEQQFITFREkFhgaHwExQVIlNxkbHRMlLB4QYjQoLxcv/aAAwDAQACEQMRAD8AgzVebb0aMpvVgm3wQ4rLVmu9V0LcZlPYHQMVnVd36q2dr3lkUc3qdF/j9NPvaiczyjh380zTpxirRSS4JWRm9Dbt0W6ejRERHY2JZgAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgxuiaVTO2rLjHLvW8wmmJcvWbI0+ozOOjVzj+Y4SruP0dUpekrx3SWzt4Fc0zDyWt2bf0k5rjNPOOHfy873IQ54B74LCSqy1I9be5LiTEZbWj0lzVXYt0d88oWzBYKFKOrFdb3t9JdEYe70eitaWjoW4+c9c/Pzh0ktwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADEopqzV1vuQiqmKoxMZiVa0zonyf9Sn6G9er/HyK6qccHjdrbI9Xzes/p64/b/X2+XCJMHBW3Q2EVOmsudJKUu3YuwtpjEPe7I0kafTR+6rfP47neZuoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYkk1Z5q1n1EIqpiqMTwlT8do+cKkoxi3FPLqea+ZTMYfP8AWbOu2r9VFFOYzu+U71vg00mtll3Fz39MxNMTHBsSyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHNWrU02na/8GMzDTu3rNNcxVxcegMapw8m3zoq3XHc/oRROYw5+xNbF6zFqr9VPjHV9OCVM3cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPOvWjCLlJ2SV2RM4VXr1Fm3Nyud0KZi67qTlN73fs3LuKJnMvnWqv1ai9Vdnrn/zwa0asoSUouzWxjOGFq7XariuicTC0aM0rCrzXaM+G59K8C2mrL22ztrW9VHRq3V8ufy/HFImbrgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeWJxMKcdabsve3wS3kTOFGo1NrT0dO5OI88FW0npKVZ8ILYvq+kpqqy8RtHadesqxwpjhH8z2uEhzAABK4HTlSGU+fHj/AHd+/tMorw7ui27es+7d96PH++/6p3CaQpVPQkr8HlLuLIqiXp9LtDT6mP8AXVv5Tun6OoyboAAAAAADo/0VXyfltR+TvbWutt7bNu0KvTUdP0ed7FbBVYQjUlBqEvRd1nv7AU3qKqpoid8cXgFqyw5JSaTdaOzdBv33Jw5U7UjP6fFt5ov2y/Z/Iwj2pH7fFXsZh3TnKm2m4yauthDpWq4uURVHWkMPoOU8O8RrpWjOSjbao3vn2MYa1esim9FrHLxRlGm5SjFWTlJRz2ZuwbddXRpmrksa5Iy9sv2PxJw5ftSP2+I+SMvbL9j8RhPtSP2+Kt1I2bi7ZNrLZkQ6lM5iJTuB5MSqU41HVUdaKlbVvk9mdycOdd2jTRXNMU5x2s43kxKnCU/KxerFytq2yXTcYLe0Yrrino8e1XyHSAAAAAA0q1YxV5SUVxbsRMq7t2i1T0q5iI7UPjdPxWVJaz9Z5LsW1mE18nntX/kNFPu6eMzzndH04/ZBYivOb1pybfT8lwK5nLzN/UXL9fTuTmfPDk8wpAAAABIYPQ9adnbUXGW3sW0yimZdbS7G1N/FUx0Y5zx7o4/ZZMFhnTjZ1Jz/AFW928siMPYaTTVaejo1VzV8/wCOv6zLoMm2AAAADp0dGk6iVZtU87tX4ZbAqvzciifR8VwxNHCxowozk1Tk1q+ldu+stivvJcO3Vfquzcpj3o4vHlCsMqapVJOLjBumle90rLdbvEs9HN6a5rojOZ3qYQ7yb5KynKuk5SajCTtrO2yyy7RDn7QimmzOI3zMN+VWKmq+rGcklTirKTWbu93WiZRs+3T6HMxxmUC2Q6K5Yj+no+3GjFds7X+bJ6nCo9/W98+CmkO6snI6U5VJuUpNKmlZybV2+nqJhytpRTTREREb5cHKDFzeIqJTmkmo2UmlkknkRLZ0dqn0NMzEIoNx9Dr4LWoqlryhzYK8XZ823gZPM0XejdmvGePFVuUOC8jqpV5zUr3jKV3lbPqMZdfR3vS5maIjHJChvgAAAAxJXVrtdK2kMaozGM4QOkNCVW9aNR1Oibz7Hs+RXNEvL67Yeorq6dFzp9lXH8fZC1qUoPVlFxfBowecu2blqro3KZie1oFYAAAdWA0fUqvmq0d8nsXiyYpy39Fs69q6vc3R1zPD+5WXA6MpUs0ry9Z7ezgWxTEPYaPZdjS76YzVznj3cnaZOkAAAAAAAktA1aSqatWl5TWtGOSdm3tsxDU1dNyaM0VYxvlbMTiaLrwoSp607a0XaLUdr37PR+Rk41u3c9FVcirEcJ7fOUNyox9CTlS8nerHVSnZZLJ2vt3vIiW9oLF2MV9L3Z6laIdZPcj6kI1ZuUkn5Oyu0t6v8kTDnbSiqaIxHWj9N11OvUknda1k91kkvoRLZ0tE0WaYlwMNhbeU2Lp/6eMITi7uFkmnzUtvyJlxdDar9PNVUcMqmQ7Szcjq1OKqa0oxd47WlzUnnn1kw5O06aqppxCv4yrr1Jz4zk+xt2IdK1T0aIp5RDXDW1462UdeN+q6uE156M444ledJU8LXiozqxsnrK1SCztb6mTz9mq9ZnNNPhKA01ozCU6etSq3ndWWvGV+OSIw6Wl1N+5Xiund8sIEh0QAAAAAAHnXoQmtWcVJdP04ETGVN7T279PQuUxMdqv6R0HKN5UryXq/3Lq4lc0cnldfsKq3muxvjl1x8uf3+aHMHngDv0Ro51ZXeUFtfF+qjKmnLqbL2dOruZq3URx7eyP55LXTpqKUYpJLYkWvdW7dNumKaIxEdTYlmAAAHVhtHV6mcKU2uNrLveQU16i1R+qqHZHk3in/AGRXXOIwonaFiOvwcWPwNSjJRqJJtXVmmrBsWb1F2M0OYLWYyaaabTTumtqfEImImMS9Xi6uv5TXlr+tfPZYMPRUdHoY3cnnUm5Nyk223dt7WwziIiMQ1CQAAAAAAAAAAAAAAAAAAAAACG03opSTqU1zlm16y8Suqnrh57bGyYu0zesx70cY5/391bK3jl00dh1Tpxh0Jv8AU82XUxiH0fQ6eNPp6bcct/zni6TJtgAABP4XD0cNSjXrR16k86cHsS4v3Z9JLmXLlzUXJt25xTHGXJiuUGJnsnqLhBJe/aRlfb0Nmjqz83FLG1ntq1X1zn4hsRZtxwpj6QmKWkMPXhGnitaM4q0ai4dJLRqsXbNc12d8T1MfgNGWdPF0munVv7mMJ9euR+q3PnuPNyO/FUfd4kYPX56rc+e4/AKW/GUfh+4YPXq/hz57j8BofnaPw/cMHrtz4U+P4PwPD/naPwfcMHrl34U+P4PwTD/naXwfcMHrl74U+P4PwTDfnaXwfcTg9cvfCnx/B+C4b87S+D7hg9cvfCnx/B+CYb87S+D7hg9cvfCnz3H4JhvztL4PuIweuXvhT4/g/A8P+dpfB9wweuXvhT4/g/AqH52j8H3DB67d+FPnuPwGj+do/D9wweu3PhT57jzfp7sXR+H7hg9er+HPnuPNmT/8delPv+lycHtGI/VRMI/G6Jr0s503b1lzl7tnaQ2bWqtXN1MuENgAAAAAAAAAVvH6Hk6knCyi3ddqu/fcqmne8frtjV1aiqq3uiZz9f7WGjUUoqS2OKfeiyHrLNyLlumuOExEtyVgAAAT3K7OdOS9F0Vq8Nrv7miZc7Zv6Ko68oEh0QAAAWAAAAAAAAAAAAAAAICSwOnK9LLW14+rPPLoe1DLUvaO1c6sTzh31cFRxUXUw6UKqzlTySfV47CeLWpvXNNVFF3fT1Sr8otOzTTTs09qfAh04nMZhgJAAAAAAARuL0rThNwbzVvkmYTVhx9VtezYuzbqnfH4cfJ7SCt5GT/Q/wD5MaKupz9hbQjHq1yf/n8fj6J4teoAAACxYCUMVQWHlJRqwzpt71w7sn2Mly70Vaa76WmPdniiaui8RF2dGp2RbXesiG7TqbVUZiqHi8LVW2nU/ZLwCyLtE/8AKPq0dGfqy/awnpU82NSXB9zCcxzY1XwfcDMMWCQAAAAAAABcBcBcAAAAeuFxM6c1ODtJP/ifQGFy3TcpmmrhKZ05RjVpxxlNWvaNRcJbL9+XcTLQ0ldVqubFfcgSHSAAAAAA5dIY2NKGs9uyK4sxmcQ0tdraNJamurj1RznzxU6rNyblLNttvrZTL57crm5XNdW+ZnMsEMU7ozTduZW7J/d4llNfN6fZ23cR6PU91X5/P1T0ZJq6aa4rYWPUU1RVHSpnMMksgDMW07ptNbGttwiYzulJU9PYqOXlW+tRf0GWrVorE/8AF6LlLivWi/8AYhlh7PscvFuuVGJ/x/tfiMo9nWe36tlypxPCl+1+Iyj2bZ7fPcz504j1KX7ZeIyezbXOfPcedNf2dH9svEZR7Ntc58PwedNb2dH9svEnJ7Nt858PwedFX2VHul4kZPZtv90+e4856nsqPdLxGT2dR+6WfOep7Gj3PxGT2dR+6Tznn7Gj3MZPZ1P7pY85p+wo9zGT2dT+6WfOaXsKPcxk9nU/vk85Zewo9zGT2dH75S2Ex8fJeXr0qUIP0UleUux8SWlcsz6T0VqqZnr7EDpbTEasdSNCEFrJqWWtl1LIjLo6fSVWqulNUz9kSG6AAAE9yXqKXlMNL0Z021+pZP3P3Ew52viaejdjjEoOcGm4vam0+tZEOhExMZhqEgAABwaQ0rTpZelP1V9XuMZqiHK1+1rOliaf1Vco/nl91XxWJnUlrTd37kuCKZnLxep1VzU3PSXJzPhHyeQa4AA6MHjqlJ8yWW9POL7CYmYbek11/Szm3Vu5Tvj6fjCdwmnqcsqicHx2x/gziuHptL/kFmvdejozz4wladSMleLTXFO5m7tu5Rcp6VExMdm9sSzAAAAAAAAAAAAAAANqcNZqPGSXe7BFU9GJnkmuVtT+pGkvRhTVl0v+EhLn7Op/1zXPGZQYdEAAAAEjydlbE0+trvixDV1sZsVeet5aZjavVX+SXvzDPSzmzTPY4wvAOHF6Wo08nLWfCOb8EYzVEOZqtraXT7pqzPKN/wDSExum6s8o8yPR6T7d3YVzXLzes25fve7R7kdnH6/j6owxcUAAAAADMYtuyTb4JXYTTTNU9GmMz2JXA6JxF9ZPyXTd37l9TOKZdzRbI1uenE+j79/0j+Vhw9OUVaU3N8WkvkWQ9dYt126MV19KeeIj7PUlcAAAAAAAAAAAAAA9sHK1SDe6pB/Egruxmir5T9klyrjbEPphB+630EtXZ0/6I+cocN4A78PoyU6E66atB2tbN2td37Q1q9TFN2m1zcAbIBJ8m4XxNPocn3RYhqa6cWKvPW59LzvXqv8AyS9zsFumjFqmOxyMhchtJaNrz9Gs5L1Xzflk+0wmmebz20Nmay9mabuY5Tu+26e+EDiMLUp5Tg4/Lv2FcxMPLX9Le084u0zH2+vB5BrgAAACSKbdkm3uSzYTETVOIjMpnA6Bk86r1V6q9Lte4zijm9FotgV1+9qJ6Mco49/JO4bCU6atCKXzfW9rLIiIem0+ks6eMWqYj798vYlsAAAAAAAAAAAAAAAAABYNPx8tSpYqOfN1J9D/AO7rtRMuZo59Fdqsz848/JXyHTZhFtqKV23ZJb29wRMxEZldcNKlRVPBTs3OnLW/VLd2863UiXBriu7NWop6p3eexUMbhZUpypy2p963PtIdu1di7RFcdbwCxP8AJqn5ONTFT9GMHGPTLfb3LtJhzddV6SqmzTxmd6BlJttva22+tkOjEREYhgJAMSimrNJrg80QxqpiqMVRmETjdBU5Z0+Y+G2Pdu7DGaI6nC1ewbNz3rPuz4fTq7kBisLUpu0424Pc+plcxMPLanSXtNV0btOPtPynzLxIawB6YahKclCKu38uL6BEZXafT3L9yLduMzPnM9i1aN0bCkuM98vouCLqacPc7P2Za0lOeNXXP45Q7jJ0gAAAAAAAAAAAAAAAAAAAJLQ+lXRvCUdelL0o/VBqanTelxVTOKo4S7JYDAVOdDE+TXqy3dCvb6hTF/VUbqqM9sf02p4nB4bnUm61W2Un6K/50XJ3MZt6jUbq/dp8ZQlfETnN1JSes3e/TutwsQ6FFuminoxG5Mx0pQrxUMXFqSVlUjt7bfyiWhOmu2apqsTunqkWG0bHnOtUn/62efdFEbkzc1lW6KYjz83JpbS3lUqdOOpSjsjx6X4DK7TaX0czXVOap60YG2AAAADzrUYzWrJJp7mRMZVXrNF6iaLkZiVX0tox0nrK7g3k96fB+JVVTh4namyqtJPTp30T4dk/xKPMXIWrQWDUKak1zpJN/p3ItojEPc7F0UWLEVzHvV75+XVCSM3ZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANKtNSTjJXTVmughhct03KJorjMTxU3GYWVOcoWbs8n0bV7imYxL51q9LXp71VrEzifDq8F0haytssu4ufRqcdGMcGSWQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA56qp3ztcxnDUu02Zq97i5tB4xVKaTfOilF9W5kUzmGpsbWRf08UzPvU7p/ifPWkTN1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADWpNJNt2SV2+ghjXXTRTNVU4iOKm43GSnOU1JpN5LoWS+RTM5l881mtuX79VymZiJndHZwhphMTKnJTi8/c1wZEThXptTc01yLlud/wB+yVs0fpCFVc3KW+L2rxRdFWXutDtC1q6c07quuOuPzHa6zJvgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa1KiinKTSS2tkMLlym3TNVc4iOuVY0vpV1eZC6hftk+no6CqqrLxe1drTqv9dvdR9/65QjDFxQDMJtNOLaa2NZMMqK6qKoqpnEx1wm8Dp/dWX+5L5rwM4r5vS6P/IMe7qY/7R/Mfj6J6nNSSkndNXRY9PbuU3KYqp4S2JZgAAAAAAAAAAAAAAAAAAAAAAAAAAAAACN0hpiFNuKTlPhsS634GE1xDj67bNnTTNER0quXCO+fwruNxtSq7zeW5LJLsK5mZeR1evvaqrNyd3VEcI89rnIaYB//2Q==', 'Horror', '2hr 1min ', '5', 'hahahahahahahahahaha', 'ewan', NULL, 'nowShowing', '2025-11-20 04:45:47'),
(4, 'SULASOK', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIATgBAgMBIgACEQEDEQH/xAAcAAAABwEBAAAAAAAAAAAAAAAAAQIDBAUGBwj/xABPEAABAwIEAgYFCgEJBgQHAAABAAIDBBEFEiExBkETIlFhcYEykaGx0QcUFSNCUlWUssHwMzU2RWJyc8LhQ3SCg5KiJlOz8RYkJTREY5P/xAAaAQACAwEBAAAAAAAAAAAAAAAAAQIDBAUG/8QAKhEAAgIBAwQCAgICAwAAAAAAAAECAxEEEiETFDFRIkEyYTNxQpEFgdH/2gAMAwEAAhEDEQA/ANbSwgDZT2NtqkRMACVI62gWdmgS9xLrDZSIGiNhcfJMwRlztVImP2BsEgEDrOJSwNUTQlhAELFMVpcJhElSSXO9CNvpO/071HM/EUsIljp8Ppw4XbDM95d5kaBZ2GcYtxswyEGKOcsY09kd7esgnzW3qXq+cFUorHLIJ7mZ+mx5pqHUmKxfMqpnJzrseORDu/8AjXRScOrxX03TtZkb0jmgE3uAd/NV/F9E2qw01LWDp6S8jSNyz7Y8wL+LQk8MH/6Oz++73p7YOvcvIJvdgjYxjGIYdViHNTStezOD0JaW6kW9I3TmJVeJ4fTCpe+lqI87Wua2JzHNvpf0jfUjsVZxab4lD/gf5ipuPUlU3DHTOq+miiLXPidGG5hcDca87+StUY7YN/ZHLyx2XFJpMGfiFOyNhiNnse0uvqBobi26kYFVVuJwyytkpYBE6xzQucNr3vnChPqoqvhGt6KAQ9DlaWt9E9ZuoSOH6Sqq8BxJlHUvikNwGBoIecux0vrtoUSglCWVjDBSeUaLDKnEX1lVSVbKZuSFskM8TXFjw4kA6nu2v5qpp+IMRqcXdhp+atLZpIulETtcpOuXNzt2rQR1DIRS0Tzad0GYN7m5QfaQsVhsbpOMJGMkdGTWT2e0Akav7dFCqKk5ZX0OTxg0ldUYvQlsjDR1UYkY2UMjc17A52UHLmNxfvUmpxtoxePCaBjZKlzy18j/AEI7C50G5AHaFIwWhq6PEsSkq5jO2Ux9FKWgEgA6WHZdY/h3PBxe+OpH1zZpmvvzccxv57+aVcYyz+kDbRpMcxbEcCfBNP8AN6ukmf0ZDYzG9jrE75iCCAezbv0RieKynBzieHujdG1ocWyMJzagW0IsRc9qjccyZ8IYXbmoYB42d+wKhRwyQ8BVRlBHS9doP3S5vv3RCEXWpPzkG3nBPwLEcSxWnmkidSROjdlDXQudm0vvmFvUUvhjiL6Vqfm1TTCOUsLw5jrt03Cr+D6apnwuu+a1zqV/SWBEbXC+Xc319RSOBKyLO6l+axsmMWYzNJJdtcG/jyt4KyyuGZ4XgjGT4J2J8RYjQYycOApJASwCTonCwd3ZjtdWWLVOMUFJNPTy0FU6JhkdD0LmOLRuR1zfw0WU4ku7i3RxBvDqOWy2NLR1kGPz1NRO6ogdShkcjmtaWnMSW6ad97c1XOMYwjJehpvLLFjnPhY9wsXNBI8khyXTVEVXTR1EBzRStD2Ota4OxRSNWX7LRopJCUgdkwGXBJS3pIQARRBKsiCAD80ELhBADb3W0CKNhe65SGgyO0VhBEGjUC6bAAAiZfmmfSdcpyZ1zZJaEgFhKZuPFEAnYhzKTA5NS1MtHXMqIrdLFKXa8zfUH2rc0uO0NeAWyiOQ/wCzkNjfuOxWQ4jonYfjlVERaOZ7p4SdnNcbkDwcSPV2qtXYdML4KRlUnBnSZMrmkOs5pFiO0Kq4fo5aDDI6WYddjiN73HIrLUeIVVGQYJnBv3CbtPktdQTRYzQ3u+M3s9rJC0tO+41ssltEql7RdGak/wBkerwBtfOJairnLgMos1osL3tsp0uEPqojBVV074XWJY1rG3t3gdyyVDPUy4pHTPq6ronVBjIE7wbZiN7roMNMxlOIQZMuXLmMhLv+re/eo3KVe3kI4lnghyYHTSYcaCJz4IHemI8t37bkg9iRRYI3DI3x0ldUsa83IIjNz5tUXD6Etx2vp31ldJBDHFJEx1U85cwNwdddufasvidTW0GK1VG3Eqtwhk6hdM4nKQHC9zrbNbvsiuErHsUv2JtJZwbakwm1a+sdV1Ms7o+ia5+WzRe+gAsk03CtPBXfPmVlU2pL3SZuoes69zbLbmVN4frmYlhsdSLB/oyNHJw3+PmqrEaTJxNSRMrq8U9VFNLJEKuSwc0ttl10HX2GmgVSc1JxbwS4ayaRzixgBcXEDUnmqXEsIpsRqo6rrwVcdg2eI2dYbX5HzWe4vdLQ1tMaSrrGCdsr3tNS8i922sCdB1joFYYLhhxDA46l1fXx1UgeBKyrk6pDiB1b25dikqtsFYmLdl7cFrJhEdSYjiEjqoQnMxj2tDc21yANf9VKxLDWYjRuppppIoX6PbGG9YbjcG23JZPhPiOrkrIKTEX9K2azQ47sfbt5i+itONw6Ci+eU9TVRzB7GfV1D2ttrfqg287XRKqcZqDf9ApJpsmYXhMWD5201TO6N5zOZJlsTa24bdQaTh2Cjr3VVJU1EdybRjLYA7gabKv4R6SsM01TU1Uj4XNyZqh5bqDuL2PmpclU/EuIH4a172UtO0ulDHEGU6aX3tdwHkVOUZqySz/YsrC4JM/DdPV1xrZqqp6YkEOGQAW2+yrSowyapgdDJilYGPaQcjY23B7wxUuK0D8Lpn4lgr3wSQDNLCXudHKzn1SdxvceHeLXCIvpHh2j+dy1Bc9gc57J3MeTc/aaQVU3JxUs8EuM4LCkgZR00NNDfo4mBjb72CeIuFzLAaqrrcUpKapr650Uhs4CqkBIyk7g3WsxbAJzRSSYTiOIx1LAXNY6ske2T+ybm47iE7KdkkpPyKMsrwXbmWKTa26h8MSuqeHqGaR75HvjuXPJLjqdyVYPCpksNomnlEZ4SAnXhNBAwiiCNyIIAUgjuEECFU8OUXTr3W0SnWaNEw4klIYWpKW0ImpYCADAJKe9FtkmMc0iaSxQBS17KDHqMZwJog85Htu1zXDQlp3H7rMVfDNTGb0k7J2j7MnVd6xofYpvCNSHQVNMTqyQvbfsOn7e1X4bcrTvnTLCZXhTRzmaOWCUxVET4ZQL5H727RyI7xor/gqQivnh5OizeYP+qteKKNlRgs8hb9ZTNM0bhuLakeBFx/7Kr4IjLsUmfybCR63D4LW7urRLPlFezbNYKzDP6QRf76f1ldLAsua4b/SGL/fj+srpaz6z/H+idX2U9KbcSYl/u8H+dU2I4Q7FJMbfTszVdNURyRAbuHQszM8x7QFcU39JMS/wIP8AOn8E6mKY72ieK3/8WqlScXlekSxlGQ4Qxf6PrgwvHzaqADidgfsu/bzWnrSTxThZ5/Nan3xLK8VYaMPxVz422pqsukYANGv3c323HiexWeA4gcRxjCmyEmanpqhshPPWKx9h9S1XRViVy/ef9FcXj4sb49FqvDv8KX3xq+4Ue2LhmnlkOWNnSOc47AB7lSfKCLVWG/4c3vjUnCOHqbFeFmOLpo6hwflcJn5LhzrXZfKRoL6e1ReO2jn3/wCj/wA2U3CWHz1mIwVPRuEELg97yNLj7I772Wg43dfBv+ez3qv4Sx+onfFQ1eUsey8RsAWm18um4U7jT+Zf+ez3otcuvFP9BHGx4I3AmsNZ/fb7iqZ9dNhXElbMwBz2zyBzXbFrjcD1EFXXAY+orf77PcU7jGCU+OTyVVBUCOpjcYZczTkeW8jzBG1x7dLSlOMb5bvDEk3BYJNBxThlUOhqg6nLxlPSC7TfvH7q7wqjbhuE0tG2XpWwxBokt6XeuZ4lhNfhljW0+WNxyiVjszCey/LzAWy4Lqnz4IYnkkwSFjb9lgbeV1C+iChvrfA4SecMyfCv8+0H97/KVv2VbncSCja/6tlEZHssPTLwB7AfWuecOwx1GLUUUrS5jzZwBIv1T2LYYVhzMN4tmbAXdDPRmRrXOLi12cBwudbbHz7LKWqUW1n0KvOP+zQ0VJFQ0cVLBm6OMWbmNyluCcvpom37Ln+S4YemeaeeUzzUkMJySEpySgA9UEWqJAiRIdUkDVGRcpQFkhhgJbG3RNCeFgEAJcQxpUCV93eafqJFBc7VNAc+wqt+Y17Zb3FyHtHNt9fj5LfwOZLG2SNwexwuCOahQYRRNohSSQtmiDi76wXNzzv2+CZhwWoojbC8SkhiP+ymYJWjwvr71qtshZ+mVxTiPcTztgwOpaT1pm9EzvLtD7LlJ4OoXUlA6okbaSoIcAfujb90uLBDPOyfFak1j2egzLkjb/whXbdlW5qMNkfseG5ZZzecHC+JJRLoIavpR3sc7MPYbeIK6Rma5oLSCCLgg3uq3GsDpMXax0+eOZgsyaM9YDsN9CPHyso1FgM1M0ROxaqfTjaJnU07L6keVlOyyNsFl4aEouL4JGEt+cYriVW3WNz2QsPb0Y1P/USPJLw7+escaD/+RF/6LFY0dOyKDooB0LGsysyAdTwv+6rqLBRSV8lW3EK6R8hvIJHMtJba9mj2Kncnklhi8dwtuLYZJTEgSenC8/YeNj4cj3ErI8E5vp4CRhY9scjXsO7HA2IPeDcLoWW4VdHgkEWOyYtG97ZJI8r4gBlLtBm8bADyv2qdV22MoPwxSjlpma+UL/7vDf8ADm98a0PB5twzSnvf+tyTiPC8OKTdLW4hXPLXOMbQYwIw43LR1NtBvc6blPUGGNwqPoYayqlhAIbFLkytubk6NBunKyLoVf2JRe7JgOHepjVGHaFsmQjsNiPetRxp/Mn/AD2e9Jn4WgfiD6unqpYM8hkc1rQbPJuS08rm556+pTq7A24hE2KeurBE0D6sFhBI+1ctvfzsrbLoSnGXoSi0mis4D/kK3++z3FK4brWtxzFKJ7rGSpkfHfmQ43Hq9yscOwGPC356Wtqy0m7o3lmV2+9m39qD+G6Coc+T66OodK6VtRG/K9jib6crdxBUJ2wlOT+mNRaSJ/EDI3cOYi2W2U0zzr2209tlVcGQOgwcPeCDPIXi/ZsPcrKXB5qmEQ4niMtTTAgmIRNj6S22YjfysnainMsQihnkprWs6ANuAOQuCLKpSShtT8jxzk57wr/PtB/e/wApXTMkYkMzgwOa0jpCBcN3Iv2LP03B1JSzMmp66uZIw3a4Oj0/7FLqMCfVROhqMYxJ0bhZzc0YuOw2YrL7IWSTT+iMIuKFcK1Aq6GqqG+jLWzPb/dJ09llbPUfCMNhwmibSwPke0OLi6Qgkk+AAT71RNpyePBYvAy9NEJx5SAkMSQitqlOSQgA8vcgjQQIkZdUrIhUdWFxBIPaFC6WT77vWr6tO7Y5TKLdQq3hongWSJZLBQulk++71oi4nclWdlL2Vd5H0CQ3TW5S0LJ9nL2Hex9BtalhqQhc9qOzl7DvY+h9rSlhRszhsShnd94o7OXsO9j6JJSUxmPaUMzvvFHZS9h3sfRY07bMJTfMqGJZALB7vWh0j/vu9aXZS9h3sfRYNSrKt6WT77vWj6WT77vWjspew7yPotNgoUpJKYM0p3kd60nM4/aKOyl7DvI+h5rU81tgoeZ33ij6R/33etPspew72Pokv20sl07VCL3HdxPmjEjxs9w8Cjspew72PospjZu6ZYNbqGZZDvI4+aHSPH23etLspew72PosgEANVXdLJ993rQ6WT77vWjspew7yPotLJqUKB00n33etEZJDu93rR2UvYd5H0SXb7pNlHL3HdxPmhmd94p9lL2HeR9DzgiATRJO5KXFqTdQs0zhHdknXqYzltwOWQRo1lNQ9VfyDlXqbObxOChldLR/xs5us/NBII0LLWZAkEaCACQR2ULEcVosMaPnk7WOcLtjHWe7waNSlKSistkoxcnhImILNu4wp2zZHUFVHHa+eUBungU7/APGeBgDNV2J5BpNvVoqVqan9lz0tyX4l+gqmj4mweseGQ1jA47Z+rf1q3VsZxl4ZVKEo/kgkEdkLKRAJBHZCyACQR2QsgAkEdkLIAJJlcI43vc4ANbdLUPiCnfHhBkbdz3glsbdCQsustlXU3DyatHVG21KXgxVTx7VUlRKyWjaWXswuBCk0/wAoUDXFtbRSMIbcdGb39ax9dHHSh8vzYOdfrRPJOXvIvqqCWpu+7QddQd1jrusx+Ruspry1tOz0fGOC1VI+o+ddFk9KOQWeD3Dn5I6Li7CKuTIJnRdhkbYFcYf9Y0Zm6jmkRVtTSyZWvtY7K3uLPplK01X2j0OxzXsD2Oa5pFwQbgo1yfhvjWejcIp7Piv1gB+y6bhuJU2JU4mpngg7jmFqrvjPh8My26eUOVyiWgjshZXmcJOQ7lIsnIdz4KjU/wATL9N/Kh2yCCC5J1gSH6sqOpdQzLE5RV0tH+DOdq/zQVkEaC1mQKyCCi4nXRYfSSTyuAyjQHmVGc1CLkycIOclFfZV8S8RQYVBLHHI35yIy4DfKeS5c/HKhhkljkPTSOuZXavPdm7B2CyHEVc6qq3AEuc855CT6ROvsVK9wtd1iBsuRObte6R2YQjStsf9jk9ZPNbpJdBsNkhsj29uvamw9rblxBcidIb9YW7uaMBlskMmew3a037nWW54P42dDJHRYkXmD0WPdrk8+xc8EjibNaQO7dTMPwyuqJR82gkd4BNScHlMUob1hrg9BgggEEEHUEIKs4adP9CUjKsZZ2RhrwdxZWi60JbopnGnDbJxCQRoKREJBGggAkEaCAFQxh8oadtz4KPilS2V5Bt3dyedOIKeU/adZo/jyVFKTmzXuuL/AMhfLfs9Ha/46hOG9mF4vDDirXxWBGju9Y+sp8spy8ze3YditzxjTxECTQPvoVlcRDdXfasHedtfcqaZZiab4fIhsuWNNtWmx70qspLxZmi5toe0I6VzXTll7Zjp48laMDS0N0GYCw7xr8VY5YIbU0UEQu0OI6wWj4bxmowurjex/VcfJ/j2FUs8Ip6iSPlfT9k/RR580bho4Et8eY/dSbK8Hc8Pq462kjqIz1Xi9uw9ikLAcA4uYqh2HVD7h2rLnn/Gi366lFvUhz5OTfV05/oCci3Pgm07DufBLU/xMen/AJEO2QQQXJOqO1P8i5QVLrJGxUz3vcGtFrk+KqPpSjGhqGDzXQ0kkoMwaqLc+CYgmI62ml/k543eDk817Ds4HzWvcjLsaASuY/KDjL56voWOPRRaMH3ndq6e4ssbm4tquHcS1Iq8VqZW+gHFo7O+3np5LBrJtyjD6Ojoa0oyn9+ConmzFxuczjqT2KPJcN31KW8guvyTZFtT2FUYNLEN9PvTnK/YNf4800Da53PIJWazD2k2TEi84TbD8/j6VrTc6hwuuqRxRMaOjaA3lYLkGCSCOsicb+kuuxSfVNt2LNdwzXQsxZPpagxvF/RVsNQLbcis1LUCJuY2HedAlYNxHTT1fzMSZ3Aht2agE8vetek1DXxZi1umUvlHyaNBE6VgFy4I2vDtiCummjkOLQEEd01UTMhZmkcGjvTFtHEExBPHMLxuDvBMYhWtg+ra4dIRe3YFXZbGuO6RZVRO2ahEicRSh9I6FtzzdlKz+G1FRSCJlRI6SORodkebubfv/ZWb3dNG5uYgkHxCzEWG4xFVSMknbLTXu0vuXd2q4Fk3dKU2ekqqVMIwRJ4rpxUUTpoXXyjMLLAvf0sLgfSZy7l0l0EklK9s3NhBXM6sdBiMjOVy31I078oWoX2Q4pS2UEHWwsrYVBfS52ekHXuqO9nC3JSIZi27b6XWtoyJk/EJA5zHn0sg9gUikf0bo3A6X37jooFabuZ5/BLpX3px/ZtZRxwH2aB2eBzauE5XxuDgf4711jDq5lbh0FW3RsjA7wPNcjpHiogDdw9liFc4Pi81Jhb6EyOyNkuzuBF/fdXaa1Vy5+zPqat8ePo6PHVRPfla8E9l1Mh1J8FyNuLT0tYJBKSAddV0XhfF48WgcWayMAzBa7rFKt4MdEGrFkvLoIIlzDpFVx08s4VrXNJBGTUf3wuRdK532ifNda+UD+iVd/wfrC47HmJVlfgg2TYaqSI6OI8Cr/CsekpzaRxc1Zst6tyEUT9bZrFW4wPcvs3px9skMmRxz5HEeNiuU4jNknlh/wDLGQ+I/wBVrMMztlmnLiGxROcDa9jyXP3uc5xJJ3vqqXLdY/0XY21Jr7Y70gAsbknsQfcnXQdibj1OgGg3KXcu7FMhkIkJO7hZE+wIslxsJ5WCBFrgdK6epaQLhupXVKc5adhI0y7LnfCEzG4g2B+jZeqSundGOja08hZYr38jfp4/HJz/AInramSV7KmcZW3DIYja/irfgWl6CKWpeLB3VFh7QrOpwakfnd0Ya9xuXAalPUzY6KnZEwAC23erFZiOY+SCpzN7vAvFqmZsQLDdm2YfxomsLxh0ZtK/1prEK+GiyiTK58vVyH7Q537lmqmubbqkrXVf1I8rBj1GnVU+OTUVvFZin6Nhv3hRMSxR9WwHO61u1ZeN7JDci5Tk1VkGXkrN7wUOKyWtLjE9FJeN5I5hW8FbFj7nfOCY5IGgxva8tc53Id43WKdVABTcBlppp6h9RKWOhizQt1F37A6a2Hw5Ku2bcGmWaeOLU0bSCOSI5pX5yU70+XQ6jtVdh1dLVR5Z2ASDm03a7vCkuabrjyfODu7ULqakdE7TkuUY5ricrhoM7iul1DHFp8FzfHIyyWZx3J09av035GbUr4lPIbEHvSmen5opR1fUgw3AK3nPJlS+7I399j3IQPsC2/VKYEosQ7UOFikRmzj2j2pY4EajhxwfUuj7Dcfx4Eq5kpeidIXNu2xa62hBBuD5hZLBKgx1jXg6ixt2rfOcyohY9h9NuUjy0/b1KifxZZFZRjKsPFQ/PcEk6di2/wAkdzVYoCSQI4ve5Y7HmuoagRlwL7WOt8p7D3haz5HJM9Zi47Iove9aG04GfZtkdP8AJBBBUlhUccjNwvWjtyfrC5C4ZCNF1/ippquH6qFu7sv6gudfQcsty0nTtVkWoxyxbXJ4RS1EmWNRKV+Z6dxmN9JJ0LxYqrp53MKm3nwRUWvJoopckNQ1xcG9C4kNNi7a/s09ax0zCOt97XwCv6Cqc6pEUlskwMbr8gVVV7AwksJII0v2fFVJYmy/zWv0Q7ZGa7lHew1Se8pEjryKwrNfRYDCzC4J5KJ9bV1DRIGl5ayNh2vbmqWviEQEbQ02Ni5my2GATSVmA/NnyBk/QdHG6+7eXwUmm4ZhaGzSMbkLejdE46Bvb49/eVk6u1vJ0HSpRW0w+DmeOuifALva4EBdRo6qV8DTM0sfbVp5KBRYRR0jzLDELnmrONmYi2ngqbbFPwW01OCFF5JF1GrmdJlbqGggkqUY7FQsZc5uHTujJDsthbtUYMc1wZiomZPiL2ktEPoCZ93EkagDxtyU2kwhlS3Mo1BA2kJNbGybpmZWtOnRg63adw7v8lOwSuEbAHuXV0205GrclLLH48BZELrOYxEIpi1vIrafPI5InWfyWVxSPpagkaq+yKxwZoyZTCMOG60HA0NPHjMz5gHEUknRg69YloP/AGlyqHwPbs0oozPC9skeZrmm4cNLKicN0WiyE9skzoTYWwgdGRYbdyX0zQNTqqfAy/EaYdJVyRvyuJ6oI0Nhp/ryTtRguIThraKsa/rkPMjMoaO3Qm65EofLazvK1OO4XVVkfotu52wDRe5WWxLhXGsSqi4RRwtcb2kd1reAvbzXQ8C4ehwyEyySmWd/pSuGvgOwLK8Uca9C402CkXaS2SRzdBbs7VfVFxfxM1tsWvkZqu4Pko4S+txKCM7ZejJN7eKy1Sz5rMYxIH6XuBZTq+vkqpXS1dU973b6qvlLJBZjTc81timvJhnJN/FBh1wlR+ldILHMsCEuLRykxEmkf0cwdewB1W1wGuD+haXaBwBHsWJhAzvurrApjHP3ixuf48FTYsk4PBbT0cmKYjUdK0lpkJsDtrp4rY/JvhP0bUYg/q3kZGNNNi74qvkhbE81TAMjm5tDvdXPAdTJPX4iJBbK1hHmXXVqcXVwUyT6nJskEaCpJlPjknRYXMTyt7ws5SVsLWOY9zc26veLSW4BVOG4y/qCxWC0D63rTusLq6NashtZU7nVYpIq+J4hX1YdENALXHNU0WEuB1BXT/oGmy7eahz4PTQtfI+VwawF2RjQXOABJty2G60KiNceSqd87JZX2Yr6MszMDa2t9kXFPD89JQw4g8EMfrIw7tJ1Hh4LdcNCkjhbXzxSOdK36lr2jqm+mvfvfT2prGCJ3Ow7Eh9TMXGJ99765b9o18fJYbrY7vj9G7T1Tw932cXfo/U80hp69ztdXeL4H9GyVInltl60PY8KjV0ZKSyiE4OL5NnwhUtqYzRP9JguztstJaujBENSHN+5KL2891iODWSHGI3NvZgOfwXSQGj7IXPv+NnB09M91fJCoZJ2wgVjmGW5Jy7bqygmbuFClhzXOyqqupmpgWtBcBzCrxuZblRRpH1DXG2ZR529MMl7NO5WRdjssR1icRzUikx6rqnWo6OeYjQ5GkgeJ2CtVM34RRK+C8ssMalgw5scr2h7gbBh8FQumYZXOgcejJu2+9kddQ4lWy5qoCBl9GudmPsVjhuEtfHlaL27V0tPp7EuTk6q+EnwQY8QfFpmv5o/n7XOu6ytm8NB0h7EmbhtsbdbrR05mVTiRI6uF7dbJy8L9rX8UqnwJ00rYYmkuebBbLCOFsMpA2WRhq5Bzk0YD3N+Kz2zVfEvJoqg7PBX8LYa+YOlfdlMDpJ949je3xWqZDFG0NaxrI27NH8ao5HgC1w0NFgNrKmr6wMDi6SzW76rmznunk6MIPbgi8ZY43DsPd0JBlf1WArkU9OJXHppnZnG5N9z2rS8YMqqydkuvRNGUDsus4/D3WLjI4Hn3LVUsIzz5G4MCmqXltPLG4gXs5wCZlpZaR5inZkkbuE9R0WKPl/+Rp6uUbZ4YXOHrAU44Fjkzy5+G1bi7m+ItPtVnJFbcFe0MmHRu0fbq96ZfEWszfdNj5qXiGEYlhzGyVtDUQsB0kfGcvr2RRuFTTTgjrluveQd/VdJ5RLhjNMC6Rw7R+4VjhnUrgw3tsR52UGiOjzzDFNmeKfEo5R/Jvsb+I+NlGXnAkbrDZXz0fQFwHRusSfDRaXgqBkFRW5CDdjPHcrK0DcuZ1rNe3fmCOS0fAsrn1+Ig6gRx2Pm5Sqx0miu7PURs0ElBVkjP8aSdFwzWP5AN/UFzag4ldSjK2xXQflBNuEK/wAGfrC4nTnM8DvV1baRntimzolJxHVSaixCkZ48foqmnnlEVYxwMDgdhY38ewqk4fpZqt7IKdmaR+2tgB2k8gt99BYdheGyUj8s9VNbp5zobjZreYA/90aizEMZHpq82ZxwUWD1dSzCo4K5jTHHeJ0kZu05Ta57FEqsShq6OsY6GeojYQ2OdjS4F3lzCexPF6XBqNkNN0YDdBHnFyO3VR4ePsKpoBnp3lzR6EbW28tVz1Gb5jE67nCCw2MVHD2I41h1HFiTYmZeu97b5z3W5Ksqvk9YxwdTTvZb7L+sD+6vaf5TcGlIEmHV0TfvDI72XWgwvH8ExkhuH10T5TtDJ9XJ/wBJ1Pknuth9cFTlXN8mUwrBDhrsxhs+1iQre60clKw6WtZMPoWHcX8lQ3ueTVCzasGcme6+gNkmWmjc3M9re/tV7JhcLz6Nj2hR58DL2FrJ3s9qkgc0YmrhhkrMgbeKNpfI1u5AUuHGOjaI42BjALBrRYBPYnwRiT6qKroMUYyWK5bmYRr4g/skYhg1Y2kbUOpOimGkrYLyMzfeAGoafZ2bLqae2MVhM5GqrlKWccAlrmyt2TmB1bTUFp0BVDRMrKuUw0dNPUvGhEEZfbxtsrvDeGsXiqBNWGmoY+ZnnGb/AKW3K3K7lMw9M0FZicNIzM4gKHS10+KzGOhhdLb0nD0W+J2HmpM2FYLPl+d1dRWEbsh+rYfE6n3KBxDj7cDw4U1M1kL3sLaaladImHTpHcydwO3UqFmp5wiyGneMyNVRUDKGIOc5rqiZn2NmNPx9ysIGANAAF1w3DeMcZw2qEjat9TGT14qpxkDvM6jyXXOGOIaHH6MVFK7JK3SSBx6zD+471zbYTc90jfXOEYbYkXiyrdRURlY4tIe3Ud5sfYSqCKrjqZWtkeTG3U67q64ufh8sMkeIYoaOw6jGRdI+Q32Df3VFw3ghex0xMjqV38kyXqvd3ktJt4Kt7YcltblP4gxeZ9c35lhlI6aYkZnjZnieSmYZwuKaNrpTG+o3c+RuYN/ut2HibrQ0sUULOjijbGBrkaAPNO5hyVkZJohJYYxBRdG0Z5ppCPvOsPULBSWty6AnzN00X672RGUjd11KLinwiuW5+SS5scsbo5Y2vY8WcxwuHDvC5PxXgUPD2MNfThwo6i7otyG/eYfC+nce5dPEtuaoeN6NmI8Pzj/awWmicBq0jf8A7brXhWQM+XCRzCRohmDm+g4m3geSfk+vhYDuNE7TyNqIejqG2tobcjtfw9xTMcUjWltiWjZw1WXyaTWcPVnSU3XdZzCGm61vAQLcTxMOFgY4yD2i7lz7Bn9G5zSQBIL68jt8PWt98nMz5aivDrgNYwW83aqMXjKHNZSZudOwIIIkEDLfKEf/AAfiHgz9YXDqZ9pR4ruPygWPCNeO5n6wuJ00BkqWRtIBc4NBOwvorocIpn5wdN4FBo8PlxCZpAk6sXfbc+v3KPxLj4fhlV83nY2R7uh6QnVtwcxHlz703xDjdLTU8NNAS2lp48oa02u0WFvPTVc2rKuatd0riIoASGNJNgL7N7VRGPUnvfg1yaprUF5F1MsckjnGVzz25f8AVR3EHY7cyQmnSwn0WgntdoD5BE1/ZGx3/CVqyZVgdMbmBrjbrag5gm3SPB0N7cnapx+a38nG2/K5CYNxu0eTrpeRs1vD3H+KYY5kNU41dONOjmdqB/Zfv5G/kuoYHxDQY7Bnopeu0deF+j2eI/dcANjs63cVIoMQqKGpjlhldFMw9SQHUdx7Qs9umjPlcMurvceH4PRYIR6FYbhfjWPEQ2lrw2GsA3v1X+HwWrirY3D0lzZxnB4Z0IKM1lEs6JJLeZ1TJm0UKqqHs1aLpKTJqtMlS0sEkhkdEwyEWMg6rrdlxY2UKfBKGZ2YmqjP/wCubT1OBTTMUyENlY5veQqvGuNqHDJegYw1E4F3NabBviVorstbwiqymuK3MfxyrwrheibIDPLVSaRRue0/8RFhoD3rk9bWz1tRJUVMzpZZHFznO3KcxjEqjFa+WrqnXkkOw2aOTR3BQmauA710a6tvL8nNts3cLwE7sU3CsSqsJrI6uilLJW6doI7COYUOUWk7rIW0VjK0bf6Uj4hxCOpkHRgBrXMvfLzPkulUQhZAxsNsjWgC2y4FS1UlJUNkhPWG47Qt9w5xMY2sOYmJ3pNP2Vkvpc1waaLVF4Z0WZrXi+xGxUUuNyCLEbpVNVR1EQkY4Fp2SKt+S0jBcjdvaOxY4NweDbOG9cBOYSmJQ5o1vopkM0csDZIzdp59ncVAxKtYwsjA6zzl8FujBPkwSljhkd9S5u+yh4rWj6JrL84H/pKiyTuq5X9FpCzQu5Kox2sHzR8TTpI9sQvzBN3f9oK0VvBnt5M5EGtlnjJsQ51vfb3FJpw/5yHhxaXtuCDbVMRPMtc+QXyulJ08P9FYUrWOLrmxb1m+BGvuCplwaF4HmVUjZWGQNttmaLE7Xv6/Yuh/JpI2Srr3Ai4ijDrbXu7VYRlKZ6eTKBnZr8f2W1+SppbUYiDf+Si9jnj9lWTa4OhoIX8EEysy3H39Eq/wZ+sLjbA1j7ldi+US44OxAjcBn62riuruZWipZRns8kzGsTiEMbW0olmfzk9AWHZzOp7vFZ+QSTvMtQ8veeZ7OzuUqvzNLOyx5KE555o27eEWOW7li7AcksPAFgdUwHF5s0EnsAQzW0O/YExZJLmdQHcn2Jh7TzUiKcNbYhp/jtSSBIb6DwQNke19CEHRkt6ovZSehba9wm3Ny+igWBUV302ZtxJCdbHW3I+vn4LS4LxQ9obBVvNxoJDz8VmWktNyieA9xde3d2qE61NclldkoeDp8OOyRgEODweQKem4poIIg+pecztmtFySuZxVctNfJI7I0XsfcmqmodO4vduWAj4LMtJFvk1PWtLg2uPcZNfTNiwp0jZC4Fz3tAyjs71jp5+meZXgB7jdxA9I9qjMfdoBO23eEsHqWWmuuNaxEyWXSteZBblHFrK0d6SiEgjObmFcykcmeC9p1HVsb9uqBk+wLXtre+iZLnSFtzy00RuGUaqJJPAcw6Jxb2dqewmpkjnLW3LCOt3KA9+th5p6CoZE2w07UhG9wLiB9FIGudmiPK62YxGGenD2uBBHauMR1o5G6n02NVMbBFEXEHt5LPbQpco1U6hx4Z0amxIUtVI0u+pkBJ7iBof281najFXV+IX6URxi4DuTG8yk/ReMVlPkgYxrHjWQvu5/wHck0nD2IUcrZZCyMtNw4dYg+4KVXxjghd855SLWulbT0scbbxhw+ph52++/vPZ/Ax2K4iJJyyJ12UzHXcOb3ae6/tT/ABDXMpy+mgkc+of/AC0rnZiO6/as9YtpQeUj7+Q0Vq4RS1l8ltg9gyO7c1nXcO46KRnEchLDdtjY/wAdygUdQI4mtvZzHXHgeSeqXBri1no3uPPdVNcmj6NDh8wFS5ouRuB+3tW1+TJmSsxK7r/VxadmrlgqJoLYZA6zraacw5dC+Tp4fiGJizczY4gXgauF3bqpeScvxN1b+LIIvI+pBSKjL/KFY8I147mfrauLbFdk4/dm4Vrbf2P1hchDQ7fdaqV8TPb5IeIOjY2OR4zWNsnaFXvrYyLMpIge0klWWMsy0rQW6l26pms1uRpzTl5CPhBPlkl02bya0WCK4ZoPSO5Tk0kbRaEG/wB48vBMAKIxxpKfjvZMtcxm+p7Ebp3u9HqjsCB5wSib2BO3JAhoCjsdbcpzNfZBLOQOFz3JBNz3BP5Rl8eSZaLlMi0CtJJbb0b3sgL2tyKcljLxbnyUdrrEAjUFDDAbBa3cbJ29kC0xykd+qS92/imIO+lk0es/uCGazC71Im6NBO55IELJsm5ZLXA1PNJfJa4B15nsTKGAEaJGkA5BJ0crXEXA3HaFocOpGzSsfE640LXDn3LNDdS6aWWndnglfG7tYbJMlHydDifi1BGXsdEYhqRe1gqzFuNpn0hpqSxkcLOlOzfDtKylRW1VT1KiollHY95I9WyY20VcYY8lsp58BSPNi5xJLjcknUlTq4MbDTRMt9XEA633jqVDgjNRVwwtFy94aB4lXGMREVr2OYAdrNbbvPwUnLDwKENyciHSRGWTLzLCfUL/ALKZ0eZ4Dti3fySKQdG650IcVLpyJYTl0c0keXJQky1LgtaKDLAXC31cgADtjdbn5M43MxLGDkcIwI2gm+vpf6LE4W52RzBZzxIwXtewBvf1ALZfJlUvqMcxtjnHLHFCGi+jes9UrO5k542HQvJBHbvCCkUmW42j/wDCdc523U/WFydsAOrSF135TT0HAeJObu1rP1tXCqXFy02ctdEljkzXJtlhjjMlCC4dXNY+pZd4F+rstDieIRVVCY+YIcFnXltzZSs5lwEOIhZHHkjyluhS2VDmi2hRPlz7hVkhOUlKETkGvy7JfztzRoAgFgVHA9x1RSStZ1Y9TzKakqJJBZzjl7AmgUwySGykEdyV00Y5n1KLe6F0h5JUtSX2tpYWHckCcXDnszO7QbX8UwPFGjAZHTKXEknUpJdfnqm7oFyBDjjmIA2CS+TcIi6wsPNITEBBBBABoIgjQAqMXKdJsETBYIwLlIkgwikdYI72TUgJ1OyBstuFIHTY3AW/7MOkJJtsPjZX2J4bLHN00rnFzjezvS7fd7ws7gJc2oe/pDHGG2e4G2l729i0Bmp6p0lTJVkMaSGtcbFZrVLflG3Tyh0tr8lPmBcNSS697am+v7qfSUsjGkxkula70QL5u0e9KjpKYTfXVAOUZm9G4G500ty0vukV9Uymjb0JsRqO0K2K3FNktppMIpIwHvkc1mYB1jpY2+IWl+SmFkeM42GzNleY4S7LsOs/4rkbMXq8hD5Xm7iSc2p8V0j5B5TJXY4XG5McPveo9NxyyLtUsLB1vKEE4gqxGP8AlVkB4DxQf2WfravOQd3r1PMyOojMc8bJYzuyRocD5FR/onDPw2i/Ls+CtjLaiMo5Z5iEuXnytZNk3K9RjCMM/DaL8sz4JQwfDD/VtF+WZ8FLqIWw8soX716pGD4WP6sofyzPgj+iMKv/ADZQ/lmfBHUQbDytmQuvVP0Thf4ZQ/lmfBD6Jwv8MofyzPgl1F6DYeVUF6qOE4X+GUP5ZnwRfROFn+rKH8sz4J9RBsPKyC9U/RGF/hlD+WZ8Ef0Phf4ZQ/lmfBHUQbDyqj816p+iML/DKH8sz4IHCMK/DKH8sz4I6iDYeVrol6qGD4Yf6sofyzPgnmYFhh3wyh/LM+CXVQbDyegvWowXCR/VdB+WZ8Ef0PhP4VQflmfBHVXoWw8koL1r9D4T+F0H5ZnwRHCMJ/C6D8sz4I6q9D2HkxG219wvWBwvCb6YXQflmfBEcKwr8LofyzPgjqBsPKuZv3gjzNHML1I/C8Lv/NlD+WZ8E0/CsL/DaL8sz4I6g9rPMALd8w9aTI4FuhC9OnCsM/DaL8uz4IvonDPw2i/Ls+Ce9BtZ5ognEcZbcantRulafti3ZdelvorDPw2i/LM+CUMJwz8Novy7PgjqEemzzN0+X0XAHxTb5S83c669PfROGfhtF+XZ8EPonDPw2i/LM+COoLpnl/MO1dU+QdwFXjNv/Lh97101mFYYD/NtF+WZ8FMioKWBjnUdLBA87mKJrL+NgoynlYJRhh5H+lRqP0vbugq8FgkMCUAAm8yGZMB26GZNZkMyAHcyLMmsyGZADuYoZtU2CjBQA4jBTeqUBdACsxQujAHMpQtbZIBIBKcbHfdFm7kdygB1uVg7SldImLowjADue6Jz00gSjAB9IUkuN0SSSgBWbVAuTZKK6ADJukFGdklMAkEaJABFGEEXNACwlJCUECD2T0TrFMJTSgCTkjOtkExfxQSGQQ8oXSmxFLbD2lSAbBRi5T3RgIwEANAEo7W3RSOtoE1qSkA9do5o83Ym2gJVhdADmYnuSm3SQUoOQA40JWVJYVIAuEgGbI04WWSbIyASCOyKyACKCBRIACQU5ZEQEANFFdOFqQWpgIJSSUohJcgAgUd0lC6ADO6CK90aADRgpIRoAVdGDZJCNAB3KCTdBACg1KykIIJACxSSCEEEwI8m6SggmAtqWgggAAo7oIJAORuUuJwRoJMBZskuCCCQgiEQCNBABFpRZUEEADKURCCCACISS1BBMY09qbIQQTASQkFBBMArpTXIIIAUgjQSAARoIIACJBBAH//Z', 'Romance', '2 hours 17 minutes', 'PG', 'Before Sunrise (1995) is about American Jesse and French student Céline who meet on a train from Budapest, hit it off, and impulsively decide to spend one magical night together wandering Vienna before Jesse flies home the next morning.', 'Ethan Hawke as Jesse, Julie Delpy as Céline', '2025-12-21', 'nowShowing', '2025-12-21 16:53:48');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
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
(7, 5, 'Welcome back, budong!', 0, '2025-12-21 16:56:45');

-- --------------------------------------------------------

--
-- Table structure for table `occupied_seats`
--

CREATE TABLE `occupied_seats` (
  `id` int NOT NULL,
  `schedule_key` varchar(255) NOT NULL,
  `seat_id` varchar(10) NOT NULL,
  `booking_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int NOT NULL,
  `movie_id` int NOT NULL,
  `cinema_id` int NOT NULL,
  `hall` int NOT NULL,
  `date` date NOT NULL,
  `show_times` json NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `movie_id`, `cinema_id`, `hall`, `date`, `show_times`, `price`, `created_at`) VALUES
(1, 2, 1, 4, '2025-11-20', '[\"10:00\", \"13:00\"]', 450.00, '2025-11-20 04:47:41'),
(2, 4, 1, 2, '2025-12-21', '[\"10:00\", \"15:30\", \"18:00\", \"20:30\", \"22:00\"]', 100.00, '2025-12-21 16:54:34'),
(3, 4, 1, 2, '2025-12-21', '[\"10:00\", \"15:30\", \"18:00\", \"20:30\", \"22:00\"]', 100.00, '2025-12-21 16:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `trailers`
--

CREATE TABLE `trailers` (
  `id` int NOT NULL,
  `movie_id` int NOT NULL,
  `url` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trailers`
--

INSERT INTO `trailers` (`id`, `movie_id`, `url`, `created_at`) VALUES
(1, 1, 'https://www.youtube.com/embed/vgr-ABdgy9c', '2025-10-28 10:38:30'),
(3, 4, 'https://www.youtube.com/embed/6MUcuqbGTxc', '2025-12-21 16:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
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
(6, 'solle', 'proofreadmopaperko@gmail.com', 'fuckthegovernment', '2025-12-21 16:45:28');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cinemas`
--
ALTER TABLE `cinemas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `occupied_seats`
--
ALTER TABLE `occupied_seats`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `trailers`
--
ALTER TABLE `trailers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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

-- Mobile User Tokens Table
-- Run this SQL to create the user_tokens table for mobile authentication

CREATE TABLE IF NOT EXISTS user_tokens (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  token varchar(255) NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY token (token),
  KEY user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


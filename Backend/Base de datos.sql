-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.0.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para sportmeet
CREATE DATABASE IF NOT EXISTS `sportmeet` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `sportmeet`;

-- Volcando estructura para tabla sportmeet.calificaciones
CREATE TABLE IF NOT EXISTS `calificaciones` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_evento` int(11) NOT NULL,
  `Id_usuario_calificador` int(11) NOT NULL,
  `Id_usuario_calificado` int(11) NOT NULL,
  `puntaje` tinyint(4) NOT NULL CHECK (`puntaje` between 1 and 5),
  `comentario` text DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_evento` (`Id_evento`,`Id_usuario_calificador`,`Id_usuario_calificado`),
  KEY `Id_usuario_calificador` (`Id_usuario_calificador`),
  KEY `Id_usuario_calificado` (`Id_usuario_calificado`),
  CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`Id_evento`) REFERENCES `eventos` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`Id_usuario_calificador`) REFERENCES `usuarios` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_ibfk_3` FOREIGN KEY (`Id_usuario_calificado`) REFERENCES `usuarios` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.calificaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla sportmeet.deportes
CREATE TABLE IF NOT EXISTS `deportes` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.deportes: ~11 rows (aproximadamente)
INSERT INTO `deportes` (`Id`, `Nombre`) VALUES
	(1, 'Fútbol'),
	(2, 'Baloncesto'),
	(3, 'Voleibol'),
	(5, 'Natación'),
	(6, 'Rugby'),
	(9, 'Tenis'),
	(10, 'Microfútbol'),
	(11, 'Atletismo'),
	(12, 'Voleibol playa'),
	(13, 'Baile'),
	(14, 'Entrenamiento físico');

-- Volcando estructura para tabla sportmeet.deportes_x_instalacion
CREATE TABLE IF NOT EXISTS `deportes_x_instalacion` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_instalacion` int(11) NOT NULL,
  `Id_deporte` int(11) NOT NULL,
  `Capacidad_base` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`),
  KEY `Id_instalacion` (`Id_instalacion`),
  KEY `Id_deporte` (`Id_deporte`),
  CONSTRAINT `deportes_x_instalacion_ibfk_1` FOREIGN KEY (`Id_instalacion`) REFERENCES `instalacion_deportiva` (`Id`),
  CONSTRAINT `deportes_x_instalacion_ibfk_2` FOREIGN KEY (`Id_deporte`) REFERENCES `deportes` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.deportes_x_instalacion: ~20 rows (aproximadamente)
INSERT INTO `deportes_x_instalacion` (`Id`, `Id_instalacion`, `Id_deporte`, `Capacidad_base`) VALUES
	(1, 1, 1, 22),
	(2, 1, 6, 30),
	(3, 5, 9, 4),
	(4, 6, 9, 4),
	(5, 7, 9, 4),
	(6, 8, 9, 4),
	(7, 9, 10, 10),
	(8, 9, 2, 10),
	(9, 10, 2, 10),
	(10, 11, 2, 10),
	(11, 12, 10, 10),
	(12, 14, 5, 30),
	(13, 15, 11, 8),
	(14, 16, 1, 22),
	(15, 17, 10, 10),
	(16, 18, 10, 10),
	(17, 19, 3, 12),
	(18, 20, 12, 8),
	(19, 21, 14, 20),
	(20, 23, 13, 30);

-- Volcando estructura para tabla sportmeet.estados
CREATE TABLE IF NOT EXISTS `estados` (
  `Id_estado` int(11) NOT NULL AUTO_INCREMENT,
  `Entidad` varchar(50) NOT NULL,
  `Nombre_estado` varchar(50) NOT NULL,
  PRIMARY KEY (`Id_estado`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.estados: ~10 rows (aproximadamente)
INSERT INTO `estados` (`Id_estado`, `Entidad`, `Nombre_estado`) VALUES
	(7, 'amigos', 'pendiente'),
	(8, 'amigos', 'aceptado'),
	(9, 'amigos', 'rechazado'),
	(10, 'eventos', 'programado'),
	(11, 'eventos', 'cancelado'),
	(12, 'eventos', 'finalizado'),
	(13, 'usuarios_x_evento', 'inscrito'),
	(14, 'usuarios_x_evento', 'asistió'),
	(15, 'usuarios_x_evento', 'no asistió'),
	(16, 'eventos', 'iniciado');

-- Volcando estructura para tabla sportmeet.eventos
CREATE TABLE IF NOT EXISTS `eventos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_instalacion` int(11) NOT NULL,
  `Id_deporte` int(11) NOT NULL,
  `Id_organizador` int(11) NOT NULL,
  `Nombre` varchar(200) NOT NULL,
  `Descripcion` varchar(500) DEFAULT NULL,
  `Fecha` date NOT NULL,
  `Hora` time NOT NULL,
  `Capacidad_evento` int(11) NOT NULL,
  `Id_estado` int(11) DEFAULT 10,
  `Recordatorio_enviado` tinyint(4) DEFAULT 0,
  `Hora_final` time NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_instalacion` (`Id_instalacion`),
  KEY `Id_deporte` (`Id_deporte`),
  KEY `eventos_ibfk_3` (`Id_organizador`),
  KEY `eventos_ibfk_4` (`Id_estado`),
  CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`Id_instalacion`) REFERENCES `instalacion_deportiva` (`Id`),
  CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`Id_deporte`) REFERENCES `deportes` (`Id`),
  CONSTRAINT `eventos_ibfk_3` FOREIGN KEY (`Id_organizador`) REFERENCES `usuarios` (`Id`),
  CONSTRAINT `eventos_ibfk_4` FOREIGN KEY (`Id_estado`) REFERENCES `estados` (`Id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=296 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.eventos: ~201 rows (aproximadamente)
INSERT INTO `eventos` (`Id`, `Id_instalacion`, `Id_deporte`, `Id_organizador`, `Nombre`, `Descripcion`, `Fecha`, `Hora`, `Capacidad_evento`, `Id_estado`, `Recordatorio_enviado`, `Hora_final`) VALUES
	(65, 1, 1, 22, 'Partido amistoso de fútbol', 'Encuentro recreativo entre compañeros', '2025-10-02', '08:00:00', 20, 12, 0, '10:00:00'),
	(66, 1, 6, 23, 'Entrenamiento de rugby', 'Práctica general del equipo', '2025-10-03', '09:00:00', 28, 12, 0, '11:00:00'),
	(67, 5, 9, 24, 'Juego de tenis', 'Partido casual entre amigos', '2025-10-04', '07:00:00', 4, 12, 0, '08:30:00'),
	(68, 6, 9, 25, 'Tenis competitivo', 'Ronda de práctica', '2025-10-05', '18:00:00', 3, 12, 0, '19:30:00'),
	(69, 7, 9, 22, 'Tenis recreativo', 'Sesión tranquila', '2025-10-06', '16:00:00', 4, 11, 0, '17:30:00'),
	(70, 8, 9, 23, 'Clínica de tenis', 'Trabajo técnico', '2025-10-07', '10:00:00', 4, 12, 0, '12:00:00'),
	(71, 9, 10, 24, 'Microfútbol rápido', 'Juego de alta intensidad', '2025-10-08', '19:00:00', 9, 12, 0, '20:30:00'),
	(72, 9, 2, 25, 'Baloncesto recreativo', 'Partido entre usuarios', '2025-10-09', '14:00:00', 9, 12, 0, '15:30:00'),
	(73, 10, 2, 22, 'Entrenamiento de baloncesto', 'Práctica técnica', '2025-10-10', '17:00:00', 8, 12, 0, '19:00:00'),
	(74, 11, 2, 23, 'Baloncesto competitivo', 'Scrimmage interno', '2025-10-11', '11:00:00', 10, 12, 0, '13:00:00'),
	(75, 12, 10, 24, 'Microfútbol mixto', 'Jornada recreativa', '2025-10-12', '09:00:00', 9, 12, 0, '10:30:00'),
	(76, 14, 5, 25, 'Natación libre', 'Práctica personal', '2025-10-13', '07:00:00', 27, 12, 0, '08:30:00'),
	(77, 15, 11, 22, 'Entrenamiento de atletismo', 'Trabajo en pista', '2025-10-14', '06:00:00', 6, 12, 0, '07:00:00'),
	(78, 16, 1, 23, 'Partido de fútbol', 'Práctica matutina', '2025-10-15', '08:00:00', 21, 12, 0, '10:00:00'),
	(79, 17, 10, 24, 'Microfútbol recreativo', 'Juego entre amigos', '2025-10-16', '20:00:00', 9, 11, 0, '21:30:00'),
	(80, 18, 10, 25, 'Microfútbol', 'Partido nocturno', '2025-10-17', '18:00:00', 8, 12, 0, '20:00:00'),
	(81, 19, 3, 22, 'Voleibol', 'Juego amistoso', '2025-10-18', '15:00:00', 10, 12, 0, '17:00:00'),
	(82, 20, 12, 23, 'Voleibol playa', 'Encuentro recreativo', '2025-10-19', '09:00:00', 7, 12, 0, '11:00:00'),
	(83, 21, 14, 24, 'Entrenamiento físico', 'Circuito básico', '2025-10-20', '07:00:00', 18, 12, 0, '08:30:00'),
	(84, 23, 13, 25, 'Sesión de baile', 'Clase abierta', '2025-10-21', '17:00:00', 29, 12, 0, '18:30:00'),
	(85, 1, 1, 22, 'Fútbol táctico', 'Trabajo de posesión', '2025-10-22', '19:00:00', 22, 12, 0, '21:00:00'),
	(86, 1, 6, 23, 'Rugby defensivo', 'Entrenamiento técnico', '2025-10-23', '20:00:00', 29, 11, 0, '22:00:00'),
	(87, 5, 9, 24, 'Tenis competitivo', 'Partido de preparación', '2025-10-24', '08:00:00', 4, 12, 0, '09:30:00'),
	(88, 6, 9, 25, 'Tenis recreativo', 'Golpes básicos', '2025-10-25', '10:00:00', 3, 12, 0, '11:30:00'),
	(89, 7, 9, 22, 'Tenis sencillo', 'Juego casual', '2025-10-26', '15:00:00', 4, 12, 0, '16:30:00'),
	(90, 8, 9, 23, 'Tenis en parejas', 'Partido amistoso', '2025-10-27', '18:00:00', 4, 12, 0, '19:30:00'),
	(91, 9, 10, 24, 'Microfútbol', 'Juego amistoso', '2025-10-28', '06:00:00', 8, 11, 0, '07:30:00'),
	(92, 9, 2, 25, 'Baloncesto mixto', 'Juego recreativo', '2025-10-29', '20:00:00', 9, 12, 0, '21:30:00'),
	(93, 10, 2, 22, 'Baloncesto juvenil', 'Entrenamiento', '2025-10-30', '17:00:00', 10, 12, 0, '19:00:00'),
	(94, 11, 2, 23, 'Baloncesto avanzado', 'Scrimmage', '2025-10-31', '08:00:00', 9, 12, 0, '10:00:00'),
	(95, 12, 10, 24, 'Microfútbol', 'Juego recreativo', '2025-11-01', '10:00:00', 10, 12, 0, '12:00:00'),
	(96, 14, 5, 25, 'Natación entrenamiento', 'Trabajo aeróbico', '2025-11-02', '07:00:00', 30, 12, 0, '08:30:00'),
	(97, 15, 11, 22, 'Atletismo', 'Ritmos en pista', '2025-11-03', '06:00:00', 8, 12, 0, '07:00:00'),
	(98, 16, 1, 23, 'Fútbol recreativo', 'Juego casual', '2025-11-04', '09:00:00', 22, 12, 0, '11:00:00'),
	(99, 17, 10, 24, 'Microfútbol', 'Juego nocturno', '2025-11-05', '19:00:00', 9, 11, 0, '21:00:00'),
	(100, 18, 10, 25, 'Microfútbol', 'Entrenamiento', '2025-11-06', '20:00:00', 10, 12, 0, '22:00:00'),
	(101, 19, 3, 22, 'Voleibol', 'Juego amistoso', '2025-11-07', '14:00:00', 12, 12, 0, '16:00:00'),
	(102, 20, 12, 23, 'Voleibol playa', 'Práctica recreativa', '2025-11-08', '09:00:00', 8, 12, 0, '11:00:00'),
	(103, 21, 14, 24, 'Entrenamiento físico', 'Circuito general', '2025-11-09', '08:00:00', 19, 12, 0, '09:30:00'),
	(104, 23, 13, 25, 'Baile', 'Sesión abierta', '2025-11-10', '18:00:00', 30, 10, 0, '19:30:00'),
	(105, 1, 1, 22, 'Partido de fútbol', 'Jornada amistosa', '2025-11-11', '16:00:00', 20, 10, 0, '18:00:00'),
	(106, 1, 6, 23, 'Rugby táctico', 'Enfoque en defensa', '2025-11-12', '17:00:00', 27, 12, 0, '19:00:00'),
	(107, 5, 9, 24, 'Tenis uno a uno', 'Juego técnico', '2025-11-13', '07:00:00', 4, 10, 0, '08:30:00'),
	(108, 6, 9, 25, 'Tenis doble', 'Partido amistoso', '2025-11-14', '08:00:00', 4, 10, 0, '09:30:00'),
	(109, 7, 9, 22, 'Tenis suave', 'Juego recreativo', '2025-11-15', '11:00:00', 3, 11, 0, '12:30:00'),
	(110, 8, 9, 23, 'Tenis intermedio', 'Juego controlado', '2025-11-16', '17:00:00', 4, 12, 0, '18:30:00'),
	(111, 9, 10, 24, 'Microfútbol rápido', 'Juego ágil', '2025-11-17', '20:00:00', 10, 10, 0, '21:30:00'),
	(112, 9, 2, 25, 'Baloncesto', 'Partido amistoso', '2025-11-18', '19:00:00', 8, 12, 0, '21:00:00'),
	(113, 10, 2, 22, 'Baloncesto mixto', 'Juego recreativo', '2025-11-19', '15:00:00', 10, 10, 0, '17:00:00'),
	(114, 11, 2, 23, 'Baloncesto avanzado', 'Entrenamiento', '2025-11-20', '18:00:00', 9, 11, 0, '20:00:00'),
	(115, 12, 10, 24, 'Microfútbol', 'Entrenamiento ligero', '2025-11-21', '06:00:00', 10, 12, 0, '07:30:00'),
	(116, 14, 5, 25, 'Natación libre', 'Sesión personal', '2025-11-22', '09:00:00', 28, 10, 0, '10:30:00'),
	(117, 15, 11, 22, 'Atletismo', 'Técnica de carrera', '2025-11-23', '08:00:00', 7, 12, 0, '09:00:00'),
	(118, 16, 1, 23, 'Fútbol técnico', 'Práctica', '2025-11-24', '17:00:00', 21, 10, 0, '19:00:00'),
	(119, 17, 10, 24, 'Microfútbol', 'Juego recreativo', '2025-11-25', '20:00:00', 10, 11, 0, '22:00:00'),
	(120, 18, 10, 25, 'Microfútbol', 'Entrenamiento', '2025-11-26', '19:00:00', 8, 12, 0, '21:00:00'),
	(121, 19, 3, 22, 'Voleibol', 'Juego mixto', '2025-11-27', '14:00:00', 9, 10, 0, '16:00:00'),
	(122, 20, 12, 23, 'Voleibol playa', 'Juego amistoso', '2025-11-28', '10:00:00', 8, 10, 0, '12:00:00'),
	(123, 21, 14, 24, 'Entrenamiento físico', 'Resistencia general', '2025-11-29', '07:00:00', 18, 12, 0, '08:30:00'),
	(124, 23, 13, 25, 'Baile', 'Sesión grupal', '2025-11-30', '18:00:00', 30, 11, 0, '19:30:00'),
	(125, 1, 1, 22, 'Fútbol matutino', 'Juego recreativo', '2025-10-01', '07:00:00', 22, 12, 0, '09:00:00'),
	(126, 1, 6, 23, 'Rugby apertura', 'Entrenamiento', '2025-10-02', '16:00:00', 30, 12, 0, '18:00:00'),
	(127, 5, 9, 24, 'Tenis suave', 'Práctica ligera', '2025-10-03', '11:00:00', 4, 11, 0, '12:30:00'),
	(128, 6, 9, 25, 'Tenis avanzado', 'Juego técnico', '2025-10-04', '17:00:00', 3, 12, 0, '18:30:00'),
	(129, 7, 9, 22, 'Tenis recreativo', 'Partido amistoso', '2025-10-05', '15:00:00', 4, 12, 0, '16:30:00'),
	(130, 8, 9, 23, 'Tenis competitivo', 'Partido libre', '2025-10-06', '08:00:00', 4, 12, 0, '09:30:00'),
	(131, 9, 10, 24, 'Microfútbol rápido', 'Juego intenso', '2025-10-07', '19:00:00', 9, 12, 0, '20:30:00'),
	(132, 9, 2, 25, 'Baloncesto', 'Scrimmage', '2025-10-08', '20:00:00', 10, 12, 0, '21:30:00'),
	(133, 10, 2, 22, 'Baloncesto mixto', 'Juego libre', '2025-10-09', '17:00:00', 8, 11, 0, '19:00:00'),
	(134, 11, 2, 23, 'Baloncesto avanzado', 'Entrenamiento fuerte', '2025-10-10', '08:00:00', 10, 12, 0, '10:00:00'),
	(135, 12, 10, 24, 'Microfútbol', 'Partido amistoso', '2025-10-11', '13:00:00', 9, 12, 0, '14:30:00'),
	(136, 14, 5, 25, 'Natación', 'Sesión libre', '2025-10-12', '07:00:00', 28, 12, 0, '08:30:00'),
	(137, 15, 11, 22, 'Atletismo', 'Trabajo de velocidad', '2025-10-13', '06:00:00', 7, 12, 0, '07:00:00'),
	(138, 16, 1, 23, 'Fútbol mixto', 'Juego recreativo', '2025-10-14', '09:00:00', 22, 12, 0, '11:00:00'),
	(139, 17, 10, 24, 'Microfútbol', 'Juego nocturno', '2025-10-15', '19:00:00', 10, 12, 0, '21:00:00'),
	(140, 18, 10, 25, 'Microfútbol', 'Entrenamiento', '2025-10-16', '18:00:00', 9, 11, 0, '20:00:00'),
	(141, 19, 3, 22, 'Voleibol', 'Juego amistoso', '2025-10-17', '14:00:00', 11, 12, 0, '16:00:00'),
	(142, 20, 12, 23, 'Voleibol playa', 'Juego recreativo', '2025-10-18', '10:00:00', 8, 12, 0, '12:00:00'),
	(143, 21, 14, 24, 'Entrenamiento físico', 'Sesión general', '2025-10-19', '08:00:00', 20, 11, 0, '09:30:00'),
	(144, 23, 13, 25, 'Baile coreográfico', 'Clase grupal', '2025-10-20', '18:00:00', 29, 12, 0, '19:30:00'),
	(145, 1, 1, 22, 'Fútbol', 'Juego recreativo', '2025-10-21', '07:00:00', 21, 12, 0, '09:00:00'),
	(146, 1, 6, 23, 'Rugby', 'Práctica general', '2025-10-22', '17:00:00', 28, 11, 0, '19:00:00'),
	(147, 5, 9, 24, 'Tenis matutino', 'Juego suave', '2025-10-23', '06:00:00', 4, 12, 0, '07:30:00'),
	(148, 6, 9, 25, 'Tenis recreativo', 'Juego libre', '2025-10-24', '09:00:00', 3, 12, 0, '10:30:00'),
	(149, 7, 9, 22, 'Tenis simple', 'Partido amistoso', '2025-10-25', '16:00:00', 4, 12, 0, '17:30:00'),
	(150, 8, 9, 23, 'Tenis dobles', 'Partido', '2025-10-26', '18:00:00', 4, 12, 0, '19:30:00'),
	(151, 9, 10, 24, 'Microfútbol', 'Entrenamiento', '2025-10-27', '20:00:00', 9, 12, 0, '21:30:00'),
	(152, 9, 2, 25, 'Baloncesto libre', 'Juego recreativo', '2025-10-28', '19:00:00', 10, 11, 0, '21:00:00'),
	(153, 10, 2, 22, 'Baloncesto', 'Entrenamiento', '2025-10-29', '17:00:00', 8, 12, 0, '19:00:00'),
	(154, 11, 2, 23, 'Baloncesto técnico', 'Scrimmage', '2025-10-30', '08:00:00', 10, 12, 0, '10:00:00'),
	(155, 12, 10, 24, 'Microfútbol', 'Juego rápido', '2025-10-31', '14:00:00', 10, 12, 0, '15:30:00'),
	(156, 1, 1, 22, 'Fútbol recreativo', 'Juego amistoso', '2025-11-01', '07:00:00', 22, 12, 0, '09:00:00'),
	(157, 1, 6, 23, 'Rugby matutino', 'Entrenamiento', '2025-11-01', '09:30:00', 30, 12, 0, '11:30:00'),
	(158, 5, 9, 24, 'Tenis entre amigos', 'Partido casual', '2025-11-01', '15:00:00', 4, 11, 0, '16:30:00'),
	(159, 6, 9, 25, 'Tenis avanzado', 'Práctica técnica', '2025-11-01', '18:00:00', 3, 12, 0, '19:30:00'),
	(160, 7, 9, 22, 'Tenis suave', 'Juego tranquilo', '2025-11-01', '20:00:00', 4, 12, 0, '21:30:00'),
	(161, 8, 9, 23, 'Tenis dobles', 'Partido amistoso', '2025-11-02', '08:00:00', 4, 12, 0, '09:30:00'),
	(162, 9, 10, 24, 'Microfútbol rápido', 'Juego recreativo', '2025-11-02', '10:00:00', 9, 11, 0, '11:30:00'),
	(163, 9, 2, 25, 'Baloncesto', 'Juego amistoso', '2025-11-02', '13:00:00', 9, 12, 0, '14:30:00'),
	(164, 10, 2, 22, 'Baloncesto mixto', 'Partido informal', '2025-11-02', '16:00:00', 10, 12, 0, '18:00:00'),
	(165, 11, 2, 23, 'Baloncesto técnico', 'Scrimmage', '2025-11-02', '18:00:00', 10, 12, 0, '20:00:00'),
	(166, 12, 10, 24, 'Microfútbol', 'Entrenamiento', '2025-11-03', '06:00:00', 9, 12, 0, '07:30:00'),
	(167, 14, 5, 25, 'Natación libre', 'Trabajo personal', '2025-11-03', '08:00:00', 30, 12, 0, '09:30:00'),
	(168, 15, 11, 22, 'Atletismo', 'Velocidad', '2025-11-03', '15:00:00', 7, 11, 0, '16:00:00'),
	(169, 16, 1, 23, 'Fútbol', 'Entrenamiento', '2025-11-03', '19:00:00', 22, 12, 0, '21:00:00'),
	(170, 17, 10, 24, 'Microfútbol', 'Partido recreativo', '2025-11-04', '08:00:00', 10, 12, 0, '09:30:00'),
	(171, 18, 10, 25, 'Microfútbol', 'Juego técnico', '2025-11-04', '13:00:00', 9, 12, 0, '14:30:00'),
	(172, 19, 3, 22, 'Voleibol', 'Juego amistoso', '2025-11-04', '17:00:00', 9, 12, 0, '19:00:00'),
	(173, 20, 12, 23, 'Voleibol playa', 'Juego recreativo', '2025-11-04', '20:00:00', 8, 11, 0, '22:00:00'),
	(174, 21, 14, 24, 'Entrenamiento físico', 'Sesión intensa', '2025-11-05', '07:00:00', 18, 12, 0, '08:30:00'),
	(175, 23, 13, 25, 'Baile', 'Clase libre', '2025-11-05', '18:00:00', 29, 12, 0, '19:30:00'),
	(176, 1, 1, 22, 'Partido de fútbol', 'Encuentro recreativo', '2025-11-05', '20:00:00', 21, 12, 0, '22:00:00'),
	(177, 1, 6, 23, 'Rugby nocturno', 'Juego táctico', '2025-11-06', '18:00:00', 28, 11, 0, '20:00:00'),
	(178, 5, 9, 24, 'Tenis', 'Juego técnico', '2025-11-06', '07:00:00', 4, 12, 0, '08:30:00'),
	(179, 6, 9, 25, 'Tenis suave', 'Partido', '2025-11-06', '17:00:00', 3, 12, 0, '18:30:00'),
	(180, 7, 9, 22, 'Tenis', 'Juego amistoso', '2025-11-07', '09:00:00', 4, 12, 0, '10:30:00'),
	(181, 8, 9, 23, 'Tenis recreativo', 'Juego suave', '2025-11-07', '15:00:00', 4, 12, 0, '16:30:00'),
	(182, 9, 10, 24, 'Microfútbol', 'Partido', '2025-11-07', '19:00:00', 10, 12, 0, '20:30:00'),
	(183, 9, 2, 25, 'Baloncesto', 'Practica', '2025-11-07', '20:00:00', 10, 11, 0, '22:00:00'),
	(184, 10, 2, 22, 'Baloncesto', 'Juego amistoso', '2025-11-08', '06:00:00', 9, 12, 0, '07:30:00'),
	(185, 11, 2, 23, 'Baloncesto avanzado', 'Scrimmage', '2025-11-08', '08:00:00', 9, 12, 0, '10:00:00'),
	(186, 12, 10, 24, 'Microfútbol', 'Juego rápido', '2025-11-08', '10:00:00', 9, 12, 0, '11:30:00'),
	(187, 14, 5, 25, 'Natación libre', 'Trabajo suave', '2025-11-08', '15:00:00', 30, 11, 0, '16:30:00'),
	(188, 15, 11, 22, 'Atletismo', 'Ritmos de carrera', '2025-11-08', '16:00:00', 8, 12, 0, '17:00:00'),
	(189, 16, 1, 23, 'Fútbol', 'Entrenamiento recreativo', '2025-11-08', '18:00:00', 22, 12, 0, '20:00:00'),
	(190, 17, 10, 24, 'Microfútbol', 'Partido', '2025-11-09', '08:00:00', 9, 12, 0, '09:30:00'),
	(191, 18, 10, 25, 'Microfútbol', 'Juego libre', '2025-11-09', '11:00:00', 8, 11, 0, '12:30:00'),
	(192, 19, 3, 22, 'Voleibol', 'Partido técnico', '2025-11-09', '14:00:00', 11, 12, 0, '16:00:00'),
	(193, 20, 12, 23, 'Voleibol playa', 'Juego recreativo', '2025-11-09', '17:00:00', 8, 12, 0, '19:00:00'),
	(194, 21, 14, 24, 'Entrenamiento físico', 'Resistencia', '2025-11-10', '06:00:00', 18, 10, 0, '07:30:00'),
	(195, 23, 13, 25, 'Baile', 'Sesión general', '2025-11-10', '18:00:00', 29, 11, 0, '19:30:00'),
	(196, 1, 1, 22, 'Fútbol libre', 'Partido entre amigos', '2025-11-11', '07:00:00', 20, 12, 0, '09:00:00'),
	(197, 1, 6, 23, 'Rugby recreativo', 'Entrenamiento', '2025-11-11', '09:00:00', 30, 10, 0, '11:00:00'),
	(198, 5, 9, 24, 'Tenis práctico', 'Juego suave', '2025-11-11', '14:00:00', 4, 11, 0, '15:30:00'),
	(199, 6, 9, 25, 'Tenis', 'Entrenamiento', '2025-11-11', '18:00:00', 3, 12, 0, '19:30:00'),
	(200, 7, 9, 22, 'Tenis matutino', 'Juego libre', '2025-11-12', '07:00:00', 4, 10, 0, '08:30:00'),
	(201, 8, 9, 23, 'Tenis intermedio', 'Partido', '2025-11-12', '16:00:00', 4, 11, 0, '17:30:00'),
	(202, 9, 10, 24, 'Microfútbol', 'Juego recreativo', '2025-11-12', '19:00:00', 10, 10, 0, '20:30:00'),
	(203, 9, 2, 25, 'Baloncesto', 'Scrimmage', '2025-11-12', '20:00:00', 9, 12, 0, '21:30:00'),
	(204, 10, 2, 22, 'Baloncesto', 'Juego amistoso', '2025-11-13', '06:00:00', 8, 10, 0, '07:30:00'),
	(205, 11, 2, 23, 'Baloncesto técnico', 'Entrenamiento', '2025-11-13', '09:00:00', 10, 12, 0, '11:00:00'),
	(206, 12, 10, 24, 'Microfútbol', 'Partido recreativo', '2025-11-13', '11:00:00', 10, 10, 0, '12:30:00'),
	(207, 14, 5, 25, 'Natación', 'Sesión libre', '2025-11-13', '15:00:00', 30, 11, 0, '16:30:00'),
	(208, 15, 11, 22, 'Atletismo', 'Técnica de carrera', '2025-11-13', '16:00:00', 8, 10, 0, '17:00:00'),
	(209, 16, 1, 23, 'Fútbol mixto', 'Juego libre', '2025-11-13', '18:00:00', 21, 12, 0, '20:00:00'),
	(210, 17, 10, 24, 'Microfútbol', 'Entrenamiento', '2025-11-14', '07:00:00', 10, 10, 0, '08:30:00'),
	(211, 18, 10, 25, 'Microfútbol', 'Juego recreativo', '2025-11-14', '10:00:00', 9, 11, 0, '11:30:00'),
	(212, 19, 3, 22, 'Voleibol', 'Juego libre', '2025-11-14', '13:00:00', 12, 10, 0, '15:00:00'),
	(213, 20, 12, 23, 'Voleibol playa', 'Partido', '2025-11-14', '16:00:00', 7, 12, 0, '18:00:00'),
	(214, 21, 14, 24, 'Entrenamiento físico', 'Fuerza general', '2025-11-14', '20:00:00', 18, 10, 0, '21:30:00'),
	(215, 23, 13, 25, 'Baile', 'Clase recreativa', '2025-11-14', '18:00:00', 30, 11, 0, '19:30:00'),
	(216, 1, 1, 22, 'Fútbol competitivo', 'Partido amistoso', '2025-11-15', '09:00:00', 22, 10, 0, '11:00:00'),
	(217, 1, 6, 23, 'Rugby físico', 'Entrenamiento', '2025-11-15', '11:00:00', 29, 12, 0, '13:00:00'),
	(218, 5, 9, 24, 'Tenis libre', 'Juego ligero', '2025-11-15', '14:00:00', 4, 10, 0, '15:30:00'),
	(219, 6, 9, 25, 'Tenis controlado', 'Juego técnico', '2025-11-15', '18:00:00', 4, 11, 0, '19:30:00'),
	(220, 7, 9, 22, 'Tenis doble', 'Partido amistoso', '2025-11-16', '07:00:00', 4, 10, 0, '08:30:00'),
	(221, 8, 9, 23, 'Tenis recreativo', 'Juego suave', '2025-11-16', '09:00:00', 4, 12, 0, '10:30:00'),
	(222, 9, 10, 24, 'Microfútbol', 'Juego rápido', '2025-11-16', '11:00:00', 8, 10, 0, '12:30:00'),
	(223, 9, 2, 25, 'Baloncesto recreativo', 'Juego libre', '2025-11-16', '16:00:00', 9, 11, 0, '17:30:00'),
	(224, 10, 2, 22, 'Baloncesto', 'Entrenamiento', '2025-11-16', '18:00:00', 8, 10, 0, '20:00:00'),
	(225, 11, 2, 23, 'Baloncesto avanzado', 'Scrimmage', '2025-11-16', '20:00:00', 9, 12, 0, '22:00:00'),
	(226, 12, 10, 24, 'Microfútbol', 'Juego intenso', '2025-11-17', '07:00:00', 10, 10, 0, '08:30:00'),
	(227, 14, 5, 25, 'Natación libre', 'Trabajo aeróbico', '2025-11-17', '09:00:00', 29, 11, 0, '10:30:00'),
	(228, 15, 11, 22, 'Atletismo', 'Series de velocidad', '2025-11-17', '16:00:00', 7, 12, 0, '17:00:00'),
	(229, 16, 1, 23, 'Fútbol', 'Scrimmage recreativo', '2025-11-17', '18:00:00', 22, 10, 0, '20:00:00'),
	(230, 17, 10, 24, 'Microfútbol', 'Entrenamiento nocturno', '2025-11-17', '20:00:00', 9, 11, 0, '21:30:00'),
	(231, 18, 10, 25, 'Microfútbol', 'Juego libre', '2025-11-18', '07:00:00', 8, 12, 0, '08:30:00'),
	(232, 19, 3, 22, 'Voleibol', 'Juego amistoso', '2025-11-18', '09:00:00', 11, 10, 0, '11:00:00'),
	(233, 20, 12, 23, 'Voleibol playa', 'Partido casual', '2025-11-18', '14:00:00', 8, 10, 0, '16:00:00'),
	(234, 21, 14, 24, 'Entrenamiento físico', 'Circuito', '2025-11-18', '19:00:00', 19, 12, 0, '20:30:00'),
	(235, 23, 13, 25, 'Baile', 'Coreografía libre', '2025-11-18', '18:00:00', 30, 10, 0, '19:30:00'),
	(236, 1, 1, 22, 'Fútbol táctico', 'Trabajo de posesión', '2025-11-19', '07:00:00', 21, 10, 0, '09:00:00'),
	(237, 1, 6, 23, 'Rugby defensivo', 'Técnica y control', '2025-11-19', '09:00:00', 29, 12, 0, '11:00:00'),
	(238, 5, 9, 24, 'Tenis recreativo', 'Juego suave', '2025-11-19', '15:00:00', 4, 11, 0, '16:30:00'),
	(239, 6, 9, 25, 'Tenis competitivo', 'Práctica intensa', '2025-11-19', '18:00:00', 3, 10, 0, '19:30:00'),
	(240, 7, 9, 22, 'Tenis matutino', 'Juego amistoso', '2025-11-20', '08:00:00', 4, 10, 0, '09:30:00'),
	(241, 8, 9, 23, 'Tenis dobles', 'Partido casual', '2025-11-20', '16:00:00', 4, 12, 0, '17:30:00'),
	(242, 9, 10, 24, 'Microfútbol', 'Juego recreativo', '2025-11-20', '19:00:00', 9, 11, 0, '20:30:00'),
	(243, 9, 2, 25, 'Baloncesto', 'Juego competitivo', '2025-11-20', '20:00:00', 10, 10, 0, '22:00:00'),
	(244, 10, 2, 22, 'Baloncesto mixto', 'Juego libre', '2025-11-21', '06:30:00', 8, 12, 0, '08:00:00'),
	(245, 11, 2, 23, 'Baloncesto avanzado', 'Scrimmage', '2025-11-21', '09:00:00', 9, 10, 0, '11:00:00'),
	(246, 12, 10, 24, 'Microfútbol rápido', 'Entrenamiento', '2025-11-21', '11:00:00', 10, 12, 0, '12:30:00'),
	(247, 14, 5, 25, 'Natación técnica', 'Sesión aeróbica', '2025-11-21', '15:00:00', 29, 10, 0, '16:30:00'),
	(248, 15, 11, 22, 'Atletismo', 'Ritmos medios', '2025-11-21', '17:00:00', 7, 11, 0, '18:00:00'),
	(249, 16, 1, 23, 'Fútbol recreativo', 'Juego tranquilo', '2025-11-21', '19:00:00', 22, 12, 0, '21:00:00'),
	(250, 17, 10, 24, 'Microfútbol', 'Partido amistoso', '2025-11-22', '07:00:00', 10, 10, 0, '08:30:00'),
	(251, 18, 10, 25, 'Microfútbol', 'Juego libre', '2025-11-22', '10:00:00', 9, 11, 0, '11:30:00'),
	(252, 19, 3, 22, 'Voleibol mixto', 'Juego recreativo', '2025-11-22', '13:00:00', 11, 10, 0, '15:00:00'),
	(253, 20, 12, 23, 'Voleibol playa', 'Sesión abierta', '2025-11-22', '16:00:00', 8, 12, 0, '18:00:00'),
	(254, 21, 14, 24, 'Entrenamiento físico', 'Fuerza y circuito', '2025-11-22', '19:00:00', 19, 10, 0, '20:30:00'),
	(255, 23, 13, 25, 'Baile libre', 'Clase grupal', '2025-11-22', '18:00:00', 29, 11, 0, '19:30:00'),
	(256, 1, 1, 22, 'Fútbol de viernes', 'Juego recreativo', '2025-11-23', '07:00:00', 20, 10, 0, '09:00:00'),
	(257, 1, 6, 23, 'Rugby recreativo', 'Entrenamiento general', '2025-11-23', '09:00:00', 30, 12, 0, '11:00:00'),
	(258, 5, 9, 24, 'Tenis ligero', 'Juego técnico', '2025-11-23', '14:00:00', 4, 11, 0, '15:30:00'),
	(259, 6, 9, 25, 'Tenis entrenamiento', 'Sesión personal', '2025-11-23', '18:00:00', 3, 10, 0, '19:30:00'),
	(260, 9, 10, 22, 'Microfútbol', 'Juego recreativo', '2025-11-24', '19:00:00', 10, 12, 0, '21:00:00'),
	(261, 9, 2, 23, 'Baloncesto', 'Juego amistoso', '2025-11-24', '20:00:00', 9, 10, 0, '22:00:00'),
	(262, 10, 2, 24, 'Baloncesto mixto', 'Scrimmage suave', '2025-11-24', '17:00:00', 10, 11, 0, '19:00:00'),
	(263, 11, 2, 25, 'Baloncesto avanzado', 'Táctico', '2025-11-24', '18:00:00', 9, 12, 0, '20:00:00'),
	(264, 12, 10, 22, 'Microfútbol', 'Partido rápido', '2025-11-25', '08:00:00', 10, 10, 0, '09:30:00'),
	(265, 14, 5, 23, 'Natación', 'Trabajo libre', '2025-11-25', '09:00:00', 28, 11, 0, '10:30:00');

-- Volcando estructura para evento sportmeet.ev_refresh_probabilidades
DELIMITER //
CREATE EVENT `ev_refresh_probabilidades` ON SCHEDULE EVERY 1 WEEK STARTS '2025-11-09 23:08:17' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    /* Actualizar instalación */
    TRUNCATE TABLE vm_eventos_por_instalacion;
    INSERT INTO vm_eventos_por_instalacion
    SELECT 
        Id_instalacion,
        SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 11 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END)
            / SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END)
    FROM eventos
    WHERE Id_estado IN (11, 12)
    GROUP BY Id_instalacion;

    /* Actualizar deporte */
    TRUNCATE TABLE vm_eventos_por_deporte;
    INSERT INTO vm_eventos_por_deporte
    SELECT 
        Id_deporte,
        SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 11 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END)
            / SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END)
    FROM eventos
    WHERE Id_estado IN (11, 12)
    GROUP BY Id_deporte;

    /* Actualizar día de la semana */
    TRUNCATE TABLE vm_eventos_por_dia_semana;
    INSERT INTO vm_eventos_por_dia_semana
    SELECT 
        DAYOFWEEK(Fecha),
        SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 11 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END)
            / SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END)
    FROM eventos
    WHERE Id_estado IN (11, 12)
    GROUP BY DAYOFWEEK(Fecha);

    /* Actualizar franja horaria */
    TRUNCATE TABLE vm_eventos_por_franja_horaria;
    INSERT INTO vm_eventos_por_franja_horaria
    SELECT 
        CASE
            WHEN HOUR(Hora) BETWEEN 6 AND 11 THEN 'mañana'
            WHEN HOUR(Hora) BETWEEN 12 AND 17 THEN 'tarde'
            WHEN HOUR(Hora) BETWEEN 18 AND 21 THEN 'noche'
            ELSE 'fuera_rango'
        END,
        SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 11 THEN 1 ELSE 0 END),
        SUM(CASE WHEN Id_estado = 12 THEN 1 ELSE 0 END)
            / SUM(CASE WHEN Id_estado IN (11, 12) THEN 1 ELSE 0 END)
    FROM eventos
    WHERE Id_estado IN (11, 12)
    GROUP BY franja;
END//
DELIMITER ;

-- Volcando estructura para tabla sportmeet.instalacion_deportiva
CREATE TABLE IF NOT EXISTS `instalacion_deportiva` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Ubicacion` varchar(200) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.instalacion_deportiva: ~20 rows (aproximadamente)
INSERT INTO `instalacion_deportiva` (`Id`, `Nombre`, `Ubicacion`) VALUES
	(1, 'Cancha sintética', 'Entre el coliseo y el bloque 28'),
	(5, 'Cancha de tenis 1', 'Entre el coliseo y el bloque 20'),
	(6, 'Cancha de tenis 2', 'Entre el coliseo y el bloque 20'),
	(7, 'Cancha de tenis 3', 'Entre el coliseo y el bloque 20'),
	(8, 'Cancha de tenis 4', 'Entre el coliseo y el bloque 20'),
	(9, 'Cancha coliseo', 'Bloque 27 (coliseo)'),
	(10, 'Placa polideportiva 1', 'Entre el coliseo y la pista atlética'),
	(11, 'Placa polideportiva 2', 'Entre el coliseo y la pista atlética'),
	(12, 'Placa polideportiva 3', 'Entre el coliseo y la pista atlética'),
	(13, 'Piscina de clavados', 'Entre el bloque 26 y las placas polideportivas'),
	(14, 'Pincina olímpica', 'Entre el bloque 26 y las placas polideportivas'),
	(15, 'Pista atlética', 'Entre el bloque 26 y las placas polideportivas'),
	(16, 'Cancha pista de atletismo', 'Entre el bloque 26 y las placas polideportivas'),
	(17, 'Cancha de micro 1', 'Debajo de las vías del metro'),
	(18, 'Cancha de micro 2', 'Debajo de las vías del metro'),
	(19, 'Cancha de voleibol', 'Debajo de las vías del metro'),
	(20, 'Cancha de voleibol playa', 'Entre la pista de atletismo y la Vía Circunvalar'),
	(21, 'Gimnasio al aire libre', 'Entre la pista de atletismo y la Vía Circunvalar'),
	(23, 'Teatro al aire libre (TAL)', 'Entre el bloque 4 y el bloque 2');

-- Volcando estructura para tabla sportmeet.notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_usuario` int(11) NOT NULL DEFAULT 0,
  `Tipo` varchar(50) NOT NULL COMMENT 'Ej: SOLICITUD_RECIBIDA, AMISTAD_ACEPTADA',
  `Contenido` varchar(255) NOT NULL COMMENT 'El mensaje a mostrar al usuario',
  `Referencia_id` int(10) unsigned DEFAULT NULL COMMENT 'ID de la tabla relacionada (ej: id de la amistad, id del evento)',
  `Leida` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=No leída, 1=Leída',
  `Fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`),
  KEY `Id_usuario` (`Id_usuario`),
  KEY `idx_notif_leida` (`Leida`),
  CONSTRAINT `FK_notificaciones_usuarios` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.notificaciones: ~29 rows (aproximadamente)
INSERT INTO `notificaciones` (`Id`, `Id_usuario`, `Tipo`, `Contenido`, `Referencia_id`, `Leida`, `Fecha_creacion`) VALUES
	(9, 22, 'AMISTAD_ACEPTADA', 'Un usuario ha aceptado tu solicitud de amistad.', 11, 1, '2025-11-05 16:31:49'),
	(10, 23, 'SOLICITUD_RECIBIDA', 'Karen Cardona te ha enviado una solicitud de amistad.', 12, 1, '2025-11-05 16:47:25'),
	(11, 22, 'AMISTAD_ACEPTADA', 'Un usuario ha aceptado tu solicitud de amistad.', 12, 1, '2025-11-05 16:48:30'),
	(12, 22, 'AMISTAD_ACEPTADA', 'KAREN CARDONA GUTIERREZ ha aceptado tu solicitud de amistad.', 12, 1, '2025-11-05 17:06:56'),
	(13, 22, 'AMISTAD_ACEPTADA', 'KAREN CARDONA GUTIERREZ ha aceptado tu solicitud de amistad.', 12, 1, '2025-11-05 17:10:16'),
	(14, 23, 'SOLICITUD_RECIBIDA', 'Karen Cardona te ha enviado una solicitud de amistad.', 13, 1, '2025-11-05 17:29:33'),
	(15, 22, 'AMISTAD_ACEPTADA', 'KAREN CARDONA GUTIERREZ ha aceptado tu solicitud de amistad.', 13, 1, '2025-11-05 17:29:49'),
	(16, 23, 'SOLICITUD_RECIBIDA', 'Karen Cardona te ha enviado una solicitud de amistad.', 14, 1, '2025-11-05 17:30:38'),
	(17, 22, 'AMISTAD_ACEPTADA', 'KAREN CARDONA GUTIERREZ ha aceptado tu solicitud de amistad.', 14, 1, '2025-11-05 17:32:23'),
	(18, 22, 'AMISTAD_ACEPTADA', 'Karen Cardona Gutiérrez ha aceptado tu solicitud de amistad.', 14, 1, '2025-11-08 14:45:01'),
	(19, 23, 'EVENTO_CREADO', 'Tu amigo(a) Karen Cardona ha creado un nuevo evento: "partido". ¡Únete!', 59, 1, '2025-11-08 15:42:59'),
	(20, 22, 'EVENTO_RECORDATORIO', '¡El evento "partido" organizado por Karen Cardona comenzará en 30 minutos! Prepárate.', 59, 1, '2025-11-08 16:35:00'),
	(21, 23, 'EVENTO_RECORDATORIO', '¡El evento "partido" organizado por Karen Cardona comenzará en 30 minutos! Prepárate.', 59, 1, '2025-11-08 16:35:00'),
	(22, 22, 'EVENTO_RECORDATORIO', '¡Tu evento "partido" comenzará en 30 minutos!', 59, 1, '2025-11-08 18:25:00'),
	(23, 23, 'EVENTO_RECORDATORIO', '¡El evento "partido" organizado por Karen Cardona comenzará en 30 minutos! Prepárate.', 59, 1, '2025-11-08 18:25:00'),
	(24, 23, 'EVENTO_CREADO', 'Tu amigo(a) Karen Cardona ha creado un nuevo evento: "Partido de voleibol". ¡Únete!', 60, 1, '2025-11-08 23:15:16'),
	(25, 22, 'EVENTO_RECORDATORIO', '¡Tu evento "Partido de voleibol" comenzará en 30 minutos!', 60, 1, '2025-11-08 23:30:00'),
	(26, 23, 'EVENTO_RECORDATORIO', '¡El evento "Partido de voleibol" organizado por Karen Cardona comenzará en 30 minutos! Prepárate.', 60, 1, '2025-11-08 23:30:00'),
	(27, 22, 'EVENTO_CANCELADO', 'El evento "Partido de voleibol" al que estabas unido(a) ha sido cancelado por el organizador.', 60, 0, '2025-11-08 23:34:15'),
	(28, 23, 'EVENTO_CANCELADO', 'El evento "Partido de voleibol" al que estabas unido(a) ha sido cancelado por el organizador.', 60, 1, '2025-11-08 23:34:15'),
	(29, 22, 'EVENTO_CANCELADO', 'El evento "Partido de voleibol" al que estabas unido(a) ha sido cancelado por el organizador.', 60, 0, '2025-11-08 23:38:05'),
	(30, 23, 'EVENTO_CANCELADO', 'El evento "Partido de voleibol" al que estabas unido(a) ha sido cancelado por el organizador.', 60, 1, '2025-11-08 23:38:05'),
	(31, 23, 'EVENTO_CANCELADO', 'El evento "Clínica de Baloncesto Juvenil" al que estabas unido(a) ha sido cancelado por el organizador.', 48, 1, '2025-11-09 00:37:09'),
	(32, 22, 'EVENTO_CANCELADO', 'El evento "viernes" al que estabas unido(a) ha sido cancelado por el organizador.', 58, 0, '2025-11-09 00:41:35'),
	(33, 24, 'EVENTO_CANCELADO', 'El evento "a" al que estabas unido(a) ha sido cancelado por el organizador.', 61, 1, '2025-11-09 07:06:16'),
	(34, 23, 'SOLICITUD_RECIBIDA', 'andrés areiza te ha enviado una solicitud de amistad.', 15, 0, '2025-11-09 17:48:48'),
	(35, 24, 'SOLICITUD_RECIBIDA', 'andres areiza te ha enviado una solicitud de amistad.', 16, 1, '2025-11-09 17:50:04'),
	(36, 25, 'AMISTAD_ACEPTADA', 'andrés areiza ha aceptado tu solicitud de amistad.', 16, 0, '2025-11-09 17:50:28'),
	(37, 25, 'EVENTO_CREADO', 'Tu amigo(a) andrés areiza ha creado un nuevo evento: "donde están las gatas que tiran pa lante?". ¡Únete!', 64, 0, '2025-11-09 21:58:48');

-- Volcando estructura para tabla sportmeet.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.roles: ~2 rows (aproximadamente)
INSERT INTO `roles` (`Id`, `Nombre`) VALUES
	(1, 'admin'),
	(2, 'usuario');

-- Volcando estructura para tabla sportmeet.solicitudes_amistad
CREATE TABLE IF NOT EXISTS `solicitudes_amistad` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_usuario_1` int(11) NOT NULL,
  `Id_usuario_2` int(11) NOT NULL,
  `Id_estado` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_usuario_1` (`Id_usuario_1`,`Id_usuario_2`),
  KEY `Id_usuario_2` (`Id_usuario_2`),
  KEY `Id_estado` (`Id_estado`),
  CONSTRAINT `solicitudes_amistad_ibfk_1` FOREIGN KEY (`Id_usuario_1`) REFERENCES `usuarios` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_amistad_ibfk_2` FOREIGN KEY (`Id_usuario_2`) REFERENCES `usuarios` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_amistad_ibfk_3` FOREIGN KEY (`Id_estado`) REFERENCES `estados` (`Id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.solicitudes_amistad: ~3 rows (aproximadamente)
INSERT INTO `solicitudes_amistad` (`Id`, `Id_usuario_1`, `Id_usuario_2`, `Id_estado`) VALUES
	(14, 22, 23, 8),
	(15, 24, 23, 7),
	(16, 25, 24, 8);

-- Volcando estructura para tabla sportmeet.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Uid` varchar(100) DEFAULT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Telefono` varchar(25) DEFAULT NULL,
  `Activo` tinyint(4) NOT NULL DEFAULT 1,
  `Foto` text DEFAULT NULL,
  `Proveedor` varchar(50) DEFAULT NULL,
  `Creado_en` timestamp NULL DEFAULT current_timestamp(),
  `Fecha_reactivacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `Uid` (`Uid`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.usuarios: ~8 rows (aproximadamente)
INSERT INTO `usuarios` (`Id`, `Uid`, `Nombre`, `Email`, `Telefono`, `Activo`, `Foto`, `Proveedor`, `Creado_en`, `Fecha_reactivacion`) VALUES
	(2, NULL, 'Karen', 'karen@example.com', '1234567890', 1, NULL, NULL, '2025-09-23 22:55:07', NULL),
	(3, NULL, 'Juan', 'juan@example.com', '3102567894', 1, NULL, NULL, '2025-09-23 22:55:07', NULL),
	(4, NULL, 'Andres', 'pin1547@example.com', '3216547890', 1, NULL, NULL, '2025-09-23 22:55:07', NULL),
	(5, NULL, 'Maria', 'M@example.com', '123456045', 1, NULL, NULL, '2025-09-23 22:55:07', NULL),
	(22, 'dtWJa20hNReIuiKaJ6qjFttykB92', 'Karen Cardona', 'karencardona43@gmail.com', '3258794156', 1, 'https://lh3.googleusercontent.com/a-/ALV-UjWP-NkOEiMel041185yMLWjQcUoQ6cEa97-JjcvaLU22F3hgtVG3PObLrrzKcKShE2l6la_2fpUlvvRZem6JgvtLu7OeoXXYjlEy4Fy4qaF1YNy3kx45c5s8fEKIoqCvf8f7KJ8h13t_NR6rdWGRV4FFXM2gAPfmT7ACZAG35J7h_wZ5nJ4-1vkxQGjEiznJ1M4hrgrR-JEyaDYlmBQsAeKk-iYm42lEXN3HCDmtepETZabZ5GELKcQNptguLg9s0YuvFx2gcSgZ_jIVWwPau7VIJHkXtOS0vhj5V98EW76trYzoETmRYqWWeR-Fcni2pyfTpXxwy3Kdg599-OWjqPQgmLc6ufUUP1S5pb1jpQkqBI94Vgi2geXZmYLWoSqvB5lu-sH1xoCt-v7yHOQbBxoS14wDYV_HtxG4Rx8lv7xmQiasgwKZXbPRICnJgGxf8t5_lAMjZEjTtrZ-nurchn-Cv59yEGRbkrgTtJ3jP8nbY2ZWHI5dZDyRIOaHVX8M-AzNAAMHTUeqsK2QfoK6qrVS1PSAJLA-hto8YYDBr9RypruMzQt3L1dVcs0E8v1mQ6jsuwEF5ZSUPk2ogtubED8wc2RDRo8J7Wz-n7-Z2Prz0sLAEAw9MjKlCldZEVcZ5rwh4_JsUdthvOeIQ7X83nUg9xkQ0l48f1d1Cbsp7wVnjOU9Jd9IHC8DZ30YWrfGJ36DWc1aEL-O58D9CSP68DCMIwG3QmAwPl7O8Tq2MBDrsGp6I6qWdzeo6MlB3AzDb_lqTROvPuzLImyrQSUPdDIOkewmtBq8Y4icp1iYEGWFDZAUNTV8aP5ENzJ_QkTEJYea08SCiCsZVVzevqFLxiMugX4uhlbrt82EPyoF0XF5ih47UIYj5iNYT3cOyEjq2RUX04BiSEPNQyOoAv9UEE7hMXb9tiNRZQpdlfRkATlyRq-wIbEH45YgF8qrP_ZD7elWqpGtgxS8p6S_sEPC5KgDJZyvMhBYlQ=s200-c', 'Google', '2025-10-24 01:54:43', NULL),
	(23, 'jQZ5j1C4wBTdRuwwT9WApvOQ7dY2', 'Karen Cardona Gutiérrez', 'karen.cardonag@udea.edu.co', '3257486415', 1, 'https://lh3.googleusercontent.com/a/ACg8ocLYXat-cOAhyz1E5vsQ-ZBIQBRkkffNt_YqfWzYHAJnb-g8MQ=s200-c', 'Google', '2025-10-24 02:06:44', NULL),
	(24, 'cymXS5Ql7XOktvcXAQKiyKmhAyN2', 'andrés areiza', 'mongolsangresucia@gmail.com', '301', 1, 'https://lh3.googleusercontent.com/a/ACg8ocJ0lpCNm3xHnJkRPGz2dndeGbO3M2Y4tZMrz9l9YnKn4nQQjg=s200-c', 'Google', '2025-11-09 06:52:22', NULL),
	(25, '6YJDXGf9MMPS1EXxxrCQWMrAkRD2', 'andres areiza', 'andresareiza88@gmail.com', '123', 1, 'https://lh3.googleusercontent.com/a/ACg8ocJquOq_g10m-5WjP-u-W3v2iSgL32NdOSlF0BXHJj7G2z97vtB5=s200-c', 'Google', '2025-11-09 17:49:19', NULL);

-- Volcando estructura para tabla sportmeet.usuarios_x_evento
CREATE TABLE IF NOT EXISTS `usuarios_x_evento` (
  `Id_usuario` int(11) NOT NULL,
  `Id_evento` int(11) NOT NULL,
  `Id_estado` int(11) NOT NULL,
  PRIMARY KEY (`Id_usuario`,`Id_evento`),
  KEY `Id_evento` (`Id_evento`),
  KEY `Id_estado` (`Id_estado`),
  CONSTRAINT `usuarios_x_evento_ibfk_1` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_x_evento_ibfk_2` FOREIGN KEY (`Id_evento`) REFERENCES `eventos` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_x_evento_ibfk_3` FOREIGN KEY (`Id_estado`) REFERENCES `estados` (`Id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.usuarios_x_evento: ~0 rows (aproximadamente)

-- Volcando estructura para tabla sportmeet.usuarios_x_rol
CREATE TABLE IF NOT EXISTS `usuarios_x_rol` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_usuario` int(11) NOT NULL,
  `Id_rol` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_usuario` (`Id_usuario`),
  KEY `Id_rol` (`Id_rol`),
  CONSTRAINT `usuarios_x_rol_ibfk_1` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`Id`),
  CONSTRAINT `usuarios_x_rol_ibfk_2` FOREIGN KEY (`Id_rol`) REFERENCES `roles` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.usuarios_x_rol: ~4 rows (aproximadamente)
INSERT INTO `usuarios_x_rol` (`Id`, `Id_usuario`, `Id_rol`) VALUES
	(1, 22, 1),
	(2, 23, 2),
	(3, 24, 2),
	(4, 25, 2);

-- Volcando estructura para tabla sportmeet.vm_eventos_por_deporte
CREATE TABLE IF NOT EXISTS `vm_eventos_por_deporte` (
  `Id_deporte` int(11) NOT NULL,
  `total_eventos` decimal(22,0) DEFAULT NULL,
  `exitosos` decimal(22,0) DEFAULT NULL,
  `fracasos` decimal(22,0) DEFAULT NULL,
  `prob_exito` decimal(26,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.vm_eventos_por_deporte: ~10 rows (aproximadamente)
INSERT INTO `vm_eventos_por_deporte` (`Id_deporte`, `total_eventos`, `exitosos`, `fracasos`, `prob_exito`) VALUES
	(1, 6, 6, 0, 1.0000),
	(2, 20, 14, 6, 0.7000),
	(5, 6, 2, 4, 0.3333),
	(6, 8, 5, 3, 0.6250),
	(9, 22, 13, 9, 0.5909),
	(10, 22, 11, 11, 0.5000),
	(11, 5, 3, 2, 0.6000),
	(12, 6, 5, 1, 0.8333),
	(13, 7, 3, 4, 0.4286),
	(14, 4, 3, 1, 0.7500);

-- Volcando estructura para tabla sportmeet.vm_eventos_por_dia_semana
CREATE TABLE IF NOT EXISTS `vm_eventos_por_dia_semana` (
  `dia_semana` int(1) DEFAULT NULL,
  `total_eventos` decimal(22,0) DEFAULT NULL,
  `exitosos` decimal(22,0) DEFAULT NULL,
  `fracasos` decimal(22,0) DEFAULT NULL,
  `prob_exito` decimal(26,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.vm_eventos_por_dia_semana: ~7 rows (aproximadamente)
INSERT INTO `vm_eventos_por_dia_semana` (`dia_semana`, `total_eventos`, `exitosos`, `fracasos`, `prob_exito`) VALUES
	(1, 16, 10, 6, 0.6250),
	(2, 15, 9, 6, 0.6000),
	(3, 15, 9, 6, 0.6000),
	(4, 12, 8, 4, 0.6667),
	(5, 15, 7, 8, 0.4667),
	(6, 14, 9, 5, 0.6429),
	(7, 19, 13, 6, 0.6842);

-- Volcando estructura para tabla sportmeet.vm_eventos_por_franja_horaria
CREATE TABLE IF NOT EXISTS `vm_eventos_por_franja_horaria` (
  `franja` varchar(11) DEFAULT NULL,
  `total_eventos` decimal(22,0) DEFAULT NULL,
  `exitosos` decimal(22,0) DEFAULT NULL,
  `fracasos` decimal(22,0) DEFAULT NULL,
  `prob_exito` decimal(26,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.vm_eventos_por_franja_horaria: ~3 rows (aproximadamente)
INSERT INTO `vm_eventos_por_franja_horaria` (`franja`, `total_eventos`, `exitosos`, `fracasos`, `prob_exito`) VALUES
	('mañana', 39, 29, 10, 0.7436),
	('noche', 37, 20, 17, 0.5405),
	('tarde', 30, 16, 14, 0.5333);

-- Volcando estructura para tabla sportmeet.vm_eventos_por_instalacion
CREATE TABLE IF NOT EXISTS `vm_eventos_por_instalacion` (
  `Id_instalacion` int(11) NOT NULL,
  `total_eventos` decimal(22,0) DEFAULT NULL,
  `exitosos` decimal(22,0) DEFAULT NULL,
  `fracasos` decimal(22,0) DEFAULT NULL,
  `prob_exito` decimal(26,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sportmeet.vm_eventos_por_instalacion: ~17 rows (aproximadamente)
INSERT INTO `vm_eventos_por_instalacion` (`Id_instalacion`, `total_eventos`, `exitosos`, `fracasos`, `prob_exito`) VALUES
	(1, 10, 7, 3, 0.7000),
	(5, 6, 1, 5, 0.1667),
	(6, 6, 5, 1, 0.8333),
	(7, 3, 1, 2, 0.3333),
	(8, 7, 6, 1, 0.8571),
	(9, 13, 7, 6, 0.5385),
	(10, 4, 2, 2, 0.5000),
	(11, 8, 7, 1, 0.8750),
	(12, 4, 4, 0, 1.0000),
	(14, 6, 2, 4, 0.3333),
	(15, 5, 3, 2, 0.6000),
	(16, 4, 4, 0, 1.0000),
	(17, 4, 0, 4, 0.0000),
	(18, 9, 5, 4, 0.5556),
	(20, 6, 5, 1, 0.8333),
	(21, 4, 3, 1, 0.7500),
	(23, 7, 3, 4, 0.4286);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

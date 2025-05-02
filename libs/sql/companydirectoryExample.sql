
-- Example SQL mimics the original provided for the project
-- Notice the lack of foreign key relationships
-- Script is just ran on the MySQL or MariaDB server after database creation

CREATE TABLE IF NOT EXISTS `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `locationID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
)

CREATE TABLE IF NOT EXISTS `location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
)

CREATE TABLE IF NOT EXISTS `personnel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `jobTitle` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `departmentID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
)


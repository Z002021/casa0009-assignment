CREATE TABLE `endangered` (
`gbifID` bigint DEFAULT -1,
`kingdom` varchar(255) DEFAULT NULL,
`phylum` varchar(255) DEFAULT NULL, 
`class` varchar(255) DEFAULT NULL,
`order` varchar(255) DEFAULT NULL,
`family` varchar(255) DEFAULT NULL,
`genus` varchar(255) DEFAULT NULL,
`species` varchar(255) DEFAULT NULL,
`decimalLatitude` float(12) DEFAULT NULL, 
`decimalLongitude` float(12) DEFAULT NULL, 
`eventDate` varchar(25) DEFAULT NULL,
`day` TINYINT DEFAULT -1,
`month` TINYINT DEFAULT -1,
`year` YEAR DEFAULT NULL,
`speciesKey` BIGINT DEFAULT -1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hotspot` (
`hotspot` tinyint DEFAULT -1,
`k_cluster` tinyint DEFAULT -1,
`occ` float(6) DEFAULT NULL,  
`sp_evenness` float(6) DEFAULT NULL, 
`sp_richness` float(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `lad` (
`LAD21NM` varchar(255) DEFAULT NULL,
`year` YEAR DEFAULT NULL,
`occ_den` float(20) DEFAULT NULL, 
`sp_richness` float(20) DEFAULT NULL, 
`sp_evenness` float(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOAD DATA LOCAL INFILE 'your_path_to/endangered.csv' INTO
TABLE endangered FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
IGNORE 1 LINES;

LOAD DATA LOCAL INFILE 'your_path_to/hotspot_ind_wide_2021.csv' INTO
TABLE hotspot FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
IGNORE 1 LINES;

LOAD DATA LOCAL INFILE 'your_path_to/LA_ind.csv' INTO
TABLE lad FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
IGNORE 1 LINES;
var portNumber = 8716;

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "dev.spatialdatacapture.org",
    user: "ucfnlfs",
    password: "firiweqina",
    database: "ucfnlfs",
    multipleStatements: true,
});

connection.connect();

var express = require("express");
var app = express();
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/js"));
app.use(express.static(__dirname + "/css"));
app.use(express.static(__dirname + "/images"));

app.get("/", function (req, res) {
    return res.render("index");
});

app.get("/lad", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-WithD");

    const queryString = "SELECT * FROM lad";
    connection.query(queryString, (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for LAD: " + err);
            res.sendStatus(500);
            return;
        }

        res.send(rows);
    });
});

app.get("/hotspot", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-WithD");

    const queryString = "SELECT * FROM hotspot";
    connection.query(queryString, (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for hotspots: " + err);
            res.sendStatus(500);
            return;
        }

        res.send(rows);
    });
});

app.get("/endangered", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-WithD");

    const queryString = "SELECT * FROM endangered";
    connection.query(queryString, (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for endangered species: " + err);
            res.sendStatus(500);
            return;
        }

        res.send(rows);
    });
});

app.get("/year_species_count", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-WithD");

    const queryString = `DROP TABLE IF EXISTS species;
    CREATE TEMPORARY TABLE species AS 
    (select distinct species from endangered);
    
    DROP TABLE IF EXISTS years;
    CREATE TEMPORARY TABLE years AS 
    (select distinct year from endangered);
    
    DROP TABLE IF EXISTS sp_years;
    CREATE TEMPORARY TABLE sp_years AS 
    (select * from species
    cross join 
    years);
    
    SELECT sp.year, sp.species, COUNT(e.gbifID) as counts
    FROM sp_years AS sp LEFT OUTER JOIN endangered as e ON 
    (sp.species = e.species AND sp.year = e.year)
    group by sp.year, sp.species
    order by sp.year, sp.species;`;

    connection.query(queryString, (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for species counts: " + err);
            res.sendStatus(500);
            return;
        }

        res.send(rows[6]);
    });
});

var server = app.listen(portNumber, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("App listening at http://%s:%s", host, port);
});

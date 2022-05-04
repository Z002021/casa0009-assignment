var portNumber = 8716;

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "dev.spatialdatacapture.org",
    user: "ucfnlfs",
    password: "firiweqina",
    database: "ucfnlfs",
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

var server = app.listen(portNumber, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("App listening at http://%s:%s", host, port);
});

// Function for unpacking rows
function unpack(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

// Load data and map/plot

d3.csv(
    "https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/endangered.csv",
    function (rows) {
        // Get species list
        var species_Array = unpack(rows, "species");
        var species = [...new Set(species_Array)];
        species.sort();

        // color palette
        col_pal_num = [
            "#ff420e",
            "#e29930",
            "#f98866",
            "#80bd9e",
            "#b7b8b6",
            "#b3c100",
            "#4cb5f5",
            "#34675c",
            "#6e6702",
            "#db9501",
            "#2e2300",
            "#c05805",
            "#e6df44",
            "#f9a603",
            "f70025",
            "#f25c00",
            "#d61800",
            "#e94f08",
            "#7f152e",
            "#edae01",
            "#2f496e",
            "#ed8c72",
            "#2988bc",
            "#eab364",
            "#acbd78",
        ];

        var col_pal = {};
        for (var j = 0; j < species.length; j++) {
            col_pal[species[j]] = col_pal_num[j];
        }

        // Data for map
        var data_map = species.map(function (species) {
            var rowsFiltered = rows.filter(function (row) {
                return row.species === species;
            });

            var x = [],
                y = [];

            for (var i = 0; i < rows.length; i++) {
                row = rows[i];
                y.push(row["species"]);
                x.push(row["year"]);
            }

            return {
                type: "scattermapbox",
                name: species,
                y: y,
                text: x,
                legendgroup: species,
                hovermode: "closest",
                hovertemplate: "<b>%{text}</b>",
                //colorway : ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'],
                lat: unpack(rowsFiltered, "decimalLatitude"),
                lon: unpack(rowsFiltered, "decimalLongitude"),
                marker: {
                    size: 2.5,
                    autocolorscale: false,
                    color: Array(rowsFiltered.length).fill(col_pal[species]),
                },
            };
        });

        //$.getJSON("http://dev.spatialdatacapture.org:8708/year_species_count", function(rows_cnt) {
        d3.csv(
            "https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/end_year_cnt.csv",
            function (rows_cnt) {
                var data_graph = species.map(function (species) {
                    var rowsFiltered = rows_cnt.filter(function (row) {
                        return row.species === species;
                    });

                    return {
                        type: "scatter",
                        name: species,
                        legendgroup: species,
                        showlegend: false,
                        marker: {
                            symbol: "square",
                            size: 8,
                            color: col_pal[species],
                        },
                        x: unpack(rowsFiltered, "year"),
                        y: unpack(rowsFiltered, "counts"),
                        mode: "lines+markers",
                    };
                });

                // Combine the data traces for map and graph
                var data = data_map.concat(data_graph);

                var layout = {
                    paper_bgcolor: "white",
                    plot_bgcolor: "white",
                    //title: 'Critically Endangered Species in England',
                    font: { color: "black", size: 12 },
                    colorbar: false,
                    margin: {
                        t: 60,
                        b: 70,
                        l: 30,
                        r: 30,
                    },
                    hoverdistance: 1,
                    hovermode: "closest",
                    annotations: [
                        {
                            x: 0,
                            y: 1.08,
                            xref: "paper",
                            yref: "paper",

                            text: " ",
                            showarrow: false,
                            font: {
                                color: "black",
                                size: 23,
                                family: "Arial",
                            },
                        },
                        {
                            text: "Select the species to display from the list on the right. <br>The map will display the locations of the selected species. <br>Hover over the points to see the year of the occurrence. <br>National Nature Reserves are also plotted in green polygons.<br><br>The chart below shows the species count over the years.<br>Hover over the chart to see the exact species count.",
                            x: 0.75,
                            xref: "paper",
                            xanchor: "auto",
                            align: "left",
                            y: 1,
                            yref: "paper",
                            yanchor: "top",
                            showarrow: false,
                            bordercolor: "black",
                            borderpad: 5,
                            font: {
                                color: "black",
                                size: 12.5,
                            },
                        },
                    ],

                    legend: {
                        orientation: "v",
                        font: {
                            size: 13,
                            color: "black",
                        },
                        tracegroupgap: 6,
                        bgcolor: "#E2E2E2",
                        bordercolor: "#FFFFFF",
                        borderwidth: 1,
                        x: 1,
                        xanchor: "right",
                    },

                    mapbox: {
                        layers: [
                            {
                                source: "https://raw.githubusercontent.com/leandrafaith/casa0009-assignment/main/data/National_Nature_Reserves_England.json",
                                type: "fill",
                                color: "green",
                                outlinecolor: "blue",
                                below: "traces",
                                showlegend: true,
                                opacity: 0.5,
                                marker: { size: 5 },
                            },
                        ],

                        center: {
                            lat: 53,
                            lon: -2.1,
                        },
                        domain: {
                            x: [0, 0.35],
                            y: [0, 1],
                        },
                        style: "carto-positron",
                        zoom: 5,
                    },

                    xaxis: {
                        domain: [0.41, 0.81],
                        title: {
                            text: "Year",
                        },
                    },

                    yaxis: {
                        domain: [0, 0.7],
                        title: {
                            text: "Count",
                        },
                    },
                };

                // Configuration for map
                Plotly.setPlotConfig({
                    mapboxAccessToken:
                        "pk.eyJ1IjoibmdsaWFuZ3dlaTE1IiwiYSI6ImNsMXhvdzB1bDAyNzkzZG43NzF2ajM3Y2EifQ.RnupTY7Atp7LreQEpiANLA",
                });

                Plotly.newPlot("map", data, layout);
            }
        );
    }
);

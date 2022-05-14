// Function for unpacking rows
function unpack(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

d3.json(
    "https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/england_la_sim.json",
    function (data) {
        console.log("Loaded GeoJSON");

        // Get names of all LA
        var lad = [];
        var areas = [];
        for (var i = 0; i < data.features.length; i++) {
            lad = lad.concat(data.features[i].properties.LAD21NM);
            areas = areas.concat(data.features[i].properties.SHAPE_Area);
        }

        // CHANGE TO D3 OR OWN URL
        // $.getJSON("http://dev.spatialdatacapture.org:8708/lad", function(rows) {
        d3.csv(
            "https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/LA_ind.csv",
            function (rows) {
                console.log("Loaded CSV");

                var indicators = ["occ_den", "sp_richness", "sp_evenness"];

                // Create labels for indicators
                let labels = [
                    "Occ. Density (/km^2)",
                    "Sp. Richness Density (/km^2)",
                    "Sp. Evenness",
                ];
                let ind_labels = {};
                for (let index = 0; index < indicators.length; ++index) {
                    ind_labels[indicators[index]] = labels[index];
                }

                var years_Array = [];

                for (var i = 0; i < rows.length; i++) {
                    // get years
                    years_Array = years_Array.concat(rows[i].year);
                    // convert data type
                    rows[i].occ_den = Number(rows[i].occ_den);
                    rows[i].sp_richness = Number(rows[i].sp_richness);
                    rows[i].sp_evenness = Number(rows[i].sp_evenness);
                }

                // Get list of unique year
                var years = [...new Set(years_Array)];

                // Function for filtering rows by year
                function filter_rows(rows, locations, year) {
                    // create container
                    var rowsFiltered = [];
                    for (i in locations) {
                        var rowFiltered = rows.filter(function (row) {
                            return (
                                row.LAD21NM === locations[i] &&
                                row.year === year
                            );
                        });
                        rowsFiltered = rowsFiltered.concat(rowFiltered);
                    }
                    return rowsFiltered;
                }

                //----- MAP -----//

                // Data for base map - occurrence data for 2011 to be visible
                rowsFiltered_map_base = filter_rows(rows, lad, years[0]);
                var data_map_base = indicators.map(function (indicator) {
                    if (indicator === "occ_den") {
                        visibility = true;
                    } else {
                        visibility = false;
                    }

                    return {
                        type: "choroplethmapbox",
                        name: ind_labels[indicator],
                        geojson: data,
                        locations: lad,
                        featureidkey: "properties.LAD21NM",
                        z: unpack(rowsFiltered_map_base, indicator),
                        colorbar: {
                            x: 0.95,
                            xanchor: "left",
                            y: 1,
                            yanchor: "top",
                            //ypad: 13,
                            //len: 1,
                        },
                        visible: visibility,
                        hovertemplate:
                            "LAD: %{location}<br>Metric Value: %{z}<extra></extra>",
                    };
                });

                // Function for getting data for dropdown list (by indicators and years)
                function dropdown_data(data, locations, ind, year) {
                    rowsFiltered = filter_rows(data, locations, year);
                    return unpack(rowsFiltered, ind);
                }

                // Data for dropdown list (map) - each indicator is a trace, each year is a set of three indicators
                for (var j = 0; j < years.length; j++) {
                    window["data_map_" + years[j]] = indicators.map(function (
                        indicators
                    ) {
                        return dropdown_data(rows, lad, indicators, years[j]);
                    });
                }

                //----- GRAPH -----//

                // Color palette
                var colors = ["B5B384", "638B4A", "CFBFB3"];

                // Data for base graph - occurrence data
                var data_box_base = [];
                var visibility = true;

                for (var l = 0; l < indicators.length; l++) {
                    if (indicators[l] === indicators[0]) {
                        visibility = true;
                    } else {
                        visibility = false;
                    }

                    var result = {
                        type: "box",
                        name: ind_labels[indicators[l]],
                        x: years_Array,
                        y: unpack(rows, indicators[l]),
                        //boxpoints: 'all',
                        marker: {
                            size: 2,
                            color: colors[l],
                        },
                        //jitter: 0.5,
                        //pointpos: -1.6,
                        visible: visibility,
                        hoveron: "boxes",
                        hovertemplate: "<extra></extra>",
                    };

                    data_box_base.push(result);
                }

                // Data for dropdown list (graph) - each year is a trace, each indicator is a set of years from 2011 to 2021
                for (var k = 0; k < indicators.length; k++) {
                    window["data_box_" + indicators[k]] = years.map(function (
                        years
                    ) {
                        var rowsFiltered_box_base = filter_rows(
                            rows,
                            lad,
                            years
                        );
                        return unpack(rowsFiltered_box_base, indicators[k]);
                    });
                }

                //----- MIXED SUBPLOT -----//

                var data_combined = data_map_base.concat(data_box_base);

                // Update menu button for dropdown list (for selection of year)
                var buttons_year = years.map(function (years) {
                    return {
                        method: "restyle",
                        args: ["z", window["data_map_" + years]],
                        label: years,
                    };
                });

                // Update menu button for dropdown list (for selection of indicators)
                var buttons_ind = indicators.map(function (indicator) {
                    if (indicator === indicators[0]) {
                        visibility = [true, false, false];
                    } else if (indicator === indicators[1]) {
                        visibility = [false, true, false];
                    } else if (indicator === indicators[2]) {
                        visibility = [false, false, true];
                    }

                    return {
                        method: "restyle",
                        args: [{ visible: visibility }],
                        label: ind_labels[indicator],
                    };
                });

                var layout = {
                    plot_bgcolor: "EBECF0",

                    annotations: [
                        {
                            text: "Use the drop down lists on the left to select the metric and year <br>to display. The map shows the value of the selected metric for <br>the selected year, while the plot shows the yearly value of the <br>selected metric from 2012 to 2021.",
                            x: 0.215,
                            xref: "paper",
                            align: "left",
                            y: 1,
                            yref: "paper",
                            yanchor: "top",
                            showarrow: false,
                            bordercolor: "black",
                            borderpad: 5,
                        },
                    ],

                    mapbox: {
                        domain: {
                            x: [0.6, 0.95],
                            y: [0, 1],
                        },
                        center: { lon: -1.5, lat: 53 },
                        style: "carto-positron",
                        zoom: 4.5,
                    },

                    xaxis: {
                        domain: [0, 0.585],
                    },

                    yaxis: {
                        domain: [0, 0.75],
                    },

                    updatemenus: [
                        {
                            y: 0.895,
                            yanchor: "top",
                            x: 0,
                            xanchor: "left",
                            buttons: buttons_year,
                        },
                        {
                            y: 1.0,
                            yanchor: "top",
                            xanchor: "left",
                            x: 0,
                            buttons: buttons_ind,
                        },
                    ],
                    margin: {
                        l: 80,
                        r: 80,
                    },
                };

                Plotly.setPlotConfig({
                    mapboxAccessToken:
                        "pk.eyJ1IjoibmdsaWFuZ3dlaTE1IiwiYSI6ImNsMXhvdzB1bDAyNzkzZG43NzF2ajM3Y2EifQ.RnupTY7Atp7LreQEpiANLA",
                    responsive: true,
                });

                if (screen.width < 1200) {
                    document.getElementById("overview").style.height = "100vh";
                    layout.mapbox.domain.x = [0, 1];
                    layout.mapbox.domain.y = [0.4, 1];
                    layout.xaxis.domain = [0, 1];
                    layout.yaxis.domain = [0, 0.4];
                    layout.annotations[0].visible = false;
                    layout.updatemenus[0].y = 0.93;

                    data_combined[0].colorbar.x = 0.8;
                    data_combined[1].colorbar.x = 0.8;
                    data_combined[2].colorbar.x = 0.8;
                    data_combined[0].colorbar.len = 0.6;
                    data_combined[1].colorbar.len = 0.6;
                    data_combined[2].colorbar.len = 0.6;
                    layout.margin.l = 30;
                    layout.margin.r = 30;
                    layout.margin.b = 40;
                    layout.margin.t = 40;
                }

                Plotly.newPlot("overview", data_combined, layout);
            }
        );
    }
);

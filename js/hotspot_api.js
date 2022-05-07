// ----- MAP ----- //
d3.json(
    "https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/hotspots_data.json",
    function (data) {
        // var indicators = ["occ", "sp_richness", "sp_evenness"];
        var hotspots = [];
        var clusters = [];
        var occ_den = [];
        var sp_richness = [];
        var sp_evenness = [];

        // Color palette
        var colors_pal = ["B5B384", "638B4A", "CFBFB3"];

        var colors = [];

        // Array to hold metadata for scatter plot
        var meta_data = [];

        // Get hotspot and cluster label
        for (var i = 0; i < data.features.length; i++) {
            // convert datatype of hotspot, cluster and metric value
            data.features[i].properties.hotspot = parseInt(
                data.features[i].properties.hotspot
            );
            data.features[i].properties.k_cluster = parseInt(
                data.features[i].properties.k_cluster
            );
            data.features[i].properties.occ = Number(
                data.features[i].properties.occ
            );
            data.features[i].properties.sp_evenness = Number(
                data.features[i].properties.sp_evenness
            );
            data.features[i].properties.sp_richness = Number(
                data.features[i].properties.sp_richness
            );
            // get array of hotspots and clusters
            hotspots = hotspots.concat(data.features[i].properties.hotspot);
            clusters = clusters.concat(data.features[i].properties.k_cluster);
            occ_den = occ_den.concat(data.features[i].properties.occ);
            sp_richness = sp_richness.concat(
                data.features[i].properties.sp_richness
            );
            sp_evenness = sp_evenness.concat(
                data.features[i].properties.sp_evenness
            );
            // set colors
            colors.push(colors_pal[data.features[i].properties.k_cluster - 1]);
            // get array of metadata
            meta_data.push([
                hotspots[i],
                occ_den[i],
                sp_richness[i],
                sp_evenness[i],
            ]);
        }

        // Set landing values for some parameters
        var marker_line_col = "black";
        var marker_line_width = 1;
        var map_ctr_lon = -0.11;
        var map_ctr_lat = 51.55;
        var map_zoom = 8.5;

        // Data for map - single trace for all hotspots
        var data_map = [
            {
                type: "choroplethmapbox",
                geojson: data,
                locations: hotspots,
                featureidkey: "properties.hotspot",
                z: clusters,
                colorscale: [
                    [0, colors_pal[0]],
                    [1, colors_pal[1]],
                ],
                marker: {
                    opacity: 0.6,
                    line: {
                        color: marker_line_col,
                    },
                },
                showscale: false,
                hovertemplate:
                    "Hotspot: %{location} <br>Occurrence Density: %{properties.occ}/km^2 <br>Species Richness: %{properties.sp_richness}/km^2 <br>Species Evenness: %{properties.sp_evenness}<extra></extra>",
            },
        ];

        // Data for graph - similarly, single trace for all hotspots
        var data_graph = [];

        // Start with empty data trace for labelling purpose
        var cluster_num = [...new Set(clusters)];
        for (var j = 0; j < cluster_num.length; j++) {
            if (j === 0) {
                x_pt = sp_richness[0];
                y_pt = sp_evenness[0];
            } else {
                x_pt = sp_richness[sp_richness.length - 1];
                y_pt = sp_evenness[sp_richness.length - 1];
            }

            var data_empty = {
                type: "scatter",
                name: "Cluster " + cluster_num[j],
                x: [x_pt],
                y: [y_pt],
                showlegend: true,
                visible: true,
                mode: "markers",
                marker: {
                    color: colors_pal[cluster_num[j] - 1],
                    size: 10,
                    line: {
                        color: marker_line_col,
                        width: marker_line_width,
                    },
                },
                hoverinfo: "none",
            };
            data_graph.push(data_empty);
        }

        // Add actual data trace
        data_graph.push({
            type: "scatter",
            name: "actual_data",
            x: sp_richness,
            y: sp_evenness,
            mode: "markers",
            marker: {
                color: colors,
                line: {
                    color: marker_line_col,
                    width: marker_line_width,
                },
                size: 10,
            },
            showlegend: false,
            meta: meta_data,
            hovertemplate:
                "Hotspot: %{meta[0]} <br>Occurrence Density: %{meta[1]}/km^2 <br>Species Richness: %{x}/km^2 <br>Species Evenness: %{y}<extra></extra>",
        });

        // Update button for choosing hotspots
        var trace_idx = [0, 3];

        var buttons_hotspot = [
            {
                method: "update",
                args: [
                    {
                        "marker.line.color": marker_line_col,
                        "marker.line.width": marker_line_width,
                    },
                    {
                        "mapbox.center": { lon: map_ctr_lon, lat: map_ctr_lat },
                        "mapbox.zoom": map_zoom,
                    },
                    trace_idx,
                ],
                label: "Clear selection",
            },
        ];

        // Number of hotspots
        n_hotspots = hotspots.length;

        for (var k = 0; k < n_hotspots; k++) {
            // set arrays of colors for marker line
            marker_line_col_update = Array(k)
                .fill(marker_line_col)
                .concat(["red"])
                .concat(Array(n_hotspots - (k + 1)).fill(marker_line_col));
            marker_line_width_update = Array(k)
                .fill(marker_line_width)
                .concat([marker_line_width * 2])
                .concat(Array(n_hotspots - (k + 1)).fill(marker_line_width));
            map_ctr_lon_update = data.features[k].properties.centroid_x;
            map_ctr_lat_update = data.features[k].properties.centroid_y;
            map_zoom_update = data.features[k].properties.zoom_level;

            var buttons_temp = {
                method: "update",
                args: [
                    {
                        "marker.line.color": [marker_line_col_update],
                        "marker.line.width": [marker_line_width_update],
                    },
                    {
                        "mapbox.center": {
                            lon: map_ctr_lon_update,
                            lat: map_ctr_lat_update,
                        },
                        "mapbox.zoom": map_zoom_update,
                    },
                    trace_idx,
                ],
                label: "Hotspot " + hotspots[k],
            };
            buttons_hotspot.push(buttons_temp);
        }

        var layout = {
            plot_bgcolor: "EBECF0",

            mapbox: {
                domain: {
                    x: [0.155, 0.555],
                    y: [0, 1],
                },
                center: { lon: map_ctr_lon, lat: map_ctr_lat },
                style: "carto-positron",
                zoom: map_zoom,
            },

            xaxis: {
                domain: [0.62, 1],
                title: {
                    text: "Species Richness Density (/km^2)",
                },
            },
            yaxis: {
                domain: [0, 1],
                title: {
                    text: "Species Evenness",
                },
                tickformat: ".2r",
            },

            legend: {
                itemclick: false,
                itemdoubleclick: false,
                xanchor: "left",
                x: -0.05,
                yanchor: "top",
                y: 1.0,
                orientation: "h",
            },

            annotations: [
                {
                    text: "Use the dropdown list above <br>to select a hotspot to focus on. <br><br>The map shows the locations <br>of the hotspots, while the plot <br>shows the species richness <br>density and evenness of the <br>hotspots. <br><br>Hover over the hotspot on the <br>map and the graph to view <br>information about the hotspot.",
                    x: -0.04,
                    xref: "paper",
                    y: 0,
                    yref: "paper",
                    align: "left",
                    showarrow: false,
                    bordercolor: "black",
                    borderpad: 5,
                },
            ],

            updatemenus: [
                {
                    xanchor: "left",
                    x: -0.04,
                    yanchor: "top",
                    y: 0.9,
                    buttons: buttons_hotspot,
                },
            ],
            margin: {
                t: 60,
                r: 40,
            },
        };

        var data = data_map.concat(data_graph);

        Plotly.setPlotConfig({
            mapboxAccessToken:
                "pk.eyJ1IjoibmdsaWFuZ3dlaTE1IiwiYSI6ImNsMXhvdzB1bDAyNzkzZG43NzF2ajM3Y2EifQ.RnupTY7Atp7LreQEpiANLA",
            responsive: true,
        });

        Plotly.newPlot("hotspot", data, layout);
    }
);

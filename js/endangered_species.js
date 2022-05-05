// Function for unpacking rows
function unpack(rows, key) {
	return rows.map(function(row) {
		return row[key];
	});
}

// Load data and map/plot
d3.csv('https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/endangered.csv', function(rows){


	// Get species list
	var species_Array = unpack(rows, 'species');
	var species = [...new Set(species_Array)];
	species.sort()


	// Data for map
	var data_map = species.map(function(species) {
		var rowsFiltered = rows.filter(function(row) {
			return (row.species === species);
		});


	var x = [],
      y = [];

  for (var i = 0; i < rows.length; i++) {
      row = rows[i];
      y.push(row["species"]);
      x.push(row["year"]);
    }

		return {
			type: 'scattermapbox',
			name: species,
			y: y,
			text: x,
			legendgroup: species,
			hovermode:'closest',
			hovertemplate:'<b>%{text}</b>',
			//colorway : ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'],
			lat: unpack(rowsFiltered, 'decimalLatitude'),
			lon: unpack(rowsFiltered, 'decimalLongitude'),
			marker: {
				size: 2.5
			}

		};
	});


	d3.csv('https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/end_year_cnt.csv', function(rows_cnt){

		var data_graph = species.map(function(species) {
			var rowsFiltered = rows_cnt.filter(function(row) {
				return (row.species === species);
			});

			return {
				type: 'scatter',
				name: species,
				legendgroup: species,
				showlegend: false,
				marker:{symbol:'square',size:8},
				x: unpack(rowsFiltered, 'year'),
				y: unpack(rowsFiltered, 'counts'),
				mode: 'lines+markers'
			};
		});

		console.log(data_graph)




		// Combine the data traces for map and graph
		var data = data_map.concat(data_graph);


		var layout =
		{

			paper_bgcolor: 'white',
			plot_bgcolor: 'white',
			//title: 'Critically Endangered Species in England',
			font: {color: 'black',size:12},
			colorbar: false,
			annotations: [{
				x: 0,
				y: 1.08,
				xref: 'paper',
				yref: 'paper',

				text: ' ',
				showarrow: false,
				font: {
          color: "black",
          size: 23,
          family: 'Arial'
        }
			},
			{
				x: 0,
				y: 0.38,
				xref: 'paper',
				yref: 'paper',
				text: 'Source: <a href="https://www.gbif.org/" style="color: rgb(0,0,0)">GBIF</a>',
				showarrow: false,
				font: {
          color: "black",
          size: 12
        }
			},
      {
				text: 'Select species names in Legend zone, the interactive map will display<br>the distribution of selected one. Hover over the points, it will present<br>the year and name of species. <br><br>Zoom in, green polygons represent National Nature Reserves of England.<br><br>The line chart shows trends in the number of species counts, hover over<br>the chart, it will display the number of selected species.',
				x: 0.977,
				xref: 'paper',
				xanchor : 'auto',
				align: 'left',
				y: 1,
				yref: 'paper',
				yanchor: 'top',
				showarrow: false,
				bordercolor: 'black',
				borderpad: 5,
				font: {
          color: "black",
          size: 12.5
        }
			}],

			legend:{'orientation':'v',
		            font:{
                     size:13,
                     color:'black'
		            },
		            tracegroupgap:6,
		            bgcolor: '#E2E2E2',
                bordercolor: '#FFFFFF',
                borderwidth: 1
		        },


			mapbox: {

      layers: [{
        source: 'https://raw.githubusercontent.com/leandrafaith/casa0009-assignment/main/data/National_Nature_Reserves_England.json',
	    type: 'fill',
	    color: 'green',
	    outlinecolor:'blue',
	    below:'traces',
	    showlegend:true,
	    opacity:0.5,
	    marker:{size:5}

      },
],

				center: {
					lat: 53,
					lon: -1
				},
				domain: {
					x: [0,0.45],
					y: [0.2,1]
				},
				style: 'carto-positron',
				zoom: 5,

			},


			xaxis: {
				domain: [0.55, 1],
				title: {
					text: 'Year'
				}
			},

			yaxis: {
				domain: [0.25, 0.8],
				title: {
					text: 'Counts'
				}
			}

    }

		// Configuration for map
		Plotly.setPlotConfig({
			mapboxAccessToken: "pk.eyJ1IjoibmdsaWFuZ3dlaTE1IiwiYSI6ImNsMXhvdzB1bDAyNzkzZG43NzF2ajM3Y2EifQ.RnupTY7Atp7LreQEpiANLA"
		});

		Plotly.newPlot('map', data, layout);


	})

});

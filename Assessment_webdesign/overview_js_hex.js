// Function for unpacking rows
function unpack(rows, key) {
	return rows.map(function(row) {
		return row[key]; 
	});
}

d3.json("https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/hexes.json", function(data) {
	
	console.log('Loaded GeoJSON')
	
	// Get names of all hexes
	var hexes = []
	for (var i = 0; i < data.features.length; i++){
		hexes = hexes.concat(data.features[i].properties.hex)
	}
	
	d3.csv("https://raw.githubusercontent.com/ngliangwei15/CASA0009-GroupAssignment/main/LA_ind_hex.csv", function(rows) {
		
		console.log('Loaded CSV')
		
		var indicators = ['occ_den', 'sp_richness', 'sp_evenness']
		var years_Array = []
		
		for (var i = 0; i < rows.length; i++){
			// get years
			years_Array = years_Array.concat(rows[i].year);
		}
		
		// Get list of unique year
		var years = [...new Set(years_Array)];
		
		// Function for filtering rows by year
		function filter_rows(rows, locations, year) {
			// create container
			var rowsFiltered = []
			for (i in locations) {
				var rowFiltered = rows.filter(function(row) {
					return (row.hex === locations[i] && row.year === year)
				})
				rowsFiltered = rowsFiltered.concat(rowFiltered)
			}
			return rowsFiltered
		}
		
		//----- MAP -----//
		
		// Data for base map - occurrence data for 2011 to be visible
		rowsFiltered_map_base = filter_rows(rows, hexes, years[0])
		var data_map_base = indicators.map(function(indicators) {
			if (indicators === 'occ_den') {
				visibility = true
			} else {
				visibility = false
			}
			return {
				type: "choroplethmapbox",
				geojson: data,
				locations: hexes,
				featureidkey: "properties.hex",
				z: unpack(rowsFiltered_map_base, indicators),
				colorbar: {
					len: 0.48,
					y: 1.0,
					yanchor: "top"
				},
				visible: visibility
			}
			
		})
		
		console.log(data_map_base)
	
		// Function for getting data for dropdown list (by indicators and years)
		function dropdown_data(data, locations, ind, year) {
			rowsFiltered = filter_rows(data, locations, year)
			return unpack(rowsFiltered, ind)
		}		
				
		// Data for dropdown list (map) - each indicator is a trace, each year is a set of three indicators
		for (var j=0; j<years.length; j++) {
			window['data_map_'+years[j]] = indicators.map(function(indicators){ 
				return dropdown_data(rows, hexes, indicators, years[j])
			})
		}


		//----- GRAPH -----//
		
		// Data for base graph - occurrence data
		var colors = ['rgba(93, 164, 214, 0.5)', 
		'rgba(44, 160, 101, 0.5)', 
		'rgba(127, 96, 0, 0.5)'];
		
		var data_box_base = [];
		var visibility = true;
		
		for (var l=0; l<indicators.length; l++) {
			if (indicators[l] === indicators[0]) {
				visibility = true
			} else {
				visibility = false
			}
			
			var result = {
				type: 'box',
				x: years_Array,
				y: unpack(rows, indicators[l]),
				boxpoints: 'all',
				marker: {
					size: 2,
					color: colors[l],
				},
				jitter: 0.5,
				pointpos: -1.6,
				name: indicators[l],
				visible: visibility
			}
			
			data_box_base.push(result);
		}
		
		
		
		// Data for dropdown list (graph) - each year is a trace, each indicator is a set of years from 2011 to 2021
		for (var k=0; k<indicators.length; k++) {
			window['data_box_'+indicators[k]] = years.map(function(years) {
				var rowsFiltered_box_base = filter_rows(rows, hexes, years)
				return unpack(rowsFiltered_box_base, indicators[k])
			})
		}
		
		//----- MIXED SUBPLOT -----//
		
		var data_combined = data_map_base.concat(data_box_base);
		
		// Create labels for indicators
		let labels = ['Occurrence Density', 'Species Richness', 'Species Evenness']
		let ind_labels = {};
		for (let index = 0; index < indicators.length; ++index) {
			ind_labels[indicators[index]] = labels[index];
		}
		
		// Update menu button for dropdown list (for selection of year)
		var buttons_year = years.map(function(years) {
			return {
				method: 'restyle',
				args: ['z', window['data_map_'+years]],
				label: years
			}
		})	
		
		// Update menu button for dropdown list (for selection of indicators)
		var buttons_ind = [{
			method: 'restyle',
			args: ['visible', [true, false, false]],
//			args2: ['y', window['data_box_'+indicators[0]]],
			label: labels[0]
		}, {
			method: 'restyle',
			args: ['visible', [false, true, false]],
//			args2: ['y', window['data_box_'+indicators[1]]],
			label: labels[1]
		}, {
			method: 'restyle',
			args: ['visible', [false, false, true]],
//			args2: ['y', window['data_box_'+indicators[2]]],
			label: labels[2]
		}]	
		

		

		var layout = {
			mapbox: {
				domain: {
					x: [0, 1],
					y: [0.52, 0.98]
				},
				center: { lon: -1.5, lat: 53 },
				style: "carto-positron",
				zoom: 4.6,
			},

			
			xaxis: {
				domain: [0, 1],
				title: {
					text: 'Year'
				}
			},
			
			yaxis: {
				domain: [0.02, 0.48],
			},
			
			updatemenus: [{
				y: 0.9,
				yanchor: 'top',
				buttons: buttons_year
			}, {
				y: 1.0,
				yanchor: 'top',
				buttons: buttons_ind
			}]
		}
	
		Plotly.setPlotConfig({
			mapboxAccessToken: "pk.eyJ1IjoibmdsaWFuZ3dlaTE1IiwiYSI6ImNsMXhvdzB1bDAyNzkzZG43NzF2ajM3Y2EifQ.RnupTY7Atp7LreQEpiANLA"
		});
		
	
		Plotly.newPlot('overview', data_combined, layout);	

		
	})
	

})
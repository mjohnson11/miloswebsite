var data = {};
var allele_info;
var s_data; // s_data formatted like [state, state-w-0-fitness, s] with an X at the mutation position and s is fitness effect of going 0 to 1
var current_displayed_pick = -1;
var picked_mutation = 0;
var color_mutation = 1;
var symbol_mutation = 2;
var state_text;

var error_bar_y;
var error_bar_x;

var svg_obj;

var s_domain = [-0.15, 0.1];
var x_domain = [-0.15, 0.1];

var graph_h = 470;
var graph_w = 510;

var x_ax = d3.scaleLinear()
  .range([40, graph_w-15])
  .domain(x_domain);
var s_ax = d3.scaleLinear()
  .range([graph_h-30, 15])
	.domain(s_domain);
var for_zero_line = d3.line()
  .x(function(d) { return x_ax(d.x); })
  .y(function(d) { return s_ax(d.y); })

function display_time() {
	d3.select("#pick1").selectAll(".trait")
		.attr("class", function(d, i) {
			if (i == picked_mutation) {
				return 'trait pick_highlight';
			} else {
				return 'trait'
			}
		})

	d3.select("#pick2").selectAll(".trait")
		.attr("class", function(d, i) {
			if (i == color_mutation) {
				return 'trait color_highlight';
			} else {
				return 'trait'
			}
		})
	
	d3.select("#pick3").selectAll(".trait")
		.attr("class", function(d, i) {
			if (i == symbol_mutation) {
				return 'trait symbol_highlight';
			} else {
				return 'trait'
			}
		})
	
	if (picked_mutation != current_displayed_pick) {
		d3.selectAll('.data_point').remove();
		svg_obj.selectAll(".data_point")
			.data(s_data)
			.enter()
				.append("rect")
					.attr("class", "data_point")
					.attr("width", 8)
					.attr("height", 8)
					.attr("stroke", "#000")
					.attr("stroke-width", 0)
					.attr("opacity", 0.7)
					.attr("x", function(d) { return x_ax(d['Fitness1'])-4; })
					.attr("y", function(d) { return s_ax(d['s'])-4; })
					.on("mouseover", function(d) {
						d3.select(this).attr("stroke-width", 2)
						error_bar_x.attr('x', x_ax(d['Fitness1']-d['Error1'])).attr('y', s_ax(d['s'])-1).attr('width', x_ax(d['Error1']*2)-x_ax(0));
						error_bar_y.attr('x', x_ax(d['Fitness1'])-1).attr('y', s_ax(d['s']+d['Error2'])).attr('height', -1*(s_ax(d['Error2']*2)-s_ax(0)));
						state_text.html(d['State'].split("").join("<br />"));
					})
					.on("mouseout", function(d) {
						d3.select(this).attr("stroke-width", 0)
						error_bar_x.attr('width', 0);
						error_bar_y.attr('height', 0);
						state_text.html("");
					})
		current_displayed_pick = picked_mutation;
	}
	svg_obj.selectAll(".data_point")
		.attr("fill", function(d) { return (d['State'][color_mutation] == '0') ? "#1E88E5" : "#DE1B62"; })
		.attr("rx", function(d) { return (d['State'][symbol_mutation] == '0') ? "0%" : "50%"; });
}

function mutation_pick(d, i) {
	s_data = [];
	for (let entry in data) {
		if (entry[i] == '0') {
			let datum1 = data[entry]
			if (entry.substr(0, i) + '1' + entry.substr(i+1) in data) {
				let datum2 = data[entry.substr(0, i) + '1' + entry.substr(i+1)]
				s_data.push({'State': entry.substr(0, i) + 'X' + entry.substr(i+1), 'Fitness1': datum1[0], 'Fitness2': datum2[0], 's': datum2[0] - datum1[0], 'Error1': datum1[1], 'Error2': datum2[1]});
			}
		}
	}
	picked_mutation = i;
	display_time();
}

function format_trait(allele) {
	s = '<div class="state0"><p3>' + allele['Allele1'] + '</p3></div>\n<div class="site"><p3>' + allele['Gene'];
	s += '</p3></div>\n<div class="sitespot"><p3>' + allele['Pos'] + '</p3></div>\n<div class="state1"><p3>' + allele['Allele2'] + '</p3></div>';
	return s;
}

function setup() {
	d3.select("#pick1").selectAll(".trait")
		.data(allele_info)
		.enter()
			.append("div")
			.attr("class", "trait")
			.attr("id", function(d, i) { return 't' + String(i+1); })
			.html(function(d) { return format_trait(d); })
			.on('click', function(d, i) { mutation_pick(d, i); });

	d3.select("#pick2").selectAll(".trait")
		.data(allele_info)
		.enter()
			.append("div")
			.attr("class", "trait")
			.attr("id", function(d, i) { return 't' + String(i+1); })
			.html(function(d) { return format_trait(d); })
			.on('click', function(d, i) { color_mutation=i; display_time(); });

		d3.select("#pick3").selectAll(".trait")
			.data(allele_info)
			.enter()
				.append("div")
				.attr("class", "trait")
				.attr("id", function(d, i) { return 't' + String(i+1); })
				.html(function(d) { return format_trait(d); })
				.on('click', function(d, i) { symbol_mutation=i; display_time(); });

	svg_obj = d3.select('#svg_graph').append("svg")
		.attr("id", "data_browser")
		.attr("width", graph_w)
		.attr("height", graph_h);
		
	svg_obj.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + x_ax(x_domain[0]) + ", 0)")
		.call(d3.axisLeft(s_ax).ticks(5));
	svg_obj.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + s_ax(s_domain[0]) + ")")
		.call(d3.axisBottom(x_ax).ticks(5));
	svg_obj.append("path")             
		.attr("class", "horizontal_dash")
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-width", 3)
		.attr("opacity", 0.5)
		.attr("d", for_zero_line([{'x': x_domain[0], 'y': 0}, {'x': x_domain[1], 'y': 0}]));

	error_bar_y = svg_obj.append("rect")
		.attr("width", 2)
		.attr("height", 0)
		.attr("stroke", '#000')
		.attr("fill", '#000');
	
	error_bar_x = svg_obj.append("rect")
		.attr("width", 0)
		.attr("height", 2)
		.attr("stroke", '#000')
		.attr("fill", '#000');

	state_text = d3.select("#state_text");

}

function loaddata() {
	//This function loads the data from the input file and serves as the main 
	//function for the page, listening for clicks and calling the other functions
	d3.csv("data/Allele_info.csv")
    .then(function(data_in) {
      allele_info = data_in;
			console.log(allele_info);
			setup();
			var file = "data/fitnesses_fa_hap_37C.txt";
			$.get(file, function(textdata) {
				let lines = textdata.split('\n');
				for (let line of lines) {
					data[line.split('\t')[0]] = [parseFloat(line.split('\t')[1]), parseFloat(line.split('\t')[2])]
				}
				console.log(data);
				mutation_pick(null, 0);
				display_time();
			}, 'text')
			.fail(function(t, g, h) {
				alert('Reading file failed: ' + g);
			});
    })
    .catch(function(error) {
      console.log(error);  
  });

}
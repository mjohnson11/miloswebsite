//This script holds the data about the state of the system,
//let's the user change the state,
//and holds a record of the states visited and corresponding dependent and fitness values.
//It also displays these values and a graph of the record


google.load("visualization", "1", {packages:["corechart"]});

var data = {};
var allele_info;

//record of steps and fitness scores, for graphing
//IN THIS CASE IT'S ACTUALLY ANTIBIOTIC RESISTANCE but it still works just a bad name
var fitness_record = [];

//records the states and everything for the current run, rows like [timepoint, state, fitness]
var state_record = [];

//the number of runs
var run_num = 1;
//current run step counter
var current_step = 0;

var intervalhandle = null; //for stopping and starting simulation

var running = false; //variable for if simulation is currently happening

//User option parameters for simulation
var accept_neutral = false;
var sim_tolerance = 0;

var n_states = 10;

function drawChart() {

    var chart_data = new google.visualization.DataTable();
    
    chart_data.addColumn('number', 'Step');
    //add a column for each run
    //alert('1');
    for (var i=0; i < run_num; i++) {
        chart_data.addColumn('number', 'Run # ' + (i+1));
    }

    //alert('2');
    //alert(fitness_record);
    chart_data.addRows(fitness_record);
    //alert('3');
    
    var options = {
      height: 400,
      legend: {position: 'none'},
      vAxis: {title: "Fitness"},
      hAxis: {title: "Step", format: '#'},
      backgroundColor: "transparent"
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(chart_data, options);

}

function flip_bit(str_1, index) {
	//flips a bit in a state string (str_1) of ones and zeros at position index
	if (str_1.charAt(index) == '0') {
	  	return str_1.substr(0, index) + '1' + str_1.substr(index+1);
	} else {
		return str_1.substr(0, index) + '0' + str_1.substr(index+1);
	}
}

function display_trait(index) {
    //displays the trait at index position with the right color on each letter
	var trait_list = document.getElementsByClassName("trait");
	
	var current_state = state_record[state_record.length-1][1].charAt(index);
	
	var st0 = trait_list[index].getElementsByClassName("state0")[0];
	var st1 = trait_list[index].getElementsByClassName("state1")[0];

    //change the state color
	if (current_state == "1") {
	    st0.style.color = "black";
	    st1.style.color = "red";
	} else {
	    st0.style.color = "red";
	    st1.style.color = "black";
	}
}


function change_state(index) {
	//Changes the state of the bit at position index and changes the display of that
	//trait block

	//add new state to records and display them
	let new_state = flip_bit(state_record[state_record.length-1][1], index);
	state_record.push([state_record.length + 1].concat([new_state, data[new_state]]));
	display_values();
	
	add_to_fitness_record();
	
	display_trait(index);
	drawChart();
}

function display_values() {
    //displays state, phenotype, and fitness rank values
    document.getElementById("current_state").innerHTML =  "Current State: " + state_record[state_record.length-1][1];
    document.getElementById("pheno_value").innerHTML = state_record[state_record.length-1][2];
}

function simulate() {
    //This function makes random changes to the state and accepts them
    //based on several user option variables (accept_neutral and sim_tolerance)
    
    //Change the state and check the fitness score
		var rand_index = Math.floor(Math.random()*n_states);
		let tmp_state = flip_bit(state_record[state_record.length-1][1], rand_index);
    var temp_score = data[tmp_state];
    var current_score = state_record[state_record.length-1][2];
    //alert(temp_score);
    //alert(current_score);

	var change = true;

	var temp_tol = Number(sim_tolerance);
	if (temp_score) {
		if (temp_score < current_score) { //if deleterious
	    if ((temp_score + temp_tol) >= current_score) { //if within tolerance for "nearly neutral"
	        if (!accept_neutral) {  //if not accepting nearly neutral
	            change = false;
	        }
	    } else {
	        change = false;
	    }
		}
	} else {
		change = false;
	}

	//alert("step");
	if (change) {
	    //alert("change");
	    change_state(rand_index);
	} else {
	    //alert("reject");
	    //adds a step to the process but doesn't make any change - adds a step to state_record
	    state_record.push(state_record[state_record.length-1].slice());
	    state_record[state_record.length-1][0] += 1;
		display_values();
		add_to_fitness_record();
		display_trait(rand_index);
		drawChart();
	}
	//alert("pause");
	
	//pause the simulation every 800 steps so the script doesn't keep running when people leave the tab
	if ((state_record[state_record.length-1][0] % 800) == 0) {
	    stop_simulating();
	}
}

function simulate_time() {
    intervalhandle = setInterval(function(){simulate()}, 300);
}

function start_simulating() {
    if (!running) {
        running = true;
        update_sim();
        simulate_time();
    }
}

function stop_simulating() {
    running = false;
    clearInterval(intervalhandle);
}

function update_sim() {
    accept_neutral = document.getElementById("sim_form").neutral_check.checked;
    sim_tolerance = document.getElementById("sim_form").tolerance.value;
}

function new_run() {
    
    //stop simulate if we are
    if (running) {
        stop_simulating();
    }
    
    //delete state_record variable information (reset it)
    while (state_record.length > 0) {
        state_record.pop();
    }
    
    //change run_num so we know it's a new run and reset current step
	run_num += 1;
	current_step = 0;
	
	//add a column of nulls to the fitness_record
	for (var i=0; i<fitness_record.length; i++) {
	    fitness_record[i].push(null);
	}
    
    //add first entry to state_record
	state_record.push([1].concat(['0'.repeat(n_states), data['0'.repeat(n_states)]]));
	//display values
	display_values();
	//reset the display for all traits
	for (var i=0; i<n_states; i++) {
	    display_trait(i);
	}
	//add the initial antibiotic resistance value to the fitness record variable
	add_to_fitness_record();
    drawChart();
	
}

function add_to_fitness_record() {
    
    current_step += 1;
    //If this step makes the array longer - if it's further down the x axis than we've gone before
    if (fitness_record.length < current_step) {
        fitness_record.push([fitness_record.length + 1]);
        //fill in every run with null
        for (var i=0; i < run_num; i++) {
            fitness_record[current_step-1].push(null);
        }
    }
    //assign fitness record the most recent antibiotic score (the third column of state_record)
    //at the column for the current run
    fitness_record[current_step-1][run_num] = Number(state_record[state_record.length-1][2]);
}

function reset() {
	//resets the whole shebang
	
	//stop simulate if we are
	if (running) {
			stop_simulating();
	}
	
	//delete state_record variable information (reset it)
	while (state_record.length > 0) {
			state_record.pop();
	}
	
	//delete fitness_record variable information (reset it)
	while (fitness_record.length > 0) {
			fitness_record.pop();
	}
    
	//change run_num so we know it's the first run and reset current step
	run_num = 1;
	current_step = 0;
	
	//add a column of nulls to the fitness_record
	for (var i=0; i<fitness_record.length; i++) {
	    fitness_record[i].push(null);
	}
    
	//add first entry to state_record
	state_record.push([1].concat(['0'.repeat(n_states), data['0'.repeat(n_states)]]));
	//display values
	display_values();
	//reset the display for all traits
	for (var i=0; i<n_states; i++) {
	    display_trait(i);
	}
	//add the initial antibiotic resistance value to the fitness record variable
	add_to_fitness_record();
	drawChart();
}

function format_trait(allele) {
	s = '<div class="state0"><p3>' + allele['Allele1'] + '</p3></div>\n<div class="site"><p3>' + allele['Gene'];
	s += '</p3></div>\n<div class="sitespot"><p3>' + allele['Pos'] + '</p3></div>\n<div class="state1"><p3>' + allele['Allele2'] + '</p3></div>';
	return s;
}

function make_blocks() {
	console.log('here');
	d3.select("#state").selectAll(".trait")
		.data(allele_info)
		.enter()
			.append("div")
			.attr("class", "trait")
			.attr("id", function(d, i) { return 't' + String(i+1); })
			.html(function(d) { return format_trait(d); });
}

function loaddata() {
	//This function loads the data from the input file and serves as the main 
	//function for the page, listening for clicks and calling the other functions
	d3.csv("data/Allele_info.csv")
    .then(function(data_in) {
      allele_info = data_in;
			console.log(allele_info);
			make_blocks();
    })
    .catch(function(error) {
      console.log(error);  
  });
	//display current tolerance
	document.getElementById("tolerance_show").innerHTML = document.getElementById("tol_text").value;

	var file = "data/fitnesses_fa_hap_37C.txt";
	$.get(file, function(textdata) {
		let lines = textdata.split('\n');
		for (let line of lines) {
			data[line.split('\t')[0]] = parseFloat(line.split('\t')[1])
		}
		console.log(data);
	
		//add first entry to state_record
		state_record.push([1].concat(['0'.repeat(n_states), data['0'.repeat(n_states)]]));
		//display values
		display_values();
	    
		//add the antibiotic resistance value to the fitness record variable
		add_to_fitness_record();
		
		drawChart();
	
		var trait_list = document.getElementsByClassName("trait");
		
		//Set up listeners for clicks on trait blocks
		for (var i = 0; i< trait_list.length; i++) {
			trait_list[i].index = i;
			display_trait(i); //set up proper display based on the initial state
			trait_list[i].addEventListener('click', function(i) {
				change_state(this.index);
			});
		}
	}, 'text')
	.fail(function(t, g, h) {
		alert('Reading file failed: ' + g);
	});

}
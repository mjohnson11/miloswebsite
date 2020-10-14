//This script holds the data about the state of the system,
//let's the user change the state or simulate changes based on rules,
//and holds a record of the states visited and corresponding fitness values.
//It also displays these values and a graph of the record

google.load("visualization", "1", {packages:["corechart"]});

//this makes it try every mutation and put a green border on the beneficial ones
var TRY_EVERYTHING = false;

//record of steps and fitness scores, for graphing
var fitness_record = [];

//current state information holder - trait values, interactions, etc.
var state_info = [];

//the number of runs
var run_num = 1;
//current run step counter
var current_step = 1;

var intervalhandle = null; //for stopping and starting simulation

var running = false; //variable for if simulation is currently happening

//User option parameters for simulation
var accept_neutral = false;
var sim_tolerance = 0;

//a string of 1's and 0's representing the initial state
var initial_state = "";

function try_everything_toggle() {
    if (TRY_EVERYTHING) {
        var trait_list = document.getElementsByClassName("NK_trait");
        for (var i=0; i<N; i++) {
            trait_list[i].style.borderColor = "#303030"; 
        }
        document.getElementById("border_show_button").innerHTML = "SHOW ACCEPTABLE MUTATIONS";
        TRY_EVERYTHING = false;
    } else {
        TRY_EVERYTHING = true;
        try_everything();
        document.getElementById("border_show_button").innerHTML = "HIDE ACCEPTABLE MUTATIONS";
    }
}


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
      vAxis: {title: "Fitness Score"},
      hAxis: {title: "Step", format: '#'},
      backgroundColor: "transparent"
    };

    var chart = new google.visualization.LineChart(document.getElementById('NK_chart_div'));
    chart.draw(chart_data, options);
    //alert('graphed');

}

function change_state(index) {
    if (state_info[index].state == "1") {
		state_info[index].state = "0";
	} else {
		state_info[index].state = "1";
	}
}


function make_step(index, actually_change) {
	//Changes the .state of the DOM object for the trait block at index and changes
	//the color
	var trait_list = document.getElementsByClassName("NK_trait");
	
	if (actually_change) {
	    change_state(index)
	    if (state_info[index].state == "1") {
    		trait_list[index].style.backgroundColor = "red";
    	} else {
    	    trait_list[index].style.backgroundColor = "#444444";
    	}
	}

    current_step += 1;
    //If this step makes the array longer - if it's further down the x axis than we've gone before
    if (fitness_record.length < current_step) {
        fitness_record.push([fitness_record.length + 1]);
        //fill in every run with null
        for (var i=0; i < run_num; i++) {
            fitness_record[current_step-1].push(null);
        }
    } 
    //assign fitness score to proper row
	fitness_record[current_step-1][run_num] = calc_fit_score();
	document.getElementById("pheno_value").innerHTML = fitness_record[current_step-1][run_num].toPrecision(6);
	drawChart();
	
}

function find_gene_combos(num, str) {
	//A recursive function that returns all possible combos of num traits 
	//as strings with num 1's and 0's
	if (str.length == num) {
		return [str];
	} else {
		var tmp_array1 = find_gene_combos(num, str + "1");
		var tmp_array2 = find_gene_combos(num, str + "0");
		return tmp_array1.concat(tmp_array2);
	}
}

function make_fit_contribs(all_gene_combos) {
	//assigns a random fitness contribution to each of the possible combos of traits
	//and returns an object that can serve as a dictionary between state strings
	//and these fitness contribution values
    var fit_c = new Object;
    len = all_gene_combos.length;
    for (var i=0; i<len; i++) {
        fit_c[all_gene_combos[i]] = Math.random();
    }
    return fit_c;
}

function make_trait(N, K, i, all_gene_combos) {
	//Makes a new trait by assigning it a random first state, K interactors,
	//and a fit_contrib object that keys between the state of the trait and the state of
	//its K interactors and a fitness contribution between one and zero.
	var trait_info = new Object;
	var interactors = [i]; //the self state is included as the first interactor
	trait_info.index = i; //index
	trait_info.state = String(Math.round(Math.random())); //random first state
	for (var j=0; j<K; j++) {
		interactors.push(Math.floor((Math.random()*N)));  //add K interactors
	}
	trait_info.interactors = interactors;
	trait_info.fit_contrib = make_fit_contribs(all_gene_combos);
	trait_info.affects = [];
	return trait_info;
}

function calc_fit_score() {
	//calculates the current fitness score
	//the affects object holds the indexes of all traits that another trait affects
	//this object currently isn't used but could be later on to improve efficiency
	//at recalculating fitness after changes are made.
	var fit_score = 0;
	for (var i=0; i<N; i++) {
	    var state_str = "";
	    for (var j=0; j<(K+1); j++) {
	    	//adding the state of the interactors to the state string
	    	//the first interactor is the state in question
	        state_str += state_info[state_info[i].interactors[j]].state;
	        state_info[state_info[i].interactors[j]].affects.push(i);
	    }
	    //add the corresponding fitness contribution
	    fit_score += state_info[i].fit_contrib[state_str];
	}
	return fit_score/N;
}

function try_mutation(ind) {
    if (state_info[ind].state == "1") {
		state_info[ind].state = "0";
	} else {
		state_info[ind].state = "1";
	}
	var temp_score = calc_fit_score();
	
	var change = true;
	
	var temp_tol = Number(sim_tolerance);
	
	if (temp_score < fitness_record[current_step-1][run_num]) { //if deleterious
	    if ((temp_score + temp_tol) >= fitness_record[current_step-1][run_num]) { //if within tolerance for "nearly neutral"
	        if (!accept_neutral) {  //if not accepting nearly neutral
	            change = false;
	        }
	    } else {
	        change = false;
	    }
	}
	
    if (state_info[ind].state == "1") {
		state_info[ind].state = "0";
	} else {
		state_info[ind].state = "1";
	}
	
	return change;
}

function try_everything() {
    //this function tries every possible mutation
    //and puts a green border around those that are acceptable
    
    var trait_list = document.getElementsByClassName("NK_trait");
    
    for (var i=0; i<N; i++) {
        var temp_change = try_mutation(i);
        //alert(temp_change);
        if (temp_change) {
            trait_list[i].style.borderColor = "#20AF20";
        } else {
            trait_list[i].style.borderColor = "#303030"; 
        }
    }
}


function simulate() {
    //This function makes random changes to the state and accepts them
    //based on several user option variables (accept_neutral and sim_tolerance)
    
    if (TRY_EVERYTHING) {
        try_everything();
    }
    
    //Change the state and check the fitness score
    var rand_index = Math.floor(Math.random()*N);

    var temp_chng = try_mutation(rand_index);

	make_step(rand_index, temp_chng);
	
	//pause the simulation every 800 steps so the script doesn't keep running when people leave the tab
	if ((fitness_record[fitness_record.length-1][0] % 800) == 0) {
	    stop_simulating();
	}
}

function simulate_time() {
    intervalhandle = setInterval(function(){simulate()}, 10);
}

function start_simulating() {
    if (!running) {
        running = true;
        //update options
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

function new_same_run() {
    //new run with same interactions and initial state
    
    //stop simulate if we are
    if (running) {
        stop_simulating();
    }
    
    var trait_list = document.getElementsByClassName("NK_trait");

    //reset state_info states to the initial state of the system
    //but don't change the interactions or scores
	for (var i=0; i<N; i++) {
		//reset the state to initial condition
		state_info[i].state = initial_state.charAt(i);
		//change the color of the html DOM element
		if (state_info[i].state == "1") {
		    trait_list[i].style.backgroundColor = "red";
		} else {
		    trait_list[i].style.backgroundColor = "#444444";
		}
	}

	//change run_num so we know it's a new run and reset current step
	run_num += 1;
	current_step = 1;
	
	//add a column of nulls to the fitness_record
	for (var i=0; i<fitness_record.length; i++) {
	    fitness_record[i].push(null);
	}

	//add initial fitness score to the next column in fitness_record
	fitness_record[0][run_num] = calc_fit_score();
	
	document.getElementById("pheno_value").innerHTML = fitness_record[0][run_num].toPrecision(6);
	drawChart();
	
}

function new_run() {
    
    //stop simulate if we are
    if (running) {
        stop_simulating();
    }
    
    //delete state info variable information (reset it)
    while (state_info.length > 0) {
        state_info.pop();
    }
    
    //get possible state string combos for K+1 states (2^(K+1))
    var all_gene_combos = find_gene_combos(K+1, "");
    
    //initializing new initial state
    var trait_list = document.getElementsByClassName("NK_trait");
    initial_state = "";

	for (var i=0; i<N; i++) {
		//make a new trait
		state_info.push(make_trait(N, K, i, all_gene_combos));
		//change the color of the html DOM element
		initial_state += state_info[i].state; //add a 1 or 0 onto the initial state string

		if (state_info[i].state == "1") {
		    trait_list[i].style.backgroundColor = "red";
		} else {
		    trait_list[i].style.backgroundColor = "#444444";
		}
	}

	//change run_num so we know it's a new run and reset current step
	run_num += 1;
	current_step = 1;
	
	//add a column of nulls to the fitness_record
	for (var i=0; i<fitness_record.length; i++) {
	    fitness_record[i].push(null);
	}

	//add initial fitness score to the next column in fitness_record
	fitness_record[0][run_num] = calc_fit_score();
	
	document.getElementById("pheno_value").innerHTML = fitness_record[0][run_num].toPrecision(6);
	drawChart();
	
}

function reset() {
    
    //stop simulate if we are
    if (running) {
        stop_simulating();
    }
    
    //delete state info variable information (reset it)
    while (state_info.length > 0) {
        state_info.pop();
    }
    
        //delete fitness_record variable information (reset it)
    while (fitness_record.length > 0) {
        fitness_record.pop();
    }
    
    //get possible state string combos for K+1 states (2^(K+1))
    var all_gene_combos = find_gene_combos(K+1, "");
    
    //initializing new initial state
    var trait_list = document.getElementsByClassName("NK_trait");
    initial_state = "";

	for (var i=0; i<N; i++) {
		//make a new trait
		state_info.push(make_trait(N, K, i, all_gene_combos));
		//change the color of the html DOM element
		initial_state += state_info[i].state; //add a 1 or 0 onto the initial state string

		if (state_info[i].state == "1") {
		    trait_list[i].style.backgroundColor = "red";
		} else {
		    trait_list[i].style.backgroundColor = "#444444";
		}
	}

	//change run_num so we know it's the first run and reset current step
	run_num = 1;
	current_step = 1;
	

	//add initial fitness score to the next column in fitness_record
	fitness_record.push([1, calc_fit_score()]);
	
	document.getElementById("pheno_value").innerHTML = fitness_record[0][run_num].toPrecision(6);
	drawChart();
	
}

function main_func() {
    //this is the main function that gets called first.  The inputs are N, the
		//number of genes, and K, the nubmer of interactors for each gene
		
		//delete old blocks
		let old_blocks = document.getElementsByClassName("NK_trait");
		console.log(old_blocks.length);
		while (old_blocks[0]) {
			let jnk = old_blocks[0].parentNode.removeChild(old_blocks[0]);
		}
        
		N = parseInt(document.getElementById('N_input').value);
		if (N > 100) {
			N = 100;
			document.getElementById('N_input').value = 100;
		} else if (N < 1) {
			N = 1;
			document.getElementById('N_input').value = 1;
		}
		K = parseInt(document.getElementById('K_input').value);
		if (K > 12) {
			K = 12;
			document.getElementById('K_input').value = 12;
		} else if (K < 0) {
			K = 0;
			document.getElementById('K_input').value = 0;
		}
    
    //display current tolerance
    document.getElementById("tolerance_show").innerHTML = document.getElementById("tol_text").value;
    
    document.getElementById("state_title").innerHTML = "state of " + N + " binary traits";
    
    if (document.getElementById("sim_form"))
	//This function serves as the main 
	//function for the page, listening for clicks and calling the other functions

	//get possible state string combos for K+1 states (2^(K+1))
    var all_gene_combos = find_gene_combos(K+1, "");
    
    var blocks_per_row = Math.ceil(Math.sqrt(N));
    
    var trait_block_width = Math.floor((249-blocks_per_row)/blocks_per_row);

    var trait_node = document.getElementById("state");
	for (var i=0; i<N; i++) {
		//make a new trait
		state_info.push(make_trait(N, K, i, all_gene_combos));
		//create the html DOM element
		var el = document.createElement("trait" + i);
		el.className = "NK_trait";
		initial_state += state_info[i].state; //add a 1 or 0 onto the initial state string
        
        //set it's color based on it's state (red is on)
		if (state_info[i].state == "1") {
		    el.style.backgroundColor = "red";
		} else {
		    el.style.backgroundColor = "#444444";
		}
	    el.style.height = trait_block_width.toString() + "px";
	    el.style.width = trait_block_width.toString() + "px";

		trait_node.appendChild(el);
	}

	//alert(initial_state);
	reset();
	//calculate initial fitness score add first entry to fitness_record
	var fit_score = calc_fit_score(state_info, N, K);
	fitness_record.push([1, calc_fit_score()]);

	document.getElementById("pheno_value").innerHTML = fitness_record[0][1].toPrecision(6);
	drawChart();

	var trait_list = document.getElementsByClassName("NK_trait");
	
	if (TRY_EVERYTHING) {
        try_everything();
    }
		
	for (var i = 0; i< trait_list.length; i++) {
		//trait_list[i].style.backgroundColor = "blue";
		trait_list[i].index = i;
		trait_list[i].addEventListener('click', function() {
			make_step(this.index, true);
			if (TRY_EVERYTHING) {
                try_everything();
            }
		});
	}
    
}
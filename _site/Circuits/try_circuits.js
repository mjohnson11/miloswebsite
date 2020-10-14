//This script runs a simulation of interacting regulating elements
//in a step-by-step way

var running; //variable for if simulation is currently happening

//current state information holder - trait values, interactions, etc.
var state_info;

//holds list of states to check for limit cycles and attractors and stuff
var state_record;
var in_cycle; //text to put down there Searching, Fixed Point, or Limit Cycle


function validate(str, min, max) {
    n = parseFloat(str);
    return (!isNaN(n) && n >= min && n <= max);
}

function change_states(full_list) {
	//Changes the state of all the players at the next step
	var trait_list = document.getElementsByClassName("circuit_trait");
    
    for (var i=0; i<state_info.length; i++) {
        if (state_info[i].on) {
    		if (full_list[i] == 1) {
    			trait_list[i].style.opacity = 0.95;
    			state_info[i].state = 1;
    		} else {
    			trait_list[i].style.opacity = 0.2;
    			state_info[i].state = 0;
    		}
        }
	}
}

function array_comp(a1, a2) {
    if (a1.length == a2.length) {
        for (var i=0; i<a1.length; i++) {
            if (a1[i] != a2[i]) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

function check_for_cycle(current_state) {
    //Checks if the system is stable or in a limit cycle by looking back in the state_record
    //the state record only goes back to the last time a trait was clicked (turning it off or back on)

    if (array_comp(state_record[state_record.length-1], current_state)) {
        //fixed point attractor / stable equilibrium
        //alert(state_record);
        //alert(current_state);
        in_cycle = "Fixed Point";
        document.getElementById("limit_cycle_ques").innerHTML = in_cycle;
    } else {
        //checking for dynamic attractor / limit cycle
        var at_limit = false;
        var limit_length = 0;
        for (var i=0; i<state_record.length; i++) {
            if (array_comp(state_record[i], current_state)) {
                limit_length = state_record.length - i;
                at_limit = true;
            }
        }
        if (at_limit) {
            //alert(current_state);
            //alert(state_record);
            in_cycle = "Limit Cycle Length " + limit_length;
            document.getElementById("limit_cycle_ques").innerHTML = in_cycle;
        }
    }

}

function simulate() {
    //This function makes random changes to the state and accepts them
    //based on several user option variables (accept_neutral and sim_tolerance)
    var full_new_state_list = [];
    for (var i=0; i<state_info.length; i++) {
        if (state_info[i].on) {
        	var state_str = "";
    	    for (var j=0; j<K; j++) {
    	    	//adding the state of the interactors to the state string
    	    	//the first interactor is the state in question
    	        state_str += state_info[state_info[i].interactors[j]].state;
    	    }
    	    //CHECK IF THE PLAN SAYS IT SHOULD BE ON OR OFF FOR THE NEXT STATE
    	    full_new_state_list.push(state_info[i].fit_contrib[state_str]);
        } else {
            full_new_state_list.push(0);
        }
	}
	//now change the states
	change_states(full_new_state_list);
	
	if (in_cycle == "Searching...") {
	    check_for_cycle(full_new_state_list);
    	state_record.push(full_new_state_list);
	}
		
}

function simulate_time() {
    intervalhandle = setInterval(function(){simulate()}, 100);
}

function start_simulating() {
    if (!running) {
        running = true;
        //update options
        simulate_time();
    }
}

function stop_simulating() {
    running = false;
    clearInterval(intervalhandle);
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
        fit_c[all_gene_combos[i]] = Math.round(Math.random());
    }
    return fit_c;
}

function make_trait(N, K, i, all_gene_combos) {
	//Makes a new trait by assigning it a random first state, K interactors,
	//and a fit_contrib object that keys between the state of the trait and the state of
	//its K interactors and a fitness contribution between one and zero.
	var trait_info = new Object;
	var interactors = [];
	trait_info.index = i; //index
	trait_info.state = String(Math.round(Math.random())); //random first state
	for (var j=0; j<K; j++) {
		interactors.push(Math.floor((Math.random()*N)));  //add K interactors
	}
	trait_info.interactors = interactors;
	trait_info.fit_contrib = make_fit_contribs(all_gene_combos);
	trait_info.on = true;
	var hue = Math.floor(Math.random()*360);
	trait_info.color = "hsl(" + hue.toString() + ", 70%, 50%)";
	return trait_info;
}

function xpos(ind, tpr) {
    var column = ind % (tpr);
    return column;
}

function ypos(ind, tpr) {
    var row = Math.floor(ind / tpr);
    return row;
}


function draw_line(first, second, tpr) {
    
    var line_el = document.createElement("img");
    line_el.src = "images/arrow.png";
    line_el.className = "circuit_line";
    //alert("line " + first + " " + second);
    var line_style = line_el.style;
    line_style.left = ((xpos(first, tpr) + 0.5)*Math.floor(800.0/tpr)).toString() + "px";
    line_style.top = ((ypos(first, tpr) + 0.5)*Math.floor(600.0/tpr) - 12).toString() + "px";
    
    var x_dist = (xpos(first, tpr) - xpos(second, tpr))*Math.floor(800.0/tpr);
    var y_dist = (ypos(first, tpr) - ypos(second, tpr))*Math.floor(600.0/tpr);
    var pixel_dist = Math.sqrt(x_dist*x_dist + y_dist*y_dist);
    pixel_dist = pixel_dist*1.02;
    pixel_dist -= 12;
    
    //find the angle
    var angle;
    if (x_dist == 0) {
        if (y_dist == 0) {
            line_el.src = "images/self_effect.png";
            line_style.width = "21px";
            line_style.height = "19px";
            line_style.left = ((xpos(first, tpr) + 0.5)*Math.floor(800.0/tpr) - 11).toString() + "px";
            line_style.top = ((ypos(first, tpr) + 0.5)*Math.floor(600.0/tpr) - 9).toString() + "px";
            return line_el;
        } else {
            x_dist = 0.1;
        }
    }
    angle = Math.atan(y_dist/x_dist);
    deg_angle = angle * 180 / Math.PI;
    if (x_dist >= 0) {
        deg_angle += 180;
    }
    //alert(deg_angle);
    line_style.width = Math.floor(pixel_dist);
    
    line_style.transformOrigin= "0% 50%";
    line_style.transform="rotate(" + deg_angle + "deg)";
    
    //for Safari
    line_style.webkitTransformOrigin= "0% 50%";
    line_style.webkitTransform="rotate(" + deg_angle + "deg)";
    
    //for IE
    line_style.msTransformOrigin= "0% 50%";
    line_style.msTransform="rotate(" + deg_angle + "deg)";

    return line_el;

}

function draw_connections(traits_per_row) {
    
    var arrow_node = document.getElementById("arrow_house");
    for (var i=0; i<state_info.length; i++) {
        for (var j=0; j<state_info[i].interactors.length; j++) {
            arrow_node.appendChild(draw_line(state_info[i].interactors[j], i, traits_per_row));
        }
    }
    arrow_node.style.display = "none";

}

function show_hide_arrows() {
    //shows or hides the interaction arrows - called from the html

    var arrow_node = document.getElementById("arrow_house");
    if (arrow_node.style.display == "none") {
        arrow_node.style.display = "block";
    } else {
        arrow_node.style.display = "none";
    }
    
}

function get_current_state() {
    var temp_state = [];
    for (var i=0; i<state_info.length; i++) {
        temp_state.push(state_info[i].state);
    }
    return temp_state;
}

function main_func() {
    //this is the main function that gets called first.  The inputs are N, the
    //number of genes, and K, the nubmer of interactors for each gene
    
    running = false; //variable for if simulation is currently happening

    //current state information holder - trait values, interactions, etc.
    state_info = [];

    //holds list of states to check for limit cycles and attractors and stuff
    state_record = [];
    in_cycle = "Searching..."; //text to put down there Searching, Fixed Point, or Limit Cycle
    document.getElementById("limit_cycle_ques").innerHTML = in_cycle;
    
    //delete squares if this is the second round
    var deleters = document.getElementsByClassName('circuit_line');
    while(deleters[0]) {
        deleters[0].parentNode.removeChild(deleters[0]);
    }
    deleters = document.getElementsByClassName('circuit_trait')
    while(deleters[0]) {
        deleters[0].parentNode.removeChild(deleters[0]);
    }

    if( (!validate(document.getElementById("form_N").value, document.getElementById("form_N").min,
                   document.getElementById("form_N").max)) ||  (!validate(document.getElementById("form_K").value, document.getElementById("form_K").min, document.getElementById("form_K").max)) ) {
        alert("BAD INPUT YO!");
    }

    N = parseInt(document.getElementById("form_N").value);
    K = parseInt(document.getElementById("form_K").value);
    
    
	//get possible state string combos for K+1 states (2^(K+1))
    var all_gene_combos = find_gene_combos(K, "");
    
    var traits_per_row = Math.ceil(Math.sqrt(N));
    var trait_margin = Math.floor((800.0/traits_per_row) - 25)/2;
    var top_margin = Math.floor((600.0/traits_per_row) - 25)/2;
    
    var initial_state_list = [];

    var trait_node = document.getElementById("state");
	for (var i=0; i<N; i++) {
		//make a new trait
		state_info.push(make_trait(N, K, i, all_gene_combos));
		//create the html DOM element
		var el = document.createElement("trait" + i);
		el.className = "circuit_trait";
		
        el.style.backgroundColor = state_info[i].color;
        
        initial_state_list.push(state_info[i].state);

        //set it's opacity based on its state (0.95 is on)
		if (state_info[i].state == "1") {
		    el.style.opacity = 0.95;
		} else {
		    el.style.opacity = 0.2;
		}
	    el.style.marginLeft = trait_margin.toString() + "px";
	    el.style.marginRight = trait_margin.toString() + "px";
	    el.style.marginTop = top_margin.toString() + "px";
	    el.style.marginBottom = top_margin.toString() + "px";

		trait_node.appendChild(el);
	}
	
	state_record.push(initial_state_list);

    draw_connections(traits_per_row);
	
	start_simulating();
	
	var trait_list = document.getElementsByClassName("circuit_trait");

	for (var i = 0; i< trait_list.length; i++) {
		trait_list[i].index = i;
		trait_list[i].addEventListener('click', function() {
		    
			if (state_info[this.index].on) {
			    state_info[this.index].on = false;
			    state_info[this.index].state = 0;
			    this.style.backgroundColor = "black";
			    this.style.opacity = 1;
			} else {
			    state_info[this.index].on = true;
			    state_info[this.index].state = 1;
			    this.style.backgroundColor = state_info[this.index].color;
			    this.style.opacity = 1;
			};
			
		//reset state record and make it so we're searching again
		state_record = [get_current_state()]; //reset state_record for next run
		in_cycle = "Searching...";
		document.getElementById("limit_cycle_ques").innerHTML = in_cycle;

		});
	}

}
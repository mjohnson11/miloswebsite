//Muller diagram sim

//global variables
var wid = 1000;
var high = 450;
var mut_top = 475;
var mut_high = 200;

//for wave display
var wave_bins = 31;
var wave_wide = 310;
var wave_high = 450; //leave 50 pixels for text
var wave_bin_wid = Math.floor( wave_wide / wave_bins )

var back_color = [34, 125, 255, 255];
var mut_back_color = [200, 200, 200, 200];
var color_dist_cutoff = 20;
var full_dissect_height = 115;

var full_pixel_record = [];

var running = true;
var paused = false;
var dissecting = false;

var mut_counter = 0;
var time = 0;
var fixed_counter = 0;
var mut_lost_counter = 0;

var n;
var u_ben;
var fit_expect_ben;
var do_exp_ben;
var u_del;
var fit_expect_del;
var do_exp_del;
var u_neu;
var mut_prob = u_neu + u_ben + u_del;
var rel_u_ben = u_ben / mut_prob;
var rel_u_del = u_del / mut_prob;
var lin_list;
var mutations;

var show_mut_freqs;

function alias_multinomial(w_freqs, average) {
    var top_indices = [];
    var fractions = [];
    var above_indices = [];
    var below_indices = [];
    var numhaps = w_freqs.length;
    var new_population = [];
    for (var i=0; i<w_freqs.length; i++) {
        top_indices.push(-1);
        fractions.push(1);
        new_population.push(0);
        if (w_freqs[i] > average) {
            above_indices.push(i);
        } else {
            below_indices.push(i);
        }
    }

    while ((below_indices.length + above_indices.length) > 1) {
        low_index = below_indices.pop();
        high_index = above_indices.pop();
        top_indices[low_index] = high_index;
        
        fractions[low_index] = w_freqs[low_index]/average;
        w_freqs[high_index] = w_freqs[high_index] - (average - w_freqs[low_index]);
        
        if (w_freqs[high_index] > average) {
            above_indices.push(high_index);
        } else {
            below_indices.push(high_index);
        }
    }
    
    for (var i=0; i<n; i++) {
        draw1 = Math.floor(Math.random()*numhaps);
        draw2 = Math.random();
        
        if (draw2 < fractions[draw1]) {
            new_population[draw1] += 1;
        } else {
            new_population[top_indices[draw1]] += 1;
        }
    }
    return new_population;
    
}

//
//THE CLASS OBJECT THING
//
function Lineage(num, freq, fit, record, color, id_tag) {
    this.num = num;
    this.freq = freq;
    this.fit = fit;
    this.record = record;
    this.color = color;
    this.id_tag = id_tag;
}

function Mutation(id_tag, num, color) {
    this.num = num;
    this.id_tag = id_tag;
    this.color = color;
}

//
//A TON OF FUNCTIONS FOR DISPLAYING AND PULLING INFO
//
//MAIN DISPLAY FUNCTIONS FOR MULLER DIAGRAM
function make_column(id, col) {
    //assigns colors to pixels based on freqs
    var col_ind = 0;
    var freq_tot = 0;
    for (var i=0; i<high; i++) {
        while (i+1 > Math.ceil((freq_tot+lin_list[col_ind].freq)*high)) {
            freq_tot += lin_list[col_ind].freq;
            col_ind += 1;
            if (col_ind == lin_list.length) {
                alert("this is whats happening");
            }
        }
        id.data[col*4+i*wid*4+0] = lin_list[col_ind].color[0];
        id.data[col*4+i*wid*4+1] = lin_list[col_ind].color[1];
        id.data[col*4+i*wid*4+2] = lin_list[col_ind].color[2];
        id.data[col*4+i*wid*4+3] = lin_list[col_ind].color[3];        
        full_pixel_record[i].push(lin_list[col_ind].color[0]);
        full_pixel_record[i].push(lin_list[col_ind].color[1]);
        full_pixel_record[i].push(lin_list[col_ind].color[2]);
        full_pixel_record[i].push(lin_list[col_ind].color[3]);
    }
    return id;
}

function make_mut_column(id, col) {
    for (var i=0; i<(mut_high); i++) {
        for (var j=0; j<4; j++) {
            id.data[col*4+(mut_top+i)*wid*4+j] = mut_back_color[j];
            full_pixel_record[mut_top+i].push(mut_back_color[j])
        }
    }
    for (var i=0; i<(mut_top-high); i++) {
        for (var j=0; j<4; j++) {
            //transparent pixels for full record
            full_pixel_record[high+i].push(0);
        }        
    }
    
    //assigns colors to pixels based on mutation freqs
    for (var i=0; i<mutations.length; i++) {
        var pixel_spot = mut_top + mut_high - Math.ceil((mutations[i].num/n) * (mut_high-1));
        id.data[col*4+pixel_spot*wid*4+0] = mutations[i].color[0];
        id.data[col*4+pixel_spot*wid*4+1] = mutations[i].color[1];
        id.data[col*4+pixel_spot*wid*4+2] = mutations[i].color[2];
        id.data[col*4+pixel_spot*wid*4+3] = 200;
        //also update full record for scrolling when paused
        full_pixel_record[pixel_spot] = full_pixel_record[pixel_spot].slice(0, full_pixel_record[pixel_spot].length-4).concat(mutations[i].color.slice(0,3), 200);
        //2pt stroke
        pixel_spot += 1;
        id.data[col*4+pixel_spot*wid*4+0] = mutations[i].color[0];
        id.data[col*4+pixel_spot*wid*4+1] = mutations[i].color[1];
        id.data[col*4+pixel_spot*wid*4+2] = mutations[i].color[2];
        id.data[col*4+pixel_spot*wid*4+3] = 200;
        full_pixel_record[pixel_spot] = full_pixel_record[pixel_spot].slice(0, full_pixel_record[pixel_spot].length-4).concat(mutations[i].color.slice(0,3), 200);   
    }
    return id;
}

//VARIOUS DISPLAY FUNCTIONS FOR OTHER STUFF
function tag_not_in_list(tag, list) {
    for (var i=0; i<list.length; i++) {
        if (list[i] == tag) {
            return false;
        }
    }
    return true;
}

function get_real_lineages() {
    var real_lineages = [];
    var lin_id_list = [];
    var lin_num_list = [];
    var lin_freq_list = [];
    for (var i=0; i<lin_list.length; i++) {
        if ( tag_not_in_list(lin_list[i].id_tag, lin_id_list) ) {
            lin_id_list.push(lin_list[i].id_tag);
            real_lineages.push(new Lineage(lin_list[i].num, lin_list[i].freq, lin_list[i].fit, copy_history(lin_list[i].record), lin_list[i].color, lin_list[i].id_tag))
        } else {
            var wheresthetag = -1;
            for (var j=0; j<lin_id_list.length; j++) {
                if (lin_list[i].id_tag == lin_id_list[j]) {
                    real_lineages[j].num += lin_list[i].num;
                    real_lineages[j].freq += lin_list[i].freq;
                }
            }
        }
    }
    var freq_check = 0;
    for (var i=0; i<real_lineages.length; i++) {
        freq_check += real_lineages[i].freq;
    }

    return real_lineages.sort(function(a,b){return b.freq-a.freq});
}

function make_history_display(thenode, therecord, i) {
    for (var j=0; j<therecord.length-1; j++) {
        var single_hist = document.createElement("hist" + String(i) + String(j));
        single_hist.className = "lin_single_hist";
        single_hist.innerHTML = "Lin: " + String(therecord[therecord.length-1-j][0]);
        single_hist.style.top = String(30 + j * 26) + "px";
        thenode.appendChild(single_hist);
        var single_hist_s = document.createElement("hist_s" + String(i) + String(j));
        single_hist_s.className = "lin_history_s";
        single_hist_s.innerHTML = "s: " + String(therecord[therecord.length-1-j][1].toFixed(4));
        single_hist.appendChild(single_hist_s);
        var single_hist_time = document.createElement("hist_time" + String(i) + String(j));
        single_hist_time.className = "lin_history_time";
        single_hist_time.innerHTML = "Mutation at Gen: " + String(therecord[therecord.length-1-j][2]);
        single_hist.appendChild(single_hist_time);
        var single_hist_color = document.createElement("hist_color" + String(i) + String(j));
        single_hist_color.style.backgroundColor = "rgb(" + String(therecord[therecord.length-1-j][3][0]) + "," + String(therecord[therecord.length-1-j][3][1]) + "," + String(therecord[therecord.length-1-j][3][2]) + ")";
        single_hist_color.className = "lin_history_color";
        single_hist.appendChild(single_hist_color);
    }
}

function make_dissect_lin(disnode, i, lins_to_use) {
    //create the html DOM element
    var el = document.createElement("lineage" + String(i));
    el.className = "dissect_lin";
    el.style.top = String((i*full_dissect_height)+32) + "px";
    disnode.appendChild(el);
    
    var name_zone = document.createElement("name" + String(i));
    name_zone.className = "lin_name_zone";
    name_zone.innerHTML = "Lineage " + String(lins_to_use[i].id_tag);
    name_zone.style.height = String(full_dissect_height - 16) + "px";
    el.appendChild(name_zone);
    var name_color_zone = document.createElement("namecolor" + String(i));
    name_color_zone.className = "lin_name_color_zone";
    name_color_zone.style.backgroundColor = "rgb(" + String(lins_to_use[i].color[0]) + "," + String(lins_to_use[i].color[1]) + "," + String(lins_to_use[i].color[2]) + ")";
    name_zone.appendChild(name_color_zone);
    var percent_zone = document.createElement("percent" + String(i));
    percent_zone.className = "lin_percent_zone" ;
    percent_zone.innerHTML = String(lins_to_use[i].freq.toFixed(6));
    percent_zone.style.height = String(full_dissect_height - 16) + "px";
    el.appendChild(percent_zone);
    var fitness_zone = document.createElement("fitness" + String(i));
    fitness_zone.className = "lin_fitness_zone";
    fitness_zone.innerHTML = String(lins_to_use[i].fit.toFixed(4));
    fitness_zone.style.height = String(full_dissect_height - 16) + "px";
    el.appendChild(fitness_zone);
    var history_zone = document.createElement("history" + String(i));
    history_zone.className = "lin_history_zone";
    history_zone.innerHTML = String(lins_to_use[i].record.length-1) + " Mutations";
    history_zone.style.height = String(full_dissect_height - 6) + "px";
    history_zone.style.paddingTop = "6px";
    make_history_display(history_zone, lins_to_use[i].record, i);
    el.appendChild(history_zone);
    
    if (i == lins_to_use.length) {
        name_zone.style.border = "none";
        percent_zone.style.border = "none";
        fitness_zone.style.border = "none";
        history_zone.style.border = "none";
    }
 }

function delete_dissect_nodes() {
    var dissect_node = document.getElementById("dissect_div");
    while (dissect_node.lastChild.id != "title_row") {
        //just to make it confusing
        dissect_node.removeChild(dissect_node.lastChild);
    }
    dissect_node.style.display = "none";
}

function show_dissect() {
    delete_dissect_nodes();
    var rlins = get_real_lineages();
    var dissect_node = document.getElementById("dissect_div");
    dissect_node.style.display = "block";
    dissect_node.style.height = "600px";
    for (var i=0; i<rlins.length; i++) {
        make_dissect_lin(dissect_node, i, rlins);
	}
}

function pause_and_scroll() {
    //resize canvas
    document.getElementById("full_pixel_canvas").style.width = time.toString() + "px";
    //display big scrollable canvas
    document.getElementById("muller_pixel_canvas").style.display = "none";
    document.getElementById("full_pixel_canvas").style.display = "block";
    //get that big canvas and put the data in it
    var full_canvas = document.getElementById("full_pixel_canvas");
    if (!full_canvas) {
        alert('no canvas');
    }
    var full_cc = full_canvas.getContext("2d");
    if (show_mut_freqs == 1) {
        var full_height = mut_top+mut_high; 
    } else {
        var full_height = high;
    }
    
    full_cc.canvas.width = time;
    var full_id = full_cc.createImageData(time, full_height);
    for (var i=0; i<full_height; i++) {
        for (var j=0; j<time; j++) {
            for (var k=0; k<4; k++) {
                full_id.data[j*4+i*time*4+k] = full_pixel_record[i][j*4+k];
            }
        }
    }
    full_cc.putImageData(full_id, 0, 0);
    
    //make it so it's scrolled right already
    document.getElementById("muller_state").scrollLeft = time-wid;    
}

function show_stats() {
    //calculating descriptive statistics and displaying them
    var fit_mean=0;
    var mut_mean=0;
    var num_lineages = 0;
    var lin_id_list = [];
    for (var i=0; i<lin_list.length; i++) {
        fit_mean += lin_list[i].fit*lin_list[i].freq;
        mut_mean += (lin_list[i].record.length-1)*lin_list[i].freq;
        if ( tag_not_in_list(lin_list[i].id_tag, lin_id_list) ) {
            lin_id_list.push(lin_list[i].id_tag);
            num_lineages += 1;
        }
        
    }
    document.getElementById("use_text").innerHTML = "Generation: " + String(time);
    document.getElementById("use_text2").innerHTML = "Mean Fitness: " + String(fit_mean.toFixed(3));
    document.getElementById("use_text3").innerHTML = "# Fixed Mutations: " + String(fixed_counter);
    document.getElementById("use_text4").innerHTML = "# of Haplotypes: " + String(num_lineages);
}

function make_wave_bin(bin_x1, bin_lins, wave_cc) {
    var running_bar_top = 0;
    var running_freq = 0;
    for (var i=0; i<bin_lins.length; i++) {
        running_freq += bin_lins[i].freq;
        var bar_top = Math.floor(running_freq * wave_high);
        wave_cc.fillStyle = "rgb(" + bin_lins[i].color[0] + "," + bin_lins[i].color[1] + "," + bin_lins[i].color[2] + ")";
        wave_cc.fillRect(bin_x1, wave_high - bar_top, wave_bin_wid, bar_top - running_bar_top);
        running_bar_top = bar_top;
    }
}

function bin_lineage_fitnesses(wave_cc) {
    //making a colored fitness histogram
    var max_fit = 0;
    var min_fit = 1000000;
    var mean_fit = 0;
    for (var i=0; i<lin_list.length; i++) {
        mean_fit += lin_list[i].fit * lin_list[i].freq;
        if (lin_list[i].fit < min_fit) {
            min_fit = lin_list[i].fit;
        } 
        if (lin_list[i].fit > max_fit) {
            max_fit = lin_list[i].fit;
        } 
    }
    
    var half_range = 0.005;
    if ((max_fit - mean_fit) > (mean_fit - min_fit)) {
        if ((max_fit - mean_fit) > half_range) {
            half_range = (max_fit - mean_fit);
        }
    } else {
        if ((mean_fit - min_fit) > half_range) {
            half_range = (mean_fit - min_fit);
        }       
    }
    
    var fit_bin_min = mean_fit - (half_range*1.1);
    var bin_size = (half_range*2.2)/wave_bins;
    
    var lin_bin_ids = []
    for (var i=0; i<wave_bins; i++) {
        lin_bin_ids.push([]);
    }
    for (var i=0; i<lin_list.length; i++) {
        var looking = true;
        for (var j=1; j<(wave_bins+1); j++) {
            if ( lin_list[i].fit < (fit_bin_min + (j*bin_size)) ) {
                if (looking) {
                    lin_bin_ids[j-1].push(lin_list[i]);
                    looking = false;
                }
            }
        }
    }
    wave_cc.clearRect(0, 0, wave_wide, wave_high+50);
    var tmpstr = "";
    for (var i=0; i<wave_bins; i++) {
        make_wave_bin(i*wave_bin_wid, lin_bin_ids[i], wave_cc);
    }
    
    //should replace with document get element stuff
    wave_cc.font = "15px Courier";
    wave_cc.fillStyle = "black";
    wave_cc.fillText('' + String(fit_bin_min.toFixed(4)), 4, 467);
    wave_cc.fillText('' + String(mean_fit.toFixed(4)), Math.floor(wave_wide/2)-60, 467);
    wave_cc.fillText('' + String((fit_bin_min + half_range*2.2).toFixed(4)), wave_wide-57, 467);
    wave_cc.beginPath();
    wave_cc.moveTo(0, 450);
    wave_cc.lineTo(0, 460);
    wave_cc.lineTo(0, 450);
    wave_cc.lineTo(Math.floor(wave_wide/2), 450);
    wave_cc.lineTo(Math.floor(wave_wide/2), 460);
    wave_cc.lineTo(Math.floor(wave_wide/2), 450);
    wave_cc.lineTo(wave_wide, 450);
    wave_cc.lineTo(wave_wide, 460);
    wave_cc.stroke();
    //document.getElementById("debug_text").innerHTML = tmpstr;
}

//SOME HELPER FUNCTIONS FOR THE MAIN SIMULATION BIT
function color_distance(col1, col2) {
    //for preventing the same or very similar colors on top of each other
    var c_dist = 0;
    for (var i=0; i<3; i++) {
        c_dist += (col1[i]-col2[i]) * (col1[i]-col2[i]);
    }
    return Math.sqrt(c_dist);
}

function copy_history(hist) {
    var new_hist = [];
    for (var i=0; i<hist.length; i++) {
        if (hist[i].length > 1) {
            new_hist.push(hist[i].slice());
        } else {
            new_hist.push(hist[i]);
        }
    }
    return new_hist;
}

function combine_lins(lin1, lin2) {
    if ((lin1.color != lin2.color) || (lin1.fit != lin2.fit)) {
        alert("Uh Oh, different lineages in lineage merge...");
        alert(lin1.record[0]);
        alert(lin2.record[0]);
    }
    return new Lineage(lin1.num + lin2.num, lin1.freq + lin2.freq, lin1.fit, copy_history(lin1.record), lin1.color, lin1.id_tag);
}

function new_color(old_color) {
    var new_c = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255), 255];
    while ( (color_distance(old_color, new_c) < color_dist_cutoff) || (color_distance(mut_back_color, new_c) < color_dist_cutoff) ) {
        new_c = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255), 255];
    }  
    return new_c;
}

function get_exp_mut_effect(expect) {
    //returns an exponentially distributed random var with expected value expect
    uni = Math.random();
    exp = -1 * Math.log(uni) * expect;
    return exp;
}


function fix_lin(lin, rem, which) {
    if (which == "top") {
        new_num = rem;
    } else {
        new_num = lin.num - rem - 1;
    }
    new_freq = new_num/n;
    
    return new Lineage(new_num, new_freq, lin.fit, lin.record, lin.color, lin.id_tag)
}
/*
function update_mutation_frequencies() {
    var new_mutations = [];
    for (var j=0; j<lin_list.length; j++) {
        for (var k=0; k<lin_list[j].record.length; k++) {
            var not_got = true;
            for (var i=0; i<new_mutations.length; i++) {
                if (lin_list[j].record[k][0] == new_mutations[i].id_tag) {
                    new_mutations.num += lin_list[j].num;
                    not_got = false;
                }
            }
            if (not_got) {
                new_mutations.push(new Mutation(lin_list[j].record[k][0], lin_list[j].num, lin_list[j].record[k][3]))
            }
        }
    }

    mutations = new_mutations;
}
*/
function update_mutation_frequencies() {
    var new_mutations = [];
    for (var i=0; i<mutations.length; i++) {
        var mut_abund = 0;
        for (var j=0; j<lin_list.length; j++) {
            for (var k=0; k<lin_list[j].record.length; k++) {
                if (lin_list[j].record[k][0] == mutations[i].id_tag) {
                    mut_abund += lin_list[j].num;
                }
            }
        }
        if (mut_abund == n) {
            fixed_counter += 1;
        } else if (mut_abund == 0) {
            mut_lost_counter += 1;
        } else {
            new_mutations.push(new Mutation(mutations[i].id_tag, mut_abund, mutations[i].color));            
        }
    }
    mutations = new_mutations;
}


//
//THE MAIN SIMULATION FUNCTIONS
//
function mutation(spot) {
    //what lineage did the mutation occur in?
    var cumulative = 0;
    var on=1;
    for (var i=0; i<lin_list.length; i++) {
        if (on==1) {
            if (spot < (cumulative + lin_list[i].num)) {
                var place = i;
                var remainder = spot - cumulative;
                on=0;
            }
            cumulative += lin_list[i].num;
        }
    }
    //what type of mutation and what fitness effect?
    var type_mut_draw = Math.random();
    if (type_mut_draw < rel_u_ben) {
        //beneficial mutation
        if (do_exp_ben == 1) {
            fit_eff = get_exp_mut_effect(fit_expect_ben); 
        } else {
            fit_eff = fit_expect_ben;
        }
    } else if (type_mut_draw < (rel_u_ben + rel_u_del)) {
        //deleterious mutation
        if (do_exp_del == 1) {
            fit_eff = get_exp_mut_effect(fit_expect_del) ; 
        } else {
            fit_eff = fit_expect_del;
        }
    } else {
        //neutral mutation
        fit_eff = 0;
    }
    new_fit = lin_list[place].fit * Math.exp(fit_eff);
    new_col = new_color(lin_list[place].color);
    mut_counter += 1;
    mutations.push(new Mutation(mut_counter, 1, new_col));
    //slice so it copies a new array
    var new_history = copy_history(lin_list[place].record);
    new_history.push([mut_counter, fit_eff, time, new_col]);

    //splitting the lineages based on where the mutation occurred
    //note that if remainder == 0 or == lin_list[place].num-1, one of these freqs will be zero
    //which will just be handled by it going extinct in the next wright fisher step
    new_lineage = new Lineage(1, 1/n, new_fit, new_history, new_col, mut_counter);
    lin_list.splice(place, 1, fix_lin(lin_list[place], remainder, "top"), new_lineage, fix_lin(lin_list[place], remainder, "bot")); 
}

function update_freqs() {
    //every individual has a chance to mutate
    for (var j = 0; j<n; j++) {
        if (Math.random()<mut_prob) {
            mutation(j);
        }
    }
    //weight frequencies by w (fitness)
    var weighted_freq_tot = 0;
    var weighted_freqs=[];

    for (var i=0; i<lin_list.length; i++) {
        //alert(new_nums[i]);
        weighted_freqs.push(lin_list[i].freq*lin_list[i].fit);
        //resetting the numbers for the sampling step
        lin_list[i].num = 0;
        weighted_freq_tot += weighted_freqs[i];
    }
    var av = weighted_freq_tot / lin_list.length;

    var temp_nums = alias_multinomial(weighted_freqs, av);
    
    for (var i=0; i<lin_list.length; i++) {
        lin_list[i].num = temp_nums[i];
    }

    //fix arrays for extinct lineages and combine lineages that are adjacent and the same haplotype
    var f_tot = 0;
    var new_lin_list = [];
    var current_tag = -1;
    var current_lineage;
    var ext_count = 0;
    for (var i=0; i<lin_list.length; i++) {
        lin_list[i].freq = lin_list[i].num/n;
        f_tot += lin_list[i].freq;
        if (lin_list[i].num > 0) {
            if (lin_list[i].id_tag == current_tag) {
                current_lineage = combine_lins(current_lineage, lin_list[i]);
            } else {
                if ((i -ext_count) != 0) {
                    new_lin_list.push(current_lineage);
                }
                current_lineage = new Lineage(lin_list[i].num, lin_list[i].freq, lin_list[i].fit, copy_history(lin_list[i].record), lin_list[i].color, lin_list[i].id_tag);
                current_tag = lin_list[i].id_tag;
            }
        } else {
            ext_count += 1;
        }
    }
    new_lin_list.push(current_lineage);
    lin_list = new_lin_list;
    //alert(f_tot);

}

function shift_left(id, cc) {
    //moves image data one column left
    id = cc.getImageData(1, 0, cc.canvas.width, cc.canvas.height);
    return id;
}

function dissect_undissect() {
    var d_but = document.getElementById("dissect_button")
    if (dissecting) {
        dissecting = false;
        delete_dissect_nodes();
        d_but.innerHTML = "<p1>SHOW LINEAGE INFO</p1>";
    } else {
        dissecting = true;
        show_dissect();
        d_but.innerHTML = "<p1>HIDE LINEAGE INFO</p1>";
    } 
}

function pause_unpause() {
    var p_but = document.getElementById("pause_button")
    if (running) {
        running = false;
        p_but.innerHTML = "<p1>CONTINUE</p1>";
    } else {
        running = true;
        paused = false;
        document.getElementById("full_pixel_canvas").style.display = "none";
        document.getElementById("muller_pixel_canvas").style.display = "block";
        p_but.innerHTML = "<p1>PAUSE</p1>";
    }
}

function update_sim(id, cc, wave_cc) {
    if (running) {

        show_stats();
        bin_lineage_fitnesses(wave_cc);

        update_freqs();

        if (show_mut_freqs) {
            update_mutation_frequencies();
        }
        
        if (time<wid) {
            //before hitting the end
            id = make_column(id, time);
            if (show_mut_freqs) {
                id = make_mut_column(id, time);   
            }
        } else {
            //now it's scrolling
            id = shift_left(id, cc);
            id = make_column(id, wid-1);
            if (show_mut_freqs) {
                id = make_mut_column(id, wid-1);   
            }
        }
        cc.putImageData(id, 0, 0);
        time += 1;

        if (((time % 10) == 0) && (dissecting)) {
            show_dissect();    
        }
    } else {
        if (paused) {
            //just chill
        } else {
            paused = true;
            pause_and_scroll();
        }
    }
}

function interval(func, wait, id, cc, wave_cc){
    //modified from http://thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/
    var interv = function(w){
        return function(){
            try{
                func.call(this, id, cc, wave_cc);
            }
            catch(e){
                alert("There was an error: " + e.toString());
            }
            setTimeout(interv, w);
        };
    }(wait);

    setTimeout(interv, wait);
}

function extra_min_max_check(val, mn, mx) {
    if (val>mx) {
        val = mx;
    }
    if (val<mn) {
        val = mn;
    }
    return val;
}
    
function main_func() {

    full_pixel_record = [];

    mut_counter = 0;
    time = 0;
    fixed_counter = 0;
    mut_lost_counter = 0;
    
    n = extra_min_max_check(parseFloat(document.getElementById('N_in').value),1,10000000);
    u_ben = extra_min_max_check(parseFloat(document.getElementById('u_ben').value),0,100000) / 1000000;
    u_del = extra_min_max_check(parseFloat(document.getElementById('u_del').value),0,100000) / 1000000;
    u_neu = extra_min_max_check(parseFloat(document.getElementById('u_neu').value),0,100000)  / 1000000;
    fit_expect_ben = extra_min_max_check(parseFloat(document.getElementById('s_exp_ben').value),0,2);
    do_exp_ben = $('#do_exp_ben').is(':checked');
    fit_expect_del = extra_min_max_check(parseFloat(document.getElementById('s_exp_del').value),-2,0);
    do_exp_del = $('#do_exp_del').is(':checked');
    show_mut_freqs = $('#show_freqs').is(':checked');
    console.log(u_ben, u_del, u_neu, fit_expect_ben);
    
    mut_prob = u_neu + u_ben + u_del;
    rel_u_ben = u_ben / mut_prob;
    rel_u_del = u_del / mut_prob;
    
    //this is the thing
    lin_list = [new Lineage(n, 1, 1, [['Anc', 0, 0, back_color]], back_color, 0)];
    mutations = [];
    if (show_mut_freqs == 0) {
        document.getElementById("muller_state").style.height = "475px";
        document.getElementById("muller_pixel_canvas").style.height = "450px";
        document.getElementById("muller_div").style.height = "525px";
        document.getElementById("muller_stats").style.top = "475px";
        document.getElementById("pause_button").style.top = "445px";
        document.getElementById("dissect_button").style.top = "445px";
    }

    var the_canvas = document.getElementById("muller_pixel_canvas");

    var cc = the_canvas.getContext("2d");
    var width = the_canvas.width;
    if (show_mut_freqs == 0) {
        the_canvas.height = 450;
    }
    var height = the_canvas.height;
    
    var id = cc.createImageData(width, height);
    for (var i=0; i<height; i++) {
        full_pixel_record.push([]);
    }

    var wave_canvas = document.getElementById("wave_pixel_canvas");
    if (!wave_canvas) {
        alert('no canvas');
    }
    var wave_cc = wave_canvas.getContext("2d");

    console.log("LOG FOR MULLER WAVE: ");
    
    interval(update_sim, 1, id, cc, wave_cc);

}


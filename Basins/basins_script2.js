//Basins of attraction pixel game thing with audio input to add energy


//INITIAL PARAMETERS AND SET UP
var aud_obj;

var audio_level = 0;
var sensitivity = 1.2;

var radius = 1; //for cluster_score function

var num_colors = 7;
var color_lists = [
    [[46, 134, 171],[104, 97, 143],[162, 59, 114],[241, 143, 1],[199, 62, 29],[129, 47, 36],[59, 31, 43]],
    [[2, 2, 19],[49, 49, 176],[0, 66, 153],[62, 191, 241],[45, 216, 229],[8, 27, 156],[12, 100, 183]],
    [[225, 39, 39],[236, 244, 164],[247, 255, 88],[251, 201, 84],[255, 147, 79],[175, 117, 85],[94, 86, 90]],
    [[15, 11, 7], [32, 32, 32], [45, 45, 45], [64, 64, 64], [84, 84, 84], [128, 128, 128], [192, 192, 192], [221, 221, 221]],
];
var rcolors = [];
for (var i=0; i<num_colors; i++) {
    var r = Math.floor(Math.random()*255);
    var g = Math.floor(Math.random()*255);
    var b = Math.floor(Math.random()*255);
    rcolors.push([r, g, b]);
}
color_lists.push(rcolors);
var which_colors = Math.floor(Math.random()*color_lists.length);
//var which_colors = 1;
console.log(which_colors);
var color_list = color_lists[which_colors];
var color_count_list = []; //just keeps a count of the number of pixels of each kind
for (var i=0; i<num_colors; i++) {
    color_count_list.push(0);
}


var wid = 260; //it has to be square and it has to be EVEN

var col_array = [];

var have_not_heard_about_whether_audio_worked_yet = true;

for (var i=0; i<wid; i++) {
    var tmp_array = [];
    for (var j=0; j<wid; j++) {
        var color_choice = Math.floor(Math.random()*num_colors);
        color_count_list[color_choice] += 1;
        tmp_array.push(color_choice);
    }
    col_array.push(tmp_array);
}


//A function for showing the value of the tolerance slider next to it
function SliderUpdate(cur_value, slider_text_id) {
	document.getElementById(slider_text_id).innerHTML = cur_value;
}

//COL_ARRAY SCORING FUNCTIONS
function match_score(col, row) {
    //simply looks up the color percentage of the rectangle in question in percentage list
    //alert(col_array[col][row]);
    var match_percentage = color_count_list[col_array[col][row]]/(wid*wid);
    return match_percentage;
}
 
function cluster_score(col, row) {
    //computes the percentage of the same color in some radius
    //around the pixel in question, not currently used
    
    var total_score = 0; 
    var col_to_compare = col_array[col][row];
    var col_ind = 0;
    var row_ind = 0;
    
    for (var i=0; i<(radius*2 + 1); i++) {
        for (var j=0; j<(radius*2 + 1); j++) {
            col_ind = col - radius + i;
            row_ind = row - radius + j;
            //tying the edges together to make a torus
            if (col_ind < 0) {
                col_ind = wid + col_ind;
            }
            if (col_ind > wid-1) {
                col_ind = col_ind - wid + 1;
            }
            if (row_ind < 0) {
                row_ind = wid + row_ind;
            }
            if (row_ind > wid-1) {
                row_ind = row_ind - wid + 1;
            }
            if (col_array[col_ind][row_ind] == col_to_compare) {
                total_score += 1;
            }
        }
    }
    
    return total_score/((radius*2 + 1)*(radius*2 + 1));
}
 
function opposite_index(ind) {
    return (wid - ind - 1);
}
 
 function sym_score(col, row) {
     //gives a score for how many of the opposite (symmetric) pixels match
    var total_sym_score = 0.25; //free for matching itself
    var opposite_row = opposite_index(row);
    var opposite_col = opposite_index(col);
    var col_to_compare = col_array[col][row];
    
    if (col_array[row][opposite_col] == col_to_compare) {
        total_sym_score += 0.25;
    } 
    if (col_array[opposite_row][col] == col_to_compare) {
        total_sym_score += 0.25;
    } 
    if (col_array[opposite_row][opposite_col] == col_to_compare) {
        total_sym_score += 0.25;
    }    
    return total_sym_score;
 }
 
//THE INTEGRATOR
function change_decision(col, row) {
  var ss = sym_score(col, row);
  var ms = match_score(col, row);
  //var cs = cluster_score(col, row);

  //return ((4*ss)/5 + Math.pow(ms, (1.0/3)))*2; 
  return ((9*ss)/5 + Math.pow(ms, (1.0/4)))*100;
  //return cs*3.8;
}

//COLOR CHANGING STUFF

function change_color(id, cc, column, row, col_index) {
    
    //var new_id = cc.createImageData(1,1);
    var base_index = row*wid+column;
    //alert('b');
    id.data[base_index*4] = color_list[col_index][0];
    id.data[base_index*4+1] = color_list[col_index][1];
    id.data[base_index*4+2] = color_list[col_index][2];
    
    //alert('c');
    return id;
}

function set_color(id) {
    for (var i=0; i<wid; i++) {
        for (var j=0; j<wid; j++) {
            //alert('changing ' + i + ' ' + j + ' ' + col_array[i][j]);
            var col_index = col_array[i][j];
            var base_index = i*wid+j;
            id.data[base_index*4] = color_list[col_index][0];
            id.data[base_index*4+1] = color_list[col_index][1];
            id.data[base_index*4+2] = color_list[col_index][2];
            id.data[base_index*4+3] = 255; //totally opaque

        }
    }
    return id;
}



function change_pixel(id, cc, col, row) {

    var new_color = Math.floor(Math.random()*num_colors);
    
    //update color_list_count
    color_count_list[new_color] += 1;
    color_count_list[col_array[col][row]] -= 1;
    //alert('a');
    id = change_color(id, cc, col, row, new_color);
    col_array[col][row] = new_color;
    

    //cc.putImageData(id, 0, 0);

}

function try_pixel_change(id, cc) {
    
    var col_choice = Math.floor(Math.random()*wid);
    var row_choice = Math.floor(Math.random()*wid);

    var change_score = change_decision(col_choice, row_choice);
    //document.getElementById("change_score").innerHTML = 'Change Score: ' + change_score.toFixed(2);
    //document.getElementById("audio_level").innerHTML = 'Audio Level: ' + audio_level.toFixed(2);

    if (change_score < audio_level) {

        change_pixel(id, cc, col_choice, row_choice);

    }
    
}

function update_sim(id, cc) {
  
    sensitivity = (document.getElementById("sense_param_form").sensitivity.value/30);
    
    if (aud_obj.status == 'FAIL') {
        audio_level = 100*sensitivity;
    } else {
        //AUDIO GET
        // Get the new frequency data
        aud_obj.analyser.getByteFrequencyData(aud_obj.freqDat);
        var aud_sum = 0;
        for (var i=0; i<20; i++) {
            aud_sum += aud_obj.freqDat[i];
        }
        audio_level = 140 + Math.pow((aud_sum/100), sensitivity);
    }
    
    // Update the bar visualisation
    document.getElementById("volume_meter").style.width = Math.min((audio_level-100)*3, 800).toString() + 'px';
    
    //make a pixel change?
    for (var i=0; i<1000; i++) {
        try_pixel_change(id, cc, audio_level);
    }

    cc.putImageData( id, 0, 0 );
}    
    
function main_func() {
    //At first I'm just going to try to get audio input going here
    //this site seems helpful - http://ianreah.com/2013/02/28/Real-time-analysis-of-streaming-audio-data-with-Web-Audio-API.html


    document.getElementById("bottom_stuff").style.display = 'block';
    document.getElementById("state_div").style.display = 'block';
    document.getElementById("go_popup").style.display = 'none';
    //AUDIO STUFF
    aud_obj = new AudioInAction(64, after_loaded);
}

function after_loaded() {
    //HTML stuff first
    var the_canvas = document.getElementById("pixel_canvas");
    if (!the_canvas) {
        alert('no canvas');
    }
    var cc = the_canvas.getContext("2d");

    var width = the_canvas.width;
    var height = the_canvas.height;

    var id = cc.createImageData(width, height);
    //alert(id.data.length);
    for (var i=0; i<id.data.length; i++) {
        id.data[i] = Math.floor(Math.random()*255);
    }

    id = set_color(id);
    cc.putImageData(id, 0, 0);

    if (aud_obj.status == "FAIL") {
        document.getElementById("slider_label").innerHTML ="Audio input not working, you can manually change the energy:";
    } 
    
    intervalhandle = setInterval(function(){update_sim(id, cc)}, 1);

}
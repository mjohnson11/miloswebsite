//Soundblaster game

//for debugging and stuff
var quiet = 0;

var crash_words = ["SHUCKS!", "RATS!", "CRASH!", "SON OF A!", "OH BROTHER!", "DEAR ME!", "NOT AGAIN!", "I HATE THIS STUPID PIECE OF GARBAGE GAME","DOUBLE SHUCKS", "SUPER RATS!", "DAG NABBIT!", "WHELP...", "ARRGRGRHRGHHH", "OOF", "DOUBLE OOF", "DOUBLE DAG NABBIN SON OF A RATS SHUCKS"]

alert("This page uses a cookie to hold your high score. I think I'm legally obligated to tell you that, and by continuing you have to agree to let me store this one small very important cookie!")
var my_cook = document.cookie;
if (my_cook.indexOf('=')>-1) {
    var local_high_score = parseInt(my_cook.split('=')[1].split(';')[0]);
} else {
    var local_high_score = 0;
}

//Sensitivity paramters
var sensitivity = 0.5;
var gravity = 2.0;
var mouse_multiplier = 4;
var weight = 75;

//other parameters
var init_mis_speed = 15;

//Initial values
var audio_level = 0;
var mis_speed = init_mis_speed;
var fly_pos = 300;
var fly_xpos = 100;
var fly_vel = 0.0;
var fly_acc = 0.0;
var mouseDown = 0;
var horiz_move=0;

//Keeping track of what's going on
var position = 0;
var crashed = 0;
var titling = 1;
var just_crashed = 0;
var just_highscore = 1;
var csv_out_string = "";
var super_time_counter = 0;

//Canvas
var the_canvas;

//make sure there is no ajax caching
$.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
});

//PNGs
var title_back = new Image();
var back_image = new Image();
var flyer_down = new Image();
var flyer_up = new Image();
var lightning = new Image();

//Missile objects
var missile1 = {image:new Image(), pos:2200, ypos:0, step:mis_speed};
var missile2 = {image:new Image(), pos:2200, ypos:0, step:mis_speed};
var missile3 = {image:new Image(), pos:-200, ypos:0, step:mis_speed};
var missile4 = {image:new Image(), pos:-200, ypos:0, step:mis_speed};

//A function for showing the value of the tolerance slider next to it
function SliderUpdate(cur_value, slider_text_id) {
	document.getElementById(slider_text_id).innerHTML = cur_value;
}

function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function reset() {
    titling = 1;
    position = 0;
    crashed = 0;
    just_crashed = 0;  
    just_highscore = 1;
    audio_level = 0;
    mis_speed = init_mis_speed;
    fly_pos = 300;
    fly_xpos = 100;
    fly_vel = 0.0;
    fly_acc = 0.0;
    mouseDown = 0;

    missile1 = {image: missile1.image, pos:2200, ypos:0, step:mis_speed};
    missile2 = {image: missile2.image, pos:2200, ypos:0, step:mis_speed};
    missile3 = {image: missile3.image, pos:-200, ypos:0, step:mis_speed};
    missile4 = {image: missile4.image, pos:-200, ypos:0, step:mis_speed};
    
    document.getElementById("practice_text").style.display = "block";
}

function title_screen(cc, audio_level) {
    cc.drawImage(back_image, 0, 0);
    if ((super_time_counter % 2) == 0) {
        update_flyer(cc, audio_level);
    }
    
    draw_the_flyer(cc);
    
    $("body").keydown(function(e){
        if (!((e.which == 37) || (e.which == 39))){ 
            titling = 0;
            document.getElementById("practice_text").style.display = "none";
        }
    });
}

function high_scores(cc) {
    cc.drawImage(back_image, 0, 0);
    document.getElementById("crash_text").style.display = "none";
    document.getElementById("high_score_div").style.display = "block";
    if (position > local_high_score) {
        document.getElementById("your_score").innerHTML = "BEST SCORE YET: " + String(position) + " PREVIOUS BEST: " + String(local_high_score);
        var new_high_score = true;
    } else {
        document.getElementById("your_score").innerHTML = "YOUR SCORE: " + String(position) + " YOUR BEST:" + String(local_high_score);
        var new_high_score = false
    }
    if (new_high_score) {
        local_high_score = position;
        document.cookie = "highscore=" + String(local_high_score)+";SameSite=Strict";
    }

    $("body").keydown(function(e){
        if (!((e.which == 37) || (e.which == 39))){ 
            document.getElementById("high_score_div").style.display = "none";
            reset();
        }
    });

}


function run_crash(cc) {
    if (just_crashed == 0) {
        document.getElementById("crash_text").style.display = "block";
        var crash_word = crash_words[Math.floor(Math.random()*crash_words.length)];
        //var crash_word = crash_words[0];
        document.getElementById("crash_text").innerHTML = crash_word;
        just_crashed += 1;
    } else if (just_crashed < 40) {
        //little pause
        just_crashed += 1;
    } else {
        high_scores(cc);
    }
}

function update_missile(cc, missile, new_mis_step) {
    //if it's reached the other side, reset it
    if (missile.pos < -190) {
        missile.pos = 1100;
        missile.ypos = Math.floor(Math.random()*468+20);
        missile.step = new_mis_step;
    }
    missile.pos -= missile.step;
    
    cc.drawImage(missile.image, missile.pos, missile.ypos);
    
    if ((missile.pos < (fly_xpos+100)) && (missile.pos > (fly_xpos-165))) {
        if ((missile.pos < (fly_xpos+70)) && (missile.pos > (fly_xpos-135))) {
            if (((fly_pos-missile.ypos) < 75) && ((missile.ypos-fly_pos) < 60)) {
                return 0;
            }
        } else {
            if (((fly_pos-missile.ypos) < 52) && ((missile.ypos-fly_pos) < 50)) {
                return 0;
            }            
        }
    }

    return 1;
}

function show_accel(audio_level) {
    fly_acc = gravity - (audio_level/weight);
    if (fly_acc >= 0) {
        document.getElementById("accel_meter_neg").style.width = Math.floor(fly_acc*50) + 'px';
        document.getElementById("accel_meter_pos").style.width = '0px';
    } else {
        document.getElementById("accel_meter_pos").style.width = Math.floor(fly_acc*(-50)) + 'px';
        document.getElementById("accel_meter_neg").style.width = '0px';
    }
}

function update_flyer(cc, audio_level) {

    if (quiet) {
        fly_acc = gravity - mouseDown*mouse_multiplier;
    }

    fly_vel = fly_vel + fly_acc;
    
}

function draw_the_flyer(cc) {
    //Actually move it
    fly_pos = fly_pos + fly_vel;
    if (fly_pos > 580) {
        fly_pos = 580;
        fly_vel = 0;
    } else if (fly_pos < 0) {
        fly_pos = 0;
        fly_vel = 0;
    }
    
    //horiz_move = 0;
    //horizontal movement on keypresses
    $("body").keydown(function(e){
        // left arrow
        if (e.which == 37){   
            horiz_move = -1;
        }
        // right arrow
        if (e.which == 39){
            horiz_move = 1;
        }   
    });
    $("body").keyup(function(e){
        //no pressing, no moving
        if ((e.which == 37) || (e.which == 39)){   
            horiz_move = 0;
        }
    });
    
    if ((fly_xpos > 5) && (horiz_move<0)){
        fly_xpos = fly_xpos + horiz_move*5;
    } else if ((fly_xpos < 1050) && (horiz_move>0)){
        fly_xpos = fly_xpos + horiz_move*5;
    }
    
    cc.drawImage(back_image, 0, 0);
    if (fly_acc >= 0) {
        cc.drawImage(flyer_down, fly_xpos, fly_pos)
    } else {
        cc.drawImage(flyer_up, fly_xpos, fly_pos)
    }
    if (fly_pos > 570) {
        if (titling == 0) {
            crashed = 1;
        } else {
            document.getElementById("feedback_text").innerHTML = "TOO LOW!";
        }
    }else if (fly_pos < 20) {
        cc.drawImage(lightning, fly_xpos+70, 0);
        if (titling == 0) {
            crashed = 1;
        } else {
            document.getElementById("feedback_text").innerHTML = "TOO HIGH!";
        }
    } else {
        document.getElementById("feedback_text").innerHTML = "";
    }
}


function update_sim(cc, audio_level) {
    
    position = position + 1;
 
    //check mousepress if we're on quiet mode
    if (quiet) {
        document.body.onmousedown = function() {
            mouseDown = 1;
        }
        document.body.onmouseup = function() {
            mouseDown = 0;
        }
    }

    if ((super_time_counter % 2) == 0) {
        update_flyer(cc, audio_level);
    }
    
    draw_the_flyer(cc);
    
    if (update_missile(cc, missile1, mis_speed) == 0) {
        crashed = 1;
    }
    if (position > 255) {
        if (update_missile(cc, missile2, mis_speed) == 0) {
            crashed = 1;
        }
    }
    if (position > 600) {
        if (update_missile(cc, missile3, mis_speed) == 0) {
            crashed = 1;
        }
    }
    if (position > 1200) {
        if (update_missile(cc, missile4, mis_speed) == 0) {
            crashed = 1;
        }
    }
    mis_speed = 13 + Math.floor(position*(1.0/200));
    
    document.getElementById("score_text").innerHTML = "Score: " + String(position);
    
}    

function run_game(cc) {
    
    super_time_counter += 1;
    
    if ((super_time_counter % 2) == 0) {
        //Update sensitivity (actually weight)
        weight = document.getElementById("sim_param_form").weight.value;
        
        //AUDIO GET
        // Get the new frequency data
        aud_obj.analyser.getByteFrequencyData(aud_obj.freqDat);
        var aud_sum = 0;
        for (var i=0; i<20; i++) {
            aud_sum += aud_obj.freqDat[i];
        }
        
        audio_level = (aud_sum*(2.0/1200)-0.2)*75;
        
        document.getElementById("accel_text").innerHTML = aud_sum;
        show_accel(audio_level);
    }
    
    if (titling) {
        title_screen(cc, audio_level);
    } else if (crashed) {
        run_crash(cc);
    }else {
        document.getElementById("crash_text").style.display = "none";
        update_sim(cc, audio_level);
    }
}
    
function main_func() {
    //At first I'm just going to try to get audio input going here
    //this site seems helpful - http://ianreah.com/2013/02/28/Real-time-analysis-of-streaming-audio-data-with-Web-Audio-API.htm
    
	//AUDIO STUFF
	
    aud_obj = new AudioInAction(64, after_loading);
    
}

function after_loading() {
    the_canvas = document.getElementById("game_canvas");
    if (!the_canvas) {
        alert('no canvas');
    }

    var cc = the_canvas.getContext("2d");
    cc.width = 1100;
    cc.height = 620;
    
    
    title_back.src = './graphics/covertry.png'
	back_image.src = './graphics/game_background.png';
	cc.drawImage(back_image, 0, 0);
    
    flyer_down.src = './graphics/flyer_down.png';
	flyer_up.src = './graphics/flyer_up.png';
	lightning.src = './graphics/lightning.png';
	missile1.image.src = './graphics/missile2.png';
	missile2.image.src = './graphics/missile3.png';
	missile3.image.src = './graphics/missile1.png';
	missile4.image.src = './graphics/missile1.png';
    
    intervalhandle = setInterval(function(){run_game(cc)}, 40);
}
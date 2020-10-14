//A function for showing the value of the tolerance slider next to it

//I was looking at these: http://www.hongkiat.com/blog/jquery-volumn-slider/
// http://jsfiddle.net/z3xV3/11/

function get_offset(slide_select, other_value) {
    //gives an offset for 3d plotting based on the value of a slider
    //other value is the 0-10 value for the x or y axis, whichever we are changing to show depth
    var depth = $(slide_select).slider( "option", "value");
    return depth*(10-other_value);
}

$(document).ready(function(){
    //make all sliders
    $(".cont_slider").slider({value:0, min:0, max:10, step:0.1, range: 'min'});
    
    //Change text under first slider according to value
    $("#sliders_1 .cont_slider").slider({
        slide: function(event, ui){
            //formula for finding pixel position to put text at
            var pos = -40 + ui.value*30;
            $("#sliders_1 .one_slider_text").css("left", pos);
            if (ui.value == 0) {
                $("#sliders_1 .one_slider_text").text("Prohibition");
            } else {
                if (ui.value < 1) {
                   $("#sliders_1 .one_slider_text").text("Shot"); 
                } else {
                    if (ui.value < 4) {
                       $("#sliders_1 .one_slider_text").text("Double"); 
                    } else {
                        if (ui.value < 8) {
                           $("#sliders_1 .one_slider_text").text("Glass"); 
                        } else {
                               $("#sliders_1 .one_slider_text").text("Woah there..."); 
                        }
                    }
                }
            }
        }
    });
    
    //Change graph point position on 2d graph according to value of 2 sliders
    $("#sliders_2 .cont_slider.v1").slider({
        slide: function(event, ui){
            var x_pos = 68 + ui.value*25;
            //complicated selector so this code can be used by multiple things
            $("#" + $(event.target).parent().parent().attr("id") + " .two_d_point").css("left", x_pos);
        }
    });
    $("#sliders_2 .cont_slider.v2").slider({
        slide: function(event, ui){
            var y_pos = 215 - ui.value*20;
            $("#" + $(event.target).parent().parent().attr("id") + " .two_d_point").css("top", y_pos);
        }
    });
    

    //Change graph point position on 3d graph according to value of 3 sliders
    $("#sliders_3 .cont_slider").slider({
        slide: function(event, ui){
            var x_val = $("#sliders_3 .cont_slider.v1").slider("option", "value");
            var y_val = $("#sliders_3 .cont_slider.v2").slider("option", "value");
            var z_val = $("#sliders_3 .cont_slider.v3").slider("option", "value");
            var x_pos = 68 + x_val*25 + z_val*(10- x_val/1.5);
            var y_pos = 215 - ( y_val*20 + z_val*(10- y_val/1.1));
            $("#" + $(event.target).parent().parent().attr("id") + " .three_d_point").css("left", x_pos);
            $("#" + $(event.target).parent().parent().attr("id") + " .three_d_point").css("top", y_pos);
            var color_fade = z_val*20;
            $(".three_d_point").css("background-color", "rgb(255, "+color_fade+", "+color_fade+")");
        }
    });
    
    //first switch changing where the dot is
    $("#switch_1 .switch").click(function(event) {
        if ($(event.target).css("background-color") == "rgb(68, 68, 68)") {
            $(event.target).css("background-color", "red");
            $("#one_discrete_point").css("left", "274px");
        } else {
            $(event.target).css("background-color", "rgb(68, 68, 68)");
            $("#one_discrete_point").css("left", "59px"); 
        }
    }); 
    
    $("#switch_3 .switch").click(function(event) {
        if ($(event.target).css("background-color") == "rgb(68, 68, 68)") {
            $(event.target).css("background-color", "red");
        } else {
            $(event.target).css("background-color", "rgb(68, 68, 68)");
        }
        //checking the third switch
        if ($("#switch_3 :nth-child(3)").css("background-color") == "rgb(68, 68, 68)") {
            if ($("#switch_3 :nth-child(1)").css("background-color") == "rgb(68, 68, 68)") {
                $("#three_discrete_point").css("left", "61px");
            } else {
                $("#three_discrete_point").css("left", "231px");
            }
            if ($("#switch_3 :nth-child(2)").css("background-color") == "rgb(68, 68, 68)") {
                $("#three_discrete_point").css("top", "201px");
            } else {
                $("#three_discrete_point").css("top", "41px");
            }
        } else {
            if ($("#switch_3 :nth-child(1)").css("background-color") == "rgb(68, 68, 68)") {
                $("#three_discrete_point").css("left", "121px");
            } else {
                $("#three_discrete_point").css("left", "291px");
            }
            if ($("#switch_3 :nth-child(2)").css("background-color") == "rgb(68, 68, 68)") {
                $("#three_discrete_point").css("top", "161px");
            } else {
                $("#three_discrete_point").css("top", "1px");
            }
        }
    });
    

    $("#switch_3_for_map .switch").click(function(event) {
        if ($(event.target).css("background-color") == "rgb(68, 68, 68)") {
            $(event.target).css("background-color", "red");
        } else {
            $(event.target).css("background-color", "rgb(68, 68, 68)");
        }
        $("#labeled_cube p").css("color", "black");
        //checking the third switch
        if ($("#switch_3_for_map :nth-child(3)").css("background-color") == "rgb(68, 68, 68)") {
            if ($("#switch_3_for_map :nth-child(2)").css("background-color") == "rgb(68, 68, 68)") {
                if ($("#switch_3_for_map :nth-child(1)").css("background-color") == "rgb(68, 68, 68)") {
                    $("#switch_3_map .map_result .map_value").text("7 ml");
                    $("#labeled_cube #label_1").css("color", "red");
                } else {
                    $("#switch_3_map .map_result .map_value").text("23 ml");
                    $("#labeled_cube #label_2").css("color", "red");
                }
            } else {
                if ($("#switch_3_for_map :nth-child(1)").css("background-color") == "rgb(68, 68, 68)") {
                    $("#switch_3_map .map_result .map_value").text("35 ml");
                    $("#labeled_cube #label_3").css("color", "red");
                } else {
                    $("#switch_3_map .map_result .map_value").text("3 ml");
                    $("#labeled_cube #label_4").css("color", "red");
                }
            } 
        } else {
            if ($("#switch_3_for_map :nth-child(2)").css("background-color") == "rgb(68, 68, 68)") {
                if ($("#switch_3_for_map :nth-child(1)").css("background-color") == "rgb(68, 68, 68)") {
                    $("#switch_3_map .map_result .map_value").text("90 ml");
                    $("#labeled_cube #label_5").css("color", "red");
                } else {
                    $("#switch_3_map .map_result .map_value").text("2 ml");
                    $("#labeled_cube #label_6").css("color", "red");
                }
            } else {
                if ($("#switch_3_for_map :nth-child(1)").css("background-color") == "rgb(68, 68, 68)") {
                    $("#switch_3_map .map_result .map_value").text("28 ml");
                    $("#labeled_cube #label_7").css("color", "red");
                } else {
                    $("#switch_3_map .map_result .map_value").text("85 ml");
                    $("#labeled_cube #label_8").css("color", "red");
                }
            }
        }
    });
    
    //Set slider for map to be in 0 in -5 to 5 range
    $("#sliders_1_for_map .cont_slider").slider({value:0, min:-5, max:5.1});
    $("#sliders_1_for_map .one_slider_text").css("left", 110);
    //make changes when it slides
    $("#sliders_1_for_map .cont_slider").slider({
        slide: function(event, ui){
            $("#sliders_1_for_map .one_slider_text").text(ui.value);
            $("#sliders_1_for_map .one_slider_text").css("left", (110 + ui.value*30));
            $("#sliders_1_map .map_result .map_value").text((ui.value*2).toFixed(1));
        }
    });
    
    //Set slider for map to be in 0 in -5 to 5 range
    $("#sliders_2_for_map .cont_slider").slider({value:0, min:-5, max:5.1});
    $("#sliders_2_for_map .one_slider_text").css("left", 110);
    //make changes when it slides
    $("#sliders_2_for_map .cont_slider.v1").slider({
        slide: function(event, ui){
            var x = ui.value;
            var y = $("#sliders_2_for_map .cont_slider.v2").slider("option", "value");
            $("#sliders_2_for_map #x_text").text(x);
            $("#sliders_2_for_map #x_text").css("left", (110 + x*30));
            var z = x + y;
            $("#sliders_2_map .map_result .map_value").text(z.toFixed(1));
        }
    });
    $("#sliders_2_for_map .cont_slider.v2").slider({
        slide: function(event, ui){
            var y = ui.value;
            var x = $("#sliders_2_for_map .cont_slider.v1").slider("option", "value");
            $("#sliders_2_for_map #y_text").text(y);
            $("#sliders_2_for_map #y_text").css("left", (110 + y*30));
            var z = x + y;
            $("#sliders_2_map .map_result .map_value").text(z.toFixed(1));
        }
    });
    
    //Set slider for map to be in 0 in -5 to 5 range
    $("#sliders_3_for_map .cont_slider").slider({value:0, min:-5, max:5.1});
    $("#sliders_3_for_map .one_slider_text").css("left", 110);
    //make changes when it slides
    $("#sliders_3_for_map .cont_slider.v1").slider({
        slide: function(event, ui){
            var x_3 = ui.value;
            var y_3 = $("#sliders_3_for_map .cont_slider.v2").slider("option", "value");
            var z_3 = $("#sliders_3_for_map .cont_slider.v3").slider("option", "value");
            $("#sliders_3_for_map #x_text").text(x_3);
            $("#sliders_3_for_map #x_text").css("left", (110 + x_3*30));
            var w_3 = x_3 + y_3 + z_3;
            $("#sliders_3_map .map_result .map_value").text(w_3.toFixed(1));
        }
    });
    $("#sliders_3_for_map .cont_slider.v2").slider({
        slide: function(event, ui){
            var y_3 = ui.value;
            var x_3 = $("#sliders_3_for_map .cont_slider.v1").slider("option", "value");
            var z_3 = $("#sliders_3_for_map .cont_slider.v3").slider("option", "value");
            $("#sliders_3_for_map #y_text").text(y_3);
            $("#sliders_3_for_map #y_text").css("left", (110 + y_3*30));
            var w_3 = x_3 + y_3 + z_3;
            $("#sliders_3_map .map_result .map_value").text(w_3.toFixed(1));
        }
    });
    $("#sliders_3_for_map .cont_slider.v3").slider({
        slide: function(event, ui){
            var z_3 = ui.value;
            var y_3 = $("#sliders_3_for_map .cont_slider.v2").slider("option", "value");
            var x_3 = $("#sliders_3_for_map .cont_slider.v1").slider("option", "value");
            $("#sliders_3_for_map #z_text").text(z_3);
            $("#sliders_3_for_map #z_text").css("left", (110 + z_3*30));
            var w_3 = x_3 + y_3 + z_3;
            $("#sliders_3_map .map_result .map_value").text(w_3.toFixed(1));
        }
    });
    

    
});


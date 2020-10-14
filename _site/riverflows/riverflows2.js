
var big_counter = 0;

//the limit of how far we will search for a correct time value
var search_limit = 100;

//records offsets for searching for if one of the records is off (to speed up searching)
var offset = [];


var intervalhandle;

var speed;

function displayloading() {
    document.getElementById("loading_text").style.display = "block";
}

function undisplayloading() {
    document.getElementById("loading_text").style.display = "none";
}

function displaystuff(whether) {
    if (whether == 1) {
        document.getElementById("all_the_stuff").style.display = "block";
    }
}

function displaytitle(i) {
    document.getElementById("ftitle" + i).style.display = "block";
}

function hidetitle(i) {
    document.getElementById("ftitle" + i).style.display = "none";
}

function set_flow(ind, flow_val, good_data) {
    if (good_data) {
        document.getElementById("flow" + (ind+1)).style.fill = "blue";
        document.getElementById("flow" + (ind+1)).setAttribute('r', "" + Math.sqrt(flow_val));
        var temp_title = document.getElementById("ftitle" + (ind+1)).innerHTML; 
        document.getElementById("ftitle" + (ind+1)).innerHTML = temp_title.slice(0, temp_title.indexOf(":")+1) + " " + flow_val + " cfs";        
    } else {
        document.getElementById("flow" + (ind+1)).style.fill = "gray";
    }
}

function time_process(raw_time) {
    var new_date = raw_time.slice(0, raw_time.indexOf("T"));
    var new_time = raw_time.slice(raw_time.indexOf("T")+1, raw_time.indexOf(":00."));
    return new_time + " on " + new_date;
}

function searching(ind, guess, look_array, correct_time) {
    guess = guess + offset[ind];
    //try the guess if it's within array
    if ((guess > 0) && ((guess + 1) < look_array.length)) {
        if (look_array[guess].getAttribute("dateTime") == correct_time) {
            return look_array[guess];
        }
    }
    //alert('lost it ' + ind + ' guess ' + look_array[guess].getAttribute("dateTime") + ' time ' + correct_time);
    //make sure we're not going over the edge of the array
    if ((guess + search_limit + 1) > look_array.length) {
        guess = look_array.length - 1 - search_limit;
    } else if ((guess - search_limit) < 0) {
        guess = search_limit;
    } else {
    }
    var found = 0;
    var i = 1;
    while (true) {
        if (look_array[guess + i].getAttribute("dateTime") == correct_time) {
            offset[ind] = i;
            //alert('found ' + look_array[guess + i].getAttribute("dateTime"));
            return look_array[guess + i];
        }
        if (look_array[guess - i].getAttribute("dateTime") == correct_time) {
            offset[ind] = -i;
            //alert('found ' + look_array[guess - i].getAttribute("dateTime"));
            return look_array[guess - i];
        }
        i += 1;
        if (i>search_limit) {
            //alert(ind + ' not found');
            return 0;
        }
    }
}

function run_animation(ts, longest, top_length) {
    
    //alert(big_counter);
    speed = parseInt(document.getElementById("time_range_form").speed.value);
    
    //these minus 2 things are because there are two descriptive nodes at the end of each timeseries
    if (big_counter >= top_length - 2) {
        //animation over, display most recent with times
        document.getElementById("time_text").innerHTML = "Most Recent";
        for (var i=0; i<ts.length; i++) {
            var final_ind = ts[i].lastChild.getElementsByTagName("ns1:value").length - 1;
            document.getElementById("flow" + (i+1)).setAttribute('r', "" + Math.sqrt(ts[i].lastChild.getElementsByTagName("ns1:value")[final_ind].childNodes[0].nodeValue));
            var temp_title = document.getElementById("ftitle" + (i+1)).innerHTML; 
            var full_title = temp_title.slice(0, temp_title.indexOf(":")+1) + " " + ts[i].lastChild.getElementsByTagName("ns1:value")[final_ind].childNodes[0].nodeValue  + " cfs at " + time_process(ts[i].lastChild.getElementsByTagName("ns1:value")[final_ind].getAttribute("dateTime"));
            document.getElementById("ftitle" + (i+1)).innerHTML = full_title;
        }
        clearInterval(intervalhandle);
        
    } else {
        var current_time = ts[longest].lastChild.getElementsByTagName("ns1:value")[big_counter].getAttribute("dateTime");
        document.getElementById("time_text").innerHTML = "Time: " + time_process(current_time);
        set_flow(longest, ts[longest].lastChild.getElementsByTagName("ns1:value")[big_counter].childNodes[0].nodeValue, true);
        for (var i=0; i<ts.length; i++) {
            if (i != longest) {
                var temp_data = searching(i, big_counter, ts[i].lastChild.getElementsByTagName("ns1:value"), current_time);
                //alert(i + " " + temp_data);
                if (temp_data == 0) {
                    set_flow(i, 0, false);
                } else {
                    set_flow(i, temp_data.childNodes[0].nodeValue, true);
                }
            }
        }
        big_counter += speed;
    }
    
}

function loaddata(filename) {
	//This function loads the data from the input file and serves as the main 
	//function for the page, listening for clicks and calling the other functions
	
	//alert(filename);
	
	displayloading();
	
    if (window.XMLHttpRequest)
      {
      xmlhttp=new XMLHttpRequest();
      }
    else // code for IE5 and IE6
      {
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
      }
    xmlhttp.open("GET",filename,false);
    xmlhttp.send();
    xml_data=xmlhttp.responseXML;
    
    time_series = xml_data.getElementsByTagName("ns1:timeSeries");
    
    top_length = 0;
    longest = 0;
    
    for (var i=0; i<time_series.length; i++) {
        temp_len = time_series[i].lastChild.getElementsByTagName("ns1:value").length;
        /*
        if ((temp_len-5) < search_limit*2) {
            search_limit = Math.round((top_length-6)/2);
        }
        */
        if (temp_len > top_length) {
            longest = i;
            top_length = temp_len;
        }
    }
    
    //alert(longest + " " + top_length);
    
    big_counter = 0;
    for (var i=0; i<time_series.length; i++) {
        offset.push(0);
    }	

    undisplayloading();

	intervalhandle = setInterval(function(){run_animation(time_series, longest, top_length)}, 50);

}
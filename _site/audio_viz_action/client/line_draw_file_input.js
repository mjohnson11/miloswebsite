/** Client side script */

//line drawing from https://bl.ocks.org/mbostock/f705fc55e6f26df29354
//audio processing modified from https://hackernoon.com/how-to-build-an-audio-processor-in-your-browser-302cb7aa502a and associated github

var the_svg;
var drawn = [];
var glob_buf;
var data = new Array(1024);
var analyser;

var not_playing = true;

var drawing = 'circles'

var top_form_height = 50;

var w = document.getElementById("svg_div").clientWidth;
var h = document.getElementById("svg_div").clientHeight + top_form_height;
var corner_dist = 0.71;

var drag_func;

Mousetrap.bind('0', function(e, n) { update(n); });
Mousetrap.bind('1', function(e, n) { update(n); });
Mousetrap.bind('2', function(e, n) { update(n); });

Mousetrap.bind(['command+z', 'ctrl+z'], function() {
  if (drawn.length > 0) {
    drawn[drawn.length-1].el.remove();
    drawn = drawn.slice(0, drawn.length-1);
  }
});

var straight_line = d3.line()
    .curve(d3.curveLinear);

var line = d3.line()
    .curve(d3.curveBasis);

var milo_line = d3.line()
    .curve(d3.curveCardinal);

var current_col = getRandomColor();

the_svg = d3.select('#svg_div')
  .append('svg')
    .attr('width', w)
    .attr('height', h)
    .on('click', draw_one);
    //.on('mousedown', mousedown) //OLD - apparently mousemove doesn't work if we're recording the drag 
    //.on('mouseup', mouseup);

drag_func = d3.drag()
  .container(function() { return this })
  .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
  .on("start", dragstarted)
  .on("end", dragended);

the_svg.call(drag_func);

function string_mid_points(points) {
  //formats points into strings
  //the first and last points are just normal, the others are all the midpoints (between points 1&2, 2&3, etc.)
  let s_list = [String(points[0][0]) + " " + String(points[0][1])];
  for (let i=0; i<points.length-1; i++) {
    s_list.push(String((points[i][0] + points[i+1][0])/2) + " " + String((points[i][1]+points[i+1][1])/2))
  }
  s_list.push(String(points[points.length-1][0]) + " " + String(points[points.length-1][1]))
  return s_list.join(",");
}

function radial_dist(x, y) {
  var xr = (w/2 - x)/w;
  var yr = (h/2 - y)/h;
  return Math.sqrt(xr*xr + yr*yr)/corner_dist;
}

function update(i) {
  console.log(i)
  if (i ==0) {
    drawing = 'wavy_lines';
  } else if (i == 1) {
    drawing = 'circles';
  } else if (i == 2) {
    drawing = 'zipper_open';
  }
}


function draw_one() {
  if (drawing == 'circles') {
    var coordinates = d3.mouse(this);
    var tmp = the_svg.append('circle')
      .attr('cx', coordinates[0])
      .attr('cy', coordinates[1])
      .attr('r', 5)
      .attr('fill', current_col)
      .attr('opacity', 0.4);
    drawn.push({'el': tmp, 'atr': 'r', 'factor': 0.1, 'r': radial_dist(coordinates[0], coordinates[1])*data.length, 'x': coordinates[0], 'y': coordinates[1], 'scaling_direction': 'radial_enhanced'});
  } 
}

function dragended() {
  console.log('dragended hmmm');
}

function dragstarted() {
  if (drawing == "wavy_lines") {
    current_col = getRandomColor();
    var d = d3.event.subject;
    var active = the_svg.append("path").datum(d);
    var x0 = d3.event.x;
    var y0 = d3.event.y;
    var slopes = []
    var r_dists = [];
    active
      .attr('stroke', current_col)
      .style('fill', 'none')
      .attr('stroke-width', 6)
      .attr('base_slopes', 'not_yet');
    var x1, y1;
    d3.event.on("drag", function() {
      x1 = d3.event.x;
      y1 = d3.event.y,
      dx = x1 - x0,
      dy = y1 - y0;
      if (dx * dx + dy * dy > 500) {
        d.push([x0 = x1, y0 = y1]);
        if (dx == 0) {
          slopes.push("100");
        } else if (dy == 0) {
          slopes.push("0.01");
        } else {
          slopes.push(String(dy/dx));
        }
        r_dists.push(String(radial_dist(x1, y1)*data.length));
        active.attr("base_path", function() { return string_mid_points(d); });
        active.attr("base_slopes", function() { return slopes.join(' '); });
        active.attr("base_rdists", function() { return r_dists.join(' '); });
      } else {
        d[d.length - 1] = [x1, y1];
      }
      if (not_playing) active.attr("d", line);
    });
    drawn.push({'el': active, 'atr': 'wavy', 'factor': 0.5, 'scaling_direction': 'radial'});
  } else if (drawing == "zipper_open") {
    current_col = getRandomColor();
    var d = d3.event.subject;
    var active = the_svg.append("path").datum(d);
    var x0 = d3.event.x;
    var y0 = d3.event.y;
    active
      .attr('stroke', current_col)
      .attr('fill', current_col)
      .attr('stroke-width', 6)
      .attr('base_slope', 'not_yet');
    var x1, y1;
    d3.event.on("drag", function() {
      x1 = d3.event.x;
      y1 = d3.event.y,
      dx = x1 - x0,
      dy = y1 - y0;
      if (dx * dx + dy * dy > 500) {
        d[d.length - 1] = [x1, y1];
        if (dx == 0) {
          active.attr("base_slope", "100");
        } else if (dy == 0) {
          active.attr("base_slope", "0.01");
        } else {
          active.attr("base_slope", function() { return String(dy/dx); });
        }
        active.attr("base_path", function() { return string_mid_points(d); });
        active.attr("base_rdist", function() { return String(radial_dist((x1+x0)/2, (y1+y0)/2)*data.length); });
        active.attr("base_dx", function() { return String(dx); });
        active.attr("base_dy", function() { return String(dy); });
      }
      if (not_playing) active.attr("d", straight_line);
    });
    drawn.push({'el': active, 'atr': 'zipper', 'factor': 0.5, 'scaling_direction': 'radial'});    
  } else if (drawing == "circles") {
    var x1, y1;
    current_col = getRandomColor();
    d3.event.on("drag", function() {
      x1 = d3.event.x;
      y1 = d3.event.y;

      var tmp = the_svg.append('circle')
            .attr('cx', x1)
            .attr('cy', y1)
            .attr('r', 5)
            .attr('fill', current_col)
            .attr('opacity', 0.4);
      drawn.push({'el': tmp, 'atr': 'r', 'factor': 0.1, 'r': radial_dist(x1, y1)*data.length, 'x': x1, 'y': y1, 'scaling_direction': 'radial_enhanced'});
     });
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}


function get_amplitude(direction_method, factor, x, y, r) {
  switch(direction_method) {
    case 'radial_enhanced':
      return data[Math.floor(r)]*factor*(data.length-r)*0.02;
    case 'reverse_radial_enhanced':
      return data[data.length-Math.floor(r)]*factor*r*0.02;
    case 'radial':
      return data[Math.floor(r)]*factor;
    case 'reverse_radial':
      return data[data.length-Math.floor(r)]*factor;
    case 'x_to_right':
      return data[Math.floor((x/w)*data.length)]*factor;
    case 'x_to_left':
      return data[data.length - Math.floor((x/w)*data.length)]*factor;
    case 'y_to_bottom':
      return data[Math.floor((y/h)*data.length)]*factor;
    case 'y_to_top':
      return data[data.length - Math.floor((y/h)*data.length)]*factor;
    case 'average':
      let s = 0
      for (let i=0; i<data.length; i++) {
        s += data[i];
      }
      return s*factor/data.length;
  }
}


function animatron () {
  analyser.getByteFrequencyData(data); 
  for (var i = 0; i < drawn.length; i++) {
    if (drawn[i].atr == "wavy") {
      let slopes = drawn[i].el.attr('base_slopes').split(" ");
      if (slopes[0] != 'not_yet') {
        let rdists = drawn[i].el.attr('base_rdists').split(" ");
        let points = drawn[i].el.attr('base_path').split(",");
        let new_points = [points[0].split(" ")];
        for (let j=0; j<slopes.length; j++) {
          let dir = ((j % 2) - 0.5) * 2; //alternating directions
          let rd = parseFloat(rdists[j]);
          let s = parseFloat(slopes[j]);
          let coords = points[j+1].split(" ");
          let x = parseFloat(coords[0]);
          let y = parseFloat(coords[1]);
          let amp = get_amplitude(drawn[i].scaling_direction, drawn[i].factor, x, y, rd);
          if (amp < 0) amp = 0;
          new_points.push([x + dir*s*amp/Math.sqrt(1 + s*s), y - dir*amp/Math.sqrt(1 + s*s)]);
        }
        new_points.push(points[points.length-1].split(" "));
        drawn[i].el.attr("d", milo_line(new_points));
      }
    } else if (drawn[i].atr == "zipper") {
      let slope = drawn[i].el.attr('base_slope');
      if (slope != 'not_yet') {
        let s = parseFloat(slope);
        let rd = parseFloat(drawn[i].el.attr('base_rdist'));
        let bezier_x = parseFloat(drawn[i].el.attr('base_dx'))/4;
        let bezier_y = parseFloat(drawn[i].el.attr('base_dy'))/4;
        let points = drawn[i].el.attr('base_path').split(",");
        let path = 'M ' + points[0];
        let coords_start = points[0].split(" "); //start
        let coords_mid = points[1].split(" "); //midpoint
        let coords_end = points[2].split(" "); //start
        let x = parseFloat(coords_mid[0]);
        let y = parseFloat(coords_mid[1]);
        let amp = get_amplitude(drawn[i].scaling_direction, drawn[i].factor, x, y, rd);
        if (amp < 0) amp = 0;
        apex1 = [x + s*amp/Math.sqrt(1 + s*s), y - amp/Math.sqrt(1 + s*s)];
        apex2 = [x - s*amp/Math.sqrt(1 + s*s), y + amp/Math.sqrt(1 + s*s)];
        path += ' C ' + String(parseFloat(coords_start[0])+bezier_x) + " " + String(parseFloat(coords_start[1])+bezier_y) + " " 
        path += String(apex1[0]-bezier_x) + " " + String(apex1[1]-bezier_y) + " ";  
        path += String(apex1[0]) + " " + String(apex1[1]);
        path += ' C ' + String(apex1[0]+bezier_x) + " " + String(apex1[1]+bezier_y) + " " 
        path += String(parseFloat(coords_end[0])-bezier_x) + " " + String(parseFloat(coords_end[1])-bezier_y) + " " + points[2];  
        path += ' C ' + String(parseFloat(coords_end[0])-bezier_x) + " " + String(parseFloat(coords_end[1])-bezier_y) + " " 
        path += String(apex2[0]+bezier_x) + " " + String(apex2[1]+bezier_y) + " ";  
        path += String(apex2[0]) + " " + String(apex2[1]);
        path += ' C ' + String(apex2[0]-bezier_x) + " " + String(apex2[1]-bezier_y) + " " 
        path += String(parseFloat(coords_start[0])+bezier_x) + " " + String(parseFloat(coords_start[1])+bezier_y) + " " + points[0];
        drawn[i].el.attr("d", path + " z");
      }
    } else {
      drawn[i].el.attr(drawn[i].atr, get_amplitude(drawn[i].scaling_direction, drawn[i].factor, drawn[i].x, drawn[i].y, drawn[i].r));
    }
  }
}

function file_reader(descripper){
  var sound = document.getElementById('sound');
  if (descripper == 'file') {
    //ref: https://stackoverflow.com/questions/28619550/javascript-play-uploaded-audio/28619927
    sound.src = URL.createObjectURL(document.getElementById('file_input').files[0]);
    // not really needed in this exact case, but since it is really important in other cases,
    // don't forget to revoke the blobURI when you don't need it
    sound.onend = function(e) {
      URL.revokeObjectURL(this.src);
    }
  } else {
    sound.src = 'scratch_song.mp3';
    document.getElementById('song_title_text').innerHTML = 'Chance the Rapper - I am Very Very Lonely';
  }
  
  d3.select('#play_local').style("display", "none");
  d3.select('#file_input').style("display", "none");
  // Creates an AudioContext and AudioContextBuffer
  const audioContext = new AudioContext();
  var audioSource = audioContext.createMediaElementSource(sound);
  analyser = audioContext.createAnalyser();
  // we have to connect the MediaElementSource with the analyser 
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
  data = new Uint8Array(analyser.frequencyBinCount);
  sound.play();
  not_playing = false;
  intervalhandle = setInterval(function(){animatron()}, 1);
}
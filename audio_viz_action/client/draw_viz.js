/** Client side script */

//line drawing from https://bl.ocks.org/mbostock/f705fc55e6f26df29354
//audio processing modified from https://hackernoon.com/how-to-build-an-audio-processor-in-your-browser-302cb7aa502a and associated github

var the_svg;
var drawn = [];
var data = new Array(1024);
var data_len = data.length;
var audioSource, audioContext, analyser, sound_analyser;
var sound = document.getElementById('sound');

var aud_obj;

var not_playing = true;

var drawing = 'wavy';
var current_freq_scale = 'radial';
var color_method = 'cycle_auto';
var freq_scale_global = false;
var scaling_enhancement = 0;
var global_amp_adjuster = 1;

var panel_amp = 50; //the set, unchanging fake audio amplitude to use for the little display
var example_svg = d3.select("#draw_display_svg");
var example_h_str = example_svg.style("height");
var example_h = parseInt(example_h_str.slice(0,example_h_str.length-2));
var example_wavy = string_mid_points([[0, example_h/2], [66, example_h/2], [133, example_h/2], [160, example_h/2], [200, example_h/2]]);
var example_zipper = string_mid_points([[0, example_h/2], [200, example_h/2]]);
var fake_amp_data;
make_fake_amp_data();

var w = document.getElementById("svg_div").clientWidth;
var h = document.getElementById("svg_div").clientHeight;
var corner_dist = Math.sqrt(0.5);

var drag_func;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  d3.select("#color_picker").property("value", color);
  DrawingObj[drawing].example();
  return color;
}

//this should allow shortcuts even when an input field is in focus
Mousetrap.stopCallback = function () {
     return false;
}

Mousetrap.bind('c', function() { update_drawing('circle'); });
Mousetrap.bind('w', function() { update_drawing('wavy'); });
Mousetrap.bind('z', function() { update_drawing('zipper'); });
Mousetrap.bind('r', function() { current_col = getRandomColor(); });
Mousetrap.bind(['command+z', 'ctrl+z'], undo);
Mousetrap.bind(['command+e', 'ctrl+e'], erase);

function undo() {
  if (drawn.length > 0) {
    drawn[drawn.length-1].el.remove();
    drawn = drawn.slice(0, drawn.length-1);
  }
}

function erase() {
  drawn = [];
  the_svg.html(null);  
}

function update_drawing(s) {
  drawing = s;
  d3.select("#drawing_select").property('value', s);
  DrawingObj[drawing].example();
}

function update_freq_scale(s) {
  current_freq_scale = s;
  DrawingObj[drawing].example();
}

function update_freq_scale_global() {
  freq_scale_global = d3.select("#global_freq_scale_check").property("checked");
  DrawingObj[drawing].example();
}

function update_scaling_enhancement() {
  scaling_enhancement = d3.select("#scaling_enhancement_input").property("value")/1000;
  DrawingObj[drawing].example();
}

function update_color_method(s) {
  color_method = s;
  d3.select("#color_method_select").property('value', s);
  if (color_method == 'cycle_auto') {
    current_col = getRandomColor();
    d3.select("#color_picker").property("value", current_col);
  }
  DrawingObj[drawing].example();
}

function change_color() {
  current_col = d3.select("#color_picker").property("value");
  DrawingObj[drawing].example();
}

// awesome d3 line interpolation demo: http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
var straight_line = d3.line()
    .curve(d3.curveLinear);
var line = d3.line()
    .curve(d3.curveBasis);
var milo_line = d3.line()
    .curve(d3.curveCardinal);

function make_fake_amp_data() {
  fake_amp_data = [];
  for (var i = 0; i < data_len; i++) fake_amp_data.push(panel_amp);
}

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

const DrawingObj = {
  circle: {
    name: 'circle',
    onclick: function(coordinates) {
        var tmp = the_svg.append('circle')
          .attr('cx', coordinates[0])
          .attr('cy', coordinates[1])
          .attr('r', 5)
          .attr('fill', current_col)
          .attr('opacity', 0.4);
        drawn.push({el: tmp, type: 'circle', atr: 'r', factor: 0.3*d3.select("#amp_factor_input").property("value")/10, r: radial_dist(coordinates[0], coordinates[1])*data_len, x: coordinates[0], y: coordinates[1], scaling_direction:  current_freq_scale});
        if (color_method == 'cycle_auto') current_col = getRandomColor();
      },
    ondrag: function () {
        var x1, y1;
        d3.event.on("drag", function() {
          x1 = d3.event.x;
          y1 = d3.event.y;

          var tmp = the_svg.append('circle')
                .attr('cx', x1)
                .attr('cy', y1)
                .attr('r', 5)
                .attr('fill', current_col)
                .attr('opacity', 0.4);
          drawn.push({el: tmp, type: 'circle', atr: 'r', factor: 0.3*d3.select("#amp_factor_input").property("value")/10, r: radial_dist(x1, y1)*data_len, x: x1, y: y1, scaling_direction: current_freq_scale});
        });
      },
    animate: function(rec, fake_amp=false) {
      let amp = get_amplitude(rec.scaling_direction, rec.factor, rec.x, rec.y, rec.r, fake_amp);
      if (amp < 0) amp = 0;
      rec.el.attr(rec.atr, amp);
    },
    example: function() {
      example_svg.html(null); 
      var coordinates = [100, example_h/2];
      var tmp = example_svg.append('circle')
          .attr('cx', coordinates[0])
          .attr('cy', coordinates[1])
          .attr('r', 5)
          .attr('fill', current_col)
          .attr('opacity', 0.4);
      var ex_rec = {el: tmp, type: 'circle', atr: 'r', factor: 0.1*d3.select("#amp_factor_input").property("value")/10, r: '0.2', x: 0.2*w, y: 0.2*h, scaling_direction:  current_freq_scale};
      this.animate(ex_rec, true);
    }
  },
  
  wavy: {
    name: 'wavy',
    onclick: null,
    ondrag: function() {
        var d = d3.event.subject;
        var active = the_svg.append("path").datum(d);
        var x0 = d3.event.x;
        var y0 = d3.event.y;
        var slopes = []
        var r_dists = [];
        active
          .attr('stroke', current_col)
          .style('fill', 'none')
          .attr('stroke-width', function() { return d3.select("#stroke_w_input").property("value"); })
          .attr('base_slopes', 'not_yet');
        var x1, y1;
        d3.event.on("drag", function() {
          x1 = d3.event.x;
          y1 = d3.event.y,
          dx = x1 - x0,
          dy = y1 - y0;
          if (dx * dx + dy * dy > 200) {
            d.push([x0 = x1, y0 = y1]);
            if (dx == 0) {
              slopes.push("100");
            } else if (dy == 0) {
              slopes.push("0.01");
            } else {
              slopes.push(String(dy/dx));
            }
            r_dists.push(String(radial_dist(x1, y1)*data_len));
            active.attr("base_path", function() { return string_mid_points(d); });
            active.attr("base_slopes", function() { return slopes.join(' '); });
            active.attr("base_rdists", function() { return r_dists.join(' '); });
          } else {
            d[d.length - 1] = [x1, y1];
          }
          if (not_playing) active.attr("d", line);
        });
        drawn.push({el: active, type: 'wavy', atr: 'wavy', factor: 0.5*d3.select("#amp_factor_input").property("value")/10, scaling_direction:  current_freq_scale});
    },
    animate: function(rec, fake_amp=false) {
      let slopes = rec.el.attr('base_slopes').split(" ");
      if (slopes[0] != 'not_yet') {
        let rdists = rec.el.attr('base_rdists').split(" ");
        let points = rec.el.attr('base_path').split(",");
        let new_points = [points[0].split(" ")];
        for (let j=0; j<slopes.length; j++) {
          let dir = ((j % 2) - 0.5) * 2; //alternating directions
          let rd = parseFloat(rdists[j]);
          let s = parseFloat(slopes[j]);
          let coords = points[j+1].split(" ");
          let x = parseFloat(coords[0]);
          let y = parseFloat(coords[1]);
          let amp = get_amplitude(rec.scaling_direction, rec.factor, x, y, rd, fake_amp);
          if (amp < 0) amp = 0;
          new_points.push([x + dir*s*amp/Math.sqrt(1 + s*s), y - dir*amp/Math.sqrt(1 + s*s)]);
        }
        new_points.push(points[points.length-1].split(" "));
        rec.el.attr("d", milo_line(new_points));
      }
    },
    example: function() {
      example_svg.html(null); 
      var tmp_path = example_svg.append("path")
        .attr('stroke', current_col)
        .style('fill', 'none')
        .attr('stroke-width', function() { return d3.select("#stroke_w_input").property("value"); })
        .attr('base_slopes', 'not_yet');
      
      tmp_path.attr("base_path", example_wavy);
      tmp_path.attr("base_slopes", '0.01 0.01 0.01');
      tmp_path.attr("base_rdists", '0.2 0.2 0.2');
      var ex_rec = {el: tmp_path, type: 'wavy', atr: 'wavy', factor: 0.5*d3.select("#amp_factor_input").property("value")/10, scaling_direction:  current_freq_scale};
      this.animate(ex_rec, true);
    }
  },

  zipper: {
    name: 'zipper',
    onclick: null,
    ondrag: function () {
        var d = d3.event.subject;
        var active = the_svg.append("path").datum(d);
        var x0 = d3.event.x;
        var y0 = d3.event.y;
        active
          .attr('stroke', current_col)
          .attr('fill', current_col)
          .attr('stroke-width', function() { return d3.select("#stroke_w_input").property("value"); })
          .attr('base_slope', 'not_yet');
        var x1, y1;
        d3.event.on("drag", function() {
          x1 = d3.event.x;
          y1 = d3.event.y,
          dx = x1 - x0,
          dy = y1 - y0;
          if (dx * dx + dy * dy > 200) {
            d[d.length - 1] = [x1, y1];
            if (dx == 0) {
              active.attr("base_slope", "100");
            } else if (dy == 0) {
              active.attr("base_slope", "0.01");
            } else {
              active.attr("base_slope", function() { return String(dy/dx); });
            }
            active.attr("base_path", function() { return string_mid_points(d); });
            active.attr("base_rdist", function() { return String(radial_dist((x1+x0)/2, (y1+y0)/2)*data_len); });
            active.attr("base_dx", function() { return String(dx); });
            active.attr("base_dy", function() { return String(dy); });
          }
          if (not_playing) active.attr("d", straight_line);
        });
        drawn.push({el: active, type: 'zipper', atr: 'zipper', factor: 0.5*d3.select("#amp_factor_input").property("value")/10, scaling_direction: current_freq_scale});
      },
    animate: function(rec, fake_amp=false) {
      let slope = rec.el.attr('base_slope');
      if (slope != 'not_yet') {
        let s = parseFloat(slope);
        let rd = parseFloat(rec.el.attr('base_rdist'));
        let bezier_x = parseFloat(rec.el.attr('base_dx'))/4;
        let bezier_y = parseFloat(rec.el.attr('base_dy'))/4;
        let points = rec.el.attr('base_path').split(",");
        let path = 'M ' + points[0];
        let coords_start = points[0].split(" "); //start
        let coords_mid = points[1].split(" "); //midpoint
        let coords_end = points[2].split(" "); //start
        let x = parseFloat(coords_mid[0]);
        let y = parseFloat(coords_mid[1]);
        let amp = get_amplitude(rec.scaling_direction, rec.factor, x, y, rd, fake_amp);
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
        rec.el.attr("d", path + " z");
      }
    },
    example: function() {
      example_svg.html(null); 
      var tmp_path = example_svg.append("path")
        .attr('stroke', current_col)
        .style('fill', current_col)
        .attr('stroke-width', function() { return d3.select("#stroke_w_input").property("value"); })
        .attr('base_slope', 'not_yet');
      
      tmp_path.attr("base_path", example_zipper);
      tmp_path.attr("base_slope", '0');
      tmp_path.attr("base_rdist", '0.2');
      tmp_path.attr("base_dx", '200');
      tmp_path.attr("base_dy", '0');
      var ex_rec = {el: tmp_path, type: 'zipper', atr: 'zipper', factor: 0.5*d3.select("#amp_factor_input").property("value")/10, scaling_direction: current_freq_scale};
      this.animate(ex_rec, true);
    }
  }
};

var current_col = getRandomColor();

DrawingObj[drawing].example();
update_drawing(drawing);

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

function radial_dist(x, y) {
  var xr = (w/2 - x)/w;
  var yr = (h/2 - y)/h;
  return Math.sqrt(xr*xr + yr*yr)/corner_dist;
}

function draw_one() {
  DrawingObj[drawing].onclick(d3.mouse(this));
}

function dragended() {
  if (color_method == 'cycle_auto') current_col = getRandomColor();
}

function dragstarted() {
  DrawingObj[drawing].ondrag();
}

function get_amplitude(direction_method, factor, x, y, r, fake_amp) {
  if (freq_scale_global) {
    direction_method = current_freq_scale;
  }
  let use_data = data;
  if (fake_amp) {
    use_data = fake_amp_data;
  }
  var val;
  switch(direction_method) {
    case 'radial':
      val = use_data[Math.floor(r)]*factor
      return (val + val*(data_len-r)*scaling_enhancement)*global_amp_adjuster;
    case 'reverse_radial':
      val = use_data[data_len-Math.floor(r)]*factor
      return (val + val*r*scaling_enhancement)*global_amp_adjuster;
    case 'x_to_right':
      val = use_data[Math.floor((x/w)*data_len)]*factor
      return (val +  val*(data_len - Math.floor((x/w)*data_len))*scaling_enhancement)*global_amp_adjuster;
    case 'x_to_left':
      val = use_data[data_len - Math.floor((x/w)*data_len)]*factor
      return (val + val*(x/w)*data_len*scaling_enhancement)*global_amp_adjuster;
    case 'y_to_bottom':
      val = use_data[Math.floor((y/h)*data_len)]*factor
      return (val + val*(data_len - Math.floor((y/h)*data_len))*scaling_enhancement)*global_amp_adjuster;
    case 'y_to_top':
      val = use_data[data_len - Math.floor((y/h)*data_len)]*factor
      return (val + val*(y/h)*data_len*scaling_enhancement)*global_amp_adjuster;
    case 'average':
      let s = 0
      for (let i=0; i<data_len; i++) {
        s += use_data[i];
      }
      return s*factor/data_len;
  }
}

function animatron () {
  analyser.getByteFrequencyData(data); 
  for (var i = 0; i < drawn.length; i++) {
    DrawingObj[drawn[i].type].animate(drawn[i])
  }
}

function file_reader(descripper, file_num = 0){
  if (descripper == 'file') {
    //ref: https://stackoverflow.com/questions/28619550/javascript-play-uploaded-audio/28619927
    sound.src = URL.createObjectURL(document.getElementById('file_input').files[file_num]);
    // not really needed in this exact case, but since it is really important in other cases,
    // don't forget to revoke the blobURI when you don't need it
    sound.onended = function(e) {
      URL.revokeObjectURL(this.src);
      if (file_num < (document.getElementById('file_input').files.length-1)) {
        console.log('Onto the next song in the playlist');
        file_reader('file', file_num = file_num + 1);
      } else {
        console.log('all input songs played');
        document.getElementById('song_title_text').innerHTML = "";
      }
    }
    document.getElementById('song_title_text').innerHTML = document.getElementById('file_input').files[file_num].name;
  } else {
    sound.src = 'scratch_song.mp3';
    document.getElementById('song_title_text').innerHTML = 'Chance the Rapper - I am Very Very Lonely';
  }
  if (not_playing) {
    //d3.select('#play_local').style("display", "none");
    //d3.select('#file_input').style("display", "none");
    // Creates an AudioContext and AudioContextBuffer
    audioContext = new AudioContext();
    audioSource = audioContext.createMediaElementSource(sound);
    sound_analyser = audioContext.createAnalyser(); // will be dormant when audio input is used
    analyser = sound_analyser;
    // we have to connect the MediaElementSource with the analyser 
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
    data_len = data.length;
    make_fake_amp_data();
    DrawingObj[drawing].example();
    sound.play();
    not_playing = false;
    intervalhandle = setInterval(function(){animatron()}, 1);
  } else {
    analyser = sound_analyser;
    sound.play();
  }
  hide_all_sidebars();
}

function input_audio() {
  //mic audio input
  //this site seems helpful - http://ianreah.com/2013/02/28/Real-time-analysis-of-streaming-audio-data-with-Web-Audio-API.html
  //AUDIO STUFF
  aud_obj = new AudioInAction(1024, after_loaded);
  
}

function after_loaded() {
  hide_all_sidebars();
  document.getElementById('song_title_text').innerHTML = "Using mic audio";
  analyser = aud_obj.analyser;
  data = aud_obj.freqDat;
  data_len = data.length;
  make_fake_amp_data();
  DrawingObj[drawing].example();
  intervalhandle = setInterval(function(){animatron()}, 1);
}
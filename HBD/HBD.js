var existing_lines = ["0.23675015703517588,0.28773584905660377 0.23486573492462312,0.30542452830188677 0.23360945351758794,0.32547169811320753 0.23423759422110552,0.3431603773584906 0.23423759422110552,0.3643867924528302 0.23423759422110552,0.38443396226415094 0.23423759422110552,0.4044811320754717 0.23423759422110552,0.42452830188679247 0.23360945351758794,0.44339622641509435",
"0.23360945351758794,0.37028301886792453 0.24365970477386933,0.36910377358490565 0.25370995603015073,0.36556603773584906 0.26313206658291455,0.36556603773584906 0.27255417713567837,0.3643867924528302",
"0.2775793027638191,0.3018867924528302 0.27506673994974873,0.3278301886792453 0.2719260364321608,0.35141509433962265 0.2712978957286432,0.37028301886792453 0.2719260364321608,0.38797169811320753 0.2712978957286432,0.4091981132075472 0.2694134736180904,0.42806603773584906",
"0.29579538316582915,0.43160377358490565 0.3008205087939699,0.4068396226415094 0.30584563442211055,0.38089622641509435 0.312755182160804,0.35377358490566035 0.31715216708542715,0.33726415094339623 0.32343357412060303,0.32075471698113206 0.3284586997487437,0.30542452830188677 0.33662452889447236,0.31957547169811323 0.3391370917085427,0.3384433962264151 0.34290593592964824,0.3561320754716981 0.34667478015075376,0.3738207547169811 0.3516999057788945,0.3915094339622642 0.35672503140703515,0.41037735849056606 0.3604938756281407,0.4257075471698113",
"0.3089863379396985,0.37264150943396224 0.3196647298994975,0.37028301886792453 0.32908684045226133,0.36910377358490565 0.3391370917085427,0.3643867924528302",
"0.3774536746231156,0.41627358490566035 0.37368483040201006,0.39622641509433965 0.3718004082914573,0.3785377358490566 0.36991598618090454,0.357311320754717 0.3692878454773869,0.3384433962264151 0.36865970477386933,0.31839622641509435 0.3711722675879397,0.3018867924528302 0.3805943781407035,0.2983490566037736 0.38750392587939697,0.3089622641509434 0.3862476444723618,0.330188679245283 0.3805943781407035,0.3455188679245283 0.37242854899497485,0.35259433962264153",
"0.4126295540201005,0.41273584905660377 0.4082325690954774,0.392688679245283 0.40509186557788945,0.37264150943396224 0.4019511620603015,0.35259433962264153 0.40006673994974873,0.33608490566037735 0.40006673994974873,0.31721698113207547 0.4025793027638191,0.3007075471698113 0.4120014133165829,0.2936320754716981 0.419539101758794,0.30424528301886794 0.4182828203517588,0.32193396226415094 0.41074513190954776,0.33490566037735847 0.4019511620603015,0.3408018867924528",
"0.44780543341708545,0.4056603773584906 0.4471772927135678,0.3867924528301887 0.44780543341708545,0.36792452830188677 0.4490617148241206,0.35023584905660377 0.4509461369346734,0.3313679245283019 0.4553431218592965,0.3160377358490566 0.4603682474874372,0.3018867924528302 0.4653933731155779,0.28773584905660377",
"0.4490617148241206,0.3384433962264151 0.4415240263819096,0.32547169811320753 0.43649890075376885,0.3113207547169811 0.43210191582914576,0.2959905660377358",
"0.5068506595477387,0.29127358490566035 0.5087350816582915,0.3113207547169811 0.5093632223618091,0.3290094339622642 0.5093632223618091,0.3490566037735849 0.5087350816582915,0.36674528301886794 0.5087350816582915,0.38443396226415094 0.5068506595477387,0.4033018867924528 0.5062225188442211,0.4209905660377358",
"0.5074788002512562,0.29009433962264153 0.5181571922110553,0.29127358490566035 0.5269511620603015,0.2959905660377358 0.5351169912060302,0.30306603773584906 0.5382576947236181,0.31957547169811323 0.5344888505025126,0.33490566037735847 0.5269511620603015,0.3455188679245283 0.5175290515075377,0.35259433962264153 0.5087350816582915,0.3596698113207547 0.5181571922110553,0.3596698113207547 0.5282074434673367,0.36202830188679247 0.5363732726130653,0.36910377358490565 0.5401421168341709,0.38443396226415094 0.5357451319095478,0.4009433962264151 0.5269511620603015,0.41037735849056606 0.5187853329145728,0.4186320754716981 0.5093632223618091,0.4209905660377358",
"0.5640114635678392,0.30660377358490565 0.5640114635678392,0.3242924528301887 0.5633833228643216,0.3419811320754717 0.5640114635678392,0.3596698113207547 0.5640114635678392,0.37971698113207547 0.562755182160804,0.39858490566037735 0.5621270414572864,0.41627358490566035",
"0.5451672424623115,0.30306603773584906 0.5564737751256281,0.30306603773584906 0.565895885678392,0.3018867924528302 0.5753179962311558,0.29952830188679247",
"0.5439109610552764,0.4209905660377358 0.5533330716080402,0.41391509433962265 0.562755182160804,0.41273584905660377 0.5721772927135679,0.41037735849056606 0.5809712625628141,0.4068396226415094",
"0.6004436243718593,0.4044811320754717 0.5966747801507538,0.3867924528301887 0.5935340766331658,0.36910377358490565 0.5916496545226131,0.35023584905660377 0.5916496545226131,0.3313679245283019 0.5929059359296482,0.3125 0.594790358040201,0.2936320754716981 0.6042124685929648,0.28773584905660377 0.6117501570351759,0.2983490566037736 0.6142627198492462,0.31485849056603776 0.608609453517588,0.3313679245283019 0.6004436243718593,0.33962264150943394 0.5985592022613065,0.3561320754716981 0.6042124685929648,0.36910377358490565 0.6111220163316583,0.37971698113207547 0.6180315640703518,0.3915094339622642 0.6268255339195979,0.39858490566037735",
"0.6331069409547738,0.2971698113207547 0.6362476444723618,0.31721698113207547 0.6368757851758794,0.33490566037735847 0.6362476444723618,0.35495283018867924 0.6368757851758794,0.375 0.6400164886934674,0.3915094339622642 0.6419009108040201,0.4080188679245283",
"0.616147141959799,0.29952830188679247 0.6261973932160804,0.29952830188679247 0.6362476444723618,0.2959905660377358 0.645041614321608,0.29245283018867924 0.6538355841708543,0.28773584905660377",
"0.6620014133165829,0.28773584905660377 0.6626295540201005,0.30778301886792453 0.6632576947236181,0.3278301886792453 0.6651421168341709,0.3455188679245283 0.6663983982412061,0.3643867924528302 0.6670265389447236,0.38443396226415094 0.6676546796482412,0.40212264150943394",
"0.6663983982412061,0.33726415094339623 0.6758205087939698,0.33726415094339623 0.6858707600502513,0.33490566037735847",
"0.687755182160804,0.2841981132075472 0.6858707600502513,0.30306603773584906 0.6858707600502513,0.3231132075471698 0.687755182160804,0.3419811320754717 0.6883833228643216,0.3632075471698113 0.6883833228643216,0.38207547169811323",
"0.7009461369346733,0.28537735849056606 0.7009461369346733,0.30424528301886794 0.7003179962311558,0.3313679245283019 0.6996898555276382,0.35259433962264153 0.6996898555276382,0.3714622641509434 0.6990617148241206,0.392688679245283",
"0.7009461369346733,0.2806603773584906 0.7097401067839196,0.28891509433962265 0.7191622173366834,0.2983490566037736 0.7266999057788944,0.31721698113207547 0.727328046482412,0.3384433962264151 0.7254436243718593,0.3561320754716981 0.7223029208542714,0.37264150943396224 0.7172777952261307,0.3867924528301887 0.7097401067839196,0.39858490566037735 0.7009461369346733,0.4044811320754717",
"0.7474285489949749,0.2830188679245283 0.7436597047738693,0.30424528301886794 0.7392627198492462,0.32075471698113206 0.7329813128140703,0.3408018867924528 0.727328046482412,0.357311320754717 0.7210466394472361,0.3785377358490566 0.7172777952261307,0.3938679245283019",
"0.7474285489949749,0.2865566037735849 0.7511973932160804,0.30660377358490565 0.7537099560301508,0.32547169811320753 0.7562225188442211,0.3455188679245283 0.7587350816582915,0.36556603773584906 0.7606195037688442,0.3867924528301887",
"0.7367501570351759,0.3443396226415094 0.7480566896984925,0.3443396226415094 0.7574788002512562,0.3419811320754717",
"0.7819762876884422,0.38325471698113206 0.7775793027638191,0.3596698113207547 0.7769511620603015,0.33962264150943394 0.7769511620603015,0.32075471698113206 0.7813481469849246,0.3018867924528302 0.7895139761306532,0.28773584905660377 0.7976798052763819,0.27712264150943394",
"0.7763230213567839,0.3125 0.7712978957286433,0.2936320754716981 0.765644629396985,0.2783018867924528"]

/** Client side script */

//line drawing from https://bl.ocks.org/mbostock/f705fc55e6f26df29354
//audio processing modified from https://hackernoon.com/how-to-build-an-audio-processor-in-your-browser-302cb7aa502a and associated github

var the_svg;
var drawn = [];
var data = new Array(1024);
var data_len = data.length;
var audioSource, audioContext, analyser, sound_analyser;
var sound = document.getElementById('sound');

var ac = 0;

var aud_obj;

var not_playing = true;
var not_dropped = true;
var squirrel_time = 60;

var drawing = 'wavy';
var current_freq_scale = 'radial';
var color_method = 'cycle_auto';
var freq_scale_global = false;
var scaling_enhancement = 0;
var global_amp_adjuster = 0.2;
var afactor = 2;

var w = document.getElementById("svg_div").clientWidth;
var h = document.getElementById("svg_div").clientHeight;
var corner_dist = Math.sqrt(0.5);

var drag_func;

fonts = ["Alfa Slab One", "Architects Daughter", "Pacifico", "Piedra", "Sansita Swashed", "Staatliches", "Comic Sans MS", "Courier New"];
font_colors = ["red", "aqua", "blue", "yellow", "black", "purple", "pink"];
font_drops = [true, true, true, true, true, true, true];
font_drop_times = [68, 70, 72, 85, 90, 93, 100];
text_drops = ["DAMN",  "WHO DAT", "OVER THERE", "HOPE YOU'RE HAVING A LOVELY DAY", "I HOPE THIS MESSAGE FINDS YOU WELL", "IN THESE TRYING TIMES", "I AM PROCRASTINATING A FELLOWSHIP APPLICATION"];
text_sizes = [2, 1.3, 1.3, 0.5, 0.6, 0.3];

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
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
        drawn.push({el: tmp, type: 'circle', atr: 'r', factor: 0.5*afactor/10, r: radial_dist(coordinates[0], coordinates[1])*data_len, x: coordinates[0], y: coordinates[1], scaling_direction:  current_freq_scale});
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
          drawn.push({el: tmp, type: 'circle', atr: 'r', factor: 0.5*afactor/10, r: radial_dist(x1, y1)*data_len, x: x1, y: y1, scaling_direction: current_freq_scale});
        });
      },
    animate: function(rec, fake_amp=false) {
      let amp = get_amplitude(rec.scaling_direction, rec.factor, rec.x, rec.y, rec.r, fake_amp);
      if (amp < 0) amp = 0;
      rec.el.attr(rec.atr, amp);
    }
  },
  star: {
    name: 'star',
    make_one: function() {
      let cx0 = (Math.random()*0.4)*(Math.floor(Math.random()/0.5)-0.5)
      let cy0 = (Math.random()*0.4)*(Math.floor(Math.random()/0.5)-0.5)
      var tmp = the_svg.append('circle')
        .attr('cx', (cx0+1)*(w/2))
        .attr('cy', (cy0+1)*(h/2))
        .attr('r', 2)
        .attr('fill', current_col)
        .attr('class', 'star')
        .attr('opacity', 1);
      drawn.push({el: tmp, type: 'star', atr: 'r', factor: 0.5*afactor/10, r: radial_dist((cx0+1)*(w/2), (cy0+1)*(h/2))*data_len, x0: cx0, y0: cy0, t0: sound.currentTime, scaling_direction:  current_freq_scale, exists: true});
      if (color_method == 'cycle_auto') current_col = getRandomColor();
    },
    animate: function(rec, fake_amp=false) {
      if (rec.exists) {
        let amp = get_amplitude(rec.scaling_direction, rec.factor, rec.x, rec.y, rec.r, fake_amp)/3;
        if (amp < 1) amp = 1;
        if ((Math.abs(rec.x0*amp*(ac-rec.ac0)/100)>(w/2)) || (Math.abs(rec.y0*amp*(ac-rec.ac0)/100)>(h/2))) {
          rec.el.node.remove();
          rec.exists = false;
        } else {
          let t = (sound.currentTime - rec.t0)/10;
          rec.el.attr("cx", (rec.x0*amp*(1+t)+1)*(w/2));
          rec.el.attr("cy", (rec.y0*amp*(1+t)+1)*(h/2));
        }
      }
    }
  },
  squirrel: {
    name: 'squirrel',
    make_one: function() {
      let cx0 = Math.random()
      let cy0 = Math.random()
      var tmp = the_svg.append('image')
        .attr('href', 'squirrel.png')
        .attr('width', w/5)
        .attr('x', cx0*w-w/10)
        .attr('y', cy0*h-h/10)
      drawn.push({el: tmp, type: 'squirrel', x: cx0, y: cy0, x_dir: (Math.floor(Math.random()/0.5)-0.5)*2, y_dir: (Math.floor(Math.random()/0.5)-0.5)*2, factor: 0.5*afactor/10, r: 10, scaling_direction: 'radial'});
    },
    animate: function(rec, fake_amp=false) {
      let amp = get_amplitude(rec.scaling_direction, rec.factor, rec.x, rec.y, rec.r, fake_amp)/10;
      if (amp < 0) amp = 0;
      rec.x = rec.x+amp*rec.x_dir/100;
      rec.y = rec.y+amp*rec.y_dir/100;
      if (rec.x>0.9) rec.x_dir=-1;
      if (rec.x<0.1) rec.x_dir=1;
      if (rec.y>0.9) rec.y_dir=-1;
      if (rec.y<0.1) rec.y_dir=1;
      rec.el.attr('x', rec.x*w-w/10);
      rec.el.attr('y', rec.y*h-h/10);
    }
  },
  text: {
    name: 'text',
    make_one: function(text, fontsize_base) {
      let cx0 = Math.random()*0.5
      let cy0 = Math.random()*0.8+0.1
      var tmp = the_svg.append('text')
        .html(text)
        .attr('x', cx0*w-w/10)
        .attr('y', cy0*h-h/10)
        .style('font-size', fontsize_base*w/10)
        .style('font-family', fonts[Math.floor(Math.random()*fonts.length)])
        .style('fill', font_colors[Math.floor(Math.random()*font_colors.length)])
      drawn.push({el: tmp, type: 'text', x: cx0, y: cy0, x_dir: (Math.floor(Math.random()/0.5)-0.5)*2, y_dir: (Math.floor(Math.random()/0.5)-0.5)*2, factor: 0.5*afactor/10, r: 30, scaling_direction: 'radial', rotate: 0, fsb: fontsize_base});
    },
    animate: function(rec, fake_amp=false) {
      let amp = get_amplitude(rec.scaling_direction, rec.factor, rec.x, rec.y, rec.r, fake_amp)/10;
      if (amp < 0) amp = 0;
      rec.el.style('font-size', (1+amp/5)*rec.fsb*w/10)
      rec.rotate += 0.3;
      rec.el.attr('transform', "rotate(" + String(rec.rotate) + "," + String(w/2) + "," + String(h/2) + ")")
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
        var spots = [String(x0/w)+','+String(y0/h)];
        active
          .attr('stroke', current_col)
          .style('fill', 'none')
          .attr('stroke-width', function() { return 2; })
          .attr('base_slopes', 'not_yet');
        var x1, y1;
        d3.event.on("drag", function() {
          x1 = d3.event.x;
          y1 = d3.event.y,
          dx = x1 - x0,
          dy = y1 - y0;
          if (dx * dx + dy * dy > 200) {
            d.push([x0 = x1, y0 = y1]);
            spots.push(String(x1/w)+','+String(y1/h));
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
            active.attr("base_spots", function() { return spots.join(' '); });
          } else {
            d[d.length - 1] = [x1, y1];
          }
          if (not_playing) active.attr("d", line);
        });
        drawn.push({el: active, type: 'wavy', atr: 'wavy', factor: afactor/10, scaling_direction:  current_freq_scale});
    },
    make_from_rec: function(base_spots_str) {
      var active = the_svg.append("path");
      var slopes = []
      var r_dists = [];
      active
        .attr('stroke', current_col)
        .style('fill', 'none')
        .attr('stroke-width', 7)
        .attr('base_slopes', 'not_yet');
      var x0 = parseFloat(base_spots_str.split(" ")[0].split(",")[0]*w);
      var y0 = parseFloat(base_spots_str.split(" ")[0].split(",")[1]*h);
      var d = [[x0, y0]];
      for (let i of base_spots_str.split(" ").slice(1,base_spots_str.split(" ").length)) {
        x1 = parseFloat(i.split(",")[0]*w);
        y1 = parseFloat(i.split(",")[1]*h);
        dx = x1 - x0,
        dy = y1 - y0;
        if (dx * dx + dy * dy > 100) {
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
          active.attr("base_spots", base_spots_str);
        } else {
          d[d.length - 1] = [x1, y1];
        }
      }
      drawn.push({el: active, type: 'wavy', atr: 'wavy', factor: afactor/10, scaling_direction:  current_freq_scale});
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
          .attr('stroke-width', function() { return 2; })
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
        drawn.push({el: active, type: 'zipper', atr: 'zipper', factor: afactor/10, scaling_direction: current_freq_scale});
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
    }
  }
};

var current_col = getRandomColor();

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
  ac += 1;
  //if (ac % (Math.floor(ac/10)+1) == 0) {
  if ((sound.currentTime > 3) && (d3.selectAll(".star")["_groups"][0].length < 1000)) {
    DrawingObj['star'].make_one();
  }
  if ((sound.currentTime > 35.8) && not_dropped) {
    not_dropped = false;
    for (let el of existing_lines) {
      DrawingObj['wavy'].make_from_rec(el);
      current_col = getRandomColor();
    }
    document.getElementById("pigeon1").style.display="block";
    document.getElementById("pigeon2").style.display="block";
  }
  if (sound.currentTime > squirrel_time) {
    squirrel_time += 15;
    DrawingObj['squirrel'].make_one();
  }
  for (let i=0; i<font_drop_times.length; i++) {
    if ((sound.currentTime>font_drop_times[i]) && font_drops[i]) {
      font_drops[i] = false;
      DrawingObj['text'].make_one(text_drops[i], text_sizes[i]);
    }
  }
  analyser.getByteFrequencyData(data); 
  for (var i = 0; i < drawn.length; i++) {
    DrawingObj[drawn[i].type].animate(drawn[i])
  }
}

function DO_IT(){

  document.getElementById("GO_BUTTON").style.display="none";

  the_svg = d3.select('#svg_div')
    .append('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('id', 'svg_element')
      //.on('mousedown', mousedown) //OLD - apparently mousemove doesn't work if we're recording the drag 
      //.on('mouseup', mouseup);

  var dummy_svg = d3.select('#svg_div')
    .append('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('id', 'dummy_svg_element')
      .on('click', draw_one);

  drag_func = d3.drag()
    .container(function() { return this })
    .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
    .on("start", dragstarted)
    .on("end", dragended);

  dummy_svg.call(drag_func);
  
  sound.src = 'WHODAT.mp3';
  audioContext = new AudioContext();
  audioSource = audioContext.createMediaElementSource(sound);
  sound_analyser = audioContext.createAnalyser(); // will be dormant when audio input is used
  analyser = sound_analyser;
  // we have to connect the MediaElementSource with the analyser 
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
  data = new Uint8Array(analyser.frequencyBinCount);
  data_len = data.length;
  sound.play();
  not_playing = false;
  intervalhandle = setInterval(function(){animatron()}, 1);
  
}

function get_paths() {
  let existing_lines = [];
  for (let ob of drawn) {
    if (ob.type=="wavy") {
      existing_lines.push(ob.el.attr("base_spots"));
      
    }
  }
  console.log(existing_lines);
}


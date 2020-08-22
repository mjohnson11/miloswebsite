/** Client side script */

//line drawing from https://bl.ocks.org/mbostock/f705fc55e6f26df29354
//audio processing modified from https://hackernoon.com/how-to-build-an-audio-processor-in-your-browser-302cb7aa502a and associated github

var the_svg;
var drawn = [];
var glob_buf;
var data;
var analyser;

var draw_circles = true;
var draw_lines = false;

var top_form_height = 50;

var w = document.getElementById("svg_div").clientWidth;
var h = document.getElementById("svg_div").clientHeight + top_form_height;

var drag_func;

var multiplier = 1600;

Mousetrap.bind('0', function(e, n) { update(n); });
Mousetrap.bind('1', function(e, n) { update(n); });

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
  .on("start", dragstarted);

the_svg.call(drag_func);

function radial_dist(x, y) {
  var xr = (w/2 - x)/w;
  var yr = (h/2 - y)/h;
  return Math.sqrt(xr*xr + yr*yr)
}

function update(i) {
  if (i == 0) {
    draw_circles = false;
    draw_lines = true;
  } else {
    draw_circles = true;
    draw_lines = false;
  }
}

var line = d3.line()
    .curve(d3.curveBasis);

function draw_one() {
  if (draw_circles) {
    var coordinates= d3.mouse(this);
    var tmp = the_svg.append('circle')
      .attr('cx', coordinates[0])
      .attr('cy', coordinates[1])
      .attr('r', 5)
      .attr('fill', current_col)
      .attr('opacity', 0.4);
    drawn.push({'el': tmp, 'atr': 'r', 'divisor': 700, 'x': radial_dist(coordinates[0], coordinates[1])*multiplier});
  }
}

function dragstarted() {
  if (draw_lines) {
    current_col = getRandomColor();
    var d = d3.event.subject,
      active = the_svg.append("path").datum(d),
      x0 = d3.event.x,
      y0 = d3.event.y;

    active
      .attr('stroke', current_col)
      .attr('stroke-width', 3);
    var x1, y1;
    d3.event.on("drag", function() {
      x1 = d3.event.x;
      y1 = d3.event.y,
      dx = x1 - x0,
      dy = y1 - y0;

      if (dx * dx + dy * dy > 100) d.push([x0 = x1, y0 = y1]);
      else d[d.length - 1] = [x1, y1];
      active.attr("d", line);
    });
    drawn.push({'el': active, 'atr': 'stroke-width', 'divisor': 2000, 'x': radial_dist(x1, y1)*multiplier});
  } else if (draw_circles) {
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
      drawn.push({'el': tmp, 'atr': 'r', 'divisor': 1000, 'x': radial_dist(x1, y1)*multiplier});
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

function animatron () {
  analyser.getByteFrequencyData(data); 
  let c = 0;
  for (var j = 0, l = data.length; j < l; j++) {
     c += data[j];
  }
  for (var i = 0; i < drawn.length; i++) {
    drawn[i].el.attr(drawn[i].atr, (200 + drawn[i].x/200)*data[Math.floor(drawn[i].x)]/drawn[i].divisor);
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
  intervalhandle = setInterval(function(){animatron()}, 1);

}
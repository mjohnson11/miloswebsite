/** Client side script */

//line drawing from https://bl.ocks.org/mbostock/f705fc55e6f26df29354
//audio processing modified from https://hackernoon.com/how-to-build-an-audio-processor-in-your-browser-302cb7aa502a and associated github

var the_svg;
var drawn = [];
var glob_buf;
var aud_obj;

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
  aud_obj.analyser.getByteFrequencyData(aud_obj.freqDat); 
  let c = 0;
  for (var j = 0, l = aud_obj.freqDat.length; j < l; j++) {
     c += aud_obj.freqDat[j];
  }
  for (var i = 0; i < drawn.length; i++) {
    drawn[i].el.attr(drawn[i].atr, (200 + drawn[i].x/200)*aud_obj.freqDat[Math.floor(drawn[i].x)]/drawn[i].divisor);
  }
}

function main_func() {
    //At first I'm just going to try to get audio input going here
    //this site seems helpful - http://ianreah.com/2013/02/28/Real-time-analysis-of-streaming-audio-data-with-Web-Audio-API.html

    //AUDIO STUFF
    aud_obj = new AudioInAction(1024, after_loaded);
}

function after_loaded() {
    
    intervalhandle = setInterval(function(){animatron()}, 1);

}
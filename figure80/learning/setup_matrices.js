
function matrix_maker(matrix_dom) {
  var buffer = 10;
  var nrows = parseInt(matrix_dom.attr("rows"));
  var ncols = parseInt(matrix_dom.attr("cols"));
  var wstring = matrix_dom.style("width");
  var hstring = matrix_dom.style("height");
  var w = parseInt(wstring.slice(0,wstring.indexOf('px')));
  var h = parseInt(hstring.slice(0,hstring.indexOf('px')));
  var vend_buf = parseInt(h/10);
  var hend_buf = parseInt(w/8);
  console.log(matrix_dom.attr("id"), nrows, ncols, w, h);
  var wboxsize = parseInt((w - hend_buf*2 - buffer*(ncols-1))/ncols);
  var hboxsize = parseInt((h - vend_buf*2 - buffer*(nrows-1))/nrows);
  console.log(wboxsize, hboxsize, buffer*(1+ncols))
  matrix_dom.append('img')
    .attr("class", "matrix_bracket left_bracket")
    .attr("src", "../elements/parenthesis.svg")
    .style("width", String(hend_buf) + 'px');

  matrix_dom.append('img')
    .attr("class", "matrix_bracket right_bracket")
    .attr("src", "../elements/parenthesis.svg")
    .style("width", String(hend_buf) + 'px');
  for (var x=0; x<ncols; x++) {
    for (var y=0; y<nrows; y++) {
      matrix_dom.append('div')
        .attr("class", "matrix_entry")
        .style("left", String(buffer*x+wboxsize*x+hend_buf) + 'px')
        .style("top", String(buffer*y+hboxsize*y+vend_buf) + 'px')
        .style("width", String(wboxsize) + 'px')
        .style("height", String(hboxsize) + 'px');
    }
  }
}

function setup_matrices() {
  console.log('yeah');
  var mats = d3.selectAll(".matrix");
  mats.attr("dummy", function() { matrix_maker(d3.select(this)); });
}
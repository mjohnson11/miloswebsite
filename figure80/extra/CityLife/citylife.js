
var width = 700;
var height = 600;

var x = d3.scaleLinear()
  .range([0, width])
  .domain([730000,810000]);

var y = d3.scaleLinear()
  .range([height, 0])
  .domain([2892500,2972500]);

var projection = d3.geoTransform({
  point: function(px, py) {
    this.stream.point(x(px), y(py));
  }
});

var green_colorscale = d3.scaleLinear()
  .range(["rgb(237,248,233)", "rgb(0,109,44)"])
  .domain([0, 8])

var black_colorscale = d3.scaleLinear()
  .range(["#FFFFFF", "#000000"])
  .domain([0, 100])

var path = d3.geoPath().projection(projection);

var the_json_dat;
function setup_all() {
  console.log('2');
  d3.json("data/Eviction_Filings_Boston_Neighborhood_Data.json").then(function(json) {
    the_json_dat = json;
    let the_svg = d3.select("#svg_map");
    the_svg.selectAll('path')
      .data(the_json_dat.features)
      .enter()
      .append('path')
        .attr("class", "map_element")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", function(d) { return black_colorscale(d.properties.BLACK); })
        //.attr("fill", function(d) { return green_colorscale(d.properties.EFR); })
        .on("mouseover", function(d) {
          d3.select(this).attr("stroke-width", 3)
        })
        .on("mouseout", function(d) {
          d3.select(this).attr("stroke-width", 1)
        })
        .attr("d", path);

      the_svg.selectAll('path')
        .data(the_json_dat.features)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
          .attr("fill", function(d) { return green_colorscale(d.properties.EFR); });
  })
  .catch(function(error) { console.log(error); });
  /*
 d3.csv("data/Eviction_Filings_Boston_Neighborhood_Data.csv", function(json) {
  console.log('hhh');
  the_json_dat = json;
  console.log(json);
  let the_svg = d3.select("#svg_map");
  the_svg.selectAll('path')
    .data(the_json_dat.features)
    .enter()
    .append('path')
      .attr("d", path)
  })
  .catch(function(error) { console.log(error); });
  */
}
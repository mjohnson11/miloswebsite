d3.selectAll(".sidebar")
  .style("height", function() { return String(this.getBoundingClientRect().height) + "px"; }) // locking in initial heights

d3.selectAll(".sidebar_button")
  .on("click", function() {
    var the_button = d3.select(this);
    if (the_button.attr("expanded") == "yes") {
      the_button.attr("expanded", "no");
      d3.select(this.parentNode).selectAll(".sidebar_content").style("display", "none");
      d3.select(this.parentNode)
        .transition()
          .style("padding-left", "0px")
          .style("padding-right", "0px")
          .style("width", "16px")
          .style("right", "0px");
      
    } else {
      the_button.attr("expanded", "yes");
      d3.select(this.parentNode)
        .transition()
          .style("padding-left", "25px")
          .style("padding-right", "15px")
          .style("width", d3.select(this.parentNode).attr("expanded_width"))
          .style("right", "22px")
          .on("end", function() {
            d3.select(the_button.node().parentNode).selectAll(".sidebar_content").style("display", "block");
      });
    }
  });

function hide_all_sidebars() {
  d3.selectAll(".sidebar_button")
    .attr("dummy", function() {
      if (d3.select(this.parentNode).attr("id") != "NOT USING NOW") {
        var the_button = d3.select(this);
        if (the_button.attr("expanded") == "yes") {
          the_button.attr("expanded", "no");
          d3.select(this.parentNode).selectAll(".sidebar_content").style("display", "none");
          d3.select(this.parentNode)
            .transition()
              .style("padding-left", "0px")
              .style("padding-right", "0px")
              .style("width", "16px")
              .style("right", "0px");  
          }
        }
      });
}
//just to hide and show an about at the bottom of a page

//Show about function

function setup_drill_downs() {
    d3.selectAll(".drill_title")
      .attr("state", "hidden")
      .on("click", function() {
        $($(this.parentNode).find('.drill_content')[0]).slideToggle();
      });
  
    d3.selectAll(".drill_closer")
      .attr("state", "hidden")
      .on("click", function() {
        $(this.parentNode).slideToggle(500);
        $('html,body').animate({ scrollTop: $(this.parentNode.parentNode).offset().top }, 500);
      })
      .html('^close^');
}

function increment_slideshow(el, increment) {
  el.attr('current_slide', function(d) {
    var cs = parseInt(d3.select(this).attr('current_slide'));
    var ns = parseInt(d3.select(this).attr('num_slides'));
    if ((cs+increment <= ns) && (cs+increment > 0)) {
      cs += increment;
    }
    el.selectAll('.left_slideshow_click').style('opacity', function() { if (cs == 1) { return 0.5; } else { return 1; }}); 
    el.selectAll('.right_slideshow_click').style('opacity', function() { if (cs == ns) { return 0.5; } else { return 1; }});
    el.selectAll('.left_slideshow_click').style('cursor', function() { if (cs == 1) { return 'default'; } else { return 'pointer'; }}); 
    el.selectAll('.right_slideshow_click').style('cursor', function() { if (cs == ns) { return 'default'; } else { return 'pointer'; }});
    return cs;
  })
  .selectAll('.m_slide')
    .attr('src', function(d) { return el.attr("base") + el.attr("current_slide") + el.attr("suffix"); });
  
  el.selectAll('.m_controls')
    .selectAll('.progress_tracker')
      .html(function(d) { return el.attr("current_slide") + " / " + el.attr('num_slides'); });
}

function setup_slideshows() {
  d3.selectAll(".m_slideshow")
    .attr('current_slide', 1)
    .selectAll('.m_slide')
      .on('click', function(d) {
            increment_slideshow(d3.select(this.parentNode), 1);
          });

  d3.selectAll(".m_slideshow")
    .selectAll(".m_controls")
      .append("div")
        .attr("class", "left_slideshow_click slideshow_click")
        .html("&#10094")
        .on("click", function(d) {
          increment_slideshow(d3.select(this.parentNode.parentNode), -1);
      });

  d3.selectAll(".m_slideshow")
    .selectAll(".m_controls")
      .append("div")
        .attr("class", "progress_tracker")
        .html(function(d) { return "1 / " + d3.select(this.parentNode.parentNode).attr('num_slides'); } );

  d3.selectAll(".m_slideshow")
    .selectAll(".m_controls")
      .append("div")
        .attr("class", "right_slideshow_click slideshow_click")
        .html("&#10095")
        .on("click", function(d) {
          increment_slideshow(d3.select(this.parentNode.parentNode), 1);
      });

}

function setup_all() {
  setup_drill_downs();
  setup_slideshows();
}
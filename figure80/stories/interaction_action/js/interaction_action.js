var control_edges = ['ACAACCTACCTGCTA', 'TCAAAACGGAGTGTT', 'TATATTGAACTTTAC', 'GTTGGGCGCTTAAAG', 'CGATGATGATGATGA'];

var qtl_colors = ["#fffc99", "#99d3ff", "white"];
var qtl_colors2 = ["0%", "50%", "50%"];
var my_red = "#F13"

var s_domain = [-0.15, 0.1];
var x_domain = [-0.15, 0.1];

var graph_h = 170;
var graph_w = 210;

var zoom_graph_h = 314;
var zoom_graph_w = 350;

var freq_graph_h = 280;
var freq_graph_w = 320;

var roman_dict = {1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI'};

var x_ax = d3.scaleLinear()
  .range([40, graph_w-15])
  .domain(x_domain);
var s_ax = d3.scaleLinear()
  .range([graph_h-30, 15])
  .domain(s_domain);
var for_zero_line = d3.line()
  .x(function(d) { return x_ax(d.x); })
  .y(function(d) { return s_ax(d.y); })

var zoom_x_ax = d3.scaleLinear()
  .range([60, zoom_graph_w-15])
  .domain(x_domain);
var zoom_s_ax = d3.scaleLinear()
  .range([zoom_graph_h-50, 15])
  .domain(s_domain);
var zoom_for_zero_line = d3.line()
  .x(function(d) { return zoom_x_ax(d.x); })
  .y(function(d) { return zoom_s_ax(d.y); })

var gen_ax = d3.scaleLinear()
  .range([40, freq_graph_w-15])
  .domain([0, 40]);
var freq_ax = d3.scaleLinear()
  .range([freq_graph_h-50, 30])
  .domain([-6, 0]);

var freq_traj = d3.line()
  .x(function(d) { return gen_ax(d.x); })
  .y(function(d) { return freq_ax(d.y); });

var edge_dat = {};
var idv_div;

function plot_one(div, gene, tmp_dat) {
  var svg_obj = d3.select(div)
    .append("svg")
      .attr("width", graph_w)
      .attr("height", graph_h);
  
  svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + x_ax(x_domain[0]) + ", 0)")
    .call(d3.axisLeft(s_ax).ticks(5));
  svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + s_ax(s_domain[0]) + ")")
    .call(d3.axisBottom(x_ax).ticks(5));
  svg_obj.append("text")             
    .attr("transform", "translate(" + (graph_w/2 + 10) + " ,20)")
    .style("text-anchor", "middle")
    .text(gene)
      .attr("class", "plot_title");
  svg_obj.append("path")             
    .attr("class", "horizontal_dash")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("opacity", 0.5)
    .attr("d", for_zero_line([{'x': x_domain[0], 'y': 0}, {'x': x_domain[1], 'y': 0}]))
  
  svg_obj.selectAll("circle")
    .data(tmp_dat)
    .enter()
      .append("circle")
        .attr("r", 2)
        .attr("fill", function(d) { return qtl_colors[parseInt(d['QTL1_state'])]; })
        .attr("opacity", 0.8)
        .attr("cx", function(d) { return x_ax(d['Seg.Fitness']); })
        .attr("cy", function(d) { return s_ax(d['s']); })
}

function make_edge_plot(holder_div, edge, g) {
  d3.csv("data/edge_files/" + edge + "_s_data.csv")
    .then(function(data_in) {
      plot_one(holder_div, g, data_in);
    })
    .catch(function(error) {
      console.log(error);  
  });
}

function plot_em() {
  //edge_dat = edge_dat.slice(0, 40);
  console.log(Object.values(edge_dat));

  idv_div = d3.select("#idv");
  idv_div.selectAll("div")
    .data(edge_dat)
    .enter()
      .append("div")
        .attr("class", "single_edge_plot")
        .attr("dummy", function(d) { make_edge_plot(this, d["Edge"], d["Gene.hit"]); })
        .on("click", function(d) { zoomed_idv(d); });
}

function format_qtl_text(q) {
  var s = q.split(';')
  var qtl = s[0].replace('_', ' ')
  return ": <a href=" + format_genome_browser(s[0].split('_')[0], s[1], s[2]) + " target='_blank'>" + qtl + " (95% conf: " + s[1] + "-" + s[2] + ")</a>";
}

function format_genome_browser(ch, loc_low, loc_high) {
  return "https://browse.yeastgenome.org/?loc=chr" + roman_dict[parseInt(ch.slice(3,))] + "%3A" + loc_low + ".." + loc_high;
}

function plot_freqs(dats, edge, zd) {
  for (var i=0; i<2; i++) {
    var td = zd.append("div")
        .attr("class", "freq_div")
        .attr("id", "rep" + String(i+1));
    if (dats[i] != null) {
      var control_dat = [];
      var edge_dat = [];
      for (var j=0; j<dats[i].length; j++) {
        if (dats[i][j]["s"] != "") {
          if (dats[i][j]["Edge"] == edge) {
            edge_dat.push(dats[i][j]);
          } else if (control_edges.includes(dats[i][j]["Edge"])) {
            control_dat.push(dats[i][j]);
          }
        }
      }
      console.log(control_dat.length, edge_dat.length);
      var ts = td.append("svg")
        .attr("class", "freq_svg")
        .attr("width", freq_graph_w)
        .attr("height", freq_graph_h);
      ts.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + gen_ax(0) + ", 0)")
        .call(d3.axisLeft(freq_ax).ticks(7));
      ts.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + freq_ax(-6) + ")")
        .call(d3.axisBottom(gen_ax).ticks(5));
      ts.append("text")
        .attr("class", "axis_label")
        .attr("transform", "translate(" + freq_graph_w/2 + ", " + freq_ax(-7) + ")")
        .style("text-anchor", "middle")
        .text("Generations")
          .attr("class", "plot_title");
      ts.append("text")
        .attr("class", "axis_label")
        .attr("transform", "translate(10, " + freq_ax(0.5) + ")")
        .style("text-anchor", "left")
        .text("Log10(freq)")
          .attr("class", "plot_title");
      ts.selectAll(".control_freq")
        .data(control_dat)
        .enter()
          .append("path")
            .attr("class", "control_freq")
            .attr("fill", "none")
            .attr('stroke', "#EEE")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.5)
            .attr('d', function(d) {
              var traj_d = [];
              for (let t=1-i; t<5; t++) { //the 1-i is a weird trick because time zero was excluded in rep 1
                traj_d.push({'x': t*10, 'y': d['T' + String(t) + "_log10freq_clipped"]})
              }
              return freq_traj(traj_d); 
            });
      ts.selectAll(".test_freq")
        .data(edge_dat)
        .enter()
          .append("path")
            .attr("class", "test_freq")
            .attr("fill", "none")
            .attr('stroke', my_red)
            .attr("stroke-width", 1)
            .attr("opacity", 0.75)
            .attr('d', function(d) {
              var traj_d = [];
              for (let t=1-i; t<5; t++) { //the 1-i is a weird trick because time zero was excluded in rep 1
                traj_d.push({'x': t*10, 'y': d['T' + String(t) + "_log10freq_clipped"]})
              }
              return freq_traj(traj_d); 
            });
    }
  }
  zd.append("div").style("font-size", "0.9em").style("float", "left").style("width", "100%").html("(These are barcode frequencies for two replicate assays. White lines are neutral control bcs, red lines are bcs for this mutation)");
}

function zoomed_plot(tmp_dat, row) {
  var zoom_idv = d3.select("#zoom_idv");
  
  var x_size = 28;
  var x_exit = d3.select("#idv").append("svg")
    .attr("class", "x_exit")
    .attr("id", "zoom_idv_exit")
    .attr("width", x_size)
    .attr("height", x_size)
    .on("click", function() { back_to_idv(); });
  x_exit.append('circle')
    .attr("r", x_size/2)
    .attr("cx", x_size/2)
    .attr("cy", x_size/2)
    .attr("fill", "#888");
  x_exit.append('rect')
    .attr("width", 8*x_size/10)
    .attr("height", x_size/4)
    .attr("x", x_size/10)
    .attr("y", x_size/2-(x_size/8))
    .attr("fill", "#333")
    .attr("transform", "rotate(45, " + String(x_size/2) + "," + String(x_size/2) + ")");
  x_exit.append('rect')
    .attr("width", 8*x_size/10)
    .attr("height", x_size/4)
    .attr("x", x_size/10)
    .attr("y", x_size/2-(x_size/8))
    .attr("fill", "#333")
    .attr("transform", "rotate(135, " + String(x_size/2) + "," + String(x_size/2) + ")");
  
  
  var svg_obj = zoom_idv.append("svg")
    .attr("id", "zoom_svg")
    .attr("width", zoom_graph_w)
    .attr("height", zoom_graph_h);

  svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + zoom_x_ax(x_domain[0]) + ", 0)")
    .call(d3.axisLeft(zoom_s_ax).ticks(5));
  svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + zoom_s_ax(s_domain[0]) + ")")
    .call(d3.axisBottom(zoom_x_ax).ticks(5));
  svg_obj.append("text")             
    .attr("transform", "translate(" + (zoom_graph_w/2 + 10) + " ,20)")
    .style("text-anchor", "middle")
    .text(row["Gene.hit"])
      .attr("class", "plot_title");
  svg_obj.append("path")             
    .attr("class", "horizontal_dash")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("opacity", 0.5)
    .attr("d", zoom_for_zero_line([{'x': x_domain[0], 'y': 0}, {'x': x_domain[1], 'y': 0}]))
  
  
  
  svg_obj.selectAll("rect")
    .data(tmp_dat)
    .enter()
      .append("rect")
        .attr("class", "zoomed_point")
        .attr("width", 8)
        .attr("height", 8)
        .attr("stroke", my_red)
        .attr("stroke-width", 0)
        .attr("fill", function(d) { return qtl_colors[parseInt(d['QTL1_state'])]; })
        .attr("rx", function(d) { return qtl_colors2[parseInt(d['QTL2_state'])]; })
        .attr("x", function(d) { return zoom_x_ax(d['Seg.Fitness'])-4; })
        .attr("y", function(d) { return zoom_s_ax(d['s'])-4; })
        .on("click", function(d) {
          var tmp_seg = d["Segregant"];
          d3.selectAll(".zoomed_point")
            .attr("width", function(d2) { if (d2["Segregant"]==tmp_seg) { return 16;} else { return 8;}; })
            .attr("height", function(d2) { if (d2["Segregant"]==tmp_seg) { return 16;} else { return 8;}; })
            .attr("x", function(d2) { if (d2["Segregant"]==tmp_seg) { return zoom_x_ax(d2['Seg.Fitness'])-8;} else { return zoom_x_ax(d2['Seg.Fitness'])-4;}; })
            .attr("y", function(d2) { if (d2["Segregant"]==tmp_seg) { return zoom_s_ax(d2['s'])-8;} else { return zoom_s_ax(d2['s'])-4;}; })
            .attr("stroke-width", function(d2) { if (d2["Segregant"]==tmp_seg) { return 5;} else { return 0;}; });
          d3.selectAll("#freq_div_holder").remove();
          var freq_holder = zoom_idv.append("div").attr("id", "freq_div_holder")
          d3.csv("data/freq_files_new/" + d['Segregant'] + "_rep1_logfreqs.csv")
            .then(function(data1) {
              d3.csv("data/freq_files_new/" + d['Segregant'] + "_rep2_logfreqs.csv")
                .then(function(data2) {
                  plot_freqs([data1, data2], row["Edge"], freq_holder);
                })
                .catch(function(error) {
                  console.log("Rep 2 freq file error: " + error);
                  plot_freqs([data1, null], row["Edge"], freq_holder);
              })
            })
            .catch(function(error) {
              console.log("Rep 1 freq file error: " + error);  
              d3.csv("data/freq_files_new/" + d['Segregant'] + "_rep2_logfreqs.csv")
                .then(function(data2) {
                  plot_freqs([null, data2], row["Edge"], freq_holder);
                })
                .catch(function(error) {
                  console.log(error);  
              })
          });
  })
  
  var edge_descrip_div = zoom_idv.append("div")
    .attr("id", "edge_descrip");
  edge_descrip_div.append("h5").style("margin-bottom", "0px").html("Insertion " + "<a href=https://www.yeastgenome.org/locus/" + row["Gene.hit"].split(" ")[1] + " target='_blank'>" + row["Gene.hit"] + "</a>");
  edge_descrip_div.append("p").html(row["Descrip"]);
  var sgd_loc = format_genome_browser(row["chromosome"], parseInt(row["insertion_edge"])-3000, parseInt(row["insertion_edge"])+3000);
  edge_descrip_div.append("p").html("<a href=" + sgd_loc + " target='_blank'>" + row["chromosome"] + " " + row["insertion_edge"] + "</a>, Edge bases: " + row["Edge"]);
  var qtl_key = [" RM: blue, BY: yellow", " RM: circle, BY: square"]
  for (var i=1; i<3; i++) {
    if (row['QTL'+String(i)] != 'NA') {
      edge_descrip_div.append("p").html("QTL "+String(i)+format_qtl_text(row['QTL'+String(i)])+"<br />"+qtl_key[i-1]);
    }
  }  
}

function load_idv() {
  console.log("loading");
  d3.select("#idv")
    .attr("onclick", "");
  d3.csv("data/Edge_info.csv")
    .then(function(data_in) {
      edge_dat = data_in;
      plot_em();
    })
    .catch(function(error) {
      console.log(error);  
  });
}

function zoomed_idv(edge_row) {
  d3.select("#idv").append("div").attr("id", "zoom_idv");
  d3.selectAll(".single_edge_plot").style("display", "none");
  d3.csv("data/edge_files/" + edge_row["Edge"] + "_s_data.csv")
    .then(function(data_in) {
      zoomed_plot(data_in, edge_row);
    })
    .catch(function(error) {
      console.log(error);  
  });
}

function back_to_idv() {
  d3.select("#zoom_idv").remove();
  d3.select("#zoom_idv_exit").remove();
  d3.selectAll(".single_edge_plot").style("display", "block");
}

function update_dfe_graph(i) {
  d3.select("#dfe_graph").attr("src", "data/dfe_pngs/dfe" + String(i) + ".png");
}


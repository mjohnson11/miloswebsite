
var nan_formats = ['', 'nan', 'NaN', 'NA', 'inf', '-inf'];

var w;
var h;

var top_data;
var main_svg;
var dfe_graph;
var s_x_graph;

var mut_s_data;
var bc_data = [null, null];
var bc_exp = '';

var neutral_muts = [51, 6, 91, 99, 102];

var fraction_plot_marked = 0.2;

var WOW_graph_counter = 0;
var WOW_content_counter = 0;
var WOW_data_counter = 0;

var env_color = { "YPD": "#000000",
                  "37_SC5": "#0173b2",
                  "37_SC7": "#de8f05",
                  "30_SC3": "#029e73",
                  "37_SC3": "#d55e00",
                  "30_SC5": "#cc78bc",
                  "30_SC7": "#ca9161" };

function is_that_a_number(stringy_thing) {
  // guesses if a string is a number
  // from Angular code here: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
  return !isNaN(stringy_thing - parseFloat(stringy_thing));
}

class WowMarkerPlot {

  constructor(dimensions, parent_data, xvar, yvar, color_by=null, xrange_given=false, yrange_given=false) {
    WOW_graph_counter += 1;
    this.parent_data = parent_data;
    this.x = xvar;
    this.y = yvar;
    this.x_dtype = this.parent_data.dtypes[xvar];
    this.y_dtype = this.parent_data.dtypes[yvar];
    this.graph_num = WOW_graph_counter;
    this.dimensions = dimensions;
    [this.left, this.top, this.w, this.h] = dimensions;
    let self = this;
    this.graph_stuff = this.parent_data.svg.append('g');
    this.axes = this.graph_stuff.append('g');
    this.color_by = color_by;

    this.point_size = Math.ceil(Math.sqrt(this.w*this.h*fraction_plot_marked/(Math.PI*this.parent_data.data.length)));
    this.plotted_yet = false;

    this.xlabel = this.graph_stuff.append('text')
      .html(xvar)
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_xlabel')
      .attr('x', this.left+this.w/2)
      .attr('y', this.top+this.h+30);

    this.ylabel = this.graph_stuff.append('text')
      .html(yvar)
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_ylabel')
      .attr('x', this.left)
      .attr('y', this.top-15);

    this.axes.append('g').attr("transform", "translate(0,"+(self.top+self.h)+")").attr('id', 'x_axis_graph_'+String(self.graph_num));
    this.axes.append('g').attr("transform", "translate("+self.left+", 0)").attr('id', 'y_axis_graph_'+String(self.graph_num));
    this.update_plot(xrange_given=xrange_given, yrange_given=yrange_given);
  }

  add_title(title) {
    this.title = this.graph_stuff.append('text')
      .html(title)
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_title')
      .attr('x', this.left+this.w/2)
      .attr('y', this.top-10);
  }

  set_pointradius(pr) {
    this.point_size = pr;
    let self = this;
    this.parent_data.svg.selectAll('.mark_on_graph_'+String(self.graph_num))
        .attr('r', self.point_size);
  }

  add_hover_el(position, func_for_text) {
    let self = this;
    var hover_el = this.graph_stuff.append('text')
      .html('')
      .attr('text-anchor', 'left')
      .attr('class', 'plot_option plot_hover_el')
      .attr('x', this.left+this.w*position[0])
      .attr('y', this.top+this.h-this.h*position[1]);

    this.parent_data.svg.selectAll('.mark_on_graph_'+String(self.graph_num))
      .on('mouseover', function(event, d) { hover_el.html(func_for_text(d)); });
    
  }

  update_plot(xrange_given=false, yrange_given=false) {
    let self = this;
    var xvar = self.x;
    var yvar = self.y;
    if (this.x_dtype == 'Number') {
      let xd;
      if (xrange_given) {
        xd = xrange_given;
      } else {
        xd = this.parent_data.number_domains[this.x];
      }
      this.xScale = d3.scaleLinear()
        .domain([xd[0]-(xd[1]-xd[0])/10, xd[1]+(xd[1]-xd[0])/10])
        .range([self.left, self.left+self.w]);
      if (!this.y) { // histogram
        self.n_bins = Math.round(self.parent_data.data.length/8);
        self.bin_size = (xd[1]-xd[0])/self.n_bins;
        self.bin_counts = {}
        for (let i=0; i<(self.n_bins+1); i++) {
          self.bin_counts[i] = 0;
        }
        for (let i=0; i<this.parent_data.data.length; i++) {
          let bin = Math.floor((this.parent_data.data[i][this.x]-xd[0])/self.bin_size);
          this.parent_data.data[i][this.x+'_binned'] = xd[0]+(bin+0.5)*self.bin_size;
          this.parent_data.data[i][this.x+'_binpos'] = self.bin_counts[bin]+0.5;
          self.bin_counts[bin] += 1;
        }
        this.yScale = d3.scaleLinear()
          .domain([0, Math.max(...Object.values(self.bin_counts))])
          .range([self.top+self.h, self.top]);
        xvar = self.x+'_binned';
        yvar = self.x+'_binpos';
      }
    } else if (this.x_dtype == 'String') {
      if (!this.y) { 
        // categorical histogram (weird barplot thingy) (otherwise swarmplot or intersection plot)
        let x_val_counts = {};
        for (let i=0; i<this.parent_data.data.length; i++) {
          let tmp_val = this.parent_data.data[i][this.x];
          if (tmp_val in x_val_counts) {
            x_val_counts[tmp_val] += 1;
          } else {
            x_val_counts[tmp_val] = 1;
          }
          this.parent_data.data[i][this.x+'_binpos'] = x_val_counts[tmp_val]-0.5;
        }
        this.yScale = d3.scaleLinear()
          .domain([0, Math.max(...Object.values(x_val_counts))])
          .range([self.top+self.h, self.top]);
        yvar = this.x+'_binpos';
      }
      let xd = this.parent_data.string_sets[this.x];
      this.xScale = d3.scalePoint()
          .domain(xd)
          .range([self.left+self.w/xd.length, self.left+self.w]);
    } 
    if (this.y) {
      if (this.y_dtype == 'Number') {
        let yd;
        if (yrange_given) {
          yd = yrange_given;
        } else {
          yd = this.parent_data.number_domains[this.y];
        }
        this.yScale = d3.scaleLinear()
          .domain([yd[0]-(yd[1]-yd[0])/10, yd[1]+(yd[1]-yd[0])/10])
          .range([self.top+self.h, self.top]);
      } else if (this.y_dtype == 'String') {
        yd = this.parent_data.string_sets[this.y]
        this.yScale = d3.scalePoint()
          .domain(yd)
          .range([self.top+self.h-self.h/yd.length, self.top]);
      }
    }
    if (this.plotted_yet) {
      this.parent_data.svg.selectAll('.mark_on_graph_'+String(self.graph_num))
        .transition()
        .duration(200)
        .attr('cx', function(d) { return self.xScale(d[xvar]); })
        .attr('cy', function(d) { return self.yScale(d[yvar]); });
    } else {
      this.parent_data.svg.selectAll("."+self.parent_data.wow_data_class)
        .append('circle')
        .attr('class', 'circle_point mark_on_graph_'+String(self.graph_num))
        .attr('r', self.point_size)
        .attr('fill', function(d) {
          if (self.color_by) {
            return self.color_by[1][d[self.color_by[0]]];
          } else {
            return '#949494';
          }
        })
        .attr('cx', function(d) { return self.xScale(d[xvar]); })
        .attr('cy', function(d) { return self.yScale(d[yvar]); });
    }
    this.xAxis = d3.axisBottom().scale(self.xScale);
    this.yAxis = d3.axisLeft().scale(self.yScale);
    d3.select('#x_axis_graph_'+String(self.graph_num)).call(self.xAxis);
    d3.select('#y_axis_graph_'+String(self.graph_num)).call(self.yAxis);
    this.plotted_yet = true;
  }

  color_key(x_spot=0.8, y_spot=1) {
    let self = this;
    let gap = self.point_size * 4;
    let key_data = [];
    for (let var_value in self.color_by[1]) {
      key_data.push({'val': var_value, 'color': self.color_by[1][var_value]});
    }
    this.parent_data.svg.selectAll(".legend_mark_"+String(self.graph_num)).remove();
    this.parent_data.svg.selectAll(".legend_mark_"+String(self.graph_num))
      .data(key_data)
      .enter()
      .append('circle')
      .attr('class', 'circle_point legend_mark_'+String(self.graph_num))
      .attr('r', self.point_size)
      .attr('fill', function(d) {return d['color'];})
      .attr('cx', function(d) { return self.left+self.w*x_spot; })
      .attr('cy', function(d, i) { return self.top+self.h-self.h*y_spot+gap*i; });

    this.parent_data.svg.selectAll(".legend_text_"+String(self.graph_num)).remove();
    this.parent_data.svg.selectAll(".legend_text_"+String(self.graph_num))
      .data(key_data)
      .enter()
      .append('text')
      .attr('class', 'legend_text_'+String(self.graph_num))
      .style('font-size', self.point_size*4-4)
      .html(function(d) {return d['val'];})
      .attr('x', function(d) { return self.left+self.w*x_spot+gap/2; })
      .attr('y', function(d, i) { return self.top+self.h-self.h*y_spot+gap*i+self.point_size; });
  }

  kill() {
    this.plot = false;
    this.graph_stuff.remove();
    this.parent_data.svg.selectAll('.mark_on_graph_'+String(this.graph_num)).remove();
  }

}

class WowSeriesPlot {

  constructor(dimensions, parent_data, xvar, yvar, color_by=null, line_weight=null) {
    WOW_graph_counter += 1;
    this.parent_data = parent_data;
    this.x = xvar;
    this.y = yvar;
    this.x_dtype = this.parent_data.dtypes[xvar];
    this.y_dtype = this.parent_data.dtypes[yvar];
    this.graph_num = WOW_graph_counter;
    this.dimensions = dimensions;
    [this.left, this.top, this.w, this.h] = dimensions;
    let self = this;
    this.graph_stuff = this.parent_data.svg.append('g');
    this.axes = this.graph_stuff.append('g');
    this.color_by = color_by;
    if (line_weight) {
      this.line_weight = line_weight;
    } else {
      this.line_weight = Math.min(Math.ceil(Math.sqrt(this.w*this.h*fraction_plot_marked/(Math.PI*this.parent_data.data.length))/2), 4);
    }
    this.plotted_yet = false;

    this.xlabel = this.graph_stuff.append('text')
      .html(xvar)
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_xlabel')
      .attr('x', this.left+this.w/2)
      .attr('y', this.top+this.h+30);

    this.ylabel = this.graph_stuff.append('text')
      .html(yvar)
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_ylabel')
      .attr('x', this.left)
      .attr('y', this.top-15);

    this.axes.append('g').attr("transform", "translate(0,"+(self.top+self.h)+")").attr('id', 'x_axis_graph_'+String(self.graph_num));
    this.axes.append('g').attr("transform", "translate("+self.left+", 0)").attr('id', 'y_axis_graph_'+String(self.graph_num));

    this.update_plot();
  }

  make_scale(d, x_or_y, scale_type) {
    let self = this;
    if (scale_type == 'Linear') {
      let range = (x_or_y == 'x') ? [self.left, self.left+self.w] : [self.top+self.h, self.top];
      return d3.scaleLinear().domain([d[0]-(d[1]-d[0])/10, d[1]+(d[1]-d[0])/10]).range(range);
    } else if (scale_type == 'Qual') {
      let range = (x_or_y == 'x') ? [self.left+self.w/d.length, self.left+self.w] : [self.top+self.h-self.h/d.length, self.top];
      return d3.scalePoint().domain(d).range(range);
    }
  }

  add_title(title) {
    this.title = this.graph_stuff.append('text')
      .html(title)
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_title')
      .attr('x', this.left+this.w/2)
      .attr('y', this.top-10);
  }

  update_plot() {
    let self = this;
    this.line = d3.line();
    if (this.y_dtype == 'Series_Number') {
      let yd = this.parent_data.number_domains[this.y];
      this.yScale = this.make_scale(yd, 'y', 'Linear');
      this.line.y(function(d) { return self.yScale(Number(d.y)); });
    } else if (this.y_dtype == 'Series_String') {
      yd = this.parent_data.string_sets[this.y]
      this.yScale = this.make_scale(yd, 'y', 'Qual')
      this.line.y(function(d) { return self.yScale(d.y); });
    }
    if (!this.x) { // assume x series is just integers up
      let xd = [0, this.parent_data.series_lengths[this.y][1]];
      this.xScale = this.make_scale(xd, 'x', 'Linear');
      this.line.x(function(d, i) { return self.xScale(i); });
    } else {
      if (this.x_dtype == 'Series_Number') {
        let xd = this.parent_data.number_domains[this.x];
        this.xScale = this.make_scale(xd, 'x', 'Linear');
        this.line.x(function(d) { return self.xScale(Number(d.x)); });
      } else if (this.x_dtype == 'Series_String') {
        let xd = this.parent_data.string_sets[this.x]
        this.xScale = this.make_scale(xd, 'x', 'Qual');
        this.line.x(function(d) { return self.xScale(d.x); });
      }
    }
    this.parent_data.svg.selectAll("."+self.parent_data.wow_data_class)
      .append('path')
      .attr('class', 'path_mark mark_on_graph_'+String(WOW_graph_counter))
      .attr('stroke-width', self.line_weight)
      .attr('stroke', function(d) {
        if (self.color_by) {
          return self.color_by[1][d[self.color_by[0]]];
        } else {
          return '#949494';
        }
      })
      .attr('fill', 'none')
      .attr('d', function(d) { 
        let yvals = d[self.y].split(';');
        let xvals;
        if (self.x) {
          xvals = d[self.x].split(';');
        }
        let tmp_line_data = [];
        for (let i=0; i<yvals.length; i++) {
          let tmp_point = {'y': yvals[i]};
          if (self.x) {
            tmp_point['x'] = xvals[i];
          } else {
            tmp_point['x'] = i;
          }
          if ((nan_formats.indexOf(tmp_point['x'])==-1) && (nan_formats.indexOf(tmp_point['y'])==-1)) tmp_line_data.push(tmp_point);
        }
        return self.line(tmp_line_data);
      });
    this.xAxis = d3.axisBottom().scale(self.xScale);
    this.yAxis = d3.axisLeft().scale(self.yScale);
    d3.select('#x_axis_graph_'+String(self.graph_num)).call(self.xAxis);
    d3.select('#y_axis_graph_'+String(self.graph_num)).call(self.yAxis);
    this.plotted_yet = true;
  }

  kill() {
    this.plot = false;
    this.graph_stuff.remove();
    this.parent_data.svg.selectAll('.mark_on_graph_'+String(this.graph_num)).remove();
  }
}

class WowData {
  constructor(data, svg, parent_data=null) {
    /*
    Reads tab-separated text file, associates it with column labels in the sidebar and an svg in the main space
    */
    WOW_data_counter += 1;
    this.wow_data_count = WOW_data_counter;
    this.wow_data_class = 'WOW_data_' + String(this.wow_data_count);
    this.data = data;
    this.wow_children = [];
    this.graphs = [];
    this.not_graphs = [];
    let wow_data = this;
    this.data = data
    this.infer_dtypes();
    this.svg = svg;
    this.search_filters = [];

    this.svg.selectAll('.'+wow_data.wow_data_class)
      .data(wow_data.data)
      .enter()
      .append('g')
        .attr('class', 'WOW_data_group ' + wow_data.wow_data_class)
        .on('mouseover', function(d) { d3.select(this).raise(); }) //brings to front
        .on('click', function() {
          svg.selectAll('.'+wow_data.wow_data_class).classed('clicked_data', false);
          d3.select(this).classed('clicked_data', true);
          //or (let j=0; j<nodes.length; j++) {
          //  d3.select(nodes[j]).classed('active', i==j);
          //}
        });
      
  }

  update_data(f_in) {
    this.f_in = f_in;
    let wow_data = this;
    let reader = new FileReader();
    reader.readAsText(f_in);
    reader.onload = function() {
      wow_data.data = d3.tsvParse(reader.result);
      update_plots();
    }
  }

  add_search_filter(column, dimensions, description="") {
    let sf = new Object();
    let self = this;
    sf.dimensions = dimensions;
    sf.column = column;
    this.search_filters.push(sf);
    sf.foreignObject = this.svg.append('foreignObject')
      .attr('x', dimensions[0])
      .attr('y', dimensions[1])
      .attr('width', dimensions[2])
      .attr('height', dimensions[3])
      .attr('class', 'foreign_obj');
    sf.input_descrip = sf.foreignObject.append('xhtml:p')
      .attr('class', 'text_input_description')
      .style('height', dimensions[3]/2)
      .style('font-size', (dimensions[3]/2)*0.8)
      .html(description);
    sf.text_input = sf.foreignObject.append('xhtml:input')
      .attr('type', 'text')
      .attr('class', 'text_input_filter')
      .style('height', dimensions[3]/2)
      .style('font-size', (dimensions[3]/2)*0.8)
      .on('keyup', function() { 
        self.svg.selectAll('.'+self.wow_data_class)
          .style('display', function(d) {
            for (let tmp_sf of self.search_filters) {
              if (d[tmp_sf.column].indexOf(tmp_sf.text_input.property("value"))==-1) return 'none';
            }
            return 'block';
          });
      });
  }

  infer_dtypes() {
    /*
    Infers the datatype of each column. Possible dtypes: 
    Number - NUMBER!
    String - any non-number variable
    Image - has to be a .png as of now
    Filename - has to be a .tsv (tab-delimited text file)
    Series_X_Number - a series with numbers on both axes (format "series:x1,y1;x2,y2;x3,y3;...")
    Series_X_String - a series with a string variable on the x-axis and numbers on the y-axis (format "series:x1,y1;x2,y2;x3,y3;...")
    */
    let example_row = this.data[0];
    this.dtypes = {};
    this.example_data = {};
    this.number_domains = {};
    this.string_sets = {}
    this.series_lengths = {}
    for (let column_name in example_row) {
      let val = "";
      let it_is_a_series = false;
      // if the value is blank ("") for the first row, keep checking rows until we find something
      let row_index = 0;
      let looking_for_example = true;
      while ((looking_for_example) && (row_index<this.data.length)) {
        let vals = String(this.data[row_index][column_name]).split(';');
        it_is_a_series = (vals.length>1) ? true : false;
        for (let i=0; i<vals.length; i++) {
          if (nan_formats.indexOf(vals[i]) == -1) {
            val = vals[i];
            looking_for_example = false;
          }
        }
        row_index += 1;
      }
      if (val.indexOf('.tsv') > -1) {
        this.dtypes[column_name] = 'Filename';
      } else if (val.indexOf('.png') > -1) {
        this.dtypes[column_name] = 'Image';
      } else if (it_is_a_series) {
        if (is_that_a_number(val)) {
          // number series, record numbers to pull max and min later
          this.dtypes[column_name] = 'Series_Number';
          let tmp_all_nums = [];
          for (let i=0; i<this.data.length; i++) {
            let tmp_series = this.data[i][column_name].split(';');
            for (let j=0; j<tmp_series.length; j++) {
              if (nan_formats.indexOf(tmp_series[j])==-1) {
                tmp_all_nums.push(Number(tmp_series[j]));
              }
            }
          }
          this.number_domains[column_name] = [Math.min(...tmp_all_nums), Math.max(...tmp_all_nums)];
        } else {
          // string series, record set of possible values
          this.dtypes[column_name] = 'Series_String';  
          this.string_sets[column_name] = [];
          for (let i=0; i<this.data.length; i++) {
            let tmp_series = this.data[i][column_name].split(';');
            for (let j=0; j<tmp_series.length; j++) {
              if (this.string_sets[column_name].indexOf(tmp_series[j])==-1) {
                this.string_sets[column_name].push(tmp_series[j]);
              }
            }
          }
        }
        // If it's series, record the min and max length
        let tmp_lens = [];
        for (let i=0; i<this.data.length; i++) {
          tmp_lens.push(this.data[i][column_name].split(';').length);
        }
        this.series_lengths[column_name] = [Math.min(...tmp_lens), Math.max(...tmp_lens)];
      } else {
        if (is_that_a_number(val)) {
          this.dtypes[column_name] = 'Number';
          let tmp_all_nums = [];
          // number column, record numbers to pull max and min later
          for (let i=0; i<this.data.length; i++) {
            if (this.data[i][column_name] != "") {
              tmp_all_nums.push(Number(this.data[i][column_name]));
            }
            this.data[i][column_name] = Number(this.data[i][column_name]);
          }
          this.number_domains[column_name] = [Math.min(...tmp_all_nums), Math.max(...tmp_all_nums)];
        } else {
          // string column, record set of possible values
          this.dtypes[column_name] = 'String';
          this.string_sets[column_name] = [];
          for (let i=0; i<this.data.length; i++) {
            if (this.string_sets[column_name].indexOf(this.data[i][column_name])==-1) {
              this.string_sets[column_name].push(this.data[i][column_name]);
            }
          }
        }
      }
    }
  }
}

function go() {
  let file = 'data/GR_v_DFE_mean.tsv';
  // This is where everything is going to actually be drawn
  let dimensions = [0, 40, 1200, 800];
  main_svg = d3.select("#WOW_svg_holder").append('svg')
    .attr('class', 'WOW_svg')
    .style('left', dimensions[0])
    .style('top', dimensions[1])
    .attr('width', dimensions[2])
    .attr('height', dimensions[3]);
  d3.tsv(file).then(function(data) {
    top_data = new WowData(data, main_svg);
    top_data.graphs.push(new WowMarkerPlot([100, 50, 250, 200], top_data, 'Avg_GR', 'DFE_mean', color_by=['Environment', env_color]));
    top_data.graphs[0].color_key();
    top_data.graphs.push(new WowMarkerPlot([450, 50, 250, 200], top_data, 'GR_max', 'GR_std_max_excluded'));
    top_data.graphs.push(new WowSeriesPlot([800, 30, 350, 90], top_data, 'Env_series', 'Env_GR'));
    top_data.graphs.push(new WowSeriesPlot([800, 170, 350, 90], top_data, 'Env_series', 'Env_DFE_mean'));
    d3.tsv('data/Mut_s_formatted.tsv').then(function(data) {
      mut_s_data = data;
      top_data.svg.selectAll('.mark_on_graph_1')
        .on('click', function(event, d) {
          let exp = d['Experiment'];
          console.log(exp);
          if (dfe_graph) dfe_graph.kill();
          let mut_data = new WowData(mut_s_data.filter(function(d) { return d['Experiment'] == exp; }), main_svg);
          console.log(mut_data);
          mut_data.add_search_filter('Gene', [125, 650, 200, 50], description='Filter by gene:')
          mut_data.add_search_filter('Mut', [125, 710, 200, 50], description='Filter by Mut_ID:')
          
          dfe_graph = new WowMarkerPlot([100, 350, 250, 250], mut_data, 'Sel_coef', null, color_by=['Environment', env_color],
                                        xrange_given=[-0.2,0.2]);
          dfe_graph.add_title(exp);
          dfe_graph.add_hover_el([0.7,0.9], function(mock_d) { return mock_d['Mut']+" "+mock_d["Gene"]; });
          mut_data.svg.selectAll('.'+mut_data.wow_data_class)
            .on('click', function(event, d) {
              mut_data.svg.selectAll('.'+mut_data.wow_data_class).classed('clicked_data', false);
              d3.select(this).classed('clicked_data', true);
              let mut = d['Mut'];
              if (s_x_graph) s_x_graph.kill();
              let s_x_data = new WowData(mut_s_data.filter(function(d) { return d['Mut'] == mut; }), main_svg);
              s_x_graph = new WowMarkerPlot([420, 350, 400, 400], s_x_data, 'Avg_GR', 'Sel_coef', color_by=['Environment', env_color],
                                            xrange_given=false, yrange_given=[-0.1,0.1]);
              s_x_graph.add_hover_el([0.7,0.9], function(mock_d) { return mock_d['Experiment']; });
              s_x_graph.add_title(d['Mut'] + ' ' + d['Gene']);
              s_x_graph.set_pointradius(4);
              s_x_data.svg.selectAll('.'+s_x_data.wow_data_class)
                .on('click', function(event, d) {
                  s_x_data.svg.selectAll('.'+s_x_data.wow_data_class).classed('clicked_data', false);
                  d3.select(this).classed('clicked_data', true);
                  make_bc_graph(d, 1);
                  make_bc_graph(d, 2);
                })

              make_bc_graph(d, 1);
              make_bc_graph(d, 2);
            })
        })
    });
  });
  
}

function make_bc_graph(row, rep) {
  if (bc_data[rep-1]) {
    if (bc_data[rep-1].graphs[0]) bc_data[rep-1].graphs[0].kill();
  }
  let mut_id_list = [row['Mut'].slice(3, row['Mut'].length), '51', '6', '91', '99', '102'];
  d3.csv('data/BC_freqs/' + row['Experiment'] + '_R' + String(rep) + '.csv').then(function(data) {
    for (let r=0; r<data.length; r++) {
      data[r]['Time'] = '0;1;2;3;4';
      data[r]['Mut_in_question'] = String(mut_id_list.indexOf(String(parseInt(data[r]['Mut_ID']))));
    }
    bc_data[rep-1] = new WowData(data.filter(function(d) { return d['Mut_in_question']!=-1;}).sort(function(a, b) { return parseInt(b['Mut_in_question'])-parseInt(a['Mut_in_question']); }), main_svg);
    console.log('data/BC_freqs/' + row['Experiment'] + '_R' + String(rep) + '.csv', data, bc_data[rep-1]);
    //let mut_id_color = {'5': 'red', '-1': '#ccc', '0': "#0173b2", '1': "#de8f05", '2': "#029e73", '3': "#d55e00", '4': "#cc78bc"};
    let mut_id_color = {'0': 'red', '-1': '#ccc', '5': '#ccc', '1': '#ccc', '2': '#ccc', '3': '#ccc', '4': '#ccc'};
    bc_data[rep-1].graphs.push(new WowSeriesPlot([950, 350+220*(rep-1), 250, 150], bc_data[rep-1], 'Time', 'Log10_freq_trajectory', color_by=['Mut_in_question', mut_id_color], line_weight=1));
    if (rep==1) bc_data[rep-1].graphs[0].add_title(String(row['Sel_coef']).slice(0,5));
  });
}

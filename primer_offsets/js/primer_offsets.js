//GLOBAL VARS
var num_primers = 20;
var primer_data = [];

var plot_width = 1100;
var plot_height = 60;
var primer_chars = 101;

var g_svg;
var x_scale;
var y_scale;
var line_func;

var freq_data = [{'freqs': [], 'color': '#74BF74', 'name': 'A'}, 
                  {'freqs': [], 'color': '#D42F24', 'name': 'T'},
                  {'freqs': [], 'color': '#244FD4', 'name': 'C'},
                  {'freqs': [], 'color': '#000000', 'name': 'G'}];

/*
for (var i=0; i<freq_data.length; i++) {
    var ts = [];
    for (var j=0; j<primer_chars; j++) {
        ts.push(Math.random());
    }
    freq_data[i]['freqs'] = ts;
}
*/

for (var i=0; i<num_primers; i++) {
    primer_data.push({'pnum': i});
}

var c_dict = {0: '#FFFFFF', 1: '#EEEEEE'};

var atcg_dict = {'A': 0, 'T': 1, 'C': 2, 'G': 3, 'N': 4, 'W': 5, 'S': 6,
                 'a': 0, 't': 1, 'c': 2, 'g': 3, 'n': 4, 'w': 5, 's': 6};

var atcg_dict_back = {0: 'A', 1: 'T', 2: 'C',  3: 'G'};

function make_freq_plot() {
    g_svg = d3.select("#graph_spot").append("svg")
        .attr("width", plot_width)
        .attr("height", plot_height);
    
    x_scale = d3.scale.linear()
        .range([5, plot_width-10])
        .domain([0, primer_chars]);
    y_scale = d3.scale.linear()
        .range([plot_height-5, 5])
        .domain([0, 1]);
    line_func = d3.svg.line()
        .x(function(d) { return x_scale(d.x); })
        .y(function(d) { return y_scale(d.y); })
        .interpolate("monotone");

    g_svg.append("rect")
        .attr("x", 5)
        .attr("y", 5)
        .attr("width", plot_width-15)
        .attr("height", plot_height-10)
        .attr("fill", "#DDDDDD");
    
    g_svg.append("rect")
        .attr("x", 5)
        .attr("y", 5)
        .attr("width", plot_width-15)
        .attr("height", (plot_height - 10)/2)
        .attr("fill", "#FF9D9D");
        
    g_svg.selectAll(".fancy_line")
        .data(freq_data)
        .enter()
        .append("path")
            .attr("class", "fancy_line")
            .attr("d", function(d) { 
                var line_data = [];
                for (var t=0; t<d['freqs'].length; t++) {
                    line_data.push({'x': t, 'y': d['freqs'][t]});
                }
                return line_func(line_data);
            })
            .attr("stroke", function(d) { return d['color']; })
            .attr("fill", "none")
            .attr("stroke-width", "2")
            .attr("opacity", "1");
    
}


function update_freq_plot() {
    g_svg.selectAll(".fancy_line")
        .attr("d", function(d) { 
            var line_data = [];
            for (var t=0; t<d['freqs'].length; t++) {
                line_data.push({'x': t, 'y': d['freqs'][t]});
            }
            return line_func(line_data);
        });
    
}

function change_seqs() {
    var p_seqs = [];
    var max_len = 0;
    for (var i=0; i<num_primers; i++) {
        var tseq = document.getElementById("p_input_"+String(i)).value;
        if (tseq.length > max_len) {
            max_len = tseq.length;
        }
        p_seqs.push(tseq);
    }
    
    var atcg_counts = [];
    for (var j=0; j<max_len; j++) {
        var tmp_counts = [0, 0, 0, 0, 0, 0, 0];
        for (var i=0; i<num_primers; i++) {
            if (p_seqs[i].length > j) { 
                if (p_seqs[i][j] in atcg_dict) {
                    tmp_counts[atcg_dict[p_seqs[i][j]]] += 1;
                }
            }
        }
        atcg_counts.push(tmp_counts);
    }
        
    var sums = [];
    for (var j=0; j<max_len; j++) {
        var ts = 0;
        for (var i=0; i<7; i++) {
            ts += atcg_counts[j][i];
        }
        sums.push(ts);
    }
    
    var half_count = 5; //for counting W as 50-50 A and T, later for S counting 50-50 C & G
    var worst_freq = 0;
    var worst_rec = 'none';
    for (var i=0; i<4; i++) {
        if (i > 1) {
            half_count = 6
        }
        var tmp_rec = [];
        for (var j=0; j<max_len; j++) {
            var tmp_freq = ((atcg_counts[j][i] + 0.25*atcg_counts[j][4] + 0.5*atcg_counts[j][half_count])/sums[j]);
            tmp_rec.push(tmp_freq);
            if (tmp_freq > worst_freq) {
                worst_freq = tmp_freq;
                worst_rec = [String(j), atcg_dict_back[i]];
            }
        }
        freq_data[i]['freqs'] = tmp_rec;
    }
    
    console.log('worst record: Position ' + worst_rec[0] + ' ' + worst_rec[1] + ' at ' + 
                String(100*worst_freq) + '%');
    
    update_freq_plot();
}

function start() {
    
    d3.select("#primer_zone").selectAll('.primer_input')
        .data(primer_data)
        .enter()
        .append("textarea")
            .attr("class", "primer_input")
            .attr("id", function(d) { return "p_input_"+String(d['pnum']); })
            .style("background-color", function(d) { return c_dict[d['pnum'] % 2]; })
            .style("top", function(d, i) { return 90 + 30*i; })
            .on("keyup", function() { change_seqs(); });
    
    d3.select("#primer_zone").selectAll('.primer_name')
        .data(primer_data)
        .enter()
        .append("textarea")
            .attr("class", "primer_name")
            .attr("id", function(d) { return "p_name_"+String(d['pnum']); })
            .style("top", function(d, i) { return 90 + 30*i; });
    
    make_freq_plot();
    
}


// file handling stuff from
// http://mounirmesselmeni.github.io/2012/11/20/reading-csv-file-with-javascript-and-html5-file-api/
function handleFiles(files) {
    // Check for the various File API support.
    if (window.FileReader) {
        // FileReader are supported.
        getAsText(files[0]);
    } else {
        alert('FileReader are not supported in this browser.');
    }
}

function getAsText(fileToRead) {
    var reader = new FileReader();
    // Read file into memory as UTF-8      
    reader.readAsText(fileToRead);
    // Handle errors load
    reader.onload = loadHandler;
    reader.onerror = errorHandler;
}

function loadHandler(event) {
    var csv = event.target.result;
    var tmp_data = d3.csv.parse(csv);
    for (var i=0; i<num_primers; i++) {
        if (i < tmp_data.length) {
            document.getElementById("p_input_"+String(i)).value = tmp_data[i]['Sequence'];
            document.getElementById("p_name_"+String(i)).value = tmp_data[i]['Name'];
        }
    }
    change_seqs();
}

function errorHandler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Cannot read file !");
    }
}

function save_data() {
    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += 'Name,Sequence\n'
    for (var i=0; i<num_primers; i++) {
        var tseq = document.getElementById("p_input_"+String(i)).value;
        var tname = document.getElementById("p_name_"+String(i)).value;
        if ((tseq + tname).length > 0) {
            csvContent += tname + ',' + tseq + '\n';
        }
    }
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}
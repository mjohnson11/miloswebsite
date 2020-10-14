/* Functions I use to get audio input */


function AudioInAction(fft_size, func_to_call_after_audio_loads) {
  var audio_guy = {};
  //browser compatibility stuff
  window.AudioContext = window.AudioContext ||
                        window.webkitAudioContext;
  audio_guy.context = new AudioContext();
  
  //checks from https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia documentation
  
  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // First get ahold of the legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in audio_guy browser'));
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
    audio_guy.microphone = audio_guy.context.createMediaStreamSource(stream);
    audio_guy.analyser = audio_guy.context.createAnalyser();
    // microphone -> analyser -> destination.
    audio_guy.microphone.connect(audio_guy.analyser);
    //analyser.connect(context.destination); //audio_guy is annoying, but kind of fun to hear the audio
    audio_guy.analyser.fftSize = fft_size;
    audio_guy.freqDat = new Uint8Array(audio_guy.analyser.frequencyBinCount);
    audio_guy.status = "GOODTOGODAWG";
    func_to_call_after_audio_loads();
  }).catch(error => {
    audio_guy.status = "FAIL";
    console.log('Reeeejected!', error);
    func_to_call_after_audio_loads();
  });
  return audio_guy;
}

function AudioFileAction(fft_size, func_to_call_after_audio_loads, get_song_from='file') {
  var audio_guy = {};
  var sound = document.getElementById('sound');
  if (get_song_from == 'file') {
    //ref: https://stackoverflow.com/questions/28619550/javascript-play-uploaded-audio/28619927
    sound.src = URL.createObjectURL(document.getElementById('file_input').files[0]);
    audio_guy.songname = document.getElementById('file_input').files[0];
    // not really needed in audio_guy exact case, but since it is really important in other cases,
    // don't forget to revoke the blobURI when you don't need it
    sound.onend = function(e) {
      URL.revokeObjectURL(audio_guy.src);
    }
  } else {
    sound.src = 'scratch_song.mp3';
    audio_guy.songname = 'Chance the Rapper - I am Very Very Lonely';
  }
  // Creates an AudioContext and AudioContextBuffer
  audio_guy.context = new AudioContext();
  var audioSource = audio_guy.context.createMediaElementSource(sound);
  audio_guy.analyser = audio_guy.context.createAnalyser();
  // we have to connect the MediaElementSource with the analyser 
  audioSource.connect(audio_guy.analyser);
  audio_guy.analyser.connect(audio_guy.context.destination);
  audio_guy.analyser.fftSize = fft_size;
  audio_guy.freqDat = new Uint8Array(audio_guy.analyser.frequencyBinCount);
  sound.play();
  func_to_call_after_audio_loads();
  //intervalhandle = setInterval(function(){animatron()}, 1);
  return audio_guy;
}

function AudioPanel(fftsize, callback_on_audio_load) {
  window.audiopanel = {};
  audpan = window.audiopanel;
  audpan.fftsize = fftsize;
  audpan.audio_panel = d3.select("body").append("div").attr("class", "audio_panel");
  audpan.audio_options = audpan.audio_panel.append("div").attr("class", "audio_options");
  audpan.audio_display = audpan.audio_panel.append("div").attr("class", "audio_display");

  audpan.mic_button = audpan.audio_options.append("div").attr("class", "audio_button").html("mic");
  audpan.file_button = audpan.audio_options.append("div").attr("class", "audio_button").attr("id", "file_input_button").html("file")
    .on("click", function() { document.getElementById('file_input').click(); });
  audpan.file_input = audpan.audio_options.append("input").attr("type", "file").attr("id", "file_input").on("change", "file_reader('file')").attr("multiple", "True");
  audpan.default_button = audpan.audio_options.append("div").attr("class", "audio_button").html("?");
  audpan.gain_slider_holder = audpan.audio_options.append("div").attr("class", "audio_gain_holder");
  audpan.gain_slider = audpan.gain_slider_holder.append("input").attr("type", "range").attr("class", "gain_slider");
  audpan.sound = audpan.audio_options.append("audio").attr('id', "sound");
  audpan.dropdown_button = audpan.audio_options.append("div").attr("class", "arrow arrow_down").on("click", function() { 
    $(".audio_display").slideToggle(); 
    $('.arrow').toggle();
  });
  audpan.dropup_button = audpan.audio_options.append("div").attr("class", "arrow arrow_up").on("click", function() { 
    $(".audio_display").slideToggle(); 
    $('.arrow').toggle();
  });
  audpan.asvg = audpan.audio_display.append("svg").attr("class", "audio_check_svg").attr("width", 300).attr("height", 300);

  audpan.audio_display.append('h2').attr('id', 'debug_monitor_text');

  audpan.mic_button.on("click", function() {
    audpan.which_source = "mic";
    audpan.source_button = audpan.mic_button;
    audpan.audobj =  AudioInAction(fftsize, callback_on_audio_load);
  })

  audpan.file_input.on("change", function() {
    if (audpan.audobj) {
      delete audpan.audobj;
    }
    audpan.which_source = "file";
    audpan.source_button = audpan.file_button;
    audpan.audobj = AudioFileAction(fftsize, callback_on_audio_load);
  })

  audpan.default_button.on("click", function() {
    audpan.which_source = "default";
    audpan.source_button = audpan.default_button;
    audpan.audobj = AudioFileAction(fftsize, callback_on_audio_load, get_song_from="def");
  })

  return audpan;
}

function monitor_display() {
  window.audiopanel.audobj.analyser.getByteFrequencyData(window.audiopanel.audobj.freqDat);
  window.audiopanel.asvg.selectAll('circle')
    .data(window.audiopanel.audobj.freqDat)
    .attr('cy', function(d) { return window.audiopanel.asvg.yscale(d); });
  let c = 0;
  let m = 0
  for (var j = 0, l = window.audiopanel.audobj.freqDat.length; j < l; j++) {
     c += window.audiopanel.audobj.freqDat[j];
     if (window.audiopanel.audobj.freqDat[j] > m) {
       m = window.audiopanel.audobj.freqDat[j];
     }
  }
  d3.select('#debug_monitor_text').html(String(m));
}

function monitor_panel() {
  window.audiopanel.asvg.xscale = d3.scaleLinear().range([40,300]).domain([0, window.audiopanel.audobj.freqDat.length]);
  window.audiopanel.asvg.yscale = d3.scaleLinear().range([250,50]).domain([0, 255]);

  window.audiopanel.asvg.selectAll('circle')
    .data(window.audiopanel.audobj.freqDat)
    .enter()
    .append('circle')
      .attr('r', 3)
      .attr('cx', function(d, i) { return window.audiopanel.asvg.xscale(i); })
      .attr('cy', function(d) { return window.audiopanel.asvg.yscale(d); })
      .attr('fill', '#DDDDDD');
      
  intervalhandle = setInterval(function(){monitor_display()}, 1);
}
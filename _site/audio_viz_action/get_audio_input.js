/* Class I use to get audio input */

class AudioInAction {
    
  constructor(fft_size, func_to_call_after_audio_loads) {
    
    //browser compatibility stuff
    window.AudioContext = window.AudioContext ||
                          window.webkitAudioContext;
    this.context = new AudioContext();
    
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
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
      this.microphone = this.context.createMediaStreamSource(stream);
      this.analyser = this.context.createAnalyser();
      // microphone -> analyser -> destination.
      this.microphone.connect(this.analyser);
      //analyser.connect(context.destination); //this is annoying, but kind of fun to hear the audio
      this.analyser.fftSize = fft_size;
      this.freqDat = new Uint8Array(this.analyser.frequencyBinCount);
      this.status = "GOODTOGODAWG";
      func_to_call_after_audio_loads();
    }).catch(error => {
      this.status = "FAIL";
      console.log('Reeeejected!', error);
      func_to_call_after_audio_loads();
    });
  }
 
}

class AudioFileAction {
  constructor(fft_size, func_to_call_after_audio_loads, get_song_from='file') {
    var sound = document.getElementById('sound');
    if (get_song_from == 'file') {
      //ref: https://stackoverflow.com/questions/28619550/javascript-play-uploaded-audio/28619927
      sound.src = URL.createObjectURL(document.getElementById('file_input').files[0]);
      this.songname = document.getElementById('file_input').files[0];
      // not really needed in this exact case, but since it is really important in other cases,
      // don't forget to revoke the blobURI when you don't need it
      sound.onend = function(e) {
        URL.revokeObjectURL(this.src);
      }
    } else {
      sound.src = 'scratch_song.mp3';
      this.songname = 'Chance the Rapper - I am Very Very Lonely';
    }
    // Creates an AudioContext and AudioContextBuffer
    this.context = new AudioContext();
    var audioSource = this.context.createMediaElementSource(sound);
    this.analyser = this.context.createAnalyser();
    // we have to connect the MediaElementSource with the analyser 
    audioSource.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.analyser.fftSize = fft_size;
    this.freqDat = new Uint8Array(this.analyser.frequencyBinCount);
    sound.play();
    func_to_call_after_audio_loads();
    //intervalhandle = setInterval(function(){animatron()}, 1);
  }
}

class AudioPanel(fftsize, callback_on_audio_load) {
  this.audio_panel = d3.select("body").append("div").attr("class", "audio_panel");
  this.audio_display = this.audio_panel.append("div").attr("class", "audio_display");
  this.audio_options = this.audio_panel.append("div").attr("class", "audio_options");

  this.mic_button = this.audio_options.append("div").attr("class", "audio_button").innerHTML("mic");
  this.file_button = this.audio_options.append("div").attr("class", "audio_button").attr("id", "file_input").innerHTML("file");
  this.default_button = this.audio_options.append("div").attr("class", "audio_button").innerHTML("?");
  this.gain_slider_holder = this.audio_options.append("div").attr("class", "audio_gain_holder");
  this.gain_slider = this.gain_slider_holder.append("input").attr("type", "range").attr("class", "gain_slider");
  this.dropdown_button = this.audio_options.append("div").attr("class", "arrow_down");
  this.dropup_button = this.audio_options.append("div").attr("class", "arrow_up");

  this.audio_check_svg = this.audio_display.append("svg").attr("class", "audio_check_svg");

  this.mic_button.on("click", function() {
    this.which_source = "mic";
    this.source_button = this.mic_button;
    this.audobj = AudionInAction(fftsize, callback_on_audio_load);
  })

  this.file_button.on("click", function() {
    this.which_source = "file";
    this.source_button = this.file_button;
    this.audobj = AudionFileAction(fftsize, callback_on_audio_load);
  })

  this.default_button.on("click", function() {
    this.which_source = "default";
    this.source_button = this.default_button;
    this.audobj = AudionFileAction(fftsize, callback_on_audio_load, get_song_from="def");
  })
}


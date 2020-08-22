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



'use strict';
angular.module('topics').controller('AudioController', ['$scope', '$http','$sce','$stateParams', '$location', 'Admin','Authentication', 'Topics', 'Profiles', 'Comments', 'Questions', 'Meals', 'Knowledge', 'TopicTypes', 'TopicTemplates', 'TemplateTypes', 'Upload', 'QuestionAnswers', 'MealAnswers', 'Reminders', 'TopicTypesByUser','$modal',
  function($scope, $http, $sce, $stateParams, $location, Admin, Authentication, Topics, Profiles, Comments, Questions, Meals, Knowledge, TopicTypes, TopicTemplates, TemplateTypes, Upload, QuestionAnswers, MealAnswers, Reminders, TopicTypesByUser, $modal) {

  function __log(e, data) {
      $scope.audiolog+=  e + ' ' + (data || '')+'\n';
    }

    var audio_context;
    var recorder;

  function startUserMedia(stream) {
      var input = audio_context.createMediaStreamSource(stream);
      __log('Media stream created.');

      // Uncomment if you want the audio to feedback directly
      //input.connect(audio_context.destination);
      //__log('Input connected to audio context destination.');
      
      recorder = new Recorder(input);
      __log('Recorder initialised.');
    }
  $scope.trustSrc = function(src) {

    return $sce.trustAsResourceUrl(src);
  };
  $scope.startRecording=function (button) {
    if(recorder){
      recorder.record();
      $scope.audiolog='';
      $scope.startReadonly = true;
      $scope.stopReadonly=false;
      $scope.deleteReadonly = true;
      __log('Recording...');
    }
  };

  $scope.stopRecording=function (button) {
    if(recorder){
      recorder.stop();
      $scope.stopReadonly = true;
      $scope.deleteReadonly = false;
      __log('Stopped recording.');
      
      // create WAV download link using audio data blob
      $scope.createDownloadLink();
      
      recorder.clear();
    }
  };
  $scope.deleteRecording=function (button){
  	//var li = document.getElementById('recordinglist');
    //li.removeChild(li.childNodes[0]);
    $scope.link='';
    $scope.linkReadonly=false;
    $scope.deleteReadonly = true;
    $scope.startReadonly= false;
    $scope.aurl='';
    $scope.aurlshow=false;
    $scope.audiolog='';
     __log('Audio deleted.');
    //console.log($scope.aurl);
  };

  $scope.createDownloadLink=function() {
    if(recorder){
        recorder.exportWAV(
      	function(blob) {
  	      var url = URL.createObjectURL(blob);

  	      $scope.aurl=$scope.trustSrc(url); 
          $scope.aurlshow=true;

  	      var files=[];
  	      blob.name=new Date().getTime();
          blob.name+=uuid();
          blob.name+=$scope.audioid.toString();
          blob.name+='.wav';
          $scope.audioid++;
  	      //-------------
  	      files.push(blob);
  	      $scope.uploadaudio(files);  

      });
    }
  };

  function uuid(){
      return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
    });
  }



  $scope.Audio_init = function () {
      try {
        // webkit shim
        $scope.audiolog='';
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;
        
        audio_context = new AudioContext();
        __log('Audio context set up.');
        __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
      } catch (e) {
        alert('No web audio support in this browser!');
      }
      
      navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
        __log('No live audio input: ' + e);
      });
  };
  }
]);

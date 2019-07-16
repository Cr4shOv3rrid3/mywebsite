$(function(){

  "use strict";
  
  // Preloader
  $( window ).load(function() {
      $("#loading-img").fadeOut();
      $("#preloader").delay(400).fadeOut("slow");
  });

  $(document).ready(function(){

    // Create launch date for ticker
    // Date below denotes 23 April, 2015
    $(function () {
      var launchDay = new Date(2016, 6-1, 11);
      $('#ticker').countdown({
        until: launchDay
      });
    });

    // SVG Fallback for older browsers
    $(function() {
      if (!Modernizr.svg) {
        $(".logo img").attr('src', function(index, attr) {
          return attr.replace('svg', 'png');
        });
      }
    });

    // Placeholder initialize
    $('input, textarea').placeholder();

  });

});


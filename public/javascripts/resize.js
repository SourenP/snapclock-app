$(document).ready(function() {
  var h = parseInt($(window).height()) - $("#banner").outerHeight(true) - 2*parseInt($(".container").css('margin'))
  $("#snap").css('height', h);
  $("#loading").css('height', h/2);
  $("#minisnap").css('height', h/2);
});

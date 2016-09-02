$(document).ready(function() {
  var h = parseInt($(window).height()) - $("#banner").outerHeight(true) - 2*parseInt($("body").css('margin'))
  $("img").css('height', h);
});

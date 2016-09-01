$(document).ready(function() {
  console.log(parseInt($("body").css('margin')))
  console.log($("#banner").outerHeight(true))
  var h = parseInt($(window).height()) - $("#banner").outerHeight(true) - 2*parseInt($("body").css('margin'))
  $("img").css('height', h);
});

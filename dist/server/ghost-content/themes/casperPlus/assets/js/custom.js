/**
 * Custom JS file for CasperPlus behaviours
 */

 /* globals $, document */
$(document).ready(function () {
  $(".close-button").click(function() {
    $(this).parent().remove();
  })

  //Kickstarter countdown begin
  var end = new Date('11/14/2015 04:21 AM')
  var _day = 1000 * 60 * 60 * 24;
  var now = new Date();
  var daysLeft = Math.floor((end - now)/_day);
  if (daysLeft > 0) {
    $("#kickstarter-countdown").text(daysLeft);
  }
  //Kickstarter countdown end
});

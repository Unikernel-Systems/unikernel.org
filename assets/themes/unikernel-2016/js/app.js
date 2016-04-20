$(document).foundation();

(function($) {

var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

// equal heights
function eqH() {
    windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    
    if (windowWidth >= 640) {
        $('.eqH-md').eqHeights('equalize');
    }
    else {
        $('.eqH-md').eqHeights('destroy');
    }
    
    if (windowWidth >= 1024) {
        $('.eqH-large').eqHeights('equalize');
    }
    else {
        $('.eqH-large').eqHeights('destroy');
    }
}

// put all responsive functions here
function respond(){
    eqH();
}


$(document).ready(function() {

});


$(window).load(function() {
    respond();
});


$(window).resize(function() {
    respond();
});


$(window).scroll(function () {
	
});

} (jQuery));
+function($) {
	"use strict";

	// EQHEIGHTS CLASS DEFINITION
  // ====================

	var EqHeights = function (element) {
        this.element = $(element);
      }

	EqHeights.prototype.equalize = function () {
		var curHighest = 0;
        this.element.addClass("heights-equalized").children().each(function () {
			var el = $(this),
					elHeight = el.height('auto').outerHeight();
			if (elHeight > curHighest) {
				curHighest = elHeight;
			}
		}).height(curHighest);
	}

	EqHeights.prototype.destroy = function () {
		this.element.removeClass("heights-equalized");
		this.element.data('eqHeights', false);
		this.element.children().each(function () {
			$(this).css('height', '');
		});
	}

	// EQHEIGHTS PLUGIN DEFINITION
  // =====================

  var old = $.fn.eqHeights

  $.fn.eqHeights = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('eqHeights')

      if (!data) $this.data('eqHeights', (data = new EqHeights(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.eqHeights.Constructor = EqHeights

	// EQHEIGHTS NO CONFLICT
  // ===============

  $.fn.eqHeights.noConflict = function () {
    $.fn.eqHeights = old
    return this
  }
}(window.jQuery);
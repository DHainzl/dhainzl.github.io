(function($){
	$(document).ready(function() {
		var activeTag = '';

		$(document).on('click','.tag-filter',function() {
			var tag = $(this).data('tag');

			if (activeTag == tag) {
				activeTag = '';
			} else {
				activeTag = tag;
			}

			$('.project-item').each(function() {
				var $item = $(this);
				var tags = $item.data('tags');
				
				if (activeTag != '' && tags.indexOf(activeTag) == -1) {
					$item.addClass('hidden');
				} else {
					$item.removeClass('hidden');
				}
			});

			$('[data-tag]').removeClass('label-primary');
			if (activeTag != '') {
				$('[data-tag="' + activeTag + '"]').addClass('label-primary');
			}
		});
	});
})(jQuery)

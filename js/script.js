$(function(){

	var status_tmpl = $('#status-template').html(),
		$status_container = $('.status'),
		$status = $(status_tmpl);

	for(var i = 0; i < 5; i++){
		var $clone = $status.clone();
		setTimeout((function($clone, i){
			return function(){
				var dir = i % 2? 'left' : 'right',
					trans = {position:'relative'},
					anim = {};

				trans[dir] = '-100%';
				anim[dir] = 0;

				$status_container.append($clone);
				// $clone
				// 	.css(trans)
				// 	.animate(anim, 1000);
			}
		})($clone, i), 100/*1000 * i*/);
	}

});
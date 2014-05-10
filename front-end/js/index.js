$(document).ready(function() {
	$('#responsive-menu-button').sidr({
		name : 'sidr-main',
		source : '.accordion'
	});

	$('li').click(function() {
		console.log($(this).find('ul')[0]);
		$(this).find('ul').toggleClass('expand');
		return false;
	});

	$('ul li').click(function() {
		console.log($(this).find('ul')[0]);

	});

	$("#index-modal").load("pages/modal.html", function() {
		
	});

	$('.mybutton').click(function() {
		$('.index-menu').click();
		console.log($('#sidr-main').css('left'));
		//using this contrll
	});
});

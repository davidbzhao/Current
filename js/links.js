define([
    'jquery'
], function($){
    $(document).ready(function(){
        initBackButton();
    })

	function initBackButton(){
		$('#backButton').click(function(){
			window.open('http://davidzhao.me/', '_self');
		})
	}
})
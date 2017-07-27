define([
    'jquery',
	'underscore',
	'firebase',
	'tagging',
	'text!../../partials/item.html',
	'text!../../partials/itemAdder.html'
], function($, _, firebase, tagging, ItemTemplate, ItemAdderTemplate){
	var loadedAll = false;
	var loadingMore = false;

	$(document).ready(function(){
		initializeFirebase();
		initializeSignInButtonListener();
		loadItems();
	});

	function initializeFirebase(){
		var config = {
			apiKey: "AIzaSyBZjK-fcZ0Q8SlgWLbnakzymQRt01cjKPE",
			authDomain: "current-ad2ee.firebaseapp.com",
			databaseURL: "https://current-ad2ee.firebaseio.com",
			projectId: "current-ad2ee",
			storageBucket: "",
			messagingSenderId: "1005389711220"
		};
		firebase.initializeApp(config);
		firebase.auth().onAuthStateChanged(function(user){
			if(user){
				loadItemAdder();
			}
		});
	}

	function initializeSignInButtonListener(){
		$('#signin').click(function(){
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithPopup(provider).then(function(result) {
				console.log('signed in')
			}).catch(function(error) {
				console.log(error)
			});
		});
	}

	function initializeScrollListener(){
		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() > $('.item').last().offset().top){
				if(!loadingMore && !loadedAll){
					loadingMore = true;
					loadMoreItems();
				}
			}
		});
	}

	function loadItems(){
		firebase.database()
				.ref('/items')
				.orderByKey()
				.limitToLast(40)
				.once('value')
				.then(function(snapshot){
			var jsonItems = snapshot.val();
			var itemKeys = _.keys(jsonItems);
			for(var cnt = 0; cnt < itemKeys.length; cnt++){
				var time = new Date(jsonItems[itemKeys[cnt]].timestamp);
				var month = time.getMonth() + 1;
				var day = time.getDate();
				var content = jsonItems[itemKeys[cnt]].body;
				var tags = []
				if(jsonItems[itemKeys[cnt]].tags !== undefined){
					tags = _.keys(jsonItems[itemKeys[cnt]].tags);
				}
				prependItem(itemKeys[cnt], month, day, content, tags);		
			}
			initializeScrollListener();
		});
	}

	function loadMoreItems(){
		firebase.database()
				.ref('/items')
				.orderByKey()
				.endAt($('.item').last().data('item-id'))
				.limitToLast(41)
				.once('value', function(snapshot){
			var jsonItems = snapshot.val();
			var itemKeys = _.keys(jsonItems);
			if(itemKeys.length <= 1){
				loadingMore = true;
				loadedAll = false;
			}
			// To length-2 to disregard the item (already in list)
			for(var cnt = itemKeys.length - 2; cnt >= 0 ; cnt--){
				var time = new Date(jsonItems[itemKeys[cnt]].timestamp);
				var month = time.getMonth() + 1;
				var day = time.getDate();
				var content = jsonItems[itemKeys[cnt]].body;
				var tags = []
				if(jsonItems[itemKeys[cnt]].tags !== undefined){
					tags = _.keys(jsonItems[itemKeys[cnt]].tags);
				}
				appendItem(itemKeys[cnt], month, day, content, tags);		
			}
			loadingMore = false;
			loadedAll = false;
		});
	}

	function loadItemAdder(){
		if(firebase.auth().currentUser != null){
			if(firebase.auth().currentUser.email === 'davidzhao058@gmail.com'){
				var newItemAdderTemplate = _.template(ItemAdderTemplate);
				var newDate = new Date();
				var currentYear = newDate.getFullYear();
				var currentMonth = newDate.getMonth() + 1;
				var currentDay = newDate.getDate();
				var newItemAdderHtml = newItemAdderTemplate({
					currentYear: currentYear,
					currentMonth: currentMonth,
					currentDay: currentDay
				});
				$('#main').prepend(newItemAdderHtml);
				$('#itemAdder-content').focus();
				initializeItemAdderListeners();
				$('#itemAdder-tags').tagging({'no-enter': true});
			}
		}
	}

	function appendItem(itemId, month, day, content, tags){
		var newItemTemplate = _.template(ItemTemplate);
		var newItemHtml = newItemTemplate({
			itemId: itemId,
			month: month,
			day: day,
			content: content,
			tags: tags
		});
		$('#items').append(newItemHtml);
	}

	function prependItem(itemId, month, day, content, tags){
		var newItemTemplate = _.template(ItemTemplate);
		var newItemHtml = newItemTemplate({
			itemId: itemId,
			month: month,
			day: day,
			content: content,
			tags: tags
		});
		$('#items').prepend(newItemHtml);
	}

	function isNumKey(evt){
		var keycode = (evt.which) ? evt.which : evt.keyCode;
		if(keycode > 31 && !(keycode >= 48 && keycode <= 57)){
			return false;
		}
		return true;
	}

	function correctLength(evt){
		var target = $(evt.target);
		if(target.prop('id') === 'itemAdder-year'){
			target.val(target.val().substring(0,4));
		} else if(target.prop('id') === 'itemAdder-month'){
			target.val(target.val().substring(0,2));
		} else if(target.prop('id') === 'itemAdder-day'){
			target.val(target.val().substring(0,2));
		}
	}

	function initializeItemAdderListeners(){
		$('.itemAdder-date').keypress(isNumKey);
		$('.itemAdder-date').focusout(correctLength);
		$('input').change(function(evt){
			$(evt.target).css('border','');
		});
		$('#itemAdder-form').submit(function(e){
			console.log('submit');
			e.preventDefault();
			var submitForm = true;
			var submittedYear = parseInt($('#itemAdder-year').val());
			var submittedMonth = parseInt($('#itemAdder-month').val());
			var submittedDay = parseInt($('#itemAdder-day').val());
			var submittedDate = new Date(submittedYear + '/' + submittedMonth + '/' + submittedDay);
			// Check if date is valid
			if(isNaN(submittedDate.getTime())){
				submitForm = false;
				$('.itemAdder-date').css('border','solid 2px #f33');
			}
			// Check if content is filled
			var submittedContent = $('#itemAdder-content').val().trim();
			if(submittedContent === ''){
				submitForm = false;
			}
			var submittedTags = $('#itemAdder-tags').tagging("getTags");
			// Submit form is valid inputs
			if(submitForm){
				var time = submittedDate.getTime();
				var content = submittedContent;
				var tags = {}
				for(var i in submittedTags){
					if(submittedTags[i].trim() !== ''){
						tags[submittedTags[i].trim().toLowerCase()] = true;
					}
				}
				var curTimeHash = (new Date()).getTime();
				saveItem(time, curTimeHash, content, tags);
				var itemId = time + curTimeHash;
				prependItem(itemId, submittedMonth, submittedDay, content, _.keys(tags));
				// Clear form
				$('#itemAdder-content').val('');
				$('#itemAdder-tags').tagging( "removeAll" );
			}
		});

		$('#main').on('keypress', '#itemAdder-tags .type-zone', function(e){
			console.log('keypress');
			console.log(e);
			var keycode = (e.which) ? e.which : e.keyCode;
			if(keycode === 13){
				$('#itemAdder-form').submit();
			}
		});
	}

	function saveItem(time, curTimeHash, content, tags){
		var newItemObj = {
			body: content,
			timestamp: time,
			tags: tags
		}
		firebase.database().ref('items/' + time + curTimeHash).set(newItemObj);
	}
});
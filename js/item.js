define([
    'jquery',
	'underscore',
	'firebase',
	'text!../../partials/item.html',
	'text!../../partials/itemAdder.html'
], function($, _, firebase, ItemTemplate, ItemAdderTemplate){
	
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

	function loadItems(){
		firebase.database().ref('/items').once('value').then(function(snapshot){
			var jsonItems = snapshot.val();
			var itemKeys = _.keys(jsonItems);
			var newItemTemplate = _.template(ItemTemplate);
			for(var cnt = 0; cnt < itemKeys.length; cnt++){
				var time = new Date(jsonItems[itemKeys[cnt]].timestamp);
				var month = time.getMonth() + 1;
				var day = time.getDate();
				var content = jsonItems[itemKeys[cnt]].body;
				var tags = []
				if(jsonItems[itemKeys[cnt]].tags !== undefined){
					tags = _.keys(jsonItems[itemKeys[cnt]].tags);
				}
				var newItemHtml = newItemTemplate({
					month: month,
					day: day,
					content: content,
					tags: tags
				});
				$('#items').append(newItemHtml);				
			}
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
				initializeItemAdderListener();
			}
		}
	}

	function isNumKey(evt){
		var keycode = (evt.which) ? evt.which : evt.keyCode;
		if(keycode > 31 && !(keycode >= 48 && keycode <= 57)){
			return false;
		}
		return true;
	}

	function isCorrectLength(evt){
		var target = $(evt.target);
		if(target.prop('id') === 'itemAdder-year'){
			return (target.val().length < 4) && (target.val().length >= 0)
		} else if(target.prop('id') === 'itemAdder-month'){
			return (target.val().length < 2) && (target.val().length >= 0)
		} else if(target.prop('id') === 'itemAdder-day'){
			return (target.val().length < 2) && (target.val().length >= 0)
		}
	}

	function verify(evt){
		return isNumKey(evt) && isCorrectLength(evt);
	}

	function initializeItemAdderListener(){
		$('#main').on('keypress','.itemAdder-date', verify);
		$('#main').on('change','input', function(evt){
			$(evt.target).css('border','');
		});
		$('#itemAdder-form').submit(function(e){
			e.preventDefault();
			var submitForm = true;
			
			var submittedYear = parseInt($('#itemAdder-year').val());
			var submittedMonth = parseInt($('#itemAdder-month').val());
			var submittedDay = parseInt($('#itemAdder-day').val());
			var submittedDate = new Date(submittedYear + '/' + submittedMonth + '/' + submittedDay);
			if(isNaN(submittedDate.getTime())){
				submitForm = false;
				$('.itemAdder-date').css('border','solid 2px #f33');
			}
			var submittedContent = $('#itemAdder-content').val().trim();
			if(submittedContent === ''){
				submitForm = false;
			}
			var submittedTags = $('#itemAdder-tags').val().split(',');
			if(submitForm){
				var time = submittedDate.getTime();
				var content = submittedContent;
				var tags = {}
				for(var i in submittedTags){
					if(submittedTags[i].trim() !== ''){
						tags[submittedTags[i].trim()] = true;
					}
				}

				addItem(time, content, tags);
				var newItemTemplate = _.template(ItemTemplate);
				var newItemHtml = newItemTemplate({
					month: submittedMonth,
					day: submittedDay,
					content: content,
					tags: _.keys(tags)
				});
				$('#items').prepend(newItemHtml);
			}
		});
	}

	function addItem(time, content, tags){
		var newItemObj = {
			body: content,
			timestamp: time,
			tags: tags
		}
		firebase.database().ref('items/').push(newItemObj);
	}
});
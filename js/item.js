define([
    'jquery',
	'underscore',
	'firebase',
	'text!../../partials/item.html'
], function($, _, firebase, ItemTemplate){
	
	var config = {
		apiKey: "AIzaSyBZjK-fcZ0Q8SlgWLbnakzymQRt01cjKPE",
		authDomain: "current-ad2ee.firebaseapp.com",
		databaseURL: "https://current-ad2ee.firebaseio.com",
		projectId: "current-ad2ee",
		storageBucket: "",
		messagingSenderId: "1005389711220"
	};
	firebase.initializeApp(config);

	$(document).ready(function(){
		initializeSignInButtonListener();
		loadItems();
	})

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

	function addTestItem(){
		var newItemKey = firebase.database().ref('items/').push().key;
		var newItemObj = {}
		newItemObj = {
			body: "Hello mundo!",
			timestamp: (new Date).getTime()
		}
		newItemObj['tags'] = {
			'test': true,
			'fun': true
		}
		firebase.database().ref('items/').push(newItemObj)
	}

	function loadItems(){
		firebase.database().ref('/items').once('value').then(function(snapshot){
			var jsonItems = snapshot.val();
			var itemKeys = _.keys(jsonItems);
			var newItemTemplate = _.template(ItemTemplate);
			for(var cnt = 0; cnt < itemKeys.length; cnt++){
				var time = new Date(jsonItems[itemKeys[cnt]].timestamp);
				var month = time.getMonth();
				var day = time.getDate() + 1;
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
});
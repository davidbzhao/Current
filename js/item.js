define([
    'jquery',
	'underscore',
	'firebase',
], function($, _, firebase){
	
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
	})

	function initializeSignInButtonListener(){
		$('#signin').click(function(){
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithPopup(provider).then(function(result) {
				addTestItem();
				console.log(readItems());
				console.log('good')
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

	function readItems(){
		firebase.database().ref('/items').once('value').then(function(snapshot){
			var jsonItems = snapshot.val();
			var itemKeys = _.keys(jsonItems);
			for(var cnt = 0; cnt < itemKeys.length; cnt++){
				console.log(jsonItems[itemKeys[cnt]]);
				console.log(jsonItems[itemKeys[cnt]].body);
			}
		});
	}
});
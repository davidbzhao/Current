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
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider);/*.then(function(result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		var user = result.user;
		// ...
		addTestItem();
		console.log('good')
	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...
		console.log('bad')
	});*/

	function addTestItem(){
		var newItemKey = firebase.database().ref('items/').push().key;
		var newItemObj = {}
		newItemObj = {
			body: "Hello world!",
			timestamp: (new Date).getTime()
		}
		newItemObj['tags'] = {
			'test': true,
			'fun': true
		}
		firebase.database().ref('items/').push(newItemObj)
	}
});
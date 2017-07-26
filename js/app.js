require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'libs/jquery-1.11.3.min',
        underscore: 'libs/underscore.min',
        bootstrap: 'libs/bootstrap.min',
        text: 'libs/text',
        firebase: 'https://www.gstatic.com/firebasejs/4.1.5/firebase',
        firebaseAuth: 'https://www.gstatic.com/firebasejs/4.1.5/firebase-auth',
    },
    shim: {
        'firebase': {
            exports: 'firebase',
        },
        'firebaseAuth': {
            exports: 'firebaseAuth',
        }
    }
});

require(['js/item.js'])
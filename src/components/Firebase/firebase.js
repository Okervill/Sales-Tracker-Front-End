import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: "AIzaSyCWUHdp8Qb2kCOl2jGDs8A0dxoxOjijAqU",
    authDomain: "albayan-30531.firebaseapp.com",
    databaseURL: "https://albayan-30531-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "albayan-30531",
    storageBucket: "albayan-30531.appspot.com",
    messagingSenderId: "149881586470",
    appId: "1:149881586470:web:cffc4aef56e0201c97f7e7",
    measurementId: "G-8P598SXEQZ"
};

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
        this.db = app.database();
    }

    // Auth Stuff
    
    // doCreateUserWithEmailAndPassword = (email, password) =>
    //     this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doPasswordReset = (email) => {
        this.auth.sendPasswordResetEmail(email);
    }

    doSignOut = () => this.auth.signOut();

    onAuthUserListener = (next, fallback) =>
        this.auth.onAuthStateChanged(authUser => {
            if (authUser) {
                this.user(authUser.uid)
                    .once('value')
                    .then(snapshot => {
                        const dbUser = snapshot.val();
                        // default empty roles
                        if (!dbUser.roles) {
                            dbUser.roles = {};
                        }

                        // merge auth and db user
                        authUser = {
                            uid: authUser.uid,
                            email: authUser.email,
                            ...dbUser,
                        };

                        next(authUser);
                    });
            } else {
                fallback();
            }
        });

    // User Stuff ERROR HERE
    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref('users');

    store = storeid => this.db.ref(`stores/${storeid}`)
    stores = () => this.db.ref('stores');
}

export default Firebase;
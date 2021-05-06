import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: "AIzaSyAO8cZvdDpI_xrZJ5AN5krSgw1nsvDBFrs",
    authDomain: "vodafone-sales.firebaseapp.com",
    databaseURL: "https://vodafone-sales-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vodafone-sales",
    storageBucket: "vodafone-sales.appspot.com",
    messagingSenderId: "208966010452",
    appId: "1:208966010452:web:029ec03b4fe8c37c038fc1",
    measurementId: "G-M1L93G24VG"
};

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
        this.db = app.database();
    }

    // Auth Stuff
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

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
}

export default Firebase;
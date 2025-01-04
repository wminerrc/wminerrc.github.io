let servicex = angular.module('miningApp');
const firebaseConfig = {
  apiKey: "AIzaSyCUsxA1CfmpvRiJ49evM4CghbEdJPvMHCo",
  authDomain: "wminerrc-70579.firebaseapp.com",
  projectId: "wminerrc-70579",
  storageBucket: "wminerrc-70579.firebasestorage.app",
  messagingSenderId: "71727690888",
  appId: "1:71727690888:web:aceb60286a3789057a1b3d",
  measurementId: "G-FMCB49MDHL"
};
servicex.service('FirebaseService', ['$http', '$q', function($http, $q) {
    const firebaseapp = firebase.initializeApp(firebaseConfig);
    const db = firebaseapp.firestore();

    this.persistUser = async function(usr) {
        const docRef = db.collection("users").doc(usr.avatar_id);
        const queryData = {
            name: usr.name,
            powerData: usr.powerData,
            rooms: usr.roomData.rooms.length,
            queriedAt: new Date().toISOString().split('T')[0]
        }
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
            const existingUserData = docSnapshot.data();
            let searchCount = existingUserData.searchCount ?? 0;
            const updatedQueries = existingUserData.queries || [];
            if(!updatedQueries.find(d => d.queriedAt === queryData.queriedAt)) {
                updatedQueries.push(queryData);
            }   
            await docRef.update({
                name: usr.name,
                searchCount: ++searchCount,
                queries: updatedQueries,
                lastSearchAt: new Date().toISOString().split('T')[0]
            });
        }else {
            const newUserData = {
                name: usr.name,
                searchCount: 1,
                queries: [queryData],
                lastSearchAt: new Date().toISOString().split('T')[0]
            }
            await docRef.set(newUserData);
        }
    };
}]);

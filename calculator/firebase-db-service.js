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

    function timeAgo(fromTime) {
        try{
        let diferenca = (new Date() - (fromTime.toDate())) / 1000;
        let unidades = [
            { limite: 60, singular: "segundo" },
            { limite: 3600, singular: "minuto" },
            { limite: 86400, singular: "hora" },
            { limite: Infinity, singular: "dia" }
        ];
        for (let i = 0; i < unidades.length; i++) {
            let { limite, singular } = unidades[i];
            if (diferenca < limite) 
                return `${Math.floor(diferenca / (limite / 60)) || 1} ${singular}(s) atrás`;
            diferenca /= limite / 60;
        }
        }catch(err) {
            return '';
        }
    }    

    function getDateRange(startDate, endDate) {
        const today = new Date();
        startDate = startDate ? new Date(startDate) : new Date(today.setDate(today.getDate() - 5));
        endDate = endDate ? new Date(endDate) : new Date();
      
        const dateRange = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          dateRange.push(d.toISOString().split("T")[0]);
        }
        return dateRange;
    }

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
            let updatedQueries = existingUserData.queries || [];
            updatedQueries = updatedQueries.filter(q => q.queriedAt !== queryData.queriedAt);
            updatedQueries.push(queryData);
            await docRef.update({
                name: usr.name,
                searchCount: ++searchCount,
                queries: updatedQueries,
                power: usr.powerData,
                lastSearchedAt: new Date()
            });
        }else { 
            const newUserData = {
                name: usr.name,
                searchCount: 1,
                queries: [queryData],
                power: usr.powerData,
                lastSearchedAt: new Date()
            }
            await docRef.set(newUserData);
        }
    };

    this.listUsers = async function() {
        const docs = (await db.collection("users").orderBy('lastSearchedAt', 'desc').limit(5).get()).docs;
        const users = docs.map(u => u.data());
        users.forEach(u => u.timeAgo = timeAgo(u.lastSearchedAt) );
        return users;
    };

    this.getBonusTask = async function() {
        const docRef = db.collection("bonus_task").doc("today");
        const docSnapshot = await docRef.get();
        if(docSnapshot.exists) {
            return docSnapshot.data();
        }
    };

    this.getUserStatistic = async function(usr) {
        const docRef = db.collection("users").doc(usr.avatar_id);
        const docSnapshot = await docRef.get();
        const dateRange = getDateRange();
        if(docSnapshot.exists) {
            const existingUserData = docSnapshot.data();
            let networkData = [];
            let userData = [];
            for(var x in dateRange) {
                let networkPowerAtDay = await db.collection("network_power").doc(dateRange[x]).get();
                if(networkPowerAtDay.exists) {
                    const networkPower = networkPowerAtDay.data();
                    networkPower.queriedAt = dateRange[x];
                    networkData.push(networkPower);
                }
                const userPowerAtDay = existingUserData.queries?.find(q => q.queriedAt === dateRange[x]);
                if(userPowerAtDay) {
                    userData.push(userPowerAtDay);   
                }
            }
            return {user: userData, network: networkData, dateRange: dateRange};
        }
        return {user: [], network: [], dateRange: dateRange};
    }

    this.persistNetworkPower = async function(currencies) {
        const snapshot_idx = new Date().toISOString().split('T')[0]
        const docRef = db.collection("network_power").doc(snapshot_idx);
        const docSnapshot = await docRef.get();
        if (!docSnapshot.exists) {
            await docRef.set({
                currencies: currencies.map(c => ({
                    name: c.name,
                    blockSize: c.blockSize,
                    blockTime: c.blockTime,
                    block_value_in_brl: c.block_value_in_brl,
                    block_value_in_usd: c.block_value_in_usd,
                    disabled_withdraw: c.disabled_withdraw,
                    min_to_withdraw: c.min_to_withdraw,
                    networkPower: c.networkPower
                })),
                totalPower: currencies.map(c => c.networkPower).reduce((acc, num) => acc + num, 0),
                totalBrlValuePerBlock: currencies.map(c => c.block_value_in_brl).reduce((acc, num) => acc + num, 0),
                totalUsdValuePerBlock: currencies.map(c => c.block_value_in_usd).reduce((acc, num) => acc + num, 0)
            });
        }
    };

}]);

let service = angular.module('miningApp');
service.service('UserMinerService', ['$http', '$q', 'FirebaseService', function($http, $q, FirebaseService) {

    const miner_levels = [
        'Common',
        'Uncommon',
        'Rare',
        'Epic',
        'Legendary',
        'Unreal',
    ];

    this.getAllUserDataByNick = async function(nick) {
        try {
            const user = await this.getUserByNick(nick);
            user.powerData = await this.getUserPowerDataById(user.avatar_id);
            user.powerData.total = user.powerData.current_power;
            user.roomData = await this.getUserRoomDataById(user.avatar_id);

            user.roomData.miners.forEach(m => {
                m.level_label = miner_levels[m.level];
                m.simulation_id = btoa(unescape(encodeURIComponent(`${m.name}_${miner_levels[m.level]}`.toLowerCase())));
            });
            user.roomData.racks.forEach(r => {
                r.cells = r.rack_info.width * r.rack_info.height;
            });
            FirebaseService.persistUser(user);
            return user;
        } catch (error) {
            console.error('Error in getAllUserDataByNick:', error);
            throw error;
        }
    };

    this.getUserByNick = async function(nick) {
        try {
            const url = encodeURIComponent(`https://rollercoin.com/api/profile/public-user-profile-data/${nick}`);
            const response = await $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${url}`);
            if (response.status === 200) { 
                const user = response.data;
                if(user.error !== '') {
                    return;
                }
                return user.data;
            } else {
                throw new Error(`Failed to fetch user by nick: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in getUserByNick:', error);
            throw error;
        }
    };

    this.getUserPowerDataById = async function(id) {
        try {
            const url = encodeURIComponent(`https://rollercoin.com/api/profile/user-power-data/${id}`);
            const response = await $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${url}`);
            if (response.status === 200) { 
                return response.data.data;
            } else {
                throw new Error(`Failed to fetch user power data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in getUserPowerDataById:', error);
            throw error;
        }
    };

    this.getUserRoomDataById = async function(id) {
        try {
            const url = encodeURIComponent(`https://rollercoin.com/api/game/room-config/${id}`);
            const response = await $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${url}`);
            if (response.status === 200) { 
                return response.data.data;
            } else {
                throw new Error(`Failed to fetch user room data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in getUserRoomDataById:', error);
            throw error;
        }
    };

}]);

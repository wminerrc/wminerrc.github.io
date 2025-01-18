var app = angular.module('miningApp', ['ui.bootstrap']);

app.controller('MiningController', ['$scope', 'CurrencyService', 'UserMinerService', 'MinerService', 'FirebaseService', '$sce', async function($scope, CurrencyService, UserMinerService, MinerService, FirebaseService, $sce) {
    $scope.units = ['GH/s', 'TH/s', 'PH/s', 'EH/s'];
    $scope.networkUnits = ['GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s'];
    let default_form = {
        currency: null,
        power: 0,
        unit: $scope.units[0],
        networkPower: 0,
        networkUnit: $scope.networkUnits[0],
        blockSize: 0,
        blockTime: 0,
        timeUnit: 'seconds'
    };
    $scope.formData = default_form;
    $scope.isLoading = true;
    $scope.orderByField = 'block_value_in_usd';
    $scope.orderByFarmField = 'user_alocated_power_month_profit_in_usd';
    $scope.orderByMinersField = 'power';
    $scope.orderByRacksField = 'bonus';
    $scope.reverseRacksSort = true;
    $scope.reverseMinersSort = true;
    $scope.reverseSort = true;
    const exchangeRates = await CurrencyService.getCurrenciesPrices();
    $scope.exchangeRates = exchangeRates;

    const filterFn = function(currency) {
        return currency.user_alocated_power && currency.user_alocated_power > 0;
    };
    $scope.filterFn = filterFn;

    function getUrlParamValue(paramName){
        var params = new URL(location).searchParams;
        var keyName = Array.from(params.keys()).find(
            function(key){
                return key.toLowerCase() == paramName.toLowerCase();
            }
        );
        return params.get(keyName);
    }

    function setParamValue(paramName, paramValue){
        if ('URLSearchParams' in window) {
            const url = new URL(window.location)
            if(!paramValue) {
                url.searchParams.delete(paramName)
            }else {
                url.searchParams.set(paramName, paramValue)
            }
            history.pushState(null, '', url);
        }
    }

    $scope.donationValue = 2;
    $scope.donationCurrency = 'U$';
    calculateDonation();

    $scope.collections = [
        {
            id: 1,
            name: "Miners of Infinity",
            miners: [
                "669fd40b8055d6def342d91a",
                "669fcfc58055d6def342d1ab",
                "669fd3b78055d6def342d8bd",
                "669fd1fd8055d6def342d53d",
                "669fd3538055d6def342d81c",
                "669fd35f8055d6def342d865",
                "669fd1788055d6def342d420",
                "669fd0e78055d6def342d31c",
                "669fd08e8055d6def342d2d1",
                "669fd6a88055d6def342da6b",
                "66a112918055d6def3474184",
                "66a112918055d6def347418c"
            ]
        },
        {
            id: 2,
            name: "Roller Football League",
            miners: [
                "6668980bdddadd0605fdaa2e",
                "6668963edddadd0605fda7ac",
                "666896c5dddadd0605fda8bb",
                "6668973cdddadd0605fda94f",
                "66689701dddadd0605fda905",
                "66689684dddadd0605fda7f6",
                "66689843dddadd0605fdaa78",
                "666897d2dddadd0605fda9e4",
                "66689794dddadd0605fda99a",
                "6668991fdddadd0605fdab24",
                "6668991fdddadd0605fdab27",
                "6668991fdddadd0605fdab2d"
            ]
        },
        {
            id: 3,
            name: "Music Festival",
            miners: [
                "661466bcd6c322a6c7c344ba",
                "661466e1d6c322a6c7c34504",
                "661467e8d6c322a6c7c346a7",
                "6614674ad6c322a6c7c3465b",
                "6614672ad6c322a6c7c34612",
                "66146919d6c322a6c7c3488d",
                "661468f7d6c322a6c7c34844",
                "66146703d6c322a6c7c3454d",
                "66146868d6c322a6c7c3476d",
                "66146973d6c322a6c7c348d8"
            ]
        },
        {
            id: 4,
            name: "Interstellar Armada",
            miners: [
                "654a1eb4d23e8edde9341e5f",
                "654a1f91d23e8edde9341eb1",
                "654a21aed23e8edde93420c9",
                "654a223cd23e8edde9342146",
                "654a210cd23e8edde9341fd6",
                "654a2382d23e8edde934216a",
                "654a253ad23e8edde9342353",
                "654a24ced23e8edde934228f",
                "654a22d9d23e8edde9342158",
                "654a1e06d23e8edde9341dfe"
            ]
        },
        {
            id: 5,
            name: "Yatch Club",
            miners: [
                "64c3a0bd31ec0b205c25efd6",
                "64c39ebd31ec0b205c25ec50",
                "64c39e7731ec0b205c25ebcd",
                "64c3a1fa31ec0b205c25f14b",
                "64c39f5b31ec0b205c25ed8b",
                "64c3a05a31ec0b205c25ef44",
                "64c3a15d31ec0b205c25f0f9",
                "64c3a29131ec0b205c25f1dd",
                "64c3a23e31ec0b205c25f18f",
                "64c254c20c6fb1d2237a1391"
            ]
        },
        {
            id: 6,
            name: "Ultimate Blaster",
            miners: [
                "65affbbf43dcad8f6d0f7a52",
                "65aff78243dcad8f6d0f79b6",
                "65affb6d43dcad8f6d0f7a36",
                "65affd6543dcad8f6d0f7acd",
                "65affccf43dcad8f6d0f7a94",
                "65affc7f43dcad8f6d0f7a78",
                "65affb1e43dcad8f6d0f7a1a",
                "65aff67743dcad8f6d0f7962",
                "65affd1843dcad8f6d0f7ab0",
                "65b0f72543dcad8f6d0fa7ff"
            ]
        },
        {
            id: 7,
            name: "Moto Gang Club",
            miners: [
                "644bbdd2648294b4642f3695",
                "644bbece648294b4642f3697",
                "644bbf0a648294b4642f3698",
                "644bbe15648294b4642f3696",
                "644bc010648294b4642f369d",
                "644bbf6f648294b4642f369a",
                "644bbf44648294b4642f3699",
                "644bbfb1648294b4642f369b",
                "644bbfe6648294b4642f369c",
                "644bb5de648294b4642f368f",
                "644bb270648294b4642f368e",
                "644bb225648294b4642f368d",
                "644bb671648294b4642f3690"

            ]
        },
        {
            id: 8,
            name: "Season 14 | Harvest Time!",
            miners: [
                '6687ccfc7643815232d6402d', '6687cd307643815232d64077', '6687cd837643815232d640c1', '6687cdc47643815232d64726', '6687c01a7643815232d60217', '6687bf4f7643815232d5f741', '6687cf557643815232d65d5c', '6687cf817643815232d65da6', '6687cfae7643815232d65def', '6687cfd57643815232d65e39', '6687ce4e7643815232d65297', '6687cea87643815232d65882', '6687ced67643815232d65cc8', '6687cefd7643815232d65d11', '6687bde47643815232d5f0c6', '6687be827643815232d5f3c1'
            ]
        }
    ];

    let loaded_user = getUrlParamValue('user');
    loaded_user = loaded_user || localStorage.getItem('keep_loaded_user');

    let loaded_miners = getUrlParamValue('miners');

    function calculateDonation() {
        if(!isNaN($scope.donationValue) && $scope.donationCurrency) {
            const currency = $scope.donationCurrency === 'U$' ? 'usd' : 'brl';
            $scope.donationInBnb = ($scope.donationValue / exchangeRates['BNB'][currency])
            $scope.donationInMatic = ($scope.donationValue / exchangeRates['MATIC'][currency])
            $scope.donationInEth = ($scope.donationValue / exchangeRates['ETH'][currency])
        }
    }

    $scope.calculateDonation = calculateDonation;

    
    const convertHashrate = (value, fromUnit, toUnit) => {
        const units = {
            'GH/s': 1,
            'TH/s': 1000,
            'PH/s': 1000000,
            'EH/s': 1000000000,
            'ZH/s': 1000000000000
        };
        return value * units[fromUnit] / units[toUnit];
    };

    const calculateEarningsWithValues = function(power_in_ghs, timeframe, coin, fiatCurrency) {

        let earningsPerBlock = coin.blockSize;
        let blockTimeInSeconds = coin.blockTime;

        let userPowerPercentage = power_in_ghs / coin.networkPower;
        earningsPerBlock *= userPowerPercentage;

        let earningsPerDay = earningsPerBlock * (86400 / blockTimeInSeconds); // 86400 seconds in a day
        
        switch(timeframe) {
            case 'block':
                return fiatCurrency === 'amount' ? earningsPerBlock.toFixed(6) : coin.in_game_only ? 0 : (earningsPerBlock * exchangeRates[coin.name][fiatCurrency]).toFixed(2);
            case 'day':
                return fiatCurrency === 'amount' ? earningsPerDay.toFixed(6) : coin.in_game_only ? 0 : (earningsPerDay * exchangeRates[coin.name][fiatCurrency]).toFixed(2);
            case 'week':
                return fiatCurrency === 'amount' ? (earningsPerDay * 7).toFixed(6) : coin.in_game_only ? 0 : (earningsPerDay * 7 * exchangeRates[coin.name][fiatCurrency]).toFixed(2);
            case 'month':
                return fiatCurrency === 'amount' ? (earningsPerDay * 30).toFixed(6) : coin.in_game_only ? 0 : (earningsPerDay * 30 * exchangeRates[coin.name][fiatCurrency]).toFixed(2);
            default:
                return 0;
        }
    };

    const removeFirstMatch = (array, condition) => array.splice(array.findIndex(condition), 1)[0];

    const chooseBestHashRateUnit = (value, fromUnit) => {
        const units = $scope.networkUnits.slice();
        let minusValue = value < 0;
        if(minusValue) {
            value = value * -1;
        }
        do{
             let unit =  units.pop();
             let converted_value = convertHashrate(value, fromUnit, unit);
             if(converted_value > 1) {
                 return {value: converted_value, unit: unit};
             }
        }while(units.length);
        if(minusValue) {
            value = value * -1;
        }
        return {value: value, unit: fromUnit};
     };

     const calculateSingleMinerImpact = function(miner, isRemove) {
        if(isRemove) {
            const removed_bonus = $scope.user_miners.filter(m => !m.removed && m.miner_id === miner.miner_id).length > 1 ? 0 : parseFloat(miner.bonus_power);
            let removed_power = parseFloat(miner.power);
            let power_after_remove = (($scope.user_data.powerData.miners - removed_power + $scope.user_data.powerData.games) * (( $scope.user_data.powerData.bonus_percent - removed_bonus) / 10000)) + ($scope.user_data.powerData.miners - removed_power) + $scope.user_data.powerData.games + $scope.user_data.powerData.racks + $scope.user_data.powerData.temp
            let remove_impact = $scope.user_data.powerData.total - power_after_remove
            return { 
                legend: chooseBestHashRateUnit(remove_impact, 'GH/s'),
                impact: remove_impact
            }   
        }else {
            const added_bonus = $scope.user_miners.filter(m => !m.removed && m.miner_id === miner.miner_id).length == 0 ? parseFloat(miner.bonus_power) : 0;
            let added_power = parseFloat(miner.power);
            let power_after_added = (($scope.user_data.powerData.miners + added_power  + $scope.user_data.powerData.games) * (( $scope.user_data.powerData.bonus_percent + added_bonus) / 10000)) + ($scope.user_data.powerData.miners + added_power) + $scope.user_data.powerData.games + $scope.user_data.powerData.racks + $scope.user_data.powerData.temp
            let add_impact = power_after_added - $scope.user_data.powerData.total 

            return { 
                legend: chooseBestHashRateUnit(add_impact, 'GH/s'),
                impact: add_impact
            } 
        }
    }

    if(typeof loaded_user === 'string' && loaded_user !== '') {
        try{
            $scope.user_data = await UserMinerService.getAllUserDataByNick(loaded_user);
            $scope.user_miners = await MinerService.getAllMinersByFilter(undefined, undefined, undefined, undefined, $scope.user_data.roomData.miners.map(m => m.miner_id), undefined, undefined);
            let miners_locations = $scope.user_data.roomData.miners.slice();

            $scope.user_miners.forEach(m => {
                let userMiner = removeFirstMatch(miners_locations, um => um.miner_id === m.miner_id);
                m.placement = userMiner.placement;
                let impact = calculateSingleMinerImpact(m, true);
                m.removeImpactPower = impact.impact;
                m.removeImpactLegend = impact.legend;
            })
            $scope.visible_user_miners = $scope.user_miners;
            window.basic_miners?.forEach(m => {
                let impact = calculateSingleMinerImpact(m, false);
                m.includeImpactPower = impact.impact;
                m.includeImpactLegend = impact.legend;
            });
            window.merge_miners?.forEach(m => {
                let impact = calculateSingleMinerImpact(m, false);
                m.includeImpactPower = impact.impact;
                m.includeImpactLegend = impact.legend;
            });
            $scope.user_data.all_racks_cells = $scope.user_data.roomData.racks.map(r => r.cells).reduce((a, b) => a + b, 0);
            $scope.user_data.occupied_racks_cells = $scope.user_data.roomData.miners.map(m => m.width).reduce((a, b) => a + b, 0);
            $scope.user_data.all_racks_space = $scope.user_data.roomData.rooms.map(r => (r.room_info.cols / 2) * r.room_info.rows).reduce((a, b) => a + b, 0);
            $scope.user_data.all_racks = $scope.user_data.roomData.racks.length;
            const bestHashRate = chooseBestHashRateUnit($scope.user_data.powerData.total, 'GH/s');
            $scope.formData.power = bestHashRate.value;
            $scope.formData.unit = bestHashRate.unit;
            $scope.formData.showMiners = false;
            $scope.formData.showRacks = false;
            $scope.isLoadedUser = true;
        }catch(err) {
            $scope.playerSearchNoResults = true;
        }
        if(loaded_user !== localStorage.getItem('keep_loaded_user')) {
            localStorage.removeItem('keep_loaded_user');
        }
        $scope.userSearchText = loaded_user; 
    }

    const formatDays = (dias) => {
        if(!dias) {
            return "0 dia";
        }

        if(dias === Number.MAX_SAFE_INTEGER) {
            return "Sem Saque";
        }

        const diasPorAno = 365;
        const diasPorMes = 30;
        
        let anos = Math.floor(dias / diasPorAno);
        let diasRestantes = dias % diasPorAno;
        let meses = Math.floor(diasRestantes / diasPorMes);
        diasRestantes = diasRestantes % diasPorMes;
    
        let resultado = "";
    
        if (anos > 0) {
            resultado += `${anos} ${anos > 1 ? 'anos' : 'ano'}`;
            if (meses > 0 || diasRestantes > 0) {
                resultado += ", ";
            }
        }
    
        if (meses > 0) {
            resultado += `${meses} ${meses > 1 ? 'meses' : 'mês'}`;
            if (diasRestantes > 0) {
                resultado += " e ";
            }
        }
    
        if (diasRestantes > 0) {
            resultado += `${diasRestantes} ${diasRestantes > 1 ? 'dias' : 'dia'}`;
        }
        return resultado;
    }

    const exchangeCoin = (value, coin, currency) => {
        return parseFloat((value * exchangeRates[coin][currency]).toFixed(2));
    };

    const getPercentualPower = function (alocated_power) {
        const user_power_in_ghs = convertHashrate($scope.formData.power, $scope.formData.unit, 'GH/s');
        return alocated_power * (user_power_in_ghs / 100);
    }


    $scope.$watch('formData.power', function(newvalue) {
        if(!$scope.formData.currency && typeof newvalue !== 'undefined') {
            $scope.currencies?.forEach(c => {
                c.user_block_farm_brl =  calculateCoinFarm(newvalue, $scope.formData.unit, c, 'brl');
                c.user_block_farm_usd =  calculateCoinFarm(newvalue, $scope.formData.unit, c, 'usd');
                c.user_block_farm_token =  calculateCoinFarm(newvalue, $scope.formData.unit, c, 'amount');
                c.user_days_to_widthdraw = calculateDaysUntilWithdraw(convertHashrate(newvalue,  $scope.formData.unit, 'GH/s'),c);
                updateAllocatedPower(c);
            });
            if(newvalue > 0) {
                $scope.orderByField = 'user_block_farm_usd';
            }else {
                $scope.orderByField = 'block_value_in_usd';
            }
        }
    });

    $scope.recentUsers = await FirebaseService.listUsers();

    $scope.getMinersByName = async function(name) {
        return await MinerService.getMinersByName(name);
    }

    $scope.getPlayerByName = async function(name) {
        const foundUser = await UserMinerService.getUserByNick(name);
        if(foundUser) {
            return [{...foundUser, code: name}]
        }
        return [];
    }

    $scope.itemsPerPage = 15;
    $scope.currentPage = 1;

    $scope.allMinerMinBonusSearch = 0;
    $scope.allMinerMaxBonusSearch = 100;
    $scope.allMinerMinBonusRange = 0;
    $scope.allMinerMaxBonusRange = 100;
    $scope.allMinersRarity = 'all';
    $scope.allMinerPosessionStatus = 'all';
    $scope.allMinerNegotiableStatus = 'all';
    $scope.allMinerCollectionId = "-1";


    //userMinersFilter
    $scope.userMinersItemsPerPage = 6;
    $scope.userMinersCurrentPage = 1;

    $scope.keepUser = localStorage.getItem('keep_loaded_user') ? true : false;

    $scope.updateKeepUser = async function(keepUser) {
        if(keepUser) {
            localStorage.setItem('keep_loaded_user', $scope.userSearchText);
        }else {
            localStorage.removeItem('keep_loaded_user');
        }
    }

    $scope.filterUserMiners = async function(search, rarity, bonus, negotiable, minMinerPower, maxMinerPower) {
        if($scope.formData.showMiners) {
            let miners_to_show = await MinerService.getAllMinersByFilter(search, rarity, bonus, negotiable, $scope.user_data.roomData.miners.map(m => m.miner_id), minMinerPower, maxMinerPower);
            $scope.visible_user_miners = $scope.user_miners.filter(m => miners_to_show.find(ts => ts.miner_id === m.miner_id));
            $scope.$apply();
        }else {
            $scope.visible_user_miners = [];
        }
    }

    $scope.filterAllMiners = async function(search, rarity, bonus, negotiable, allMinerPosessionStatus, allMinerCollectionId, minMinerPower, maxMinerPower) {
        if($scope.formData.showAllMiners) {
            let ids = [];
            if(allMinerCollectionId && parseInt(allMinerCollectionId) !== -1) {
                ids = $scope.collections.find(c => c.id === parseInt(allMinerCollectionId))?.miners ?? [];
            }
            let foundMiners = await MinerService.getAllMinersByFilter(search, rarity, bonus, negotiable, ids, minMinerPower, maxMinerPower);
            foundMiners.forEach(m => {
                m.already_have = $scope.user_data.roomData.miners.find(mm => mm.miner_id === m.miner_id);
            });
            if(allMinerPosessionStatus === 'mine') {
                foundMiners = foundMiners.filter(m => m.already_have);
            }else if(allMinerPosessionStatus === 'not_mine') {
                foundMiners = foundMiners.filter(m => !m.already_have);
            }
            $scope.allMiners = foundMiners;
            $scope.$apply();
        }else {
            $scope.allMiners = [];
        }
    }

    function calculatePowerData(data) {
        const dateRange = data.dateRange;
        const userData = data.user;
        const networkData = data.network;
    
        const networkPowerByDate = {};
        const userPowerByDate = {};
    
        networkData.forEach(item => networkPowerByDate[item.queriedAt] = item.totalPower);
        userData.forEach(item => userPowerByDate[item.queriedAt] = item.powerData.total);
    
        return dateRange.map((date, i) => {
            const networkPower = networkPowerByDate[date] || 0;
            const userPower = userPowerByDate[date] || 0;
            
            let networkPowerIncrease = 0;
            let userPowerIncrease = 0;
            let networkPowerAbsIncrease = 0;
            let userPowerAbsIncrease = 0;
    
            if (i > 0) {
                const prevDate = dateRange[i - 1];
                const prevNetworkPower = networkPowerByDate[prevDate] || 0;
                const prevUserPower = userPowerByDate[prevDate] || 0;
    
                networkPowerAbsIncrease = networkPower - prevNetworkPower;
                userPowerAbsIncrease = userPower - prevUserPower;
    
                if (prevNetworkPower !== 0) {
                    networkPowerIncrease = ((networkPower - prevNetworkPower) / prevNetworkPower).toFixed(3);
                }
                if (prevUserPower !== 0) {
                    userPowerIncrease = ((userPower - prevUserPower) / prevUserPower).toFixed(3);
                }
            }
    
            const resultItem = {
                date,
                networkPower,
                userPower,
                networkPowerAbsIncrease,
                userPowerAbsIncrease
            };
    
            if (i > 0) {
                resultItem.networkPowerIncrease = networkPowerIncrease;
                resultItem.userPowerIncrease = userPowerIncrease;
            }
    
            return resultItem;
        });
    }

    $scope.dailyBonus = await FirebaseService.getBonusTask();
    
    $scope.showStatistics = async function() {
        if($scope.formData.showUserStatistics) {
            $scope.statistics = await FirebaseService.getUserStatistic($scope.user_data);
            $scope.statistics = calculatePowerData($scope.statistics);
            const labels = $scope.statistics.map(s => s.date);
            const networkGrowth = $scope.statistics.map(s => s.networkPower);
            const playerGrowth = $scope.statistics.map(s => s.userPower);
            const chart = echarts.init(document.getElementById('chart'));

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                    },
                },
                formatter: function (params) {
                    if(Array.isArray(params)) {
                        const day = $scope.statistics.find(s => s.date === params[0]?.name);
                        const networkPower = chooseBestHashRateUnit(day?.networkPower ?? 0, 'GH/s');
                        const networkLabel = `${networkPower.value.toFixed(2)} ${networkPower.unit}`
                        const networkPowerIncrease = chooseBestHashRateUnit(day?.networkPowerAbsIncrease ?? 0, 'GH/s');
                        const networkPowerIncreaseLabel = `${networkPowerIncrease.value.toFixed(2)} ${networkPowerIncrease.unit}`
                        const userPower = chooseBestHashRateUnit(day?.userPower ?? 0, 'GH/s');
                        const userPowerIncrease = chooseBestHashRateUnit(day?.userPowerAbsIncrease ?? 0, 'GH/s');
                        const userPowerIncreaseLabel = `${userPowerIncrease.value.toFixed(2)} ${userPowerIncrease.unit}`
                        const userPowerLabel = `${userPower.value.toFixed(2)} ${userPower.unit}`
                        return `Poder da rede: ${networkLabel}
                                <br>Seu poder: ${userPowerLabel}
                                <br>A rede subiu ${networkPowerIncreaseLabel} (${day.networkPowerIncrease} %)
                                <br>Você subiu ${userPowerIncreaseLabel} (${day.userPowerIncrease} %)
                                `;
                    }
                    return params;
                },
                legend: {
                    data: ['Crescimento da Rede', 'Seu Crescimento como Jogador'],
                    top: '0%',
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    data: labels,
                    axisLabel: {
                        fontSize: 12,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#333',
                        },
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        fontSize: 12,
                        formatter: function (value) {
                            const power = chooseBestHashRateUnit(value, 'GH/s');
                            return `${power.value.toFixed(2)} ${power.unit}`
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#333',
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                        },
                    },
                },
                series: [
                    {
                        name: 'Crescimento da Rede',
                        data: networkGrowth,
                        type: 'line',
                        smooth: true, // Linha suave
                        color: '#1E90FF', // Azul
                        lineStyle: {
                            width: 3,
                        },
                        symbol: 'circle',
                        symbolSize: 8,
                    },
                    {
                        name: 'Seu Crescimento como Jogador',
                        data: playerGrowth,
                        type: 'line',
                        smooth: true, // Linha suave
                        color: '#FF6347', // Vermelho
                        lineStyle: {
                            width: 3,
                        },
                        symbol: 'circle',
                        symbolSize: 8,
                    },
                ],
            };

            // Exibe o gráfico
            chart.setOption(option);



            $scope.$apply();
        }else {
            $scope.allMiners = [];
        }
    }

    $scope.onSelect = async function($item) {
        $scope.isLoading = true;
        $scope.detailed_miners = await MinerService.getDetailedMiner($item);
        $scope.chosen_mine = $item.name.en;
        $scope.isLoading = false;
        $scope.$apply();
    }

    $scope.onSelectPlayer = async function($item) {
        let  new_url = window.location.pathname+"?user=" + $item.code;
        if(loaded_miners) {
            new_url+= '&miners=' + loaded_miners;
        }
        window.location.href = new_url;
    }

    $scope.reloadWithoutUser = async function() {
        localStorage.removeItem('keep_loaded_user');
        window.location.href = window.location.pathname;
    }

    $scope.openBuyLink = async function(item) {
        if(!localStorage.getItem('alreadyDonatedMessage')) {
            localStorage.setItem('alreadyDonatedMessage', 'true');
            if(confirm('Te ajudei a tomar essa decisão de compra? Considere fazer uma contribuição para manter o desenvolvimento desse projeto')) {
                window.scrollTo(0, document.body.scrollHeight);
                return;
            }
        }
        window.open(`https://rollercoin.com/marketplace/buy/miner/${item.miner_id}`,'_blank');
    }

    $scope.openSellLink = async function(item) {
        if(!localStorage.getItem('alreadyDonatedMessage')) {
            localStorage.setItem('alreadyDonatedMessage', 'true');
            if(confirm('Te ajudei a tomar essa decisão de venda? Considere fazer uma contribuição para manter o desenvolvimento desse projeto')) {
                window.scrollTo(0, document.body.scrollHeight);
                return;
            }
        }
        window.open(`https://rollercoin.com/marketplace/sell/miner/${item.miner_id}`,'_blank');
    }

    $scope.openBuyCraftLink = async function(id, type) {
        if(!localStorage.getItem('alreadyDonatedMessage')) {
            localStorage.setItem('alreadyDonatedMessage', 'true');
            if(confirm('Te ajudei a tomar essa decisão de compra? Considere fazer uma contribuição para manter o desenvolvimento desse projeto')) {
                window.scrollTo(0, document.body.scrollHeight);
                return;
            }
        }
        window.open(`https://rollercoin.com/marketplace/buy/${type}/${id}`,'_blank');
    }

    $scope.addMinerToSimulation = async function($item) {
        $scope.customMiners = $scope.customMiners || [];
        $scope.customMiners.push({...$item, rdid: uuidv4()});
        $scope.recalculateUserPower();
    }

    $scope.removeMinerFromSimulation = async function($item) {
        $scope.customMiners = $scope.customMiners.filter(m => m.rdid !== $item.rdid);
        $scope.recalculateUserPower();
    }

    $scope.removeUserMinerSimulation = async function($item) {
        $item.removed = true;
        $scope.recalculateUserPower();
    }

    $scope.revertRemoveUserMinerSimulation = async function($item) {
        $item.removed = false;
        $scope.recalculateUserPower();
    }

    const calcPercentIncrease = (a, b) => b === 0 ? Infinity : ((a - b) / b) * 100;

    const calculateUserPower = function(increasedMinerPower, increasedMinerBonus) {
        const new_miners_power = $scope.user_data.powerData.miners + increasedMinerPower;
        const new_miners_bonus = $scope.user_data.powerData.bonus_percent + increasedMinerBonus;
        return $scope.user_data.powerData.games + new_miners_power + $scope.user_data.powerData.racks + $scope.user_data.powerData.temp + ( (new_miners_power + $scope.user_data.powerData.games) *  new_miners_bonus / 10000);
    }

    $scope.recalculateUserPower = async function() {
        $scope.customMiners = $scope.customMiners || [];
        if($scope.customMiners.length === 0 && !$scope.user_miners.find(m => m.removed)) {
            $scope.user_data.newPowerData = undefined;
            const bestHashRate = chooseBestHashRateUnit($scope.user_data.powerData.total, 'GH/s');
            $scope.formData.power = bestHashRate.value;
            $scope.formData.unit = bestHashRate.unit;
            $scope.user_data.occupied_racks_cells = $scope.user_data.roomData.miners.map(m => m.width).reduce((a, b) => a + b, 0);
            return;
        }
        let removedMinersForBonusCalc = $scope.user_miners.filter(m => m.removed && !$scope.user_miners.find(om => om.miner_id === m.miner_id && !om.removed));
        removedMinersForBonusCalc = getUniqueListBy(removedMinersForBonusCalc, 'miner_id');
        let customMinersForBonusCalc = $scope.customMiners.filter(m => !$scope.user_data.roomData.miners.find(rm => m.miner_id === rm.miner_id));
        customMinersForBonusCalc = getUniqueListBy(customMinersForBonusCalc, 'miner_id');
        const new_bonus = customMinersForBonusCalc.map(m => parseFloat(m.bonus_power)).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        const removed_bonus = removedMinersForBonusCalc.map(m => parseFloat(m.bonus_power)).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        let removed_power = $scope.user_miners.filter(m => m.removed).map(m => parseFloat(m.power)).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        let new_power = $scope.customMiners.map(m => parseFloat(m.power)).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        let new_miners_power = $scope.user_data.powerData.miners + new_power - removed_power
        let new_miners_bonus = (new_bonus + $scope.user_data.powerData.bonus_percent - removed_bonus) / 10000
        let new_bonus_power = (new_miners_power + $scope.user_data.powerData.games) * new_miners_bonus
        $scope.user_data.newPowerData = {
            bonus_percent : new_bonus + $scope.user_data.powerData.bonus_percent - removed_bonus,
            new_bonus_percent : new_bonus - removed_bonus,
            new_power : new_power - removed_power,
            miners: new_miners_power,
            total: new_bonus_power + new_miners_power  + $scope.user_data.powerData.games + $scope.user_data.powerData.racks + $scope.user_data.powerData.temp
        };
        let new_deoccupied_cells = $scope.user_miners.filter(m => m.removed).map(m => m.width).reduce((a, b) => a + b, 0);
        let new_occupied_cells = $scope.customMiners.map(m => m.width).reduce((a, b) => a + b, 0);
        $scope.user_data.occupied_racks_cells = $scope.user_data.roomData.miners.map(m => m.width).reduce((a, b) => a + b, 0) + new_occupied_cells - new_deoccupied_cells;
        $scope.user_data.newPowerData.new_total = $scope.user_data.newPowerData.total - $scope.user_data.powerData.total;
        $scope.user_data.newPowerData.new_total_percent = calcPercentIncrease($scope.user_data.newPowerData.total, $scope.user_data.powerData.total);
        const bestHashRate = chooseBestHashRateUnit($scope.user_data.newPowerData.total, 'GH/s');
        $scope.formData.power = bestHashRate.value;
        $scope.formData.unit = bestHashRate.unit;
    }

    if(typeof loaded_miners === 'string' && loaded_miners !== '') {
        const all_miners = await MinerService.getAllMinersByFilter(); 
        const miners_ids = loaded_miners.split(',');
        const load_these = miners_ids.map(id => all_miners.find(m => m.miner_id === id));
        $scope.customMiners = [];
        load_these.forEach(m =>  $scope.customMiners.push({...m, rdid: uuidv4()}));
        if(loaded_user) {
            $scope.recalculateUserPower();
        }
    }

    $scope.getPercentualPower = getPercentualPower;
    $scope.chooseBestHashRateUnit = chooseBestHashRateUnit;
    $scope.formatDays = formatDays;

    const convertTime = (value, fromUnit, toUnit) => {
  
        if (fromUnit === 'minutes' && toUnit === 'seconds') {
            return value * 60;
        } else if (fromUnit === 'seconds' && toUnit === 'minutes') {
            return value / 60;
        } else {
            return value;
        }
    };
      
    function getUniqueListBy(arr, key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }
    
    function uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
          (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
      }

    $scope.hasAnyAllocatedPower = function() {
        return $scope.currencies?.find(c => c.user_alocated_power > 0);
    };

    const getCurrenciesSum = function(attr) {
        return $scope.currencies?.filter(filterFn).map(c => c?.[attr] || 0).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    }

    $scope.getCurrenciesSum = getCurrenciesSum;

    $scope.currencies = await CurrencyService.getDetailedCurrencies();
    $scope.currencies?.forEach(c => {
        c.block_value_in_brl = c.in_game_only ? 0 : exchangeCoin(c.blockSize, c.name, 'brl');
        c.block_value_in_usd = c.in_game_only ? 0 : exchangeCoin(c.blockSize, c.name, 'usd');
        c.user_block_farm_brl = 0;
        c.user_block_farm_usd = 0;
        c.user_block_farm_token = 0;
        c.user_days_to_widthdraw = c.disabled_withdraw ? Number.MAX_SAFE_INTEGER : 0;
        const param_allocation = getUrlParamValue(c.name.toLowerCase());
        if(param_allocation && !isNaN(param_allocation)) {
            c.user_alocated_power = parseInt(param_allocation);
            updateAllocatedPower(c);
        }
    });
    $scope.isLoading = false;

    $scope.$apply();

    $scope.updateNetworkPowerUnit = function(oldUnit) {
        $scope.formData.networkPower = convertHashrate($scope.formData.networkPower, oldUnit, $scope.formData.networkUnit);
    };

    $scope.closeModal = async function() {
        const confettiSound = document.getElementById('confettiSound');
        const jsConfetti = new JSConfetti()
        setTimeout(async function() {
            jsConfetti.addConfetti({ confettiNumber: 300});
            await sleep(50);
            confettiSound.play();
        }, 3000);
        setTimeout(async function() {
            while(true) {
                await sleep(1000);
                jsConfetti.addConfetti({ confettiNumber: getRandomInt(10,300)});
            }
        }, 4000);
        const overlay = document.getElementById('overlay');
        overlay.style.display = 'none';
        $scope.$apply();    
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);    // Arredonda para cima para garantir que não seja menor que o mínimo
        max = Math.floor(max);   // Arredonda para baixo para garantir que não seja maior que o máximo
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

    $scope.updatePowerUnit = function(oldUnit) {
        $scope.formData.power = convertHashrate($scope.formData.power, oldUnit, $scope.formData.unit);
    };

    $scope.updateTimeUnit = function(oldUnit) {
        $scope.formData.blockTime = convertTime($scope.formData.blockTime, oldUnit, $scope.formData.timeUnit);
    };

    $scope.resetValues = function() {
        if(confirm("Isso irá recarregar todos os valores de poder de rede e cotação e demorará algum tempo. Tem certeza?")) {
            localStorage.clear();
            location.reload();  
        }
    }

    $scope.updateCurrencyDetails = function() {
        const selectedCurrency = $scope.formData.currency;
        if (selectedCurrency) {
            const bestHashRate = chooseBestHashRateUnit(selectedCurrency.networkPower, selectedCurrency.networkUnit);
            $scope.formData.networkPower = bestHashRate.value;
            $scope.formData.networkUnit = bestHashRate.unit;
            $scope.formData.blockSize = selectedCurrency.blockSize;
            $scope.formData.blockTime = selectedCurrency.blockTime;
            $scope.formData.timeUnit = 'seconds';
        }else {
            $scope.formData.networkPower = 0;
            $scope.formData.networkUnit = $scope.networkUnits[0];
            $scope.formData.blockSize = 0;
            $scope.formData.blockTime = 0;
            $scope.formData.timeUnit = 'seconds';
        }
    };

    function calculateCoinFarm(power, unit, coin, currency) {
        let userPowerPercentage = convertHashrate(power, unit, 'GH/s') / convertHashrate(coin.networkPower, coin.networkUnit,'GH/s');
        let earningsPerBlock = coin.blockSize;
        earningsPerBlock *= userPowerPercentage;
        return currency === 'amount' ? earningsPerBlock.toFixed(6) : coin.in_game_only ? 0 : (earningsPerBlock * exchangeRates[coin.name][currency]).toFixed(2);
    };

    function calculateDaysUntilWithdraw(power_in_ghs, coin) {
        if(coin.disabled_withdraw) {
            return Number.MAX_SAFE_INTEGER;
        }
        if(!power_in_ghs) {
            return 0;
        }
        let earningsPerBlock = coin.blockSize;
        let blockTimeInSeconds = coin.blockTime;
        let minToWithdraw = coin.min_to_withdraw;
        let userPowerPercentage = power_in_ghs / coin.networkPower;
        earningsPerBlock *= userPowerPercentage;
        let earningsPerDay = earningsPerBlock * (86400 / blockTimeInSeconds); // 86400 seconds in a day
        return Math.ceil(minToWithdraw / earningsPerDay);
    };

    function updateAllocatedPower(currency) {
        const user_alocated_power = parseFloat(currency.user_alocated_power);
        if(!isNaN(user_alocated_power)) {
            const percentual_user_alocated_power = getPercentualPower(user_alocated_power);
            currency.user_alocated_power_value = percentual_user_alocated_power;
            currency.user_alocated_power_day_profit_in_usd = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'day', currency, 'usd'));
            currency.user_alocated_power_day_profit_in_brl = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'day', currency, 'brl'));
            currency.user_alocated_power_day_profit_in_cripto = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'day', currency, 'amount'));
            currency.user_alocated_power_week_profit_in_usd = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'week', currency, 'usd'));
            currency.user_alocated_power_week_profit_in_brl = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'week', currency, 'brl'));
            currency.user_alocated_power_week_profit_in_cripto = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'week', currency, 'amount'));
            currency.user_alocated_power_month_profit_in_usd = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'month', currency, 'usd'));
            currency.user_alocated_power_month_profit_in_brl = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'month', currency, 'brl'));
            currency.user_alocated_power_month_profit_in_cripto = parseFloat(calculateEarningsWithValues(percentual_user_alocated_power, 'month', currency, 'amount'));
            setParamValue(currency.name.toLowerCase(), user_alocated_power);
        }else {
            setParamValue(currency.name.toLowerCase());
        }
    };

    async function donate(network) {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const web3 = new Web3(window.ethereum);
                    const chainId = network === 'BSC' ? '0x38' : '0x89';
                    const donation = network === 'BSC' ? $scope.donationInBnb.toFixed(18) : $scope.donationInMatic.toFixed(18)
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: chainId }],
                    });
                    const toAddress = '0x57721770F5Ea06B79ECe6996D653BAC413667Fa2';
                    const amountInWei = web3.utils.toWei(''+donation, 'ether');
                    const accounts = await web3.eth.getAccounts();
                    const fromAddress = accounts[0];
                    const transactionParameters = {
                        to: toAddress,
                        from: fromAddress,
                        value: web3.utils.toHex(amountInWei)
                    };
                    await window.ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [transactionParameters],
                    });
                    alert('Doação enviada com sucesso!');
                } catch (error) {
                    console.error('Erro ao enviar a doação:', error);
                    alert('Erro ao enviar a doação. Por favor, tente novamente.');
                }
            } else {
                alert('MetaMask não está instalada. Por favor, instale a MetaMask e tente novamente.');
            }
    }

    $scope.donate = donate;
    
    $scope.updateAllocatedPower = updateAllocatedPower;



    $scope.calculateEarningsWithValues = calculateEarningsWithValues;

    $scope.calculateAllCoins = async function() {
        $scope.currencies?.forEach(c => {
            c.user_alocated_power = 100
            updateAllocatedPower(c);
        });
        await sleep(500);
        document.getElementById('bestCoinTable').scrollIntoView();
    }

    $scope.bestBuys = async function() {
        $scope.formData.showAllMiners = true;
        $scope.allMinerNegotiableStatus = 'negotiable';
        $scope.allMinerPosessionStatus = 'not_mine';
        $scope.orderByAllMinersField='supply';
        $scope.reverseAllMinersSort = true;
        $scope.allMinerMinBonusSearch = 2;
        $scope.filterAllMiners($scope.allMinerNameSearch, $scope.allMinersRarity, {min:$scope.allMinerMinBonusSearch, max:$scope.allMinerMaxBonusSearch}, $scope.allMinerNegotiableStatus, $scope.allMinerPosessionStatus, $scope.allMinerCollectionId, $scope.allMinerMinPowerSearch, $scope.allMinerMaxPowerSearch)
        $scope.$apply();
    }

    $scope.resetAlocatedPower = function() {
        $scope.currencies?.forEach(c => {
            c.user_alocated_power = 0
            updateAllocatedPower(c);
        });
    }

    const ordinalNum = num => ['primeira', 'segunda', 'terceira', 'quarta', 'quinta', 'sexta', 'sétima', 'oitava', 'nona', 'décima'][num - 1];
    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    $scope.getMinerLocation = function(miner) {
        const miner_rack = $scope.user_data.roomData.racks.find(r => r._id === miner.placement.user_rack_id);
        const room_location = miner_rack.placement.room_level+1;
        const rack_row =  miner_rack.placement.y + 1;
        const rack_column =  miner_rack.placement.x + 1;
        return $sce.trustAsHtml(`${capitalize(ordinalNum(room_location))} sala<br>${ordinalNum(rack_row)} fileira<br>${ordinalNum(rack_column)} rack`);
    }


    $scope.calculateEarnings = function(timeframe, currency) {
        if (!$scope.formData.currency || !$scope.formData.blockSize || !$scope.formData.blockTime) {
            return 0;
        }
        
        let earningsPerBlock = $scope.formData.blockSize;
        let blockTimeInSeconds = $scope.formData.blockTime;

        if ($scope.formData.timeUnit === 'minutes') {
            blockTimeInSeconds *= 60;
        }

        let userPowerPercentage = convertHashrate($scope.formData.power, $scope.formData.unit, 'GH/s') / convertHashrate($scope.formData.networkPower, $scope.formData.networkUnit,'GH/s');
        earningsPerBlock *= userPowerPercentage;

        let earningsPerDay = earningsPerBlock * (86400 / blockTimeInSeconds); // 86400 seconds in a day
        
        switch(timeframe) {
            case 'block':
                return currency === 'amount' ? earningsPerBlock.toFixed(6) : $scope.formData.currency.in_game_only ? 0 : (earningsPerBlock * exchangeRates[$scope.formData.currency.name][currency]).toFixed(2);
            case 'day':
                return currency === 'amount' ? earningsPerDay.toFixed(6) : $scope.formData.currency.in_game_only ? 0 : (earningsPerDay * exchangeRates[$scope.formData.currency.name][currency]).toFixed(2);
            case 'week':
                return currency === 'amount' ? (earningsPerDay * 7).toFixed(6) : $scope.formData.currency.in_game_only ? 0 : (earningsPerDay * 7 * exchangeRates[$scope.formData.currency.name][currency]).toFixed(2);
            case 'month':
                return currency === 'amount' ? (earningsPerDay * 30).toFixed(6) : $scope.formData.currency.in_game_only ? 0 : (earningsPerDay * 30 * exchangeRates[$scope.formData.currency.name][currency]).toFixed(2);
            default:
                return 0;
        }
    };
}]);

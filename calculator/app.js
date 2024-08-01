var app = angular.module('miningApp', ['ui.bootstrap']);

app.controller('MiningController', ['$scope', 'CurrencyService', 'UserMinerService', 'MinerService', async function($scope, CurrencyService, UserMinerService, MinerService) {
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

    let loaded_user = getUrlParamValue('user');

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


    const chooseBestHashRateUnit = (value, fromUnit) => {
        const units = $scope.networkUnits.slice();
        do{
             let unit =  units.pop();
             let converted_value = convertHashrate(value, fromUnit, unit);
             if(converted_value > 1) {
                 return {value: converted_value, unit: unit};
             }
        }while(units.length);
        return {value: value, unit: fromUnit};
     };

    if(typeof loaded_user === 'string' && loaded_user !== '') {
        try{
            $scope.user_data = await UserMinerService.getAllUserDataByNick(loaded_user);     
            const bestHashRate = chooseBestHashRateUnit($scope.user_data.powerData.total, 'GH/s');
            $scope.formData.power = bestHashRate.value;
            $scope.formData.unit = bestHashRate.unit;
            $scope.formData.showMiners = false;
            $scope.formData.showRacks = false;
            $scope.isLoadedUser = true;
        }catch(err) {
            $scope.playerSearchNoResults = true;
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

    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;

    $scope.allMinerMinBonusSearch = 0;
    $scope.allMinerMaxBonusSearch = 100;
    $scope.allMinerMinBonusRange = 0;
    $scope.allMinerMaxBonusRange = 100;
    $scope.allMinersRarity = 'all';
    $scope.allMinerPosessionStatus = 'all';
    $scope.allMinerNegotiableStatus = 'all';

    $scope.filterAllMiners = async function(search, rarity, bonus, negotiable, allMinerPosessionStatus) {
        if($scope.formData.showAllMiners) {
            let foundMiners = await MinerService.getAllMinersByFilter(search, rarity, bonus, negotiable);
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

    $scope.addMinerToSimulation = async function($item) {
        $scope.customMiners = $scope.customMiners || [];
        $scope.customMiners.push({...$item, rdid: uuidv4()});
        $scope.recalculateUserPower();
    }

    $scope.removeMinerFromSimulation = async function($item) {
        $scope.customMiners = $scope.customMiners.filter(m => m.rdid !== $item.rdid);
        $scope.recalculateUserPower();
    }

    $scope.recalculateUserPower = async function() {
        if($scope.customMiners.length === 0) {
            $scope.user_data.newPowerData = undefined;
            const bestHashRate = chooseBestHashRateUnit($scope.user_data.powerData.total, 'GH/s');
            $scope.formData.power = bestHashRate.value;
            $scope.formData.unit = bestHashRate.unit;
            return;
        }
        let customMinersForBonusCalc = $scope.customMiners.filter(m => !$scope.user_data.roomData.miners.find(rm => m.miner_id === rm.miner_id));
        customMinersForBonusCalc = getUniqueListBy(customMinersForBonusCalc, 'miner_id');
        const new_bonus = customMinersForBonusCalc.map(m => parseFloat(m.bonus_power)).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        let new_power = $scope.customMiners.map(m => parseFloat(m.power)).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        $scope.user_data.newPowerData = {
            bonus_percent : new_bonus + $scope.user_data.powerData.bonus_percent,
            miners: $scope.user_data.powerData.miners + new_power,
            total: (($scope.user_data.powerData.miners + new_power) * ((new_bonus + $scope.user_data.powerData.bonus_percent) / 10000)) + $scope.user_data.powerData.miners + $scope.user_data.powerData.games + $scope.user_data.powerData.racks + $scope.user_data.powerData.temp
        };
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

    $scope.resetAlocatedPower = function() {
        $scope.currencies?.forEach(c => {
            c.user_alocated_power = 0
            updateAllocatedPower(c);
        });
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

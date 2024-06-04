var app = angular.module('miningApp', []);
app.controller('MiningController', ['$scope', 'CurrencyService', async function($scope, CurrencyService) {
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
    $scope.reverseSort = true;
    const exchangeRates = await CurrencyService.getCurrenciesPrices();
    $scope.exchangeRates = exchangeRates;

    const filterFn = function(currency) {
        return currency.user_alocated_power && currency.user_alocated_power > 0;
    };
    $scope.filterFn = filterFn;


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

    const exchangeCoin = (value, coin, currency) => {
        return parseFloat((value * exchangeRates[coin][currency]).toFixed(2));
    };

    const getPercentualPower = function (alocated_power) {
        const user_power_in_ghs = convertHashrate($scope.formData.power, $scope.formData.unit, 'GH/s');
        return alocated_power * (user_power_in_ghs / 100);
    }


    $scope.$watch('formData.power', function(newvalue) {
        if(!$scope.formData.currency && typeof newvalue !== 'undefined') {
            $scope.currencies.forEach(c => {
                c.user_block_farm_brl =  calculateCoinFarm(newvalue, $scope.formData.unit, c, 'brl');
                c.user_block_farm_usd =  calculateCoinFarm(newvalue, $scope.formData.unit, c, 'usd');
                c.user_block_farm_token =  calculateCoinFarm(newvalue, $scope.formData.unit, c, 'amount');
                updateAllocatedPower(c);
            });
            if(newvalue > 0) {
                $scope.orderByField = 'user_block_farm_usd';
            }else {
                $scope.orderByField = 'block_value_in_usd';
            }
        }
    });

    $scope.getPercentualPower = getPercentualPower;
    $scope.chooseBestHashRateUnit = chooseBestHashRateUnit;

    const convertTime = (value, fromUnit, toUnit) => {
  
        if (fromUnit === 'minutes' && toUnit === 'seconds') {
            return value * 60;
        } else if (fromUnit === 'seconds' && toUnit === 'minutes') {
            return value / 60;
        } else {
            return value;
        }
    };

    const getCurrenciesSum = function(attr) {
        return $scope.currencies.filter(filterFn).map(c => c[attr] || 0).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    }

    $scope.getCurrenciesSum = getCurrenciesSum;

    $scope.currencies = await CurrencyService.getDetailedCurrencies();
    $scope.currencies.forEach(c => {
        c.block_value_in_brl = c.in_game_only ? 0 : exchangeCoin(c.blockSize, c.name, 'brl');
        c.block_value_in_usd = c.in_game_only ? 0 : exchangeCoin(c.blockSize, c.name, 'usd');
        c.user_block_farm_brl = 0;
        c.user_block_farm_usd = 0;
        c.user_block_farm_token = 0;
    });
    $scope.isLoading = false;
    $scope.$apply();

    $scope.updateNetworkPowerUnit = function(oldUnit) {
        $scope.formData.networkPower = convertHashrate($scope.formData.networkPower, oldUnit, $scope.formData.networkUnit);
    };

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

    const updateAllocatedPower =  function(currency) {
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
        }
    };

    
    $scope.updateAllocatedPower = updateAllocatedPower;

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

    $scope.calculateEarningsWithValues = calculateEarningsWithValues;

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

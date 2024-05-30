angular.module('miningApp', [])
.controller('MiningController', ['$scope', 'CurrencyService', async function($scope, CurrencyService) {
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
    const exchangeRates = await CurrencyService.getCurrenciesPrices();
    $scope.exchangeRates = exchangeRates;

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

    const convertTime = (value, fromUnit, toUnit) => {
  
        if (fromUnit === 'minutes' && toUnit === 'seconds') {
            return value * 60;
        } else if (fromUnit === 'seconds' && toUnit === 'minutes') {
            return value / 60;
        } else {
            return value;
        }
    };

    $scope.currencies = await CurrencyService.getDetailedCurrencies();
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
        localStorage.clear();
        location.reload();
    }

    $scope.updateCurrencyDetails = function() {
        const selectedCurrency = $scope.formData.currency;
        if (selectedCurrency) {
            $scope.formData.networkPower = selectedCurrency.networkPower;
            $scope.formData.networkUnit = selectedCurrency.networkUnit;
            $scope.formData.blockSize = selectedCurrency.blockSize;
            $scope.formData.blockTime = selectedCurrency.blockTime;
            $scope.formData.timeUnit = 'seconds';
        }else {
            $scope.formData.power = 0;
            $scope.formData.unit = $scope.units[0];
            $scope.formData.networkPower = 0;
            $scope.formData.networkUnit = $scope.networkUnits[0];
            $scope.formData.blockSize = 0;
            $scope.formData.blockTime = 0;
            $scope.formData.timeUnit = 'seconds';
        }
    };

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

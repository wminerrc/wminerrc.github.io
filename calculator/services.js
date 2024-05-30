angular.module('miningApp')
.service('CurrencyService', ['$http', '$q', function($http, $q) {

    const current_date = new Date().toISOString().split('T')[0];

    var delay = function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const cacheValidityDuration = 24 * 60 * 60 * 1000;

    const getCache = (cacheKey) => {
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_exp`);
        if (cacheTimestamp) {
            const now = new Date().getTime();
            const age = now - cacheTimestamp;
            if (age < cacheValidityDuration) {
                return JSON.parse(localStorage.getItem(cacheKey));
            }
        }
        return null;
    };

    const setCache = (data, cacheKey) => {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_exp`, new Date().getTime().toString());
    };

    
    var getCurrenciesPrices = async function() {
        const cache_key = 'exchange_history';
        var cached = getCache(cache_key);
        if(cached) return cached;
        const currencies =
            [
                {
                    name: 'MATIC', coingecko_id : 'matic-network'
                },
                {
                    name: 'BNB', coingecko_id : 'binancecoin'
                },
                {
                    name: 'LTC', coingecko_id : 'litecoin'
                },
                {
                    name: 'SOL', coingecko_id : 'solana'
                },
                {
                    name: 'ETH', coingecko_id : 'ethereum'
                },
                {
                    name: 'TRX', coingecko_id : 'tron'
                },
                {
                    name: 'BTC', coingecko_id : 'bitcoin'
                },
                {
                    name: 'DOGE', coingecko_id : 'dogecoin'
                }
            ];

        return $http.get(`https://api.coingecko.com/api/v3/simple/price?ids=${currencies.map(c => c.coingecko_id).join()}&vs_currencies=usd,brl`).then(response => {
            if (response.status === 200) { 
                var result = response.data;
                currencies.forEach(c => {
                    delete Object.assign(result, {[c.name]: result[c.coingecko_id] })[c.coingecko_id];
                })
                setCache(result, cache_key);
                return result;
            }
        });
    };

    var getCurrencies = function() {
        return $http.get(`https://rollercoin.free.mockoapp.net/get?url=${encodeURIComponent('https://rollercoin.com/api/wallet/get-currencies-config')}`).then(response => {
            if (response.status === 200) { 
                const result = JSON.parse(response.data.contents);
                return result.data.currencies_config.filter(c => c.is_can_be_mined).map(c => ({
                    name: c.name,
                    in_game_only: c.network === '' || c.network === 'Rollertoken',
                    balance_key: c.balance_key,
                    to_small: c.to_small,
                    divider: c.divider,
                    image: `https://rollercoin.com/static/img/icon/currencies/${c.img}.svg?v=1.0`
                }));
            }
        });
    };

    var getBlockSizeByCurrency = async function(currency) {
        const search = `https://rollercoin.com/api/mining/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=block_reward`;
        return $http.get(`https://rollercoin.free.mockoapp.net/get?url=${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = JSON.parse(response.data.contents);
                return result.data[0].value;
            }
        });
    };

    var getNetworkPowerByCurrency = async function(currency) {
        const search = `https://rollercoin.com/api/mining/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=total_power`;
        return $http.get(`https://rollercoin.free.mockoapp.net/get?url=${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = JSON.parse(response.data.contents);
                return result.data[0].value;
            }
        });
    };

    var getBlockTimeByCurrency = async function(currency) {
        const search = `https://rollercoin.com/api/mining/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=duration`;
        return $http.get(`https://rollercoin.free.mockoapp.net/get?url=${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = JSON.parse(response.data.contents);
                return result.data[0].value;
            }
        });
    };
    
    this.getCurrencies = getCurrencies;
    this.getCurrenciesPrices = getCurrenciesPrices;

    this.getDetailedCurrencies = async function() {
        const cache_key = 'rc_network_data';
        var cached = getCache(cache_key);
        if(cached) return cached;
        const currencies = await getCurrencies();
        const detailedCurrencies = [];
        for (const currency of currencies) {
            var blockSize = await getBlockSizeByCurrency(currency.balance_key);
            await delay(1500);
            var networkPower = await getNetworkPowerByCurrency(currency.balance_key);
            await delay(1500);
            var blockTime = await getBlockTimeByCurrency(currency.balance_key);
            await delay(1500);
            currency.blockSize = (blockSize/currency.divider) / currency.to_small;
            currency.networkPower = networkPower;
            currency.blockTime = blockTime;
            currency.networkUnit = 'GH/s';
            detailedCurrencies.push(currency);
        }
        setCache(detailedCurrencies, cache_key);
        return detailedCurrencies;
    };

}]);

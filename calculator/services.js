const service_app = angular.module('miningApp');

service_app.factory('retryInterceptor', function($q, $injector, $timeout) {
    const retryLimit = 15;
    const retryDelay = 1000;

    return {
        responseError: function(response) {
            const config = response.config;
            if(!config) {
                return $q.reject(response);
            }

            if (!config.retryCount) {
                config.retryCount = 0;
            }

            if (config.retryCount < retryLimit) {
                config.retryCount++;
                const $http = $injector.get('$http');
                return $timeout(function() {
                    return $http(config);
                }, retryDelay);
            }

            return $q.reject(response);
        }
    };
  });

  service_app.factory('cacheInterceptor', function($q, $injector) {
    const cacheKeyPrefix = 'http_cache_';
    const cacheDuration = 24 * 60 * 60 * 1000; // 1 dia em milissegundos

    function getCacheKey(url) {
      return cacheKeyPrefix + SparkMD5.hash(url);
    }

    function isCacheValid(cacheEntry) {
      if (!cacheEntry) return false;
      const currentTime = new Date().getTime();
      return currentTime - cacheEntry.timestamp < cacheDuration;
    }

    return {
      request: function(config) {
        const cacheKey = getCacheKey(config.url);
        const cachedResponse = JSON.parse(localStorage.getItem(cacheKey));

        if (isCacheValid(cachedResponse)) {
          config.status = 200;
          config.config = config;
          config.data = cachedResponse.data;
          cached = true;
          return $q.resolve(config);
        }
        
        return config;
      },
      response: function(response) {
        const cacheKey = getCacheKey(response.config.url);
        const cacheEntry = {
          data: response.data,
          timestamp: new Date().getTime()
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

        return response;
      }
    };
  });


    service_app.config(function($httpProvider) {
        $httpProvider.interceptors.push('cacheInterceptor');
        $httpProvider.interceptors.push('retryInterceptor');
    });

service_app.service('CurrencyService', ['$http', '$q', 'FirebaseService', function($http, $q, FirebaseService) {

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

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await $http.get(url);
                if (response.status === 200) {
                    const result = JSON.parse(response.data.contents);
                    return result.data[0].value;
                } else {
                    throw new Error(`HTTP status ${response.status}`);
                }
            } catch (error) {
                if (i === retries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    this.getLeagues = function() {
        return [
            {
                "id": "68af01ce48490927df92d687",
                "name": "Bronze I" 
            },
            {
                "id": "68af01ce48490927df92d686",
                "name": "Bronze II" 
            },
            {
                "id": "68af01ce48490927df92d685",
                "name": "Bronze III" 
            },
            {
                "id": "68af01ce48490927df92d684",
                "name": "Silver I" 
            },
            {
                "id": "68af01ce48490927df92d683",
                "name": "Silver II" 
            },
            {
                "id": "68af01ce48490927df92d682",
                "name": "Silver III" 
            },
            {
                "id": "68af01ce48490927df92d681",
                "name": "Gold I" 
            },
            {
                "id": "68af01ce48490927df92d680",
                "name": "Gold II" 
            },
            {
                "id": "68af01ce48490927df92d67f",
                "name": "Gold III" 
            },
            {
                "id": "68af01ce48490927df92d67e",
                "name": "Platinum I" 
            },
            {
                "id": "68af01ce48490927df92d67d",
                "name": "Platinum II" 
            },
            {
                "id": "68af01ce48490927df92d67c",
                "name": "Platinum III" 
            },
            {
                "id": "68af01ce48490927df92d67b",
                "name": "Diamond I" 
            },
            {
                "id": "68af01ce48490927df92d67a",
                "name": "Diamond II" 
            },
            {
                "id": "68af01ce48490927df92d679",
                "name": "Diamond III" 
            }
        ];
    }

    
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
                },
                {
                    name: 'XRP', coingecko_id : 'ripple'
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
        return $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${encodeURIComponent('https://rollercoin.com/api/wallet/get-currencies-config')}`).then(response => {
            if (response.status === 200) { 
                const result = response.data;
                return result.data.currencies_config.filter(c => c.is_can_be_mined).map(c => ({
                    name: c.name,
                    in_game_only: c.network === '' || c.network === 'Rollertoken',
                    balance_key: c.balance_key,
                    to_small: c.to_small,
                    divider: c.divider,
                    disabled_withdraw: c.disabled_withdraw,
                    min_to_withdraw: c.min,
                    image: `https://rollercoin.com/static/img/icon/currencies/${c.img}.svg?v=1.0`
                }));
            }
        });
    };

    var getBlockSizeByCurrency = async function(currency) {
        const search = `https://rollercoin.com/api/mining/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=block_reward`;
        return $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = response.data;
                return result.data[0]?.value ?? 0;
            }
        });
    };

    var getBlockSizeByCurrencyAndLeague = async function(currency, leagueId) {
        const search = `https://rollercoin.com/api/league/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=block_reward&leagueId=${leagueId}`;
        return $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = response.data;
                return result.data[0]?.value ?? 0;
            }
        });
    };

    var getNetworkPowerByCurrency = async function(currency) {
        const search = `https://rollercoin.com/api/mining/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=total_power`;
        return $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = response.data;
                return result.data[0]?.value ?? 0;
            }
        });
    };

    var getNetworkPowerByCurrencyAndLeague = async function(currency, leagueId) {
        const search = `https://rollercoin.com/api/league/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=total_power&leagueId=${leagueId}`;
        return $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = response.data;
                return result.data[0]?.value ?? 0;
            }
        });
    }; 

    var getBlockTimeByCurrency = async function(currency) {
        const search = `https://rollercoin.com/api/mining/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=duration`;
        return $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = response.data;
                return result.data[0]?.value ?? 0;
            }
        });
    };

    var getBlockTimeByCurrencyAndLeague = async function(currency, leagueId) {
        const search = `https://rollercoin.com/api/league/network-info-by-day?from=${current_date}&to=${current_date}&currency=${currency}&groupBy=duration&leagueId=${leagueId}`;
        return $http.get(`https://morning-thunder-0ce3.wminerrc.workers.dev/?${encodeURIComponent(search)}`).then(response => {
            if (response.status === 200) { 
                const result = response.data;
                return result.data[0]?.value ?? 0;
            }
        });
    };
    
    this.getCurrencies = getCurrencies;
    this.getCurrenciesPrices = getCurrenciesPrices;

    this.getDetailedCurrenciesByLeague = async function(league) {
        const cache_key = `rc_network_data_${league}`;
        var cached = getCache(cache_key);
        if(cached) return cached;
        const currencies = await getCurrencies();
        const detailedCurrencies = [];
        for (const currency of currencies) {
            var blockSize = await getBlockSizeByCurrencyAndLeague(currency.balance_key, league);
            var networkPower = await getNetworkPowerByCurrencyAndLeague(currency.balance_key, league);
            var blockTime = await getBlockTimeByCurrencyAndLeague(currency.balance_key, league);
            currency.blockSize = (blockSize/currency.divider) / currency.to_small;
            currency.networkPower = networkPower;
            currency.blockTime = blockTime;
            currency.networkUnit = 'GH/s';
            detailedCurrencies.push(currency);
        }
        setCache(detailedCurrencies, cache_key);
        FirebaseService.persistNetworkPower(detailedCurrencies);
        return detailedCurrencies;
    };

    this.getDetailedCurrencies = async function() {
        const cache_key = 'rc_network_data';
        var cached = getCache(cache_key);
        if(cached) return cached;
        const currencies = await getCurrencies();
        const detailedCurrencies = [];
        for (const currency of currencies) {
            var blockSize = await getBlockSizeByCurrencyAndLeague(currency.balance_key, '68af01ce48490927df92d67b');
            var networkPower = await getNetworkPowerByCurrencyAndLeague(currency.balance_key, '68af01ce48490927df92d67b');
            var blockTime = await getBlockTimeByCurrencyAndLeague(currency.balance_key, '68af01ce48490927df92d67b');
            currency.blockSize = (blockSize/currency.divider) / currency.to_small;
            currency.networkPower = networkPower;
            currency.blockTime = blockTime;
            currency.networkUnit = 'GH/s';
            detailedCurrencies.push(currency);
        }
        setCache(detailedCurrencies, cache_key);
        FirebaseService.persistNetworkPower(detailedCurrencies);
        return detailedCurrencies;
    };

}]);

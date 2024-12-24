let servicez = angular.module('miningApp');
servicez.service('MinerService', ['$http', '$q', function($http, $q) {
    const basic_miners = window.basic_miners;
    const merge_miners = window.merge_miners;
    const old_merge_miners = window.old_merge_miners;
    merge_miners.forEach(m => m.old_craft_items =  old_merge_miners.find(om => om.miner_id === m.miner_id)?.craft_items )
    basic_miners.forEach(m => m.recipe_cost = 0);
    basic_miners.forEach(m => m.old_recipe_cost = 0);
    merge_miners.forEach(m => m.recipe_cost = m.craft_items.filter(i => i.component_type === 'mutation_components').map(r => window.components.find(c => c.id === r._id).avg_price * r.count ));
    merge_miners.forEach(m => m.recipe_cost = parseFloat((m.recipe_cost / 1000000).toFixed(2)));
    merge_miners.forEach(m => m.old_recipe_cost = m.old_craft_items?.filter(i => i.component_type === 'mutation_components').map(r => window.components.find(c => c.id === r._id).avg_price * r.count ));
    merge_miners.forEach(m => m.old_recipe_cost = parseFloat((m.old_recipe_cost / 1000000).toFixed(2)));
    merge_miners.forEach(m => m.recipe_cost = m.recipe_cost || 0);
    merge_miners.forEach(m => m.old_recipe_cost = m.old_recipe_cost || 0);
    const calculateDiscount = (oldPrice, currentPrice) => ((oldPrice - currentPrice) / oldPrice * 100).toFixed(2);
    merge_miners.forEach(m => m.craft_cost_diff = calculateDiscount(m.old_recipe_cost, m.recipe_cost))
    merge_miners.forEach(m => m.craft_cost_diff = isNaN(m.craft_cost_diff) ? 0 : m.craft_cost_diff);
    basic_miners.forEach(m => m.craft_cost_diff = 0)
    this.getMinersByName = async function(name) {
        return JSON.parse(JSON.stringify(basic_miners)).filter(m => m.name.en.toLowerCase().includes(name.toLowerCase()));
    };

    this.getDetailedMiner = async function(miner) {
        return [JSON.parse(JSON.stringify(miner))].concat(JSON.parse(JSON.stringify(merge_miners)).filter(m => m.filename === miner.filename).sort((a,b) => a.level - b.level));
    };

    this.getAllMinersByFilter = async function(name, rarity, bonus, negotiable, ids, minMinerPower, maxMinerPower) {
        let miners = JSON.parse(JSON.stringify(basic_miners)).concat(JSON.parse(JSON.stringify(merge_miners)));

        if(typeof name === 'string' && name !== '') {
            if(miners.find(m => m.name.en.toLowerCase() === name.toLowerCase())) {
                miners = miners.filter(m => m.name.en.toLowerCase() === name.toLowerCase());
            }else {
                miners =  miners.filter(m => m.name.en.toLowerCase().includes(name.toLowerCase()))
            }
        }

        if(typeof rarity === 'string' && rarity !== 'all') {
            switch(rarity) {
                case 'legacy':
                    miners = miners.filter(m => m.type === 'old_merge');
                    break;
                case 'common':
                    miners = miners.filter(m => m.level === 0);
                    break;
                case 'uncommon':
                    miners = miners.filter(m => m.level === 1);
                    break;
                case 'rare':
                    miners = miners.filter(m => m.level === 2);
                    break;
                case 'epic':
                    miners = miners.filter(m => m.level === 3);
                    break;
                case 'legendary':
                    miners = miners.filter(m => m.level === 4);
                    break;
                case 'unreal':
                    miners = miners.filter(m => m.level === 5);
                    break;
            }
        }

        if(typeof bonus === 'object' && bonus.min >= 0 && bonus.max <= 100) {
            miners = miners.filter(m => m.bonus_power >= (bonus.min * 100) && m.bonus_power <= (bonus.max * 100) );
        }

        if(typeof negotiable === 'string') {
            switch(negotiable) {
                case 'inegotiable':
                    miners = miners.filter(m => !m.is_can_be_sold_on_mp);
                    break;
                case 'negotiable':
                    miners = miners.filter(m => m.is_can_be_sold_on_mp);
                    break;
            }
            
        }
        if(!isNaN(minMinerPower) && parseInt(minMinerPower) > 0) {
            miners = miners.filter(m => m.power >= parseInt(minMinerPower))
        }
        if(!isNaN(maxMinerPower) && parseInt(maxMinerPower) > 0) {
            miners = miners.filter(m => m.power <= parseInt(maxMinerPower))
        }
        if(ids?.length) {
            miners = miners.filter(m => ids.includes(m.miner_id));
        }
        return miners
            .sort((a,b) =>  a.name.en.toLowerCase() - b.name.en.toLowerCase()  || a.level - b.level );
    };

}]);

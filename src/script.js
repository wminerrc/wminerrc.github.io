import Mustache from "node_modules/mustache"
import html2canvas from 'html2canvas';
import event from 'data/event.json';

function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } else {
        window.open(uri);
    }
}

const template = `
    <div id="rewards_div">
    <table class="rewards">
        <thead>
            <tr>
                <th id="banner" onclick="window.open('https://www.youtube.com/@wminer', '_blank')" colspan="6" style="
                    height: 50px;
                    position: -webkit-sticky;
                    position: sticky;
                    width: auto;
                    top: 0;
                    z-index: 999;
                    background-color: #ef4e4e;
                    font-size: 40px;
                    text-align: center;
                ">INSCREVA-SE NO CANAL<i class="fa fa-youtube-play" style="font-size: 48px;color: white;float: right;"></i></th>
            </tr>
            <tr id="export_rewards" class="export">
                <th colspan="6" style="text-align: right;">Save as image <i class="fa fa-floppy-o" aria-hidden="true"></i></th>
            </tr>
            <tr>
                <th colspan="6" style="text-align: center;">{{eventName}}</th>
            </tr>
            <tr>
                <th style="text-align: center;">LVL</th>
                <th style="text-align: center;">TOTAL</th>
                <th style="text-align: center;">XP</th>
                <th style="text-align: center;">Reward</th>
                <th style="text-align: center;">Image</th>
                <th style="text-align: center;"><i class="fa fa-shopping-cart" aria-hidden="true"></i></th>
            </tr>
        </thead>
        <tbody>
            {{#rewards}}
                <tr>
                    <td style="text-align: center;">{{level}}</td>
                    <td style="text-align: center;">{{total}}</td>
                    <td style="text-align: center;">{{xp}}</td>
                    <td>{{label}}</td>
                    <td style="text-align: center; display: flex; position: relative;">
                    {{#image_lvl_content}}
                        <img src='{{image_lvl_content}}' style='left: 2px;position: absolute;top: 25px;'/>
                    {{/image_lvl_content}}
                    <img src='{{image_content}}' width="80px" height="auto"/>
                    </td>
                    {{#can_be_sold}}
                        <td style="text-align: center;"><i class="fa fa-check" aria-hidden="true"></i></td>
                    {{/can_be_sold}}
                    {{^can_be_sold}}
                        <td style="text-align: center;"><i class="fa fa-times" aria-hidden="true"></i></td>
                    {{/can_be_sold}}
                </tr>
            {{/rewards}}
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL MINERS</td>
                    <td colspan="2" style="text-align: center;">{{summary.total_miners}}</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL BONUS</td>
                    <td colspan="2" style="text-align: center;">{{summary.total_bonus}}%</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL POWER</td>
                    <td colspan="2" style="text-align: center;">{{summary.total_power}} ghs</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL RACKS</td>
                    <td colspan="2" style="text-align: center;">{{{summary.total_racks}}}</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL RLT</td>
                    <td colspan="2" style="text-align: center;">{{summary.total_rlt}}</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL RST</td>
                    <td colspan="2" style="text-align: center;">{{summary.total_rst}}</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL BATTERIES</td>
                    <td colspan="2" style="text-align: center;">{{summary.total_batteries}}</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;">TOTAL XP</td>
                    <td colspan="2" style="text-align: center;">{{summary.total_xp}}</td>
                </tr>
        </tbody>
    </table>
    </div>

    <div id="merge_div">
    <table class="rewards">
            <thead>
                <tr id="export_merge" class="export">
                    <th colspan="12" style="text-align: right;">Save as image <i class="fa fa-floppy-o" aria-hidden="true"></i></th>
                </tr>
                <tr>
                    <th colspan="12" style="text-align: center;">Merges</th>
                </tr>
                <tr>
                    <th style="text-align: center;">Reward</th>
                    <th style="text-align: center;">Image</th>
                    <th style="text-align: center;"><i style="color: rgb(43, 214, 0);" class="fa fa-wrench" aria-hidden="true"> II</i></th>
                    <th style="text-align: center;"><i style="color: rgb(3, 225, 228);" class="fa fa-wrench" aria-hidden="true"> III</i></th>
                    <th style="text-align: center;"><i style="color: rgb(255, 47, 209);" class="fa fa-wrench" aria-hidden="true"> IV</i></th>
                    <th style="text-align: center;"><i style="color: rgb(255, 220, 0);" class="fa fa-wrench" aria-hidden="true"> V</i></th>
                    <th style="text-align: center;"><i style="color: rgb(235, 0, 0);;" class="fa fa-wrench" aria-hidden="true"> VI</i></th>
                </tr>
            </thead>
            
            <tbody>
                {{#mergeTable}}
                        <tr>
                            <td>{{label}}</td>
                            <td style="text-align: center; position: relative;">
                                <img src='{{image_content}}' width="80px" height="auto"/>
                            </td>
                            {{#merge_recipes}}
                            <td>
                                <img src="images/basic_miner.svg" width="16" height="16"> {{tot_miners}}<br/>
                                <img src="images/{{level}}/fan.png" width="16" height="16"> {{tot_fan}}<br/>
                                <img src="images/{{level}}/wire.png" width="16" height="16"> {{tot_wire}}<br/>
                                <img src="images/{{level}}/hash.png" width="16" height="16"> {{tot_hash}}<br/>
                                <img src="images/rlt.svg" width="16" height="16"> {{rlt_price}}<br/>
                                <img src="images/bonus.svg" width="16" height="16"/><span style="color:#276e6f;font-weight:bold"> {{new_bonus}}%</span><br/>
                                <img src="images/power.svg" width="16" height="16"/> {{new_power}} Ghs
                            </td>
                            {{/merge_recipes}}
                            {{^merge_recipes.length}}
                                <td colspan="5" style="text-align: center;">No merge available</td>
                            {{/merge_recipes.length}}
                        </tr>
                {{/mergeTable}}
            </tbody>
    </table>
    </div>
    

    <div id="mktplace_div">
    <table class="rewards">
            <thead>
                <tr id="export_mktplace" class="export">
                    <th colspan="5" style="text-align: right;">Save as image <i class="fa fa-floppy-o" aria-hidden="true"></i></th>
                </tr>
                <tr>
                    <th colspan="5" style="text-align: center;">Investment table (Marketplace)</th>
                </tr>
                <tr>
                    <th style="text-align: center;"><i class="fa fa-usd" aria-hidden="true"></i></th>
                    <th style="text-align: center;">BALANCE ({{bestDiscount}}% OFF)</th>
                    <th style="text-align: center;">MULTIPLIER</th>
                    <th style="text-align: center;">TRADE <i class="fa fa-money" aria-hidden="true"></i> <i class="fa fa-exchange" aria-hidden="true"></i> <i class="fa fa-money" aria-hidden="true"></i></th>
                    <th style="text-align: center;">FEE <i class="fa fa-university" aria-hidden="true"></i></th>
                </tr>
            </thead>
            <tbody>
                {{#spendTable}}
                    {{#mkt_table}}
                        <tr>
                            <td style="text-align: center;">\${{spend.price_to_pay_in_dols}}</td>
                            <td style="text-align: center;">{{converted_rlt}} rlt</td>
                            <td style="text-align: center;">{{spend.tot_multiplier}}x</td>
                            <td style="text-align: center;">{{spend.rlt_to_spend}} rlt</td>
                            <td style="text-align: center;">{{spend.fee}} rlt</td>
                        </tr>
                    {{/mkt_table}}
                {{/spendTable}}
            </tbody>
    </table>
    </div>

    <div id="lootbox_div">
    <table class="rewards">
        <thead>
            <tr id="export_loot" class="export">
                <th colspan="21" style="text-align: right;">Save as image <i class="fa fa-floppy-o" aria-hidden="true"></i></th>
            </tr>
            <tr>
                <th colspan="21" style="text-align: center;">Investment table (Lootbox)</th>
            </tr>
            <tr>
                <th rowspan="2" style="text-align: center;"><i class="fa fa-usd" aria-hidden="true"></th>
                <th rowspan="2" style="text-align: center;">BALANCE ({{bestDiscount}}% OFF)</th>
                <th rowspan="2" style="text-align: center;">MULTIPLIER</th>
                <th class="lootbox-3" colspan="3" style="text-align: center;">BOX 3 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
                <th class="lootbox-5" colspan="3" style="text-align: center;">BOX 5 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
                <th class="lootbox-12" colspan="3" style="text-align: center;">BOX 12 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
                <th class="lootbox-30" colspan="3" style="text-align: center;">BOX 30 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
                <th class="lootbox-70" colspan="3" style="text-align: center;">BOX 70 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
                <th class="lootbox-120" colspan="3" style="text-align: center;">BOX 120 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
            </tr>
            <tr>
                <th class="lootbox-3" style="text-align: center;">UNITS</th>
                <th class="lootbox-3" style="text-align: center;">MAX LOSS</th>
                <th class="lootbox-3" style="text-align: center;">AVG LOSS</th>
                <th class="lootbox-5" style="text-align: center;">UNITS</th>
                <th class="lootbox-5" style="text-align: center;">MAX LOSS</th>
                <th class="lootbox-5" style="text-align: center;">AVG LOSS</th>
                <th class="lootbox-12" style="text-align: center;">UNITS</th>
                <th class="lootbox-12" style="text-align: center;">MAX LOSS</th>
                <th class="lootbox-12" style="text-align: center;">AVG LOSS</th>
                <th class="lootbox-30" style="text-align: center;">UNITS</th>
                <th class="lootbox-30" style="text-align: center;">MAX LOSS</th>
                <th class="lootbox-30" style="text-align: center;">AVG LOSS</th>
                <th class="lootbox-70" style="text-align: center;">UNITS</th>
                <th class="lootbox-70" style="text-align: center;">MAX LOSS</th>
                <th class="lootbox-70" style="text-align: center;">AVG LOSS</th>
                <th class="lootbox-120" style="text-align: center;">UNITS</th>
                <th class="lootbox-120" style="text-align: center;">MAX LOSS</th>
                <th class="lootbox-120" style="text-align: center;">AVG LOSS</th>
            <tr/>
        </thead>
        <tbody>
            {{#spendTable}}
                {{#loot_table}}
                    <tr>
                        <td style="text-align: center;">\${{spend.price_to_pay_in_dols}}</td>
                        <td style="text-align: center;">{{converted_rlt}} rlt</td>
                        <td style="text-align: center;">{{spend.tot_multiplier}}x</td>
                        {{#spend.per_box}}
                            <td class="lootbox-{{box}}" style="text-align: center;">{{count}} boxes</td>
                            <td class="lootbox-{{box}}" style="text-align: center;">{{max_rlt_to_lose}} rlt</td>
                            <td class="lootbox-{{box}}" style="text-align: center;">{{avg_rlt_to_lose}} rlt</td>
                        {{/spend.per_box}}
                    </tr>
                {{/loot_table}}
            {{/spendTable}}
        </tbody>
    </table>
    </div>
    <div id="balao">
        <span class="fechar" onclick="document.getElementById('balao').style.display = 'none';">X</span>
        <p>{{bestDiscount}}% de desconto! Preencha o nosso form.</p>
        <p>Ajude o canal e ainda participe de sorteios insanos!</p>
        <a href="https://forms.gle/y1q2cH3t1Lq88Yix7" target="_blank">Acessar o form</a>
    </div>
`

var output = Mustache.render(template, event);

window.onload = () => { 
    
    document.getElementById('content').innerHTML = output;

    document.getElementById("export_rewards").addEventListener("click", function() {
        html2canvas(document.getElementById("rewards_div"), {
            allowTaint: true,
            useCORS: true,
            backgroundColor: null
        }).then(function(canvas) {
            saveAs(canvas.toDataURL(), event.eventName.replace(/ /g,'').toLowerCase() + '-reward-table.png');
        });
    });
    
    document.getElementById("export_merge").addEventListener("click", function() {
        html2canvas(document.getElementById("merge_div"), {
            allowTaint: true,
            useCORS: true,
            backgroundColor: null
        }).then(function(canvas) {
            saveAs(canvas.toDataURL(), event.eventName.replace(/ /g,'').toLowerCase() + '-merge-table.png');
        });
    });

    document.getElementById("export_mktplace").addEventListener("click", function() {
        html2canvas(document.getElementById("mktplace_div"), {
            allowTaint: true,
            useCORS: true,
            backgroundColor: null
        }).then(function(canvas) {
            saveAs(canvas.toDataURL(), event.eventName.replace(/ /g,'').toLowerCase() + '-mkt-table.png');
        });
    });

    document.getElementById("export_loot").addEventListener("click", function() {
        html2canvas(document.getElementById("lootbox_div"), {
            allowTaint: true,
            useCORS: true,
            backgroundColor: null
        }).then(function(canvas) {
            saveAs(canvas.toDataURL(), event.eventName.replace(/ /g,'').toLowerCase() + '-loot-table.png');
        });
    });

    setTimeout(function() {
        balao.style.display = "block";
      }, 2000);
    

    
}



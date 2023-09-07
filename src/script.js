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

    <div id="mktplace_div">
    <table class="rewards">
            <thead>
                <tr id="export_mktplace" class="export">
                    <th colspan="4" style="text-align: right;">Save as image <i class="fa fa-floppy-o" aria-hidden="true"></i></th>
                </tr>
                <tr>
                    <th colspan="4" style="text-align: center;">Investment table (Marketplace)</th>
                </tr>
                <tr>
                    <th style="text-align: center;"><i class="fa fa-usd" aria-hidden="true"></i></th>
                    <th style="text-align: center;">BALANCE ({{bestDiscount}}% OFF)</th>
                    <th style="text-align: center;">TRADE <i class="fa fa-money" aria-hidden="true"></i> <i class="fa fa-exchange" aria-hidden="true"></i> <i class="fa fa-money" aria-hidden="true"></i></th>
                    <th style="text-align: center;">FEE <i class="fa fa-university" aria-hidden="true"></i></th>
                </tr>
            </thead>
            <tbody>
                {{#spendTable}}
                    {{#mkt_table}}
                        <tr>
                            <td style="text-align: center;">\${{investment}},00</td>
                            <td style="text-align: center;">{{converted_rlt}} rlt</td>
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
                <th colspan="11" style="text-align: right;">Save as image <i class="fa fa-floppy-o" aria-hidden="true"></i></th>
            </tr>
            <tr>
                <th colspan="11" style="text-align: center;">Investment table (Lootbox)</th>
            </tr>
            <tr>
                <th rowspan="2" style="text-align: center;"><i class="fa fa-usd" aria-hidden="true"></th>
                <th rowspan="2" style="text-align: center;">BALANCE ({{bestDiscount}}% OFF)</th>
                <th colspan="3" style="text-align: center;">BOX 5 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
                <th colspan="3" style="text-align: center;">BOX 10 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
                <th colspan="3" style="text-align: center;">BOX 25 <i class="fa fa-dropbox" aria-hidden="true"></i></th>
            </tr>
            <tr>
                <th style="text-align: center;">UNITS</th>
                <th style="text-align: center;">MAX LOSS</th>
                <th style="text-align: center;">AVG LOSS</th>
                <th style="text-align: center;">UNITS</th>
                <th style="text-align: center;">MAX LOSS</th>
                <th style="text-align: center;">AVG LOSS</th>
                <th style="text-align: center;">UNITS</th>
                <th style="text-align: center;">MAX LOSS</th>
                <th style="text-align: center;">AVG LOSS</th>
            <tr/>
        </thead>
        <tbody>
            {{#spendTable}}
                {{#loot_table}}
                    <tr>
                        <td style="text-align: center;">\${{investment}},00</td>
                        <td style="text-align: center;">{{converted_rlt}} rlt</td>
                        {{#spend.per_box}}
                            <td style="text-align: center;">{{count}} boxes</td>
                            <td style="text-align: center;">{{max_rlt_to_lose}} rlt</td>
                            <td style="text-align: center;">{{avg_rlt_to_lose}} rlt</td>
                        {{/spend.per_box}}
                    </tr>
                {{/loot_table}}
            {{/spendTable}}
        </tbody>
    </table>
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
    

    
}



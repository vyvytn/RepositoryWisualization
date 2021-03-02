import PackChart from './modules/PackChart.js'
import ChordChart from "./modules/ChordChart.js";
import NetworkChart from "./modules/NetworkChart.js";
import testNetwork from "./modules/testNetwork.js";

let packChart = new PackChart("./public/libraryItems.json");
let chordChart = new ChordChart();
let network = new NetworkChart();
let test=new testNetwork();


visualize()

function visualize() {
    init();
    btnCLickFunctions();
}

function init() {
    drawPack();
    drawChord();
    showPack();
}

function drawChord() {
    chordChart.drawChart();
    // test.draw();
}

function drawPack() {
    packChart.drawChart();
}

function drawNetwork() {
    // network.drawChart();
    test.draw();
}

function showPack() {
    $("#chordContainer").hide();
    $("#networkContainer").hide();
    $("#packChartContainer").show();
}

function showChord() {
    $("#packChartContainer").hide();
    $("#networkContainer").hide();
    $("#chordContainer").show();
}

function showNetwork() {
    $("#packChartContainer").hide();
    $("#chordContainer").hide();
    $("#networkContainer").show();
}

function btnCLickFunctions() {
   /* $(document).ready(function () {
        $('#collapseMenu').click(function () {
            showChord()
        });
    });*/
    $('selectMenu').on('change', function() {
        alert( this.value );
    });
    $(document).ready(function () {
        $('#returnBtn').click(function () {
            showPack()
        });
    });
    $(document).ready(function () {
        $('#resetBtn').click(function () {
            showPack()
        });
    });
    /*$(document).on( "some:event", function(evt,someData) {
        console.log('DATA')
    } );
*/
}

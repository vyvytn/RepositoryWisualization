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
    $("#packContainer").show();
}

function showChord() {
/*    var btn= document.getElementById('resetBtn')
    btn.innerHTML='return to home'*/
    let areaName= $('#selectMenu option').filter(':selected').val()
    addNavRoute(areaName);
    $("#packContainer").hide();
    $("#networkContainer").hide();
    $("#chordContainer").show();
}
function addNavRoute(areaName){
    let navBar = document.getElementById('navBar');
    if (navBar.childElementCount>1)navBar.removeChild(navBar.lastChild);
    let newNav = document.createElement('li');
    newNav.className = 'breadcrumb-item active';
    newNav.setAttribute = ('aria-current', 'page');
    newNav.innerHTML = areaName;
    navBar.appendChild(newNav);
}
function showNetwork() {
    $("#packContainer").hide();
    $("#chordContainer").hide();
    $("#networkContainer").show();
}

function btnCLickFunctions() {
    $('#selectMenu').on('change', function() {
        showChord()
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

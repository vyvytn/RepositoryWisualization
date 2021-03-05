import PackChart from './modules/PackChart.js'
import ChordChart from "./modules/ChordChart.js";
import NetworkChart from "./modules/NetworkChart.js";

let packChart = new PackChart("./public/libraryItems.json");
let chordChart = new ChordChart();
let nw = new NetworkChart();


visualize()

function visualize() {
    init();
    btnCLickFunctions();
}

function init() {
    drawPack();
    showPack();
    drawNetwork();
    drawChord();

}

function drawChord() {
    chordChart.drawChart();
}

function drawPack() {
    packChart.drawChart();
}

function drawNetwork() {
    // network.drawChart();
    nw.drawChart();
}

function showPack() {
    $("#chordContainer").hide();
    $("#networkContainer").hide();
    $("#packContainer").show();
}

function showChord() {
    /*    var btn= document.getElementById('resetBtn')
        btn.innerHTML='return to home'*/
    let areaName = $('#selectMenu option').filter(':selected').val();
    addNavRoute(areaName);
    $("#packContainer").hide();
    $("#networkContainer").hide();
    // chordChart.updateData();
    $("#chordContainer").show();

}

function showNetwork() {
addNavRoute('network chart')
    $("#packContainer").hide();
    $("#chordContainer").hide();
    $("#networkContainer").show();
}


function addNavRoute(areaName) {
    let navBar = document.getElementById('navBar');
    if (navBar.childElementCount > 1) navBar.removeChild(navBar.lastChild);
    let newNav = document.createElement('li');
    newNav.className = 'breadcrumb-item active';
    newNav.setAttribute = ('aria-current', 'page');
    newNav.innerHTML = areaName;
    navBar.appendChild(newNav);
}


function btnCLickFunctions() {
    $('#selectMenu').on('change', function () {
        showChord();
        // showNetwork();
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

    $(document).on("groupClicked", print);
    $(document).ready(function () {
        $('#networkBtn').click(function () {
            showNetwork()
        });
    });

    /*$(document).on( "some:event", function(evt,someData) {
        console.log('DATA')
    } );
*/
}

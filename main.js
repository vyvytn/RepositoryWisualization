import PackChart from './modules/PackChart.js'
import ChordChart from "./modules/ChordChart.js";
let packChart = new PackChart("./public/libraryItems.json");
// let network = new basicNetwork();
let chordChart = new ChordChart();


visualize()

function visualize() {
    init();
    btnCLickFunctions();
}

function init() {
    drawPack();
    showPack();
    // drawNetwork();
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
}

function showPack() {
    $("#chordContainer").hide();
    $("#networkContainer").hide();
    $("#packContainer").show();
}

  function showChord() {
/*    var btn= document.getElementById('resetBtn')
    btn.innerHTML='return to home'*/
    let areaName= $('#selectMenu option').filter(':selected').val();
    addNavRoute(areaName);
     $("#packContainer").hide();
      $("#networkContainer").hide();
      // chordChart.updateData();
      $("#chordContainer").show();

 }
function showNetwork() {
    $("#packContainer").hide();
    $("#chordContainer").hide();
    $("#networkContainer").show();
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




function btnCLickFunctions() {
    $('#selectMenu').on('change', function() {
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
    /*$(document).on( "some:event", function(evt,someData) {
        console.log('DATA')
    } );
*/
}

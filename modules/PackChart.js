import ChordChart from "./ChordChart.js";
import NetworkChart from "./NetworkChart.js";


export default class PackChart {
    dataUrl;

    constructor(url) {
        this._setUrl(url);
        $("#chordMenuContainer").hide();

    }

    _setUrl(u) {
        this.dataUrl = u;
    }

    drawChart() {

        //get JSON data
        d3.json(this.dataUrl, function (data) {

                //select SVG from HTML and creates symbols
                let svg = d3.select("svg");
                let margin = 20,
                    diameter = +svg.attr("width"),
                    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


                let colors = [
                    "#beab90",
                    "#7d94b1",
                    "#8b5964",
                    "#cb5616",
                    "#7a9b54",
                    "#c38a2b",
                    "#4e8a60"
                ]

                function colorFIll(areaName) {
                    switch (areaName) {
                        case "Weizenbaum Institut":
                            return colors[1];

                        case "Mensch - Arbeit - Wissen":
                            return colors[2];

                        case "Markt - Wettbewerb - Ungleichheit":
                            return colors[3];

                        case "Demokratie – Partizipation – Öffentlichkeit":
                            return colors[4];

                        case "Verantwortung – Vertrauen – Governance":
                            return colors[5];

                        case  "Querschnittsformate":
                            return colors[6];

                    }
                }

                let navBar = document.getElementById('navBar');
                let newNav = document.createElement('li');
                newNav.className = 'breadcrumb-item active';
                newNav.setAttribute = ('aria-current', 'page');
                newNav.innerHTML = 'Weizenbaum Institut';
                navBar.appendChild(newNav);

                let pack = d3.pack()
                    .size([diameter - margin, diameter - margin])
                    .padding(2);

                //nesting data and creating a hierarchy
                let rawData = data.results.bindings;
                let myNewData = d3.nest()
                    .key(d => d.area.value)
                    .key(d => d.group.value)
                    .key(d => d.title.value)

                    .entries(rawData);
                let packable = {key: "Weizenbaum Institut", values: myNewData}
                let root = d3.hierarchy(packable, d => d.values)
                    // .sum(d=>d.values.length)
                    .sum(d => 1)
                    .sort(function (a, b) {
                        return b.value - a.value;
                    });
                console.log(root)

                //zoom interaction
                let focus = root,
                    nodes = pack(root).descendants(),
                    view;


                let circle = g.selectAll("circle")
                    .data(nodes)
                    .enter().append("circle")
                    .attr("class", function (d) {
                        // return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                        return d.depth === 0 ? "node node--root" : d.depth === 1 ? " node node--area" : d.depth === 2 ? "node node--group" : "node node--item"
                    })
                    .style("fill", function (d) {
                        // return d.children ? colors[d.depth + 1] : null;
                        return d.depth === 0 ? colors[0] : d.depth === 1 ? colorFIll(d.data.key) : d.depth===2? 'white':'none'
                    })
                    .style("opacity", function (d) {
                        return d.depth === 0 ? 0.5 : d.depth === 1 ? 0.7 : d.depth === 2 ? 0.7 : 1

                    })
                    .on("click", function (d) {
                        console.log(d.data.key)
                        if (d.depth >= 2) {
                            drawNetwork();
                        }
                        if (focus !== d) zoom(d), d3.event.stopPropagation();
                        console.log(d)
                    })
                    .on("mouseover", function () {

                    });


                // create a tooltip
                var tooltip = d3.select("#packContainer")
                    .append("div")
                    .style("position", "absolute")
                    .style("visibility", "hidden")
                    .text("I'm a circle!");

                d3.select("#circleBasicTooltip")
                    .on("mouseover", function () {
                        return tooltip.style("visibility", "visible");
                    })
                    .on("mousemove", function () {
                        return tooltip.style("top", (event.pageY - 800) + "px").style("left", (event.pageX - 800) + "px");
                    })
                    .on("mouseout", function () {
                        return tooltip.style("visibility", "hidden");
                    });


                let text = g.selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .attr("class", "label")
                    .style("fill-opacity", function (d) {
                        return d.parent === root ? 1 : 0;
                    })
                    .style("display", function (d) {
                        return d.parent === root ? "inline" : "none";
                    })
                    .text(function (d) {
                        return d.data.key;
                    });

                let node = g.selectAll("circle,text");

                svg
                    // .style("background", colors[0])
                    .on("click", function () {
                        zoom(root);
                    });

                zoomTo([root.x, root.y, root.r * 2 + margin]);

                function zoom(d) {
                    let focus0 = focus;
                    focus = d;
                    console.log(focus);
                    if (d.depth !== 0) {
                        updateNavigation(2, focus.data.key)
                    } else {
                        while (navBar.childElementCount > 2) {
                            navBar.removeChild(navBar.lastChild)

                        }
                    }

                    let chordBtn = $("#chordMenuContainer")
                    focus.depth !== 0 ? chordBtn.show() : chordBtn.hide();


                    let transition = d3.transition()
                        .duration(d3.event.altKey ? 50 : 500)
                        .tween("zoom", function (d) {
                            let i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2.5 + margin]);
                            return function (t) {
                                zoomTo(i(t));
                            };
                        });

                    transition.selectAll("text")
                        .filter(function (d) {
                            return d.parent === focus || this.style.display === "inline";
                        })
                        .style("fill-opacity", function (d) {
                            return d.parent === focus ? 1 : 0;
                        })
                        .on("start", function (d) {
                            if (d.parent === focus) this.style.display = "inline";
                        })
                        .on("end", function (d) {
                            if (d.parent !== focus) this.style.display = "none";
                        });
                }


                function updateNavigation(depth, name) {
                    let navBar = document.getElementById('navBar');
                    while (navBar.childElementCount > depth) {
                        navBar.removeChild(navBar.lastChild)
                    }
                    let newNav = document.createElement('li');
                    newNav.className = 'breadcrumb-item active';
                    newNav.setAttribute = ('aria-current', 'page');
                    newNav.innerHTML = name;
                    navBar.appendChild(newNav);
                }


                function zoomTo(v) {
                    let k = diameter / v[2];
                    view = v;
                    node.attr("transform", function (d) {
                        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                    });
                    circle.attr("r", function (d) {
                        return d.r * k;
                    });
                }

                function drawChord() {
                    let chordChart = new ChordChart;
                    chordChart.drawChart();
                    /*                let areaName = $('#selectMenu option').filter(':selected').val();
                                    let navBar = document.getElementById('navBar');
                                    if (navBar.childElementCount > 1) navBar.removeChild(navBar.lastChild);
                                    let newNav = document.createElement('li');
                                    newNav.className = 'breadcrumb-item active';
                                    newNav.setAttribute = ('aria-current', 'page');
                                    newNav.innerHTML = areaName;
                                    navBar.appendChild(newNav);*/
                    $("#chordMenuContainer").hide()
                    $("#packContainer").hide();
                    $("#networkContainer").hide();
                    // chordChart.updateData();
                    $("#chordContainer").show();

                }

                function drawNetwork() {
                    let nw = new NetworkChart();
                    nw.drawChart().then(
                        function () {
                            $("#packContainer").hide()
                            $("#chordContainer").hide()
                            $("#networkContainer").show()
                        }
                    )
                }

                $(document).ready(function () {
                    $('#chordMenuBtn').click(function () {
                        drawChord();
                        // showNetwork();
                    });
                    $('#resetBtn').click(function () {
                        focus = root;
                        $("#chordMenuContainer").hide()
                        let navBar = document.getElementById('navBar');
                        while (navBar.childElementCount > 2) {
                            navBar.removeChild(navBar.lastChild)
                        }
                        zoomTo([root.x, root.y, root.r * 2 + margin]);

                       d3.transition().selectAll("text")
                            .filter(function (d) {
                                return d.parent === focus || this.style.display === "inline";
                            })
                            .style("fill-opacity", function (d) {
                                return d.parent === focus ? 1 : 0;
                            })
                            .on("start", function (d) {
                                if (d.parent === focus) this.style.display = "inline";
                            })
                            .on("end", function (d) {
                                if (d.parent !== focus) this.style.display = "none";
                            });
                    });

                });
            }
        );

    }

}

import ChordChart from "./ChordChart.js";
import NetworkChart from "./NetworkChart.js";


export default class PackChart {
    dataUrl;

    constructor(url) {
        this.init(url)
    }

    init(url) {
        this.dataUrl = url;
        $("#chordMenuContainer").hide();
        $("#returnBtn").hide();
    }

    drawChart() {

        //get JSON data
        d3.json(this.dataUrl, function (data) {

                //select SVG from HTML and creates symbols
                let svg = d3.select("svg");
                let margin = 20,
                    diameter = +svg.attr("width"),
                    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

                //cooperate colors from Weizenbaum Institute
                let colors = [
                    "#beab90",
                    "#7d94b1",
                    "#8b5964",
                    "#cb5616",
                    "#7a9b54",
                    "#c38a2b",
                    "#4e8a60"
                ]

                //set suitable colors to area
                function colorFIll(areaName) {
                    switch (areaName) {
                        case "Weizenbaum Institut":
                            return colors[1];

                        case "Mensch, Arbeit, Wissen":
                            return colors[2];

                        case "Markt, Wettbewerb, Ungleichheit":
                            return colors[3];

                        case "Demokratie, Partizipation, ?ffentlichkeit":
                            return colors[4];

                        case "Verantwortung, Vertrauen, Governance":
                            return colors[5];

                        case  "Querschnittsformate":
                            return colors[6];

                    }
                }

                //set up navigation
                let navBar = document.getElementById('navBar');
                let newNav = document.createElement('li');
                newNav.className = 'breadcrumb-item active';
                newNav.setAttribute = ('aria-current', 'page');
                newNav.style = ('font-family', 'Times New Roman');
                newNav.innerHTML = 'Weizenbaum Institut';
                navBar.appendChild(newNav);

                // create d3 pack chart
                let pack = d3.pack()
                    .size([diameter - margin, diameter - margin])
                    .padding(25);

                //nesting data and creating a hierarchy
                let rawData = data.results.bindings;
                let myNewData = d3.nest()
                    .key(d => d.area.value)
                    .key(d => d.group.value)
                    .key(d => d.title.value)
                    .entries(rawData);
                let packable = {key: "Weizenbaum Institut", values: myNewData}
                let root = d3.hierarchy(packable, d => d.values)
                    .sum(d => 1)
                    .sort(function (a, b) {
                        return b.value - a.value;
                    });

                //zoom interaction
                let focus = root,
                    nodes = pack(root).descendants(),
                    view;

                //creating tooltip
                let tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .attr('class', 'd3-tip')
                    // .offset([-10, 0])
                    .html(function (d) {
                        return d.depth === 1 ? "Research topic: " + '<br>' + '<b>' + d.data.key + '<b>' : "show network chart of " + '<br>' + "'" + d.data.key + "'"
                    });


                svg.on("click", function () {
                    console.log('ZOOM ROOT')
                    zoom(root);
                }).call(tip)

                //---------------------------------------------------------------------------
                //creating visual hierarchy
                let circle = g.selectAll("circle")
                    .data(nodes)
                    .enter().append("circle")
                    .attr("class", function (d) {
                        // return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                        return d.depth === 0 ? "node node--root" : d.depth === 1 ? " node node--area" : d.depth === 2 ? "node node--group" : "node node--item"
                    })
                    .each(function (d, i) {
                        d.index = i;
                    })
                    .style("fill", function (d) {
                        // return d.children ? colors[d.depth + 1] : null;
                        // return d.depth === 0 ? colors[0] : d.depth === 1 ? colorFIll(d.data.key) : d.depth === 2 ? 'white' : 'none'
                        return d.depth === 0 ? colors[0] : d.depth === 1 ? colorFIll(d.data.key) : 'none'
                    })
                    .style("stroke", function (d) {
                        return d.depth === 0 ? colors[0] : d.depth === 1 ? colorFIll(d.data.key) : 'none'
                    })
                    .style("opacity", function (d) {
                        return d.depth === 0 ? 0.5 : d.depth === 1 ? 0.7 : d.depth === 2 ? 0.7 : 1
                    })
                    .on("click", function (d, i) {
                        console.log(d)
                        if (d.depth >= 2) {
                            console.log('CLICK DEPTH 2')
                            $("#returnBtn").show();
                            drawNetwork(d);
                        } else {
                            console.log('ZOOM')
                            if (focus !== d && d.depth!==2) zoom(d, i), d3.event.stopPropagation();
                        }
                    })


                //creating text for area title
                let text = g.selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .attr("class", "label")
                    .style("fill-opacity", function (d) {
                        return d.parent === root ? 1 : 0;
                    })
                    .style("display", "block")
                    .style('font-size', function (d) {
                        return d.r / 10
                    })
                    .style('font-family', 'Monospace')
                    .text(function (d) {
                        return d.data.key;
                    });

                let node = g.selectAll("circle,text");


                //default zoom window
                zoomTo([root.x, root.y, root.r * 2 + margin]);


                //ZOOM function
                //---------------------------------------------------------------------------
                function zoom(d, i) {
                    console.log(d)

                    let focus0 = focus;
                    focus = d;

                    switch (d.depth) {
                        case 0:
                            console.log('DEPTH 0')
                            text.style('display', 'block')
                            initZoomRoot()
                            break;
                        case 1:
                            text.style('display', 'none')
                            $(document).ready(function () {
                                // console.log('focus.data.key')
                                // console.log(focus.data.key)
                                $('#chordMenuBtn').show()
                                $('#chordMenuBtn').click(function () {
                                    drawChord(focus.data.key);
                                });
                            })
                            circle
                                .on('mouseover', function (d, i) {
                                    if (d.depth === 1) tip.style("background", colorFIll(d.data.key))
                                    tip.show(d, i)

                                })
                                .on('mouseout', tip.hide)
                                .style("pointer-events", function (d) {
                                    if (d.depth === 2) return "all"
                                })
                                .style("fill", function (d) {
                                    return d.depth === 0 ? colors[0] : d.depth === 1 ? colorFIll(d.data.key) : d.depth === 2 ? colorFIll(d.parent.data.key) : 'none'
                                })

                            updateNavigation(2, focus.data.key)
                            break;
                        case 2:
                            /* text.style('display', 'block')
                             $('#chordMenuBtn').click(function () {
                                 drawChord(focus.data.key);
                             });*/
                            return

                    }
                    circle.filter(d => d.depth === 1)
                        .on('mouseover', function (d, i) {
                            tip.style("background", colorFIll(d.data.key))
                            tip.show(d, i)

                        })

                    //show chord button
                    let chordBtn = $("#chordMenuContainer")
                    focus.depth !== 0 ? chordBtn.show() : chordBtn.hide();

                    //actual zoom function
                    let transition = d3.transition()
                        .duration(d3.event.altKey ? 50 : 500)
                        .tween("zoom", function (d) {
                            let a = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2.5 + margin]);
                            return function (t) {
                                zoomTo(a(t));
                            };
                        })


                    //label changing while zooming
                    transition.selectAll("text")
                        .filter(function (d) {
                            return this.style.display === "block";
                        })
                        .style("fill-opacity", function (d) {
                            return d.parent === focus ? 1 : 0;
                        })
                        .on("start", function (d) {
                            if (d.parent === focus) this.style.display = "block";
                        })
                        .on("end", function (d) {
                            if (d.parent !== focus) this.style.display = "none";
                        });

                }

                //NAVIGATION functions
                //---------------------------------------------------------------------------
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

                function addNavigation(name) {
                    let navBar = document.getElementById('navBar');
                    let newNav = document.createElement('li');
                    newNav.className = 'breadcrumb-item active';
                    newNav.setAttribute = ('aria-current', 'page');
                    newNav.innerHTML = name;
                    navBar.appendChild(newNav);
                }

                function deleteNavigation(depth) {
                    console.log('DELETE')
                    let navBar = document.getElementById('navBar');
                    while (navBar.childElementCount > depth) {
                        navBar.removeChild(navBar.lastChild)
                    }
                }

                //---------------------------------------------------------------------------

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

                function drawChord(name) {
                    let chordChart = new ChordChart(name);
                    chordChart.drawChart().then(
                        function () {
                            $("#packContainer").hide()
                            $("#networkContainer").hide()
                            $("#resetBtn").hide()
                            $("#chordMenuBtn").hide();
                            // chordChart.updateData();
                            $("#returnBtn").show()
                            $("#chordContainer").show()
                        })
                    resetMenu()
                }

                function drawNetwork(d, i) {
                    console.log('DRAW NETWORK')
                    let group = d.data.key
                    addNavigation(group)
                    // updateNavigation(3, d.data.key)
                    let nw = new NetworkChart(group);
                    nw.drawChart().then(
                        function () {
                            $("#packContainer").hide()
                            $("#chordContainer").hide()
                            $("#resetBtn").hide();
                            $('#chordMenuBtn').hide()
                            $("#returnBtn").show()
                            $("#networkContainer").show()
                        })
                    resetMenu(nw, d, i)

                }

                function initZoomRoot() {
                    console.log('INIT')
                    circle
                        .on("mouseover", function (d, i) {
                            tip.style("background", colorFIll(d.data.key));
                            tip.show(d, i)
                        })
                        .style("pointer-events", function (d) {
                            if (d.depth === 2) return "none"
                        })

                    deleteNavigation(2)
                }

                function resetMenu(network, d, i) {
                    console.log('RESET ENTERD')

                    $(document).ready(function () {
                            $('#returnBtn').click(function () {
                                console.log('RESET RETURN BTN CLICKED')
                                if (network) {
                                    network.delete()
                                    svg.call(tip)

                                  /*  if(d){
                                        focus = d.parent
                                        let transition = d3.transition()
                                            .tween("zoom", function (d) {
                                                let a = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2.5 + margin]);
                                                return function (t) {
                                                    zoomTo(a(t));
                                                };
                                            })

                                        transition.selectAll("text")
                                            .filter(function (d) {
                                                return this.style.display === "block";
                                            })
                                            .style("fill-opacity", function (d) {
                                                return d.parent === focus ? 1 : 0;
                                            })
                                            .on("start", function (d) {
                                                if (d.parent === focus) this.style.display = "block";
                                            })
                                            .on("end", function (d) {
                                                if (d.parent !== focus) this.style.display = "none";
                                            });

                                    }*/
                                }
                                /*  if(d.depth===2){
                                      zoom(d.parent,i)
                                  }*/
                                console.log(d)
                                $("#chordContainer").hide()
                                $("#networkContainer").hide()
                                $('#returnBtn').hide()
                                $('#chordMenuBtn').show()
                                $("#packContainer").show()
                                $('#resetBtn').show()
                                deleteNavigation(3)
                            })

                        }
                    )
                    console.log('RESET LEAVE')

                }


                $(document).ready(function () {
                    $('#resetBtn').click(function () {
                        console.log('RESET BUTTON CLICKED')
                        $('#chordMenuBtn').hide()
                        svg.call(tip)
                        circle
                            .on("mouseover", function (d, i) {
                                tip.style("background", colorFIll(d.data.key));
                                tip.show(d, i)
                            })
                        focus = root;
                        initZoomRoot()
                        zoomTo([root.x, root.y, root.r * 2 + margin]);
// zoom(root,root.index)
                        d3.transition().selectAll("text")
                            .style('display', 'block')
                            .on("start", function (d) {
                                if (d.parent === focus) this.style.display = "block";
                            })
                            .on("end", function (d) {
                                if (d.parent !== focus) this.style.display = "none";
                            });
                        console.log('RESET BUTTON LEAVED')

                    });
                    /*  $('#returnBtn').click(function () {
                          deleteNavigation(3)
                          $("#chordContainer").hide()
                          $("#networkContainer").hide()
                          $("#packContainer").show()
                          $('#returnBtn').hide()
                      })*/
                });
            }
        );

    }

}

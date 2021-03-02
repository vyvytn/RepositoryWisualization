export default class PackChart {
    dataUrl;

    constructor(url) {
        this._setUrl(url)
    }

    _setUrl(u) {
        this.dataUrl = u;
    }

    /*
        getCurrentGroup(){
            return this.currentGroup;
        }
        setCurrentGroup(value){
            this.currentGroup=value;
        }*/
    drawChart() {

        //get JSON data
        d3.json(this.dataUrl, function (data) {
            /*   var svg = d3.select("body").append("svg");
               svg.attr("width", 750);
               svg.attr("height", 800);
   */
            //select SVG from HTML and creates symbols
            let svg = d3.select("svg");
            let margin = 20,
                diameter = +svg.attr("width"),
                g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


            let colors = [
                "#beab90",
                "#7d94b1",
                "#8b5964",
                "#cb5616"
            ]

            let pack = d3.pack()
                .size([diameter - margin, diameter - margin])
                .padding(2);

            //nesting data and creating a hierarchy
            let rawData = data.results.bindings;
            let myNewData = d3.nest()
                .key(d => d.area.value)
                .key(d => d.group.value)
                .entries(rawData);
            let packable = {key: "Weizenbaum Institut", values: myNewData}
            let root = d3.hierarchy(packable, d => d.values)
                // .sum(d=>d.values.length)
                .sum(d => 10)
                .sort(function (a, b) {
                    return b.value - a.value;
                });

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
                    return d.children ? colors[d.depth + 1] : null;
                })
                .style("opacity", function (d) {
                    return d.depth === 0 ? 0.3 : d.depth === 1 ? 0.5 : d.depth === 2 ? 0.7 : 1

                })
                .on("click", function (d) {
                    circleClick(d)
                });

            function circleClick(d) {
                if (d.depth < 2) {
                    circle.attr("class")
                    if (focus !== d) zoom(d), d3.event.stopPropagation();
                    console.log(d.data.key)
                    let navBar = document.getElementById('navBar');
                    if (navBar.hasChildNodes()) {
                        // navBar.querySelectorAll('*').forEach(n => n.remove());
                        navBar.removeChild(navBar.lastChild)
                    }
                    let newNav = document.createElement('li');
                    newNav.className = 'breadcrumb-item active';
                    newNav.setAttribute = ('aria-current', 'page');
                    newNav.innerHTML = d.data.key;
                    navBar.appendChild(newNav);

                } else if (d.depth >= 2) {
                    console.log(d.data.key ? d.data.key : d.data.group.value)
                    let navBar = document.getElementById('navBar');
                    let newNav = document.createElement('li');
                    newNav.className = 'breadcrumb-item active';
                    newNav.setAttribute = ('aria-current', 'page');
                    newNav.innerHTML = 'circle';
                    navBar.appendChild(newNav);
                    // $(document).trigger("some:event", d.data.group.value);
                    $(document).trigger("some:event", d.data.key ? d.data.key : d.data.group.value);

                }
            }

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

            $(document).ready(function () {
                $('#resetBtn').click(function () {
                    focus = root;
                    zoomTo([root.x, root.y, root.r * 2 + margin]);
                });
            });
        });

    }

}

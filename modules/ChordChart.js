export default class ChordChart {
    areaName;

    constructor(areaName) {
        this.areaName = areaName;
    }


    // ASYNC
    async drawChart() {
        let area = this.areaName



        //get data
        d3.json('/public/new.json', function (data) {

            let s = d3.select('#chordSVG');
            s.select("g").remove();
            let unsortedData = data.results.bindings;

            //nesting data
            let myNewData = d3.nest()
                .key(d => d.author.value)
                .key(d => d.group.value)
                .entries(unsortedData);


            /*
                        let groupNested = d3.nest()
                            .key(d => d.group.value)
                            .entries(unsortedData)

                        let group = groupNested.map(el => {
                            return el.key
                        })
                        console.log(group)*/

            let groupNested = d3.nest()
                .key(d => d.area.value)
                .key(d => d.group.value)
                .entries(unsortedData)

            let group = [];

            groupNested.map(el => {
                if (el.key === area) {
                    el.values.map(elem => {
                        group.push(elem.key)
                    })
                }
            })


            let packableItems = {key: "Weizenbaum Library", values: myNewData};

            //creating hierarchy
            let hierarchy = d3
                .hierarchy(packableItems, d => d.values);

            /*       let nodes = hierarchy.descendants();
                   console.log(nodes)*/

            //getting links
            let links = hierarchy.links();

            //creating data matrix
            let matrix = [group.length];
            for (var i = 0; i < group.length; i++) {
                matrix[i] = new Array(group.length);
            }

            //fill matrix with data
            group.map((g, i) => {
                let count = 0;
                links.map(el => {
                    if (el.target.data.key === g) {
                        if (el.source.depth === 1) {
                            el.source.data.values.map(elem => {
                                if (elem.key !== g) {
                                    let index = group.indexOf(elem.key)
                                    matrix[i][index] = 1
                                    count += 1;
                                }
                            })

                        }

                    }
                });
            })

            //set '0' for no relation
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix.length; j++) {
                    if (matrix[i][j] === undefined) {
                        matrix[i][j] = 0;
                    }
                }
            }


            var rotation = .99;

            var options = {
                "gnames": group,
                "rotation": rotation,
                "colors": [
                    "#beab90",
                    "#c93e37",
                    "#7a9b54",
                    "#7d94b1",
                    "#c38a2b",
                    "#4e8a60",
                    "#8b5964",
                    "#cb5616",
                ]
            };


            // initialize the chord configuration variables
            var config = {
                width: 1000,
                height: 1000,
                rotation: 0,
                textgap: 10,
                colors: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"]
            };

            // add options to the chord configuration object
            if (options) {
                extend(config, options);
            }

            // set chord visualization variables from the configuration object
            var offset = Math.PI * config.rotation,
                width = config.width,
                height = config.height,
                textgap = config.textgap,
                colors = config.colors;

            // set viewBox and aspect ratio to enable a resize of the visual dimensions
            var viewBoxDimensions = "0 0 " + width + " " + height,
                aspect = width / height;

            var gnames;
            if (config.gnames) {
                gnames = config.gnames;
            } else {
                // make a list of names
                gnames = [];
                for (var i = 0; i < matrix.length; i++) {
                    gnames.push(String.fromCharCode(i));
                }
            }

            // creating chord diagramm
            var chord = d3.layout.chord()
                .padding(.05)
                .sortSubgroups(d3.descending)

            var innerRadius = Math.min(width, height) * .20,
                outerRadius = innerRadius * 1.1;

            var fill = d3.scale.ordinal()
                .domain(d3.range(matrix.length - 1))
                .range(colors);


            let svg = d3.select('#chordSVG')
                .attr("viewBox", viewBoxDimensions)
                .attr("preserveAspectRatio", "xMinYMid")    // add viewBox and preserveAspectRatio
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


            chord.matrix(matrix)
            console.log(matrix)
            var g = svg.selectAll("group")
                .data(chord.groups)
                .enter().append("g")
                .attr("class", "group");

            g.append("path")
                .style("fill", function (d) {
                    return fill(d.index);
                })
                .style("stroke", function (d) {
                    return fill(d.index);
                })
                .attr("id", function (d, i) {
                    return "group" + d.index;
                })
                .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(startAngle).endAngle(endAngle))
                .on("mouseover", fade(.1))
                .on("mouseout", fade(1))
                .on('click', function (d) {
                    console.log(gnames[d.index])
                })

            g.append("text")
                .style('font-size', '12px')
                .style('font-family', 'Monospace')
                .each(function (d) {
                    d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
                })
                // .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.angle > Math.PI ? "end" : null;
                })
                .attr("transform", function (d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                        + "translate(" + (outerRadius + textgap) + ")"
                        + (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .text(function (d) {
                    return gnames[d.index];
                });

            svg.append("g")
                .attr("class", "chord")
                .selectAll("path")
                .data(chord.chords)
                .enter().append("path")
                .attr("d", d3.svg.chord().radius(innerRadius).startAngle(startAngle).endAngle(endAngle))
                .style("fill", function (d) {
                    return fill(d.source.index);
                })
                .style("opacity", 1)
                .append("title")
                .text(function (d) {
                    return d.source.value + "  " + gnames[d.source.index] + " shared with " + gnames[d.target.index];
                });

            console.log('svg')
            console.log(svg)
// helper functions start here

            function startAngle(d) {
                return d.startAngle + offset;
            }

            function endAngle(d) {
                return d.endAngle + offset;
            }

            function extend(a, b) {
                for (var i in b) {
                    a[i] = b[i];
                }
            }

            // Returns an event handler for fading a given chord group.
            function fade(opacity) {
                return function (g, i) {
                    svg.selectAll(".chord path")
                        .filter(function (d) {
                            return d.source.index != i && d.target.index != i;
                        })
                        .transition()
                        .style("opacity", opacity);
                };


            }


        })

    }


}

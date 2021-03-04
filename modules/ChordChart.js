export default class ChordChart {
    areaName = $('#selectMenu option').filter(':selected').val();

    // ASYNC
    async drawChart() {
        await d3.json('/public/libraryItems.json', function (data) {
            let unsortedData = data.results.bindings;
            let myNewData = d3.nest()
                .key(d => d.area.value)
                .key(d => d.group.value)
                .key(d => d.title.value)
                .entries(unsortedData);
            console.log(myNewData)

            let areaArray=myNewData.map(el=>{
                 return el.key
            });

            console.log(areaArray)


            var visual = document.getElementById("visual");

            // matrix of ADB, EBRD, EIB, IDB, KFW, OPIC, World Bank
            let areaMatrix;

            for (let area in areaArray){

            }
            var matrix = [
                [2101, 1694, 1456, 3723, 627, 2491],
                [ 195, 371, 743,0,0, 65],
                [1663, 1003, 159, 1903, 803, 871],
                [ 381, 1255, 80, 639, 743, 65],
                [1649, 2531, 357, 1244, 262, 357],
                [280, 2579, 0, 0, 159, 553],

            ];

            // var array = ["ADB", "EBRD", "EIB", "IDB", "KfW", "OPIC", "World Bank", "Energy Efficiency", "Renewable Energy", "Policy Loan", "T&D", "High Carbon projects", "Other energy projects"];

            var rotation = .99;

            var chord_options = {
                "gnames": areaArray,
                "rotation": rotation,
                "colors": ["#166000", "#238443", "#fb7e17", "#75b3ff", "#d01501", "#b10056"]
            };

            function Chord(container, options, matrix) {

                // initialize the chord configuration variables
                var config = {
                    width: 800,
                    height: 800,
                    rotation: 0,
                    textgap: 0,
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

                // start the d3 magic
                var chord = d3.layout.chord()
                    .padding(.05)
                    .sortSubgroups(d3.descending)
                    .matrix(matrix);

                var innerRadius = Math.min(width, height) * .31,
                    outerRadius = innerRadius * 1.1;

                var fill = d3.scale.ordinal()
                    .domain(d3.range(matrix.length - 1))
                    .range(colors);

                var svg = d3.select("#chordSVG")
                    .attr("id", "visual")
                    .attr("viewBox", viewBoxDimensions)
                    .attr("preserveAspectRatio", "xMinYMid")    // add viewBox and preserveAspectRatio
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                var g = svg.selectAll("g.group")
                    .data(chord.groups)
                    .enter().append("svg:g")
                    .attr("class", "group");

                g.append("svg:path")
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
                    .on("mouseout", fade(1));

                g.append("svg:text")
                    .each(function (d) {
                        d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
                    })
                    .attr("dy", ".35em")
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
                    .append("svg:title")
                    .text(function (d) {
                        return d.source.value + "  " + gnames[d.source.index] + " shared with " + gnames[d.target.index];
                    });

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


                window.onresize = function () {
                    var targetWidth = (window.innerWidth < width) ? window.innerWidth : width;

                    var svg = d3.select("#visual")
                        .attr("width", targetWidth)
                        .attr("height", targetWidth / aspect);
                }


            }

            window.onload = function () {
                Chord(visual, chord_options, matrix);

            }

            d3.select(self.frameElement).style("height", "600px");


        });

    }


    /*updateData(){
        console.log(this.areaName);
        Chord(this.vis, this.opt, this.mat);
    }*/
}

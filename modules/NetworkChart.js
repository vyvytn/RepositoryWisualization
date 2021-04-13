export default class NetworkChart {


    group;

    links;
    data;


    constructor(group) {
        this.group = group;
    }

    async drawChart(g) {
        let group
        if (g) {
            group = g
        } else {
            group = this.group
        }

        await d3.json("./public/new.json", function (data) {
                var link, edgepaths, nodes, node, simulation, clickedNode
                let unsortedData = data.results.bindings;

                // console.log(unsortedData)
                let authorsList = d3.nest()
                    .key(d => d.author.value)
                    .key(d => d.title.value)
                    .key(d => d.group.value)
                    .key(d => d.area.value)
                    .entries(unsortedData);

                let authors = d3.nest()
                    .key(d => d.author.value)
                    .key(d => d.title.value)
                    .key(d => d.group.value)
                    .entries(unsortedData);

                let itemsList = d3.nest()
                    .key(d => d.title.value)
                    .entries(unsortedData);


                let abstractList = d3.nest()
                    .key(d => d.title.value)
                    .key(function (d) {
                        return d.abstract ? d.abstract.value : 'No abstract'
                    })
                    .entries(unsortedData);

                abstractList.map(i => {
                    i.values.map(abstract => {
                        abstract.values = null
                    })
                })


                let items = {key: 'items', values: itemsList};
                let itemsHierarchy = d3.hierarchy(items, d => d.values)

                let allData = d3.nest()
                    .key(d => d.area.value)
                    .key(d => d.group.value)
                    .key(d => d.title.value)
                    .key(d => d.author.value)
                    .entries(unsortedData);

                allData.map(area => {
                    area.type = 'area'
                    area.values.map(group => {
                        group.type = 'group'
                        group.values.map(title => {
                            title.type = 'title'
                            title.values.map(author => {
                                author.type = 'author'
                            })
                        })
                    })
                })

                authors.map(auth => {
                    auth.type = 'author'
                    auth.values.map(tit => {
                        tit.type = 'title'
                        tit.values.map(g => {
                            g.type = 'group'
                        })
                    })
                })

                // console.log(allData)

                let groupData = [];

                //load groupspecific data
                allData.map(el => {
                    el.values.map(elem => {
                        if (elem.key === group) {
                            groupData = elem.values
                        } else {
                            // console.log(elem.key)
                        }
                    })
                })

                //match author with its metadata
                groupData.map(item => {
                    item.values.map(author => {
                        authors.map(a => {
                            if (a.key === author.key) {
                                author.values = a.values
                            }
                        })
                    })
                })


                /*  abstractList.map(abstract=>{
                      groupData.map(item=>{
                          if(item.key===abstract.key){
                              console.log(item)
                            item.values.push(abstract.values[0])
                          }
                      })
                  })*/


                itemsList.map(item => {
                    groupData.map(i => {
                        if (i.key === item.key) {
                            i.values.push(item.values[0].abstract ? item.values[0].abstract : 'No abstract')
                            i.values.push(item.values[0].date ? item.values[0].date : 'No date')
                            i.values.push(item.values[0].language ? item.values[0].language : 'No language')
                            i.values.push(item.values[0].document ? item.values[0].document : 'No URL')
                            i.values.push(item.values[0].title)

                        }
                    })
                })


                let packableItems = {key: group, values: groupData};

                //creating hierarchy
                let hierarchy = d3.hierarchy(packableItems, d => d.values);
                // nodes = hierarchy.descendants();
                let groups = packableItems.values.map(el => {
                    return el.key
                });


                let colorScale = d3.scaleOrdinal() //=d3.scaleOrdinal(d3.schemeSet2)
                    .domain(groups)
                    .range([
                        "#beab90",
                        "#7d94b1",
                        "#8b5964",
                        "#cb5616",
                        "#7a9b54",
                        "#c38a2b",
                        "#4e8a60"
                    ])

                let colors = [
                    "#beab90",
                    "#7d94b1",
                    "#8b5964",
                    "#cb5616",
                    "#7a9b54",
                    "#c38a2b",
                    "#4e8a60"
                ]


                //set SVG attributes
                let width = 805
                let height = 765
                let margin = {top: 30, right: 80, bottom: 5, left: 5}
                const svg = d3.select('#nwSVG')
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .call(d3.zoom().on("zoom", function () {
                        svg.attr("transform", d3.event.transform)
                    }))
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);


                // legend for items
                let legendSVG = d3.select('#legendSVG')
                    .attr('width', 800)
                    .attr('height', 800)

                const legend_g = legendSVG.selectAll(".legend")
                    .data(colorScale.domain())
                    .enter().append("g")
                    .attr("transform", (d, i) => `translate(${width},${i * 30})`);

                legend_g.append("circle")
                    .attr("cx", -800)
                    .attr("cy", 20)
                    .attr("r", 5)
                    .attr("fill", colorScale);

                legend_g.append("text")
                    .attr("x", -790)
                    .attr("y", 25)
                    .text(d => d)
                    .style("font-size", "15px")
                    .style("font-family", "Times New Roman")

                nodes = hierarchy.descendants().filter(n => n.data.value !== '' && n.data.value !== "")
                console.log(nodes)
                nodes.map(n => {
                    if (n.depth === 1) {
                        // n._children = n.children;
                        // n.children = null;
                        collapse(n)
                    }
                })
                /*       let links = hierarchy.links();

                       link = svg.selectAll(".links")
                           .data(links)
    */
                update(true)

                //-----------------------------------------------------------------------------------------------------------------

                function update(first) {


                    // The <title> element provides an accessible, short-text description of any SVG container element or graphics element.
                    // Text in a <title> element is not rendered as part of the graphic, but browsers usually display it as a tooltip.
                    /* linksEnter.append("title")
                         .text(d => d.key); //DESIGN tooltip text*/

                    let links = hierarchy.links().filter(l => l.target.data.value !== '' && l.target.data.value !== "")
                    console.log(nodes)
                    // console.log(links)

                    // if(links)
                    link = svg.selectAll(".links")
                        .data(links)

                    const linksEnter =
                        link.enter()
                            .append('line')
                            .attr("class", "links")
                            .attr("stroke-width", 1)
                            .style('stroke', 'black')
                            .style('opacity', 10)
                            .on('click', function(d){
                                console.log(d)
                            })
                    link.exit().remove();

                    link = linksEnter.merge(link)
                        .attr('marker-end', 'url(#arrowhead)')


                    //d3 network simulation
                    simulation = d3.forceSimulation()
                        .force("link", d3.forceLink().id(function (d) {
                                return d.id;
                            })
                                // .id(d => d.data.key) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
                                //DESIGN Abstand der Knoten zueinander
                                .distance(50).strength(0.7)
                        )
                        //abstand von Kind-Elternknoten
                        .force('charge', d3.forceManyBody().strength(-50)
                            .theta(-950)
                        )
                        .force('center', d3.forceCenter(width / 2, height / 2))
                        .force('collision', d3.forceCollide().radius(100))
                        // .force('collide', d3.forceCollide().radius(30))
                        // .force("charge", d3.forceManyBody()
                        //     .strength(-200)
                        //     .theta(0.9)
                        //     .distanceMax(50)) // DESIGN Absto?en- Abstand zwischen Nodes
                        .on("tick", ticked);


                    //appending little triangles, path object, as arrowhead
                    //The <defs> element is used to store graphical objects that will be used at a later time
                    //The <marker> element defines the graphic that is to be used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.
                    svg.append('defs').append('marker')
                        .attr("id", 'arrowhead')
                        .attr('viewBox', '-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
                        .attr('refX', 50) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
                        .attr('refY', 0)
                        .attr('orient', 'auto')
                        .attr('markerWidth', 15) //DESIGN Pfeilspitzenbreite
                        .attr('markerHeight', 15)//DESIGN Pfeilspitzenh?he
                        .attr('xoverflow', 'visible')
                        .append('svg:path')
                        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                        .attr('fill', '#999')
                        .style('stroke', 'none');

                    // Initialize the nodes
                    // nodes = hierarchy.descendants();
                    nodes = hierarchy.descendants().filter(n => n.data.value !== '' && n.data.value !== "")

                    node = svg.selectAll(".nodes")
                        .data(nodes)

                    let nodeEnter = node.enter()
                        .append("g")
                        .attr("class", "nodes")
                        .call(d3.drag() //sets the event listener for the specified typenames and returns the drag behavior.
                            .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
                            .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
                            .on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
                        )

                    //Wuzelknoten nicht klickbar
                    nodeEnter.filter(function (d) {
                        if (d.depth !== 0) return d
                    })
                        .on("click", function (d) {
                            // console.log(d3.select(this.parentNode).attr('fill'))
                            // console.log(d.parent.color)

                            click(nodeEnter, d)
                        })

                    node.exit().remove();

                    /*  edgepaths = svg.selectAll(".edgepath") //make path go along with the link provide position for link labels
                          .data(links)
                          .enter()
                          .append('path')
                          .attr('class', 'edgepath')
                          .attr('fill-opacity', 100)
                          .attr('stroke-opacity', 10)
                          .attr('id', function (d, i) {
                              return 'edgepath' + i
                          })*/

                    /* // .style("pointer-events", "none");
                     const edgelabels = svg.selectAll(".edgelabel")
                         .data(links)
                         .enter()
                         .append('text')
                         .style("pointer-events", "none")
                         .attr('class', 'edgelabel')
                         .attr('id', function (d, i) {
                             return 'edgelabel' + i
                         })
                         .attr('font-size', 10)
                         .attr('fill', '#aaa');

                     //Text f?r verbindungen/Pfeile
                     edgelabels.append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
                         .attr('xlink:href', function (d, i) {
                             return '#edgepath' + i
                         })
                         .style("text-anchor", "middle")
                         .style("pointer-events", "none")
                         .attr("startOffset", "50%")
                         .text(d => 'contains');
    */

                    //tooltip
                    let tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .style(function (d) {
                            if (d.depth === 0) {
                                return "('display', 'inline')"
                            } else {
                                return "('display', 'none')"
                            }
                        })
                        .style("background", colors[2])
                        .style("overflow-y", 'scroll')


                    nodeEnter.filter(function (d) {
                        if (d.depth === 0 || d.depth === 1) return d;
                    })
                        .append("circle")
                        .attr("r", d => d.depth === 0 ? 50 : d.depth === 1 ? 30 : d.depth === 3 ? 10 : 15)
                        .style("display", "inline")
                        .style("fill", function (d) {
                            let col = d.depth === 0 ? 'lightgrey' : d.depth === 1 ? colorScale(d.data.key) : d.depth === 2 ? colorScale(d.parent.data.key) : 'black'
                            // setColorAttribute(col)
                            d.color = col
                            // console.log(d.color)
                            return col
                        })
                        .on("mouseover", function (d) {
                            d3.select(this).attr("r", d.depth === 1 ? 50 : d.depth === 3 ? 20 : d.depth === 0 ? 50 : 25);
                        })
                        .on('mouseout', function (d) {
                            d3.select(this).attr("r", d => d.depth === 0 ? 50 : d.depth === 1 ? 30 : d.depth === 3 ? 10 : 15)
                            if (d.depth === 0) {
                                d3.select(this).select('circle').attr("r", 50)
                            }
                        })

                    //author icons
                    nodeEnter.filter(function (d) {
                        if (d.data.type === 'author') return d;
                    }).append("svg:image")
                        .attr("xlink:href", 'https://simpleicon.com/wp-content/uploads/user1.png')
                        .attr("x", function (d) {
                            return -25;
                        })
                        .attr("y", function (d) {
                            return -25;
                        })
                        .attr("height", 50)
                        .attr("width", 50)

                    // rectangle for literals
                    nodeEnter.filter(function (d) {
                        if (d.data.type === 'literal') return d;
                    }).append("rectangle")


                    //usage of tooltip
                    svg.call(tip)


                    //    title of nodes
                    node.append("title")
                        .text(d => d.data.key);

                    //filterbutton
                    nodeEnter.filter(function (d) {
                        if (d.depth === 0) return d;
                    })
                        .append("text")
                        .attr('id', 'filterbutton')
                        .attr("class", "fa")
                        .attr('font-family', 'FontAwesome')
                        .style('display', 'inline')
                        .attr("dx", 30)
                        .attr("dy", -30)
                        .text(function (d, i) {
                            // if (i === 0) return "\uf055"
                            return "\uf055"
                        })
                        .style('pointer-events', 'auto')
                        .on('d3.select(d).attr(\'fill\')', function (d, i) {
                            openTip(tip, d, i)
                        })

                    nodeEnter.filter(function (d) {
                        if (d.depth >= 2) return d;
                    })
                        .append("rect")
                        .attr("width", 200)
                        .attr("height", 50)
                        .attr("dy", -10)
                        .attr("dx", -40)
                        .style("fill", function (d) {
                            // if (d.depth === 2) {
                            //     return d.parent.color
                            // }
                            return  d.depth === 2 ?  d.parent.color:d.depth === 3 ?d.parent.parent.color:d.depth === 4 ?d.parent.parent.parent.color:d.parent.parent.parent.parent.color
                            // nodes.forEach(el=>{
                            //     if (el.depth === 2) {
                            //         return el.parent.color
                            //     }
                            // })
                        });

                    function getColorNode(d) {
                        if (d.depth === 2) {
                            // console.log(d.parent.color)
                            return d.color
                        } else {
                            getColorNode(d.parent)
                        }
                    }

                    nodeEnter.filter(function (d) {
                        if (d.depth === 4) return d;
                    })
                        .on('click', function (d) {
                            console.log('CLICK')
                        })

                    node = nodeEnter.merge(node);

                    ///*Titel auf Knoten
                    // */

                    nodeEnter.append("text")
                        .attr("dy", 0)
                        .attr("dx", 20)
                        .attr("text-anchor", "start")
                        .text(function (d) {
                            // console.log(d.data.key ? d.data.key : d.data.value)
                            if (d.depth !== 1)
                                return d.data.key ? d.data.key : d.data.value
                        }).call(wrap, 200);

                    nodeEnter.selectAll('rectangle')
                        .attr("width", function(d) {return this.parentNode.getBBox().width;})

                    //Listen for tick events to render the nodes as they update in your Canvas or SVG.
                    simulation
                        .nodes(nodes)

                    simulation.force("link")
                        .links(links);
                }

                //-----------------------------------------------------------------------------------------------------------------
                // wrapping long text
                // source: https://bl.ocks.org/mbostock/7555321
                // function wrap(text, width) {
                //     text.each(function () {
                //         var text = d3.select(this),
                //             words = text.text().split(/\s+/).reverse(),
                //             word,
                //             line = [],
                //             lineNumber = 0,
                //             lineHeight = 0.5, // ems
                //             y = text.attr("y"),
                //             dy = parseFloat(text.attr("dy")),
                //             tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                //         while (word = words.pop()) {
                //             line.push(word);
                //             tspan.text(line.join(" "));
                //             if (tspan.node().getComputedTextLength() > width) {
                //                 line.pop();
                //                 tspan.text(line.join(" "));
                //                 line = [word];
                //                 tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                //             }
                //         }
                //     });
                // }
                function wrap(text, width) {
                    text.each(function () {
                        var text = d3.select(this),
                            words = text.text().split(/\s+/).reverse(),
                            word,
                            line = [],
                            lineNumber = 0,
                            lineHeight = 0.9, // ems
                            // x = text.attr("x"),
                            // y = text.attr("y"),
                            dy = 0, //parseFloat(text.attr("dy")),
                            tspan = text.text(null)
                                .append("tspan")
                                .attr("x", 0)
                                .attr("y", 10)
                                .attr("dy", dy + "em");
                        while (word = words.pop()) {
                            line.push(word);
                            tspan.text(line.join(" "));
                            if (tspan.node().getComputedTextLength() > width) {
                                line.pop();
                                tspan.text(line.join(" "));
                                line = [word];
                                tspan = text.append("tspan")
                                    .attr("x", 0)
                                    .attr("y", 10)
                                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                    .text(word);
                            }
                        }
                    });
                }

                // This function is run at each iteration of the force algorithm, updating the nodes position (the nodes data array is directly manipulated).
                function ticked() {
                    link.attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    // node.attr("transform", d => `translate(${d.x},${d.y})`);
                    node.attr("transform",
                        function (d) {
                            return "translate(" + d.x + ", " + d.y + ")";
                        });
                    // edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
                }

                //When the drag gesture starts, the targeted node is fixed to the pointer
                //The simulation is temporarily ?heated? during interaction by setting the target alpha to a non-zero value.
                function dragstarted(d) {
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].

                    d.fy = d.y; //fx - the node?s fixed x-position. Original is null.
                    d.fx = d.x; //fy - the node?s fixed y-position. Original is null.
                }

                //When the drag gesture starts, the targeted node is fixed to the pointer
                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }

                // the targeted node is released when the gesture ends
                function dragended(d) {
                    if (!d3.event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }

                function click(node, d) {
                    console.log(d)
                    if (d3.event.defaultPrevented) return; // ignore drag
                    if (d.children) {
                        //SCHLIESSEN
                        /*console.log('closed manuel')
                        console.log(d)*/
                        d._children = d.children;
                        d.children = null;
                    } else {
                        console.log('NEW NODE')

                        //OEFFNEN
                        function simulateForce(node) {
                            simulation.force('center', function (d) {
                                if (d === node) {
                                    return d3.forceCenter(width / 2, height / 1)
                                }
                            })
                        }

                        // simulateForce(d)
                        // console.log(d)
                        d.children = d._children;
                        d._children = null;


                        //allows just one node expanding
                        //source :https://stackoverflow.com/questions/19167890/d3-js-tree-layout-collapsing-other-nodes-when-expanding-one
                    }
                    if (d.parent) {
                        d.parent.children.forEach(function (element) {
                            if (d !== element && element.children) {
                                // console.log('closed automatically')
                                // console.log(element)                                // collapse(element)
                                element._children = element.children;
                                element.children = null;
                                // collapse(element)
                            }
                            // console.log(element)
                        });
                    }
                    update()
                    simulation.restart()
                }

                function collapse(d) {
                    if (d.children) {
                        d._children = d.children;
                        d._children.forEach(collapse);
                        d.children = null;
                    }
                }

                function openTip(tip, d, i) {
                    let color = d.depth === 0 ? 'grey' : d.depth === 1 ? colorScale(d.data.key) : d.depth === 2 ? colorScale(d.parent.data.key) : colorScale(d.parent.parent.data.key)
                    tip.style("background", color);
                    tip.direction('e')
                    leftMenuClicked(tip, d, i)
                    checked()
                    submitFilter(tip, d, i)
                    tip.html(function (d) {
                        return "<div class=row style='width: 300px; height: 500px'>" +
                            "<div class=col><p style='color:white; font-family: Monospace; font-weight: bold;'>show publications by author:</p> </div>" +
                            " <div class=col>" +
                            " <button align=\"right\" type=\"button\" class=\"btn btn-default\" style=\"color:white;\" id=leftMenuBtn><i class=\"bi bi-x-circle-fill\"></i></button> </div>" +
                            "</div>"

                            + getAuthors(d).map(el => {
                                return "<div class=form-check>" +
                                    "<input class=form-check-input type=checkbox id=flexCheckDefault value='" + el + "'> " +
                                    "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value=" + el + ">" + el + "</label> </div>"
                            })
                            + "<p style='color:white; font-family: Monospace; font-weight: bold'>show publications by year:</p>"
                            + getYears(d).map(el => {
                                return "<div class=form-check>" +
                                    "<input class=form-check-input type=checkbox id=flexCheckDefault value='" + el.key + "'> " +
                                    "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value=" + el.key + ">" + el.key + "</label> </div>"
                            })
                            + "<p style='color:white; font-family: Monospace; font-weight: bold'>show publications by type:</p>"
                            /*+ getYears(d).map(el => {
                                return "<div class=form-check>" +
                                    "<input class=form-check-input type=checkbox id=flexCheckDefault value='" + el.key + "'> " +
                                    "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value=" + el.key + ">" + el.key + "</label> </div>"
                            })*/
                            + "<div class=\"d-grid gap-2\"><button class=\"btn btn-light\" type=\"button\" id=submitFilter><i class=\"bi bi-check2-square\"></i></button> </div>"

                    })
                    if (d.depth === 0) {
                        tip.show(d, i)
                    }
                }

                function getYears(d) {
                    let years = []
                    d.children.map(item => {
                        let itemName = item.data.key;
                        itemsList.map(title => {
                            if (itemName === title.key) {
                                title.values.map(year => {
                                    years.push(year.key)
                                })
                            }
                        })
                    })
                    let result = Object.values(years.reduce((c, v) => {
                        c[v] = c[v] || [v, 0];
                        c[v][1]++;
                        return c;
                    }, {})).map(o => ({[o[0]]: o[1]}));

                    // console.log(result)
                    return result
                }

                function getAuthors(d) {
                    let authorList = []
                    if (d.children) {
                        d.children.map(child => {
                            child.data.values.map(author => {
                                if (author.key !== undefined && author.key !== 'undefined') authorList.push(author.key)
                            })
                        })
                    } else {
                        d.data.values.map(author => {
                            authorList.push(author)
                        })
                    }
                    // console.log(authorList)
                    return authorList
                }


                function wordwrap2(str, width, brk, cut) {
                    brk = brk || '\n';
                    width = width || 75;
                    cut = cut || false;
                    if (!str) {
                        return str;
                    }
                    var regex = '.{1,' + width + '}(\\s|$)' + (cut ? '|.{' + width + '}|.+$' : '|\\S+?(\\s|$)');
                    console.log(str.match(RegExp(regex, 'g')).join(brk))
                    return str.match(RegExp(regex, 'g')).join(brk);
                }


                //-----------------------------------------------------------------------------------------------------------------


                function checked() {
                    $(document).on('click', '.form-check-input:checked', function () {
                        $(".form-check-input").prop("disabled", true);
                    });
                }

                function submitFilter(tip, d, i) {
                    $(document).ready(function () {
                        $('#submitFilter').click(function () {
                            let name = $('.form-check-input:checked').val();
                            tip.hide(d, i)
                        })
                    })
                }

                function leftMenuClicked(tip, d, i) {
                    $(document).ready(function () {
                        $('#leftMenuBtn').click(function () {
                            tip.hide(d, i)
                        })
                    })
                }

                /* function openNewGroup(newGroup) {

                     //load groupspecific data
                     let newGroupData=[];
                     allData.map(el => {
                        return el.values.map(elem => {
                             if (elem.key === newGroup) {
                                newGroupData= elem.values
                             } else {
                                 // console.log(elem.key)
                             }
                         })
                     })
                     console.log(newGroupData)
                     //match author with its metadata
                     newGroupData.map(item => {
                         item.values.map(author => {
                             authors.map(a => {
                                 if (a.key === author.key) {
                                     author.values = a.values
                                 }
                             })
                         })
                     })

                      let newPackableItems = {key: newGroup, values: newGroupData};

                     //creating hierarchy
                     let  newHierarchy = d3.hierarchy(newPackableItems, d => d.values);
                     // nodes = hierarchy.descendants();
                      groups = newPackableItems.values.map(el => {
                         return el.key
                     });

                     nodes = newHierarchy.descendants().filter(n => n.data.value !== '' && n.data.value !== "")
                     nodes.map(n => {
                         if (n.depth === 1) {
                             // n._children = n.children;
                             // n.children = null;
                             collapse(n)
                         }
                     })
                     console.log(nodes)

                     update()
                     simulation.restart()

                 }*/


            }
        )

    }

    delete() {
        let svg = d3.select('#nwSVG');
        svg.select("g").remove();
        let legend = d3.select('#legendSVG');
        legend.selectAll("*").remove();
    }


}

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

                var link, nodes, node, simulation, links, rectWidth, rectHeight, rectangles
                let unsortedData = data.results.bindings;

                let authors = d3.nest()
                    .key(d => d.author.value)
                    .key(d => d.title.value)
                    .key(d => d.group.value)
                    .entries(unsortedData);

                let itemsList = d3.nest()
                    .key(d => d.title.value)
                    .entries(unsortedData);

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


                let groupData = [];

                //load groupspecific data
                allData.map(el => {
                    el.values.map(elem => {
                        if (elem.key === group) {
                            groupData = elem.values
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
                let width = 1200
                let height = 1000
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
                nodes.map(n => {
                    if (n.depth === 1) {
                        // n._children = n.children;
                        // n.children = null;
                        collapse(n)
                    }
                })
                links = hierarchy.links().filter(l => l.target.data.value !== '' && l.target.data.value !== "")


                update(hierarchy, false)

                //update function begins
                //-----------------------------------------------------------------------------------------------------------------

                function update(hier, collap) {


                    //initialize links between nodes
                    links = hier.links().filter(l => l.target.data.value !== '' && l.target.data.value !== "")
                    link = svg.selectAll(".links")
                        .data(links)

                    //creates visual links as lines
                    const linksEnter =
                        link.enter()
                            .append('line')
                            .attr("class", "links")
                            .attr("stroke-width", 1)
                            .style('stroke', 'black')
                            .style('opacity', 10)

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
                                .distance(50).strength(0.1)
                        )
                        //abstand von Kind-Elternknoten
                        .force('charge', d3.forceManyBody()
                            // .strength(-50)
                            // .theta(-950)
                        )
                        .force('center', d3.forceCenter(width / 2, height / 2))
                        // .force('collision', d3.forceCollide().radius(70))
                        .force('collide', d3.forceCollide().radius(65))
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

                    //initialize nodes
                    nodes = hier.descendants().filter(n => n.data.value !== '' && n.data.value !== "")
                    node = svg.selectAll(".nodes")
                        .data(nodes)

                    //create visual nodes as circles
                    let nodeEnter = node.enter()
                        .append("g")
                        .attr("class", "nodes")
                        .call(d3.drag() //sets the event listener for the specified typenames and returns the drag behavior.
                            .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
                            .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
                            .on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
                        )

                    //root not clickable
                    //opens children nodes
                    nodeEnter.filter(function (d) {
                        if (d.depth !== 0) return d
                    })
                        .on("click", function (d) {
                            click(nodeEnter, d)
                        })

                    //old nodes will be deleted when update function is called
                    node.exit().remove();

                    //tooltip created as filter
                    let tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .style("background", colors[2])

                    //usage of tooltip
                    svg.call(tip)


                    //styling for root and children nodes
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

                    // title of nodes
                    node.append("title")
                        .text(d => d.data.key);

                    //creates button for filtering
                    //opens tip when clicking
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
                        .on('mouseover', function (d) {
                            d3.select(this).style('font-size', 17)
                        })
                        .on('mouseout', function (d) {
                            d3.select(this).style('font-size', 10)
                        })
                        .on('click', function (d, i) {
                            console.log(d)
                            openTip(tip, d, i, collap)
                        })

                    rectWidth = 130;
                    //rectangle for literals
                     rectangles=nodeEnter.filter(function (d) {
                        if (d.depth >= 2 && d.depth < 4) return d;
                    })
                        .append("rect")
                        .attr("width", rectWidth+40)
                        .attr("height",40)
                        .attr("dy", 200)
                        .attr("dx", -40)
                        .style('opacity', 0.85)
                        .style("fill", function (d) {
                            return d.depth === 2 ? d.parent.color : d.depth === 3 ? d.parent.parent.color : d.depth === 4 ? d.parent.parent.parent.color : d.parent.parent.parent.parent.color
                        })

                    //visual nodes for new researchgroup
                    nodeEnter.filter(function (d) {
                        if (d.depth === 4) return d;
                    })
                        .append("circle")
                        .attr("r", 50)
                        // .style("display", "inline")
                        .on("mouseover", function (d) {
                            d3.select(this).attr("r", 70)
                        })
                        .on('mouseout', function (d) {
                            d3.select(this).attr("r", 50)
                        })
                        .style("fill", function (d) {
                            return d.parent.parent.parent.color
                        });


                    //text labels for nodes
                    nodeEnter.append("text")
                        .attr("dy", 0)
                        .attr("dx", 0)
                        .style("font-size", 15)
                        .attr("text-anchor", "start")
                        .style('overflow', 'scroll')
                        // .style("fill", "whitesmoke")
                        .text(function (d) {
                            if (d.depth !== 1)
                                return d.type + d.data.key ? d.data.key : d.data.value
                        }).each(function(d) {
                        calculateTextWrap(this,d);
                    })


                    //author icons for author nodes
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
                        .on("mouseover", function (d) {
                            d3.select(this).attr("width", 80);
                            d3.select(this).attr("height", 80)
                        })
                        .on('mouseout', function (d) {
                            d3.select(this).attr("width", 50);
                            d3.select(this).attr("height", 50)
                        })

                    //publication icons for publication nodes
                    nodeEnter.filter(function (d) {
                        if (d.data.type === 'title' &&d.depth===3) return d;
                    }).append("svg:image")
                        .attr("xlink:href", 'https://simpleicon.com/wp-content/uploads/note-5.png')
                        .attr("x", function (d) {
                            return -25;
                        })
                        .attr("y", function (d) {
                            return -25;
                        })
                        .attr("height", 35)
                        .attr("width", 35)
                        .on("mouseover", function (d) {
                            d3.select(this).attr("width", 60);
                            d3.select(this).attr("height", 60)
                        })
                        .on('mouseout', function (d) {
                            d3.select(this).attr("width", 35);
                            d3.select(this).attr("height", 35)
                        })

                    //opens new group as rootnode when clicking on group node
                    //updates navigation
                    nodeEnter.filter(function (d) {
                        if (d.depth === 4) return d;
                    })
                        .on('click', function (d) {
                            let navBar = document.getElementById('navBar');
                            while (navBar.childElementCount > 2) {
                                navBar.removeChild(navBar.lastChild)
                            }
                            let newArea = document.createElement('li');
                            newArea.className = 'breadcrumb-item active';
                            newArea.setAttribute = ('aria-current', 'page');
                            newArea.innerHTML = d.data.values[0].area.value
                            navBar.appendChild(newArea);
                            let newNav = document.createElement('li');
                            newNav.className = 'breadcrumb-item active';
                            newNav.setAttribute = ('aria-current', 'page');
                            newNav.innerHTML = d.data.key;
                            navBar.appendChild(newNav);

                            removeOldD3();

                            hierarchy = getNewHierarchyByGroup(d.data.key)
                            nodes = hierarchy.descendants().filter(n => n.data.value !== '' && n.data.value !== "")
                            nodes.map(n => {
                                if (n.depth === 1) {
                                    collapse(n)
                                }
                            })
                            update(hierarchy, false)
                            simulation.restart()
                        })


                    node = nodeEnter.merge(node);

                    //Listen for tick events to render the nodes as they update in your Canvas or SVG.
                    simulation
                        .nodes(nodes)

                    simulation.force("link")
                        .links(links);
                }

                //functions
                //-----------------------------------------------------------------------------------------------------------------

            function calculateTextWrap(element, data) {
                var text = d3.select(element);
                if (text.node().getComputedTextLength() < 150) {
                    //console.log("No need to wrap");
                    text.attr("y", 20)
                        .attr("x", 23)


                } else {
                    var words = text.text().split("").reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(0.35),
                        tspan = text
                            .text(null)
                            .append("tspan")
                            .attr("text-anchor", "start")
                            .attr("x", 0)
                            .attr("y", 20)
                            .attr("dy", dy + "em");


                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(""));
                        if (tspan.node().getComputedTextLength() > 150) {
                            lineNumber++;
                            line.pop();
                            tspan.text(line.join(""));
                            line = [word];
                            tspan = text
                                .append("tspan")
                                .attr("text-anchor", "start").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
                        }
                    }
                }
                /*var rectHeight = text.node().getBBox().height;
                if(rectHeight < 30) rectHeight = 30;*/
                data.rectHeight = lineNumber;
                console.log(lineNumber)
            }
                // This function is run at each iteration of the force algorithm, updating the nodes position (the nodes data array is directly manipulated).
                function ticked() {
                    link.attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                   rectangles
                       .attr("height", function(d) { return d.rectHeight? (d.rectHeight+2)*22:40})
                    rectangles.filter(n=>n.depth===3)
                       .on("mouseover", function (d) {
                           d3.select(this).style('color',  'black')
                       })
                       .on('mouseout', function (d) {
                           d3.select(this).attr("width", rectWidth+40);
                           d3.select(this).attr("height", function(d) { return d.rectHeight? (d.rectHeight+2)*22:40})
                       })

                    // node.attr("transform", d => `translate(${d.x},${d.y})`);
                    node.attr("transform",
                        function (d) {
                            return "translate(" + d.x + ", " + d.y + ")";
                        });
                    // edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
                }

                //When the drag gesture starts, the targeted node is fixed to the pointer
                function dragstarted(d) {
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].

                    d.fy = d.y;
                    d.fx = d.x;
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
                    console.log('CLICK')
                    console.log(d)
                    if (d3.event.defaultPrevented) return; // ignore drag
                    if (d.children) {
                        // d._children = d.children;
                        // d.children = null;
                        collapse(d)
                    } else {
                        function simulateForce(node) {
                            simulation.force('center', function (d) {
                                if (d === node) {
                                    return d3.forceCenter(width / 2, height / 1)
                                }
                            })
                        }

                        d.children = d._children;
                        d._children = null;
                    }
                    //allows just one node expanding
                    //source :https://stackoverflow.com/questions/19167890/d3-js-tree-layout-collapsing-other-nodes-when-expanding-one
                    if (d.parent) {
                        d.parent.children.forEach(function (element) {
                            if (d !== element && element.children !== null) {
                                element._children = element.children;
                                element.children = null;
                                removeOldD3()
                            }
                        });
                    }
                    update(hierarchy, false)
                    simulation.restart()
                }

                //closes all children from specific node
                function collapse(d) {
                    if (d.children) {
                        d._children = d.children;
                        d._children.forEach(collapse);
                        d.children = null;
                    }
                }

                //creates html element for filtering
                function openTip(tip, d, i, bool) {

                    let color = d.depth === 0 ? 'grey' : d.depth === 1 ? colorScale(d.data.key) : d.depth === 2 ? colorScale(d.parent.data.key) : colorScale(d.parent.parent.data.key)
                    tip.style("background", color);
                    tip.direction('e')
                    // checked()
                    // submitFilter(tip, d, i)
                    // leftMenuClicked(tip, d, i)

                    if (bool) {
                        tip.html(function (d) {
                            return "<div style='height: auto; overflow-x: hidden; overflow-y: auto' >" +
                                "<div class=row >" +
                                " <button align=\"right\" type=\"button\" class=\"btn btn-default\" style=\"color:white;\" id=leftMenuBtn><i class=\"bi bi-x-circle-fill\"></i></button> " +
                                "</div>" +
                                "<div class=form-check>" +
                                "<input class=form-check-input type=checkbox id=flexCheckDefault value='all'> " +
                                "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value='all'> show all publications</label> " +
                                "</div>" +
                                "<div class=\"d-grid gap-2\">" +
                                "<button class=\"btn btn-light\" type=\"button\" id=submitFilter><i class=\"bi bi-check2-square\"></i></button>" +
                                " </div>" +
                                "</div>"

                        })
                    } else {
                        tip.html(function (d) {
                            return "<div style='height: 500px; overflow-x: hidden; overflow-y: auto' ><div class=row >" +
                                "<div class=col> <p style='color:white; font-family: Monospace; font-weight: bold;'>show publications by author:</p> </div>" +
                                " <div class=col>" +
                                " <button align=\"right\" type=\"button\" class=\"btn btn-default\" style=\"color:white;\" id=leftMenuBtn><i class=\"bi bi-x-circle-fill\"></i></button> </div>" +
                                "</div>"

                                + getAuthors(d).map(el => {
                                    return "<div class=form-check>" +
                                        "<input class=form-check-input type=checkbox id=flexCheckDefault value='" + el + "'> " +
                                        "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value=" + el + ">" + el + "</label> </div>"
                                })
                                /* + "<p style='color:white; font-family: Monospace; font-weight: bold'>show publications by year:</p>"
                                 + getYears(d).map(el => {
                                     return "<div class=form-check>" +
                                         "<input class=form-check-input type=checkbox id=flexCheckDefault value='" + el.key + "'> " +
                                         "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value=" + el.key + ">" + el.key + "</label> </div>"
                                 })
                                 + "<p style='color:white; font-family: Monospace; font-weight: bold'>show publications by type:</p>"
                                 /!*+ getYears(d).map(el => {
                                     return "<div class=form-check>" +
                                         "<input class=form-check-input type=checkbox id=flexCheckDefault value='" + el.key + "'> " +
                                         "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value=" + el.key + ">" + el.key + "</label> </div>"
                                 })*!/*/
                                + "<div class=form-check>" +
                                "<input class=form-check-input type=checkbox id=flexCheckDefault value='all'> " +
                                "<label class=form-check-label style='color:white; font-family: Monospace' for=flexCheckDefault value='all'>ALL PUBLICATIONS</label> </div>"
                                + "<div class=\"d-grid gap-2\"><button class=\"btn btn-light\" type=\"button\" id=submitFilter><i class=\"bi bi-check2-square\"></i></button> </div> </div>"

                        })
                    }
                    if (d.depth === 0) {
                        tip.show(d, i)
                    }
                    $(document).ready(function () {
                        $('#submitFilter').click(function () {
                            tip.hide(d, i)
                            let name = $('.form-check-input:checked').val();
                            if (name === 'all') {
                                showNodesByGroup(d.data.key)
                            } else {
                                showNodesByAuthor(d, name)
                            }
                        })
                    })
                    $(document).ready(function () {
                        $('#leftMenuBtn').click(function () {
                            tip.hide(d, i)
                        })
                    })
                    $(document).on('click', '.form-check-input:checked', function () {
                        $(".form-check-input").prop("disabled", true);
                    });


                }

                //return list of all authors in chosen researchgroup
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
                    return authorList
                }

                function showNodesByAuthor(d, author) {

                    removeOldD3()
                    hierarchy = getNewHierarchyByAuthor(d, author)
                    nodes = hierarchy.descendants().filter(n => n.data.value !== '' && n.data.value !== "")
                    nodes.map(n => {
                        if (n.depth === 1) {
                            collapse(n)
                        }
                    })

                    update(hierarchy, true)
                    simulation.restart()

                }

                function showNodesByGroup(group) {
                    removeOldD3()

                    hierarchy = getNewHierarchyByGroup(group)
                    console.log(getNewHierarchyByGroup(group))
                    nodes = hierarchy.descendants().filter(n => n.data.value !== '' && n.data.value !== "")
                    nodes.map(n => {
                        if (n.depth === 1) {
                            collapse(n)
                        }
                    })

                    update(hierarchy, false)
                    simulation.restart()
                }

                //returns new hierarchy of new researchgroup
                //updates whole network chart
                function getNewHierarchyByGroup(newGroup) {
                    //load groupspecific data
                    let newGroupData = [];
                    allData.map(el => {
                        return el.values.map(elem => {
                            if (elem.key === newGroup) {
                                newGroupData = elem.values
                            }
                        })
                    })
                    // console.log(newGroupData)
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
                    itemsList.map(item => {
                        newGroupData.map(i => {
                            if (i.key === item.key) {
                                i.values.push(item.values[0].abstract ? item.values[0].abstract : 'No abstract')
                                i.values.push(item.values[0].date ? item.values[0].date : 'No date')
                                i.values.push(item.values[0].language ? item.values[0].language : 'No language')
                                i.values.push(item.values[0].document ? item.values[0].document : 'No URL')
                                i.values.push(item.values[0].title)

                            }
                        })
                    })
                    let newPackableItems = {key: newGroup, values: newGroupData};

                    //creating hierarchy
                    let newHierarchy = d3.hierarchy(newPackableItems, d => d.values);
                    groups = newPackableItems.values.map(el => {
                        return el.key
                    });

                    return newHierarchy
                }

                //creates hierarchy for filterd nodes
                //updates whole network chart
                function getNewHierarchyByAuthor(d, author) {
                    let groupname = d.data.key
                    //load groupspecific data
                    let newGroupData = [];
                    allData.map(el => {
                        el.values.map(elem => {
                            if (elem.key === groupname) {
                                elem.values.map(item => {
                                    item.values.map(meta => {
                                        if (meta.key === author) {
                                            newGroupData.push(item)
                                        }
                                    })
                                })
                            }
                        })
                    })
                    let newPackableItems = {key: groupname, values: newGroupData};
                    //creating hierarchy
                    let newHierarchy = d3.hierarchy(newPackableItems, d => d.values);
                    return newHierarchy
                }

                function removeOldD3() {
                    let s = d3.select('#nwSVG');
                    s.selectAll(".nodes").remove();
                    s.selectAll(".links").remove();
                    let leg = d3.select('#legendSVG');
                    leg.selectAll(".text").remove();
                    leg.selectAll(".circle").remove();
                    let t = d3.selectAll('.d3-tip')
                    t.remove()
                }

            }
        )

    }

    //called from outside
    //necessary for creating new network chart
    delete() {
        let svg = d3.select('#nwSVG');
        svg.select("g").remove();
        let legend = d3.select('#legendSVG');
        legend.selectAll("*").remove();
        let t = d3.selectAll('.d3-tip')
        t.remove()
    }


}

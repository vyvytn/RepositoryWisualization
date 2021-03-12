export default class NetworkChart {


    async drawChart() {

        await d3.json("./public/libraryItems.json", function (data) {

            let unsortedData = data.results.bindings;

            //nesting data
            let myNewData = d3.nest()
                .key(d => d.area.value)
                .key(d => d.group.value)
                .key(d => d.title.value)
                .key(d => d.author.value)

                .entries(unsortedData);

            let packableItems = {key: "Weizenbaum Library", values: myNewData[1].values};
            console.log(packableItems)

            //creating hierarchy
            let hierarchy = d3
                .hierarchy(packableItems, d => d.values);

            let nodes = hierarchy.descendants();
            console.log(nodes);

            /*   nodes=nodes.map((el,i)=> {
                   return el+={
                       type: el.depth===0? 'root' : el.depth===1? 'area' :el.depth===2? 'group' : 'item'
                   }
               })*/


            //getting links
            let links = hierarchy.links();

            links.map((el, index) => {
                    if (el.source.depth === 3) {
                        let id = nodes.indexOf(el.target);
                        console.log(id)
                        links[index].target = nodes[id].parent.parent;
                    }
                }
            )
            console.log(links)

            let width = 805
            let height = 765
            let margin = {top: 30, right: 80, bottom: 5, left: 5}

            let groups = packableItems.values.map(el => {
                return el.key
            });
            console.log(groups);
            // let groups = [1, 2, 3, 4, 5]

            let colorScale = d3.scaleOrdinal() //=d3.scaleOrdinal(d3.schemeSet2)
                .domain(groups)
                .range(['#ff9e6d', '#86cbff', '#c2e5a0', '#fff686', '#9e79db'])

            let simulation = d3.forceSimulation()
                .force("link", d3.forceLink() // This force provides links between nodes
                    .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
                    .distance(70) //DESIGN Abstand der Knoten zueinander
                )
                .force("charge", d3.forceManyBody().strength(-150)) // DESIGN Absto?en- Abstand zwischen Nodes
                .force("center", d3.forceCenter(width / 2, height / 2)); // This force attracts nodes to the center of the svg area - Chart ist mittig ausgerichtet
            /*

                        const dataset = {
                            nodes: [
                                {
                                    id: 1,
                                    name: '001-12345-001',
                                    teilbereich: 'PM/Stgt',
                                    label: 'KiAN: 70',
                                    group: 'Stuttgart',
                                    runtime: 700
                                },
                                {id: 2, name: '070-77777-001', teilbereich: 'BER/CH', label: '', group: 'Schweiz', runtime: 0},
                                {
                                    id: 3,
                                    name: '070-77777-002',
                                    teilbereich: 'BER/CH',
                                    label: 'KiAN: 25',
                                    group: 'Schweiz',
                                    runtime: 250
                                },
                                {id: 4, name: '001-34567-001', teilbereich: 'IDS/Stgt', label: '', group: 'Stuttgart', runtime: 0},
                                {id: 5, name: '001-34567-001', teilbereich: 'IDS/Stgt', label: '', group: 'Stuttgart', runtime: 0},
                                {id: 6, name: '024-98765-001', teilbereich: 'BER/A', label: '', group: 'Oesterreich', runtime: 0},
                                {id: 7, name: '001-34567-003', teilbereich: 'BER/Stgt', label: '', group: 'Stuttgart', runtime: 0}
                            ],
                            links: [
                                {source: 1, target: 2, type: '30'},
                                {source: 2, target: 1, type: '70'},
                                {source: 1, target: 3, type: '60'},
                                {source: 1, target: 4, type: '50'},
                                {source: 1, target: 5, type: '40'},
                                {source: 3, target: 6, type: '25'},
                                {source: 6, target: 3, type: '25'},
                                {source: 4, target: 7, type: '30'},
                                {source: 1, target: 7, type: '20'}
                            ]
                        };
            */


            const svg = d3.select('#nwSVG')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            //appending little triangles, path object, as arrowhead
//The <defs> element is used to store graphical objects that will be used at a later time
//The <marker> element defines the graphic that is to be used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.
            svg.append('defs').append('marker')
                .attr("id", 'arrowhead')
                .attr('viewBox', '-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
                .attr('refX', 50) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
                .attr('refY', 0)
                .attr('orient', 'auto')
                .attr('markerWidth', 5) //DESIGN Pfeilspitzenbreite
                .attr('markerHeight', 5)//DESIGN Pfeilspitzenh?he
                .attr('xoverflow', 'visible')
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#999')
                .style('stroke', 'none');

            const link = svg.selectAll(".links")
                .data(links)
                .enter()
                .append("line")
                .attr("class", "links")
                .attr('marker-end', 'url(#arrowhead)') //The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.


//The <title> element provides an accessible, short-text description of any SVG container element or graphics element.
//Text in a <title> element is not rendered as part of the graphic, but browsers usually display it as a tooltip.
            link.append("title")
                .text(d => d.key); //DESIGN tooltip text

            const edgepaths = svg.selectAll(".edgepath") //make path go along with the link provide position for link labels
                .data(links)
                .enter()
                .append('path')
                .attr('class', 'edgepath')
                .attr('fill-opacity', 0)
                .attr('stroke-opacity', 0)
                .attr('id', function (d, i) {
                    return 'edgepath' + i
                })

            // .style("pointer-events", "none");

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
            /*            edgelabels.append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
                            .attr('xlink:href', function (d, i) {
                                return '#edgepath' + i
                            })
                            .style("text-anchor", "middle")
                            .style("pointer-events", "none")
                            .attr("startOffset", "50%")
                            .text(d => 'contains');*/

// Initialize the nodes
            const node = svg.selectAll(".nodes")
                .data(nodes)
                .enter()
                .append("g")
                .attr("class", "nodes")
                .call(d3.drag() //sets the event listener for the specified typenames and returns the drag behavior.
                        .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
                        .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
                    //.on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
                )
                .on("click", function (d) {
                    node.append("text")
                        .attr("dy", 4)
                        .attr("dx", 10)
                        .text('filter')
                });

            node.append("circle")
                .attr("r", d => 10)
                .style("stroke", "grey")
                .style("stroke-opacity", 0.3)
                .style("stroke-width", d => d.runtime / 10)
                .style("fill", d => d.depth===0?'white':d.depth===1? colorScale(d.data.key):d.depth===2? colorScale(d.parent.data.key):colorScale(d.parent.parent.data.key))
                // .style("fill", 'white')


            /*node.append("title")
                .text(d => d.id + ": " + d.label + " - " + d.group +", runtime:"+ d.runtime+ "min");*/

            node.append("title")
                .text(d => d.data.key);


            /*     node.append("text")
                     .attr("dy", 4)
                     .attr("dx", -33)
                     .text(d =>'B');*/

            node.append("text")
                .attr("dy", 16)
                .attr("dx", -17)
                .text(d => d.data.key);


            //Listen for tick events to render the nodes as they update in your Canvas or SVG.
            simulation
                .nodes(nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(links);


// This function is run at each iteration of the force algorithm, updating the nodes position (the nodes data array is directly manipulated).
            function ticked() {
                link.attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node.attr("transform", d => `translate(${d.x},${d.y})`);

                edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
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

//the targeted node is released when the gesture ends
//   function dragended(d) {
//     if (!d3.event.active) simulation.alphaTarget(0);
//     d.fx = null;
//     d.fy = null;

//     console.log("dataset after dragged is ...",dataset);
//   }

            //drawing the legend
            const legend_g = svg.selectAll(".legend")
                .data(colorScale.domain())
                .enter().append("g")
                .attr("transform", (d, i) => `translate(${width},${i * 20})`);

            legend_g.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 5)
                .attr("fill", colorScale);

            legend_g.append("text")
                .attr("x", 10)
                .attr("y", 5)
                .text(d => d);
        })
    }

}

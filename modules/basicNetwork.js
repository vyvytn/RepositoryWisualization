export default class basicNetwork {


    async drawChart() {


        await d3.json("./public/libraryItems.json", function (data) {
           /*  d3.json("./public/libraryItems.json", function (data) {
                 let unsortedData = data.results.bindings;

                 //nesting data
                 let myNewData = d3.nest()
                     .key(d => d.area.value)
                     .key(d => d.group.value)
                     .key(d => d.title.value)
                     .key(d => d.author.value)
                     .entries(unsortedData);


                 let packableItems = {key: "Weizenbaum Library", values: myNewData};

                 //creating hierarchy
                 let hierarchy = d3
                     .hierarchy(packableItems, d => d.values);

                       let nodes = hierarchy.descendants();
                        console.log(nodes)

                 //getting links
                 let links = hierarchy.links();

                 console.log(links)

             })
*/

            let unsortedData = data.results.bindings;

            //nesting data
            let myNewData = d3.nest()
                .key(d => d.area.value)
                .key(d => d.group.value)
                .key(d => d.title.value)
                .key(d => d.author.value)
                .entries(unsortedData);


            let packableItems = {key: "Weizenbaum Library", values: myNewData};

            //creating hierarchy
            let hierarchy = d3
                .hierarchy(packableItems, d => d.values);

            let nodes = hierarchy.descendants();
            console.log(nodes)

            //getting links
            let links = hierarchy.links();

            console.log(links)

            // Initialize the links
// append the svg object to the body of the page
            // set the dimensions and margins of the graph
            var margin = {top: 10, right: 30, bottom: 30, left: 40},
                width = 800 - margin.left - margin.right,
                height = 800 - margin.top - margin.bottom;

            var svg = d3.select("#networkContainer")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
            var link = svg
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .style("stroke", "#aaa")

            // Initialize the nodes
            var node = svg
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", 20)
                .style("fill", "#69b3a2")

            // Let's list the force we wanna apply on the network
            var simulation = d3.forceSimulation(nodes)                 // Force algorithm is applied to data.nodes
                .force("link", d3.forceLink()                               // This force provides links between nodes
                    .id(function (d) {
                        return d.id;
                    })                     // This provide  the id of a node
                    .links(links)                                    // and this the list of links
                )
                .force("charge", d3.forceManyBody().strength(-100))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
                .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
                .on("end", ticked);

            // This function is run at each iteration of the force algorithm, updating the nodes position.
            function ticked() {
                link
                    .attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                node
                    .attr("cx", function (d) {
                        return d.x + 6;
                    })
                    .attr("cy", function (d) {
                        return d.y - 6;
                    });
            }

        });

    }
}
// const width = 1450;
// const height = 1300;
// const margin = {top: 100, left: 150};
const innerCircleRadius = 400; // Inner radius of the visualization (where the group arcs are positioned)
const outerCircleRadius = 410; // Outer radius of the visualization (including the flight time lines)

let groups = [];

// Set chart dimensions
let dimensions = {
  width: 1450,
  height: 1300,
  margin: {
    top: 100,
    right: 150,
    bottom: 0,
    left: 80,
  },
}

dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

async function radialViz(){

  // Load data

  const dataset = await d3.csv('./data/astronauts_nasa_1959-2017.csv').then(d =>
    {
     const aggreg = d3.flatGroup(d, grp => +grp.group, grp => +grp.year, grp => grp.group_name)
     aggreg.forEach(elem =>
       { const group = new Object();
         group['group'] = elem[0] || 'payload-specialist';
         group['year'] = elem[1];
         group['group_name'] = elem[2];
         group['astronauts'] = elem[3];
         groups.push(group);
       }
    )
  })

  const wrapper = d3.select('div#viz')
  .append('svg')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height);

  const bounds = wrapper.append('g')
  .style('transform', `translate(${dimensions.margin.left+outerCircleRadius}px, ${dimensions.margin.top+outerCircleRadius}px)`);


  // Format data into required layout

  const cirLayout = d3.pie()
  .value(d => d.astronauts.length)
  .sort(null);

  const groupFormatted = cirLayout(groups)

  // Create arc generator

  const arcGen = d3.arc()
      .innerRadius(innerCircleRadius)
      .outerRadius(outerCircleRadius)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .padAngle(0.01)
      .cornerRadius(16);

  console.log(groupFormatted)

  // Draw arc

  bounds.selectAll('g')
  .data(groupFormatted)
  .join('g')
  .attr('class', d => 'group-' + d.data.group)
  .append('path')
  .attr('d', arcGen)
  .attr('id', d => 'id-' + d.data.group)
  .style('fill', '#6794AD')


bounds.selectAll(".arcLabel")
    .data(groupFormatted)
    .join("text")
    .attr("class", "arcLabel")
    .attr('dy', d => d.endAngle > 2 && d.endAngle < 5 ? -8 : 30)
    .append("textPath")
    .attr('startOffset', d => d.endAngle > 2 && d.endAngle < 5 ? '75%' : '25%')
    .attr("text-anchor","middle")
    .attr("xlink:href", (d,i) => "#id-"+ d.data.group)
    .text(d => d.data.year == 0 ? 'Payload Specialists' : d.data.year)
    .style('font-size','.9rem');

  // bounds
  // .selectAll('text')
  // .data(groupFormatted)
  // .join('text')
  // .text(d => d.data.year == 0 ? 'Payload Specialists' : d.data.year)
  // .attr('x', d => arcGen.innerRadius(outerCircleRadius-80).centroid(d)[0])
  // .attr('y', d=> arcGen.innerRadius(outerCircleRadius-90).centroid(d)[1])
  // .attr('text-anchor','middle')













}

radialViz();

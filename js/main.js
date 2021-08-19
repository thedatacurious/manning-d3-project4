// const width = 1450;
// const height = 1300;
// const margin = {top: 100, left: 150};
const innerCircleRadius = 400; // Inner radius of the visualization (where the group arcs are positioned)
const outerCircleRadius = 410; // Outer radius of the visualization (including the flight time lines)

let groups = [];
let domain_space_flight_total_hours = [];
let domain_space_walks_total_hours = [];
let fatalities = [];

// Set chart dimensions
let dimensions = {
  width: 1450,
  height: 1300,
  margin: {
    top: 100,
    right: 100,
    bottom: 0,
    left: 300,
  },
}

dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

async function radialViz(){

  // Load data

  const dataset = await d3.csv('./data/astronauts_nasa_1959-2017.csv').then(d =>
    {domain_space_flight_total_hours = d3.extent(d.map(d => +d.space_flight_total_hours));
     domain_space_walks_total_hours = d3.extent(d.map(d => +d.space_walks_total_hours));

     fatalities = d.filter(d => d.death_mission != '');

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

    // return aggreg;
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
  .padAngle(0.01)
  .sort(null);

  const groupFormatted = cirLayout(groups)

  // Create arc generator

  const arcGen = d3.arc()
      .innerRadius(innerCircleRadius)
      .outerRadius(outerCircleRadius)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .cornerRadius(16);

  // Draw arc

  bounds.selectAll('g')
  .data(groupFormatted)
  .join('g')
  .attr('class', d => 'group group-' + d.data.group)
  .append('path')
  .attr('d', arcGen)
  .attr('id', d => 'id-' + d.data.group)
  .style('fill', '#92AEC9')

  bounds.selectAll('.group')
    .data(groupFormatted)
    .join('.group')
    .append("text")
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

  // Create scales
  const scale_space_flight_total_hours = d3.scaleLinear().domain(domain_space_flight_total_hours).range([0,300])
  const scale_space_walks_total_hours = d3.scaleLinear().domain(domain_space_walks_total_hours).range([0,300])

  // console.log(fatalities);

  groupFormatted.forEach((elem) => {

  let partition = (elem.endAngle-elem.startAngle-2*0.01)/elem.value;
  function endRadius(d){return scale_space_flight_total_hours(+d.space_flight_total_hours) + outerCircleRadius;}

  let point = d3.arc()
        .innerRadius(outerCircleRadius)
        .outerRadius(outerCircleRadius)

  bounds.select(`.group-${elem.data.group}`)
  .selectAll('line')
  .data(elem.data.astronauts)
  .join('line')
  // .attr('class',d => {
  //   if (d.death_mission == 'Apollo 1' ){return 'apollo';}
  //   if (d.death_mission == 'STS-107 (Columbia)' ){return 'colombia';}
  //   if (d.death_mission == 'STS 51-L (Challenger)' ){return 'challenger';}
  //   return
  // }
  // )
  .attr('x1', (d,i) =>
   point.startAngle(elem.startAngle+0.01+partition*i)
           .endAngle(elem.startAngle+0.01+partition*(i+1))
           .centroid(d)[0]
)
  .attr('y1', (d,i) =>
   point.startAngle(elem.startAngle+0.01+partition * i)
           .endAngle(elem.startAngle+0.01+partition*(i+1))
           .centroid(d)[1]
)
.attr('x2', (d,i) =>
  point.innerRadius(endRadius(d))
           .outerRadius(endRadius(d))
           .startAngle(elem.startAngle+0.01+partition* i)
           .endAngle(elem.startAngle+0.01+partition*(i+1))
           .centroid(d)[0]
)
.attr('y2', (d,i) =>
  point.innerRadius(endRadius(d))
           .outerRadius(endRadius(d))
           .startAngle(elem.startAngle+0.01+partition * i)
           .endAngle(elem.startAngle+0.01+partition*(i+1))
           .centroid(d)[1]
)
// .style('stroke-width', 2)
.style('stroke', d => d.military_force.length > 0 ? '#C2A83E' : '#718493');

bounds.select(`.group-${elem.data.group}`)
.selectAll('circle')
.data(elem.data.astronauts)
.join('circle')
.attr('cx', (d,i) =>
point.innerRadius(endRadius(d))
         .outerRadius(endRadius(d))
         .startAngle(elem.startAngle+0.01+partition* i)
         .endAngle(elem.startAngle+0.01+partition*(i+1))
         .centroid(d)[0]
)
.attr('cy', (d,i) =>
point.innerRadius(endRadius(d))
         .outerRadius(endRadius(d))
         .startAngle(elem.startAngle+0.01+partition * i)
         .endAngle(elem.startAngle+0.01+partition*(i+1))
         .centroid(d)[1]
)
.attr('r', d => Math.sqrt(scale_space_walks_total_hours(+d.space_walks_total_hours)))
.style('fill', d => d.military_force.length > 0 ? 'rgba(194, 168, 62, 0.35)' : 'rgba(113, 132, 147, 0.35)')

// console.log(elem)

  elem.data.astronauts.forEach((astronaut,i) => { // loop through each astronaut
    if (astronaut.death_mission != ''){
      console.log(astronaut.group)
      // if there is an astronaut in the group who died during mission, append the star
      bounds.select(`.group-${elem.data.group}`)
      .insert('image')
      .attr('xlink:href', d =>
      {if (astronaut.death_mission == 'Apollo 1' ){return 'assets/star_yellow.svg';}
      if (astronaut.death_mission == 'STS-107 (Columbia)' ){return 'assets/star_red.svg';}
      if (astronaut.death_mission == 'STS 51-L (Challenger)' ){return 'assets/star_green.svg';}
    })
      .attr('width', '15px')
      .attr('height', '15px')
      .attr('x', d => // d now refers to the group
      {let selected = d.data.astronauts[i];
        return point.innerRadius(endRadius(selected)+50)
                   .outerRadius(endRadius(selected)+50)
                   .startAngle(d.startAngle+0.01+partition* i)
                   .endAngle(d.startAngle+0.01+partition*(i+1))
                   .centroid(selected)[0]
      })
      .attr('y', d =>
      {let selected = d.data.astronauts[i];
        return point.innerRadius(endRadius(selected)+50)
                       .outerRadius(endRadius(selected)+50)
                       .startAngle(d.startAngle+0.01+partition * i)
                       .endAngle(d.startAngle+0.01+partition*(i+1))
                       .centroid(selected)[1];
      })
    }
  })

})

flightTime = [500, 5000, 10000]
const flightLegend = d3.select('div.flight-time')

const flightEntries = flightLegend
.append('svg')
.selectAll('g')
.data(flightTime)
.join('g')

flightEntries
.append('text')
.text(d => d3.format(',')(d) + ' hours')
.attr('x', d => 10+scale_space_flight_total_hours(d))
.attr('y', (d,i) => 30+25*i)
.attr('class','legend')



flightEntries
.append('line')
.attr('x1', 0)
.attr('y1', (d,i) => 30+25*i)
.attr('x2', d => scale_space_flight_total_hours(d))
.attr('y2',(d,i) => 30+25*i)
.style('stroke', '#718493')






console.log(domain_space_flight_total_hours)

}

radialViz();

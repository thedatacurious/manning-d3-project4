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
         group['group'] = elem[0] || 23;
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
    // .attr('class', d => 'group-' + d.data.group)
    .append("textPath")
    .attr('startOffset', d => d.endAngle > 2 && d.endAngle < 5 ? '75%' : '25%')
    .attr("text-anchor","middle")
    .attr("xlink:href", (d,i) => "#id-"+ d.data.group)
    // .attr('class', d => 'group-' + d.data.group)
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

  groupFormatted.forEach((elem, index) => {

  let partition = (elem.endAngle-elem.startAngle-2*0.01)/elem.value;
  function endRadius(d){return scale_space_flight_total_hours(+d.space_flight_total_hours) + outerCircleRadius;}

  let point = d3.arc()
        .innerRadius(outerCircleRadius)
        .outerRadius(outerCircleRadius)



  bounds.select(`.group-${elem.data.group}`)
  // .append('g')
  // .attr('class', `line-${elem.data.group}`)
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
  .attr('x1', (d,i) =>{
    groups[index].astronauts[i]['x1'] = point.startAngle(elem.startAngle+0.01+partition * i)
            .endAngle(elem.startAngle+0.01+partition*(i+1))
            .centroid(d)[0];
   return groups[index].astronauts[i]['x1'];
  }
)
  .attr('y1', (d,i) =>{
   groups[index].astronauts[i]['y1'] = point.startAngle(elem.startAngle+0.01+partition * i)
             .endAngle(elem.startAngle+0.01+partition*(i+1))
             .centroid(d)[1];
   return groups[index].astronauts[i]['y1'];
  }
)
.attr('x2', (d,i) =>{
  groups[index].astronauts[i]['x2'] = point.innerRadius(endRadius(d))
           .outerRadius(endRadius(d))
           .startAngle(elem.startAngle+0.01+partition* i)
           .endAngle(elem.startAngle+0.01+partition*(i+1))
           .centroid(d)[0];
  return groups[index].astronauts[i]['x2'];
  }
)
.attr('y2', (d,i) => {
  groups[index].astronauts[i]['y2'] = point.innerRadius(endRadius(d))
           .outerRadius(endRadius(d))
           .startAngle(elem.startAngle+0.01+partition * i)
           .endAngle(elem.startAngle+0.01+partition*(i+1))
           .centroid(d)[1];
  return groups[index].astronauts[i]['y2'];
  }
)
// .style('stroke-width', 2)
.style('stroke', d => d.military_force.length > 0 ? '#C2A83E' : '#718493');

bounds.select(`.group-${elem.data.group}`)
.selectAll('circle')
.data(elem.data.astronauts)
.join('circle')
.attr('cx', (d,i) => groups[index].astronauts[i]['x2'])
.attr('cy', (d,i) => groups[index].astronauts[i]['y2'])
.attr('r', (d,i) => {
  groups[index].astronauts[i]['radius'] = Math.sqrt(scale_space_walks_total_hours(+d.space_walks_total_hours));
  return groups[index].astronauts[i]['radius'];
  }
)
.style('fill', d => d.military_force.length > 0 ? 'rgba(194, 168, 62, 0.35)' : 'rgba(113, 132, 147, 0.35)')

// console.log(elem)

  elem.data.astronauts.forEach((astronaut,i) => { // loop through each astronaut
    if (astronaut.death_mission != ''){
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
        groups[index].astronauts[i]['xStar'] = point.innerRadius(endRadius(selected)+50)
                   .outerRadius(endRadius(selected)+50)
                   .startAngle(d.startAngle+0.01+partition* i)
                   .endAngle(d.startAngle+0.01+partition*(i+1))
                   .centroid(selected)[0];
        return groups[index].astronauts[i]['xStar'];
      })
      .attr('y', d =>
      {let selected = d.data.astronauts[i];
        groups[index].astronauts[i]['yStar'] = point.innerRadius(endRadius(selected)+50)
                   .outerRadius(endRadius(selected)+50)
                   .startAngle(d.startAngle+0.01+partition* i)
                   .endAngle(d.startAngle+0.01+partition*(i+1))
                   .centroid(selected)[1];
        return groups[index].astronauts[i]['yStar'];
      })
    }
  })

})

// Create legends

// console.log(domain_space_flight_total_hours)
flightTime = [500, 5000, 10000]
// console.log(domain_space_walks_total_hours)
spaceWalk = [20,40,60]

const flightLegend = d3.select('div.flight-time')

const flightEntries = flightLegend
.append('svg')
.selectAll('g')
.data(flightTime)
.join('g')

flightEntries
.append('text')
.text(d => d3.format(',')(d) + 'h')
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

const walkLegend = d3.select('div.time-in-spacewalk')

const walkEntries = walkLegend
.append('svg')
.selectAll('g')
.data(spaceWalk)
.join('g')

walkEntries
.append('text')
.text(d => d + 'h')
.attr('x',  45)
.attr('y', (d,i) => 15+20*i + (i+1)*Math.sqrt(scale_space_walks_total_hours(d)))
.attr('class','legend')

walkEntries
.append('circle')
.attr('cx', 20)
.attr('cy', (d,i) => 10+20*i + (i+1)*Math.sqrt(scale_space_walks_total_hours(d)))
.attr('r', d => Math.sqrt(scale_space_walks_total_hours(d)))
.style('fill', 'rgba(113, 132, 147, 0.35)')

// Add interactions

function smoothTransition(){return d3.transition().duration(500).delay(50).ease(d3.easeCubicOut);}

// console.log(d3.min(groupFormatted.map(d => d.value)))

//// Create line generator
const lineGen = d3.line();
const yStart = -outerCircleRadius;
const x = outerCircleRadius*1.3;
let initialPosition = [[x,yStart],[x,yStart]];


function openAstronautsList(e,d){
  closeAstronautsList();

  d3.select('button.close')
  .style('transform', `translate(${dimensions.boundedWidth+5}px,${dimensions.margin.top}px)`)
  .style('opacity', 1);

  d3.select(`.group-${d.data.group}`)
  .classed('is-open',true);

  //// Transform group arc into vertical line
  let arcLength = d3.max([30 * d.value, 120]) //(+d.endAngle - +d.startAngle)/(2*Math.PI)*(2*Math.PI*outerCircleRadius)
  const yEnd = arcLength-outerCircleRadius;
  let nextPosition = [[x,yStart],[x,yEnd]];

  //// Apply transformation to arc
  d3.select('.is-open')
  .select('path') //#id-${d.data.group}`)
  .attr('d', lineGen(initialPosition))
  .transition(smoothTransition())
  .attr('d', lineGen(nextPosition))
  .style('stroke', '#92AEC9')
  .style('stroke-width', '5')

  //// Apply transformation to arc label
  d3.select('.is-open')
  .select('text') //.group-${d.data.group}`)
  .attr('dy', 30)
  .select('textPath') //.group-${d.data.group}`)
  .attr('startOffset', '0%')
  .attr("text-anchor","start")
  .text(d => {
    let year = d.data.year == 0 ? '' : d.data.year
    let nickname = d.data.group_name
    return year + ' ' + nickname
  }
    )
  //// Apply transformation to astronaut lines indicating flight time
  d3.select('g.is-open')
  .selectAll('line')
  .transition(smoothTransition())
  .attr('x1', x + 5)
  .attr('y1', (d,i) => 15+yStart + i*30)
  .attr('x2', (d,i) =>  x + 5 + scale_space_flight_total_hours(+d.space_flight_total_hours))
  .attr('y2', (d,i) => 15+yStart + i*30)

  let groupIndex = 0;

  //// Apply transformation to astronaut circles indicating spacewalk time
  d3.select('g.is-open')
  .selectAll('circle')
  .transition(smoothTransition())
  .attr('cx', (d,i) =>  x + 5 + scale_space_flight_total_hours(+d.space_flight_total_hours))
  .attr('cy', (d,i) => 15 + yStart + i*30)
  .attr('r', (d,i) =>  {
    groupIndex = d.group == 'payload_specialist' ? 23-1 : +d.group-1;
    return groups[groupIndex].astronauts[i]['radius'];
  }
  )
  .style('fill', d => d.military_force.length > 0 ? 'rgba(194, 168, 62, 0.35)' : 'rgba(113, 132, 147, 0.35)')


  //// Apply transformation to astronaut stars indicating those who died during missions
  d3.select('g.is-open')
  .selectAll('image')
    .attr('x', () => x + 15 + scale_space_flight_total_hours(+d.space_flight_total_hours))
    .attr('y', () => 15 + yStart + i*30)

  // .transition(smoothTransition())

}


function closeAstronautsList(){
    d3.select('button.close')
    .style('opacity', 0);

    //// Revert transformation for arc
    d3.select('.is-open')
    .select('path')
    .attr('d', lineGen(initialPosition))
    .attr('d', arcGen)
    .style('stroke-width','1')

    //// Revert transformation for astronaut lines indicating flight time
    d3.select('.is-open')
    .select('text')
    .attr('dy', d => d.endAngle > 2 && d.endAngle < 5 ? -8 : 30)
    .select('textPath')
    .attr('startOffset', d => d.endAngle > 2 && d.endAngle < 5 ? '75%' : '25%')
    .attr("text-anchor","middle")
    .text(d => d.data.year == 0 ? 'Payload Specialists' : d.data.year);

    let groupIndex = 0;
    let astronautIndex = [];

    //// Revert transformation for astronaut circles indicating spacewalk time
    d3.select('.is-open')
    .selectAll('line')
    .transition(smoothTransition())
    .attr('x1', (d,i) => {
      groupIndex = d.group == 'payload_specialist' ? 23-1 : +d.group-1;    //in most cases, +d.group-1 gives the index of groups array
      return groups[groupIndex].astronauts[i]['x1']; //for payload specialist, the index is 22
  })
    .attr('y1', (d,i) => groups[groupIndex].astronauts[i]['y1'])
    .attr('x2', (d,i) => groups[groupIndex].astronauts[i]['x2'])
    .attr('y2', (d,i) => groups[groupIndex].astronauts[i]['y2'])

    d3.select('g.is-open')
    .selectAll('circle')
    .transition(smoothTransition())
    .attr('cx', (d,i) => groups[groupIndex].astronauts[i]['x2'])
    .attr('cy', (d,i) => groups[groupIndex].astronauts[i]['y2'])

    //// Revert transformation for astronaut stars indicating those who died during missions
    // d3.select('g.is-open')
    // .selectAll('image')
    //   .attr('x', (d,i) => {console.log(groups[groupIndex].astronauts)
    //    return groups[groupIndex].astronauts[astronautIndex]['xStar']})
    //   .attr('y', (d,i) => {
    //    return groups[groupIndex].astronauts[astronautIndex]['yStar']})

    d3.select('.is-open')
    .classed('is-open',false);





}

d3.selectAll('.group').on('click', openAstronautsList)

d3.select('button.close').on('click', closeAstronautsList)



}



radialViz();

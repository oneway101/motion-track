import React from 'react'
import * as d3 from 'd3'
import {select, line, curveBasis} from 'd3'

class Sketch extends React.Component {

  constructor(){
    super()
    this.dataArr = []
  }

  perform(skeleton) {
    this.dataArr.push(skeleton)
    console.log('performing', this.dataArr)

    const svg = select('svg')
    let selection = select('svg')
      .selectAll('circle')
      .data(this.dataArr)
      .enter()

    Object.keys(skeleton).forEach( joint => {
      if (joint === 'nose') {
        svg.append('circle')
          .attr('r', 5)
          .attr('cx', skeleton[joint].x)
          .attr('cy', skeleton[joint].y)
          .attr('stroke', 'red')
          .attr('fill', 'white')
      }
    })

    // let lineGenerator = line()
    //     .x(function(d){ return d.x })
    //     .y(function(d){ return d.y})
    //     .curve(curveBasis)

    // selection.append('path')
    // .attr('d', lineGenerator(this.dataArr))
    // .attr('stroke', 'black')
    // .attr('fill', 'none')

    // remove outdated data
    if (this.dataArr.length > 30) {
      this.dataArr.shift()
      //this.update()
    }

  }

  draw(skeleton) {
    console.log('drawing', this.dataArr)
    this.dataArr.push(skeleton)




    // Add new elements
    const selection = select('svg')
    selection
      .append('circle')
      .attr('r', 3)
      .attr('stroke', 'red')
      .attr('cx', function(d) {
        console.log(d)
        return d.x;
      })
      .style('cy', function(d) {
        console.log(d)
        return d.y;
      });

    // remove outdated data
    if (this.dataArr.length > 30) {
      this.dataArr.shift()
      //this.update()
    }

  }

  update() {
    // Perform the data join
    var selection = select('svg')
      .selectAll('circle')
      .data(this.dataArr);

    // Remove surplus elements
    selection.exit()
      .remove();

  }



  render() {
    const { skeleton } = this.props
    if (!skeleton) return (<div>No data</div>)
    this.perform(skeleton)
    return (
      <svg width='500' height='700'>
      </svg>
    )
  }

}


export default Sketch

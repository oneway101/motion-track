import React, {Fragment} from 'react'
import * as posenet from '@tensorflow-models/posenet'
import * as tf from '@tensorflow/tfjs'

class Capture extends React.Component {
  constructor() {
    super()
    this.videoWidth = 750
    this.videoHeight = 500
  }

  componentDidMount() {
    this.detectPoseInRealTime()
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: this.videoWidth,
        height: this.videoHeight
      }
    })
    const video = document.getElementById('video')
    video.srcObject = stream

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        resolve(video)
      }
    })
  }

  async loadVideo() {
    const video = await this.setupCamera()
    video.play()
    return video
  }

  stopStreamedVideo() {
    const video = document.getElementById('video')
    const stream = video.srcObject
    const tracks = stream.getTracks()

    tracks.forEach(function(track) {
      track.stop()
    })

    video.srcObject = null
  }

  async detectPoseInRealTime() {
    const canvas = document.getElementById('output')
    const ctx = canvas.getContext('2d')

    canvas.width = this.videoWidth
    canvas.height = this.videoHeight

    let poses = []
    try {
      const net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: {width: 640, height: 480},
        multiplier: 0.75
      })

      const video = await this.loadVideo()
      const pose = await net.estimateSinglePose(video, {
        flipHorizontal: true
      })
      poses.push(pose)
      console.log(poses)

      ctx.save()
      ctx.scale(-1, 1)
      ctx.translate(-this.videoWidth, 0)
      ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight)
      ctx.restore()
    } catch (err) {
      console.log(err)
    }
  }

  async loadPoseNetModel() {}

  render() {
    return (
      <Fragment>
        <div id="main">
          <video id="video" />
          <canvas id="output" />
          <button onClick={() => this.detectPoseInRealTime()}>Start</button>
          <button onClick={() => this.stopStreamedVideo()}>Stop</button>
        </div>
      </Fragment>
    )
  }
}

export default Capture

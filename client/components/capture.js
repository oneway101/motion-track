import React, {Fragment} from 'react'
import * as posenet from '@tensorflow-models/posenet'
import {drawKeypoints, drawSkeleton} from './utils'

class Capture extends React.Component {
  static defaultProps = {
    videoWidth: 900,
    videoHeight: 700,
    flipHorizontal: false,
    algorithm: 'single-pose',
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
    maxPoseDetections: 2,
    nmsRadius: 20,
    outputStride: 32,
    imageScaleFactor: 0.75,
    skeletonColor: '#ffadea',
    skeletonLineWidth: 6,
    loadingText: 'Loading...'
  }

  constructor(props) {
    super(props, Capture.defaultProps)
    this.net = null
    this.animationReqID = null
  }

  async start() {
    try {
      this.video = await this.setupCamera()
    } catch (err) {
      throw new Error('Video capture has failed')
    }

    try {
      this.net = await posenet.load()
    } catch (err) {
      console.log(err)
      throw new Error('PoseNet failed to load')
    }

    this.detectPoseInRealTime()
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }
    const {videoWidth, videoHeight} = this.props
    const video = document.getElementById('video')
    video.width = videoWidth
    video.height = videoHeight

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: videoWidth,
        height: videoHeight
      }
    })

    video.srcObject = stream

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play()
        resolve(video)
      }
    })
  }

  stopStreamedVideo() {
    const video = document.getElementById('video')
    const stream = video.srcObject
    const tracks = stream.getTracks()

    tracks.forEach(function(track) {
      track.stop()
    })

    video.srcObject = null
    cancelAnimationFrame(this.animationReqID)
  }

  detectPoseInRealTime() {
    const {
      algorithm,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      minPoseConfidence,
      minPartConfidence,
      maxPoseDetections,
      nmsRadius,
      videoWidth,
      videoHeight,
      showVideo,
      showPoints,
      showSkeleton,
      skeletonColor,
      skeletonLineWidth
    } = this.props

    // create canvas context
    const canvas = document.getElementById('canvas')
    const canvasContext = canvas.getContext('2d')
    canvas.width = videoWidth
    canvas.height = videoHeight

    const posenetModel = this.net
    const video = this.video

    const poseDetectionFrame = async () => {
      let poses = []

      const pose = await posenetModel.estimateSinglePose(
        video,
        imageScaleFactor,
        flipHorizontal,
        outputStride
      )
      poses.push(pose)

      canvasContext.clearRect(0, 0, videoWidth, videoHeight)

      if (showVideo) {
        canvasContext.save()
        canvasContext.scale(-1, 1)
        canvasContext.translate(-videoWidth, 0)
        canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight)
        canvasContext.restore()
      }

      poses.forEach(({score, keypoints}) => {
        console.log(score, keypoints)
        if (score >= minPoseConfidence) {
          if (showPoints) {
            drawKeypoints(keypoints, minPartConfidence, canvasContext)
          }
          if (showSkeleton) {
            drawSkeleton(keypoints, minPartConfidence, canvasContext)
          }
        }
      })
      this.animationReqID = requestAnimationFrame(poseDetectionFrame)
    }
    poseDetectionFrame()
  }

  render() {
    return (
      <Fragment>
        <div id="main">
          {/* <video id="video" playsInline ref={this.getVideo} />
          <canvas id="output" ref={this.getCanvas} /> */}
          <video id="video" playsInline />
          <canvas id="canvas" />
          <button onClick={() => this.start()}>Start</button>
          <button onClick={() => this.stopStreamedVideo()}>Stop</button>
        </div>
      </Fragment>
    )
  }
}

export default Capture

import React, {Component} from 'react';
import clickSoundPath from '../../assets/audio/click.m4a';
import countdownSoundPath from '../../assets/audio/beep_basic_c.mp3';
import shutterSoundPath from '../../assets/audio/chime_done.mp3';

export class PhotoPrompt extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countdown:  null,
            imgSrc:     null
        };
        this.clickSound     = new Audio(clickSoundPath);
        this.countdownSound = new Audio(countdownSoundPath);
        this.shutterSound   = new Audio(shutterSoundPath);

        this.userPhoto      = document.getElementById('user-photo');
        this.video          = document.getElementById('photo-booth-video');
        this.isFaceDetected = false;
        this.detectFace();
    }

    componentDidMount = () => setTimeout(this.startCountdown, 1000);

    renderFaceDetection = () => {
        const {countdown, imgSrc} = this.state;

        const canvasStyle = (imgSrc) ? {opacity: 0} : {opacity: 1};
        const imgStyle    = (imgSrc) ? {opacity: 1} : {opacity: 0};

        return (
            <div id="photo-booth-wrapper">
                <canvas width="240" height="240" ref={el => this.canvas = el} style={canvasStyle}/>
                <span ref={ref => this.digit = ref} className='digit'>{countdown}</span>
                <img style={imgStyle} src={imgSrc} alt='user'/>
            </div>
        );
    };

    renderButtons = () => {
        const style = (this.state.countdown === 0) ? {opacity: 1} : {opacity: 0};

        return (
            <div id='photo-buttons'>
                <button className='btn-gray'  style={style} onClick={this.onClickRetake}>retake</button>
            </div>
        )
    };

    onClickRetake = () => {
        this.countdownSound.play();

        this.setState({imgSrc: null}, this.startCountdown);
    };

    takePhoto = () => {
        this.shutterSound.play();
        this.cameraFlash.style.zIndex = 1000;
        this.cameraFlash.style.opacity = 1;

        const imgSrc = (this.isFaceDetected) ? this.canvas.toDataURL('image/png') : null;

        this.setState({imgSrc}, () => {
            setTimeout(() => {
                this.cameraFlash.style.opacity  = 0;
                this.cameraFlash.style.zIndex   = -1000;
            }, 200)
        });
    };

    detectFace = async () => {
        if (!this.video) {
            return;
        }

        if (this.video.paused || this.video.ended || !window.isFaceDetectionModelLoaded()) {
            setTimeout(() => { this.detectFace(); });
            return;
        }

        if (this.canvas) {
            const options = new window.faceapi.TinyFaceDetectorOptions(128, 0.5);
            const result = await window.faceapi.detectSingleFace(this.video, options);
            if (result) {
                window.drawPreview(this.video, this.canvas, result);
                this.isFaceDetected = true;
            }
            else {
                this.isFaceDetected = false;
                const context = this.canvas.getContext('2d');
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        setTimeout(() => { this.detectFace(); });
    };


    startCountdown = () => {
        this.setState({countdown: 3}, () => {
            if (this.digit) {
                window.photoPrompt = {
                    timerId: null,
                    digit: 3,
                    step: 0
                };

                this.countdownSound.play();
                window.photoPrompt.timerId = setInterval(this.onCountdown, 500);
            }
        })
    };

    onCountdown = () => {
        if (!window.photoPrompt) {
            return;
        }

        switch (window.photoPrompt.step) {
            case 0:
                this.digit.className = "digit in";
                break;

            case 1:
                this.digit.className = "digit out";
                break;

            default:
                this.digit.className = "digit";

                if (this.state.countdown > 1) {
                    this.countdownSound.play();
                }

                this.setState({countdown: this.state.countdown - 1}, () => (window.photoPrompt.step = -1));
                break;
        }

        window.photoPrompt.step++;

        if (this.state.countdown === 0) {
            this.stopCountdown();
            this.takePhoto();
            this.digit.style.opacity = 0;
        }
        else if (this.state.countdown === 3) {
            this.digit.style.opacity = 1;
        }
    };

    stopCountdown = () => {
        if(window.photoPrompt && window.photoPrompt.timerId){
            clearInterval(window.photoPrompt.timerId);
            delete window.photoPrompt;
        }
    };

    render() {
        return (
            <div id='body' className='photo-prompt-wrapper'>
                <div>
                    {this.renderFaceDetection()}
                    <div id='camera-flash' ref={el => this.cameraFlash = el}/>
                    {this.renderButtons()}
                </div>
            </div>
        )
    }
}
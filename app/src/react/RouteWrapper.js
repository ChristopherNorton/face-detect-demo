import React, {Component} from 'react';
import {PhotoPrompt} from "./screens/PhotoPrompt";

class RouteWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            readyToRecord: true,
        };

        this.video = document.getElementById('photo-booth-video');
    }

    componentDidMount = async () => {
        await window.changeFaceDetector('tiny_face_detector');
        window.changeInputSize(128);
        
        this.video.srcObject = await window.navigator.mediaDevices.getUserMedia({video: {}});
    };

    componentDidCatch = (error, errorInfo) => {
        console.log('error: ', error, 'errorInfo: ', errorInfo);
    };

    renderBody      = () => {
        const {updateScreen} = this.props;

        return <PhotoPrompt updateScreen={updateScreen} />;
    };

    render() {
        return (
            <div id='route-wrapper'>
                {this.renderBody()}
            </div>
        )
    }
}

export default RouteWrapper;
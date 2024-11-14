let localStream
let remoteStream
let peerConnection


const servers = {
    iceServers: [
       {
        urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
       }
    ]
}

let signalingSocket = new WebSocket("https://delicate-bunny-31073d.netlify.app/");

let init = async() => {
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    document.getElementById('user-1').srcObject = localStream;

    createOffer();
}

function toggleVideo() {
    console.log("video track clicked")
    const videoTrack = localStream.getVideoTracks()[0];
    let temp = videoTrack.enabled ? "Camera on" : "Camera off";
    document.getElementById('video-btn').innerText = temp;
    videoTrack.enabled = !videoTrack.enabled;  // Toggle enabled state
}

function toggleAudio() {
    console.log("audio track clicked")
    const audioTrack = localStream.getAudioTracks()[0];
    let temp = audioTrack.enabled ? "Unmute" : "Mute";
    document.getElementById('audio-btn').innerText = temp;
    audioTrack.enabled = !audioTrack.enabled;  // Toggle enabled state
}

document.getElementById('video-btn').addEventListener('click', toggleVideo);
document.getElementById('audio-btn').addEventListener('click', toggleAudio)



let createOffer = async () => {

    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();

    document.getElementById('user-2').srcObject = remoteStream;


    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });


    peerConnection.ontrack = (event) => {
        console.log("ontrack triggred")
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = (event) => {
        if(event.candidate) {
            signalingSocket.send(JSON.stringify({type: "candidate", candidate: event.candidate}));
        }
    }

    
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    signalingSocket.send(JSON.stringify({type: "offer", offer: peerConnection.localDescription}))
}

signalingSocket.onmessage = async (message) => {
    const data = JSON.parse(message.data);


    if(data.type === "offer"){

        peerConnection = new RTCPeerConnection(servers);

        remoteStream = new MediaStream();

        document.getElementById('user-2').srcObject = remoteStream;

        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });
    
    
        peerConnection.ontrack = (event) => {
            console.log("ontrack triggred from socket")
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track)
            })
        }
    
        peerConnection.onicecandidate = (event) => {
            if(event.candidate) {
                signalingSocket.send(JSON.stringify({type: "candidate", candidate: event.candidate}));
            }
        }

    
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        let answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        signalingSocket.send(JSON.stringify({type: "answer", answer:  answer}))
        
    }else if(data.type === "answer"){
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }else if(data.type === "candidate"){
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

init();




//////////////////////////////////////////////////////////////////////////////////////////////////
// let localStream
// let remoteStream
// let peerConnection


// const servers = {
//     iceServers: [
//        {
//         urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
//        }
//     ]
// }

// let signalingSocket = new WebSocket("ws://localhost:8080");

// let init = async() => {
//     localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
//     document.getElementById('user-1').srcObject = localStream;

//     createOffer();
// }

// let createOffer = async () => {

//     peerConnection = new RTCPeerConnection(servers);

//     remoteStream = new MediaStream();

//     document.getElementById('user-2').srcObject = remoteStream;


//     localStream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, localStream);
//     });


//     peerConnection.ontrack = (event) => {
//         console.log("ontrack triggred")
//         event.streams[0].getTracks().forEach((track) => {
//             remoteStream.addTrack(track)
//         })
//     }

//     peerConnection.onicecandidate = (event) => {
//         if(event.candidate) {
//             signalingSocket.send(JSON.stringify({type: "candidate", candidate: event.candidate}));
//         }
//     }

    
//     let offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
    
//     signalingSocket.send(JSON.stringify({type: "offer", offer: peerConnection.localDescription}))
// }

// signalingSocket.onmessage = async (message) => {
//     const data = JSON.parse(message.data);


//     if(data.type === "offer"){

//         peerConnection = new RTCPeerConnection(servers);

//         remoteStream = new MediaStream();

//         document.getElementById('user-2').srcObject = remoteStream;

//         localStream.getTracks().forEach((track) => {
//             peerConnection.addTrack(track, localStream);
//         });
    
    
//         peerConnection.ontrack = (event) => {
//             console.log("ontrack triggred from socket")
//             event.streams[0].getTracks().forEach((track) => {
//                 remoteStream.addTrack(track)
//             })
//         }
    
//         peerConnection.onicecandidate = (event) => {
//             if(event.candidate) {
//                 signalingSocket.send(JSON.stringify({type: "candidate", candidate: event.candidate}));
//             }
//         }

    
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
//         let answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
        
//         signalingSocket.send(JSON.stringify({type: "answer", answer:  answer}))
        
//     }else if(data.type === "answer"){
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
//     }else if(data.type === "candidate"){
//         await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
//     }
// }

// init();

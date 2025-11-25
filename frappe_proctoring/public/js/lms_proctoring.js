// Initialize proctoring when DOM is ready
(function () {
    console.log("[Proctoring] Script loaded, current URL:", window.location.pathname);

    function checkAndInit() {
        console.log("[Proctoring] Checking if on quiz page...");
        console.log("[Proctoring] Current pathname:", window.location.pathname);

        // Check if we are on an LMS Quiz page
        // Match patterns: /lms/quiz/, /Lms/quiz/, or any case variation
        const pathname = window.location.pathname.toLowerCase();
        const isQuizPage = pathname.includes("/lms/quiz") ||
            pathname.includes("/quiz/") ||
            document.querySelector('[data-quiz-name]') !== null ||
            document.querySelector('.quiz-submission') !== null;

        console.log("[Proctoring] Is quiz page?", isQuizPage);

        if (isQuizPage) {
            console.log("[Proctoring] Quiz page detected, initializing...");
            initProctoring();
        } else {
            console.log("[Proctoring] Not a quiz page, skipping initialization");
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        console.log("[Proctoring] Waiting for DOM...");
        document.addEventListener('DOMContentLoaded', checkAndInit);
    } else {
        console.log("[Proctoring] DOM already ready");
        checkAndInit();
    }
})();

let isCameraActive = false;
let isScreenActive = false;
let overlayElement = null;

function initProctoring() {
    console.log("Initializing Proctoring...");

    // Create Blocking Overlay
    overlayElement = document.createElement('div');
    overlayElement.id = 'proctoring-overlay';
    overlayElement.style.position = 'fixed';
    overlayElement.style.top = '0';
    overlayElement.style.left = '0';
    overlayElement.style.width = '100%';
    overlayElement.style.height = '100%';
    overlayElement.style.backgroundColor = 'rgba(0,0,0,0.9)';
    overlayElement.style.zIndex = '10000';
    overlayElement.style.display = 'flex';
    overlayElement.style.flexDirection = 'column';
    overlayElement.style.justifyContent = 'center';
    overlayElement.style.alignItems = 'center';
    overlayElement.style.color = 'white';
    overlayElement.innerHTML = `
        <h1>Proctoring Setup Required</h1>
        <p>Please allow Camera and Screen Sharing permissions to continue.</p>
        <div id="proctoring-status">
            <p>Camera: <span id="cam-status" style="color: red">Waiting...</span></p>
            <p>Screen: <span id="screen-status" style="color: red">Waiting...</span></p>
        </div>
        <button id="retry-proctoring" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">Retry Permissions</button>
    `;
    document.body.appendChild(overlayElement);

    document.getElementById('retry-proctoring').onclick = () => {
        startProctoringFlow();
    };

    // Create Video Overlay (Mini view)
    const videoContainer = document.createElement('div');
    videoContainer.style.position = 'fixed';
    videoContainer.style.bottom = '20px';
    videoContainer.style.right = '20px';
    videoContainer.style.width = '200px';
    videoContainer.style.height = '150px';
    videoContainer.style.border = '2px solid red';
    videoContainer.style.zIndex = '9999';
    videoContainer.style.backgroundColor = 'black';

    const videoElement = document.createElement('video');
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.autoplay = true;
    videoElement.muted = true;

    const statusText = document.createElement('div');
    statusText.innerText = "Proctoring Active";
    statusText.style.color = 'white';
    statusText.style.fontSize = '12px';
    statusText.style.textAlign = 'center';

    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(statusText);
    document.body.appendChild(videoContainer);

    startProctoringFlow(videoElement, statusText);
}

async function startProctoringFlow(videoElement, statusText) {
    // 1. Start Camera
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoElement) videoElement.srcObject = stream;

            isCameraActive = true;
            document.getElementById('cam-status').innerText = "Active";
            document.getElementById('cam-status').style.color = "green";

            startFrameTransmission(videoElement, statusText);
        } else {
            throw new Error("getUserMedia not supported");
        }
    } catch (error) {
        console.error("Error accessing camera:", error);
        document.getElementById('cam-status').innerText = "Failed";
    }

    // 2. Start Screen Capture
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = () => {
            alert("Screen sharing stopped. It is required for the exam.");
            isScreenActive = false;
            checkOverlay();
        };

        isScreenActive = true;
        document.getElementById('screen-status').innerText = "Active";
        document.getElementById('screen-status').style.color = "green";

        startScreenFrameTransmission(screenStream);

    } catch (error) {
        console.error("Error accessing screen:", error);
        document.getElementById('screen-status').innerText = "Failed";
    }

    checkOverlay();
}

function checkOverlay() {
    if (isCameraActive && isScreenActive) {
        if (overlayElement) {
            overlayElement.style.display = 'none';
        }
    } else {
        if (overlayElement) {
            overlayElement.style.display = 'flex';
            // Reset status text if failed
            if (!isCameraActive) document.getElementById('cam-status').innerText = "Failed/Waiting";
            if (!isScreenActive) document.getElementById('screen-status').innerText = "Failed/Waiting";
        }
    }
}

function startFrameTransmission(videoElement, statusText) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Send frame every 3 seconds
    setInterval(() => {
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            const dataURL = canvas.toDataURL('image/jpeg', 0.5); // Compress quality 0.5

            sendFrameToBackend(dataURL, 'process_frame', (r) => {
                if (r.message) console.log("Cam Status:", r.message);
            });
        }
    }, 3000);
}

function startScreenFrameTransmission(stream) {
    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    setInterval(async () => {
        if (track.readyState === 'ended') return;

        try {
            const bitmap = await imageCapture.grabFrame();
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext('2d');
            context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

            const dataURL = canvas.toDataURL('image/jpeg', 0.5);

            sendFrameToBackend(dataURL, 'process_screen_frame', (r) => {
                if (r.message) console.log("Screen Status:", r.message);
            });

        } catch (error) {
            console.error('Error capturing screen frame:', error);
        }
    }, 5000);
}

function sendFrameToBackend(dataURL, method, callback) {
    // Use fetch API if frappe is not available
    if (typeof frappe !== 'undefined' && frappe.call) {
        frappe.call({
            method: `frappe_proctoring.frappe_proctoring.api.${method}`,
            args: {
                image_data: dataURL
            },
            callback: callback,
            error: function (r) {
                console.log("Proctoring Error:", r);
            }
        });
    } else {
        // Fallback to fetch API
        fetch(`/api/method/frappe_proctoring.frappe_proctoring.api.${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Frappe-CSRF-Token': window.frappe ? frappe.csrf_token : ''
            },
            body: JSON.stringify({
                image_data: dataURL
            })
        })
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => console.log("Proctoring Error:", error));
    }
}


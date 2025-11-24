// Initialize proctoring when DOM is ready
(function () {
    function checkAndInit() {
        // Check if we are on an LMS Quiz page
        if (window.location.pathname.includes("/quiz/") ||
            window.location.pathname.includes("/lms/quiz/")) {
            initProctoring();
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndInit);
    } else {
        checkAndInit();
    }
})();

function initProctoring() {
    console.log("Initializing Proctoring...");

    // Create Video Overlay
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

    // Access Camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                videoElement.srcObject = stream;
                startFrameTransmission(videoElement, statusText);
            })
            .catch(function (error) {
                console.error("Error accessing camera:", error);
                if (typeof frappe !== 'undefined' && frappe.msgprint) {
                    frappe.msgprint("Error accessing camera. Proctoring is required for this quiz.");
                } else {
                    alert("Error accessing camera. Proctoring is required for this quiz.");
                }
                statusText.innerText = "Camera Blocked";
                statusText.style.color = 'red';
            });
    } else {
        console.error("getUserMedia not supported");
        statusText.innerText = "Browser Not Supported";
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

            // Use fetch API if frappe is not available
            if (typeof frappe !== 'undefined' && frappe.call) {
                frappe.call({
                    method: 'frappe_proctoring.frappe_proctoring.api.process_frame',
                    args: {
                        image_data: dataURL
                    },
                    callback: function (r) {
                        if (r.message) {
                            console.log("Proctoring Status:", r.message);
                        }
                    },
                    error: function (r) {
                        console.log("Proctoring Error:", r);
                        statusText.innerText = "Connection Error";
                        statusText.style.color = 'orange';
                    }
                });
            } else {
                // Fallback to fetch API
                fetch('/api/method/frappe_proctoring.frappe_proctoring.api.process_frame', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image_data: dataURL
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Proctoring Status:", data);
                    })
                    .catch(error => {
                        console.log("Proctoring Error:", error);
                        statusText.innerText = "Connection Error";
                        statusText.style.color = 'orange';
                    });
            }
        }
    }, 3000);
}

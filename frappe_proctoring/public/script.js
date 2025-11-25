//selecting all required elements
const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const exit_btn = info_box.querySelector(".buttons .quit");
const continue_btn = info_box.querySelector(".buttons .restart");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");
const waitTxt = document.querySelector(".result_box .wait_text");
const camOpen = document.querySelector(".camera")


// if startQuiz button clicked
start_btn.onclick = () => {
    info_box.classList.add("activeInfo"); //show info box
    camOpen;
};

// if exit quiz button clicked
exit_btn.onclick = () => {
    location.replace("./quiz.html");
};

// if continue quiz button clicked
continue_btn.onclick = () => {
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.add("activeQuiz") //show quiz
    showQuetions(0);
    queCounter(1);
    startTimer(15);
    startTimerLine(0);
    // cameraStart();
}

function showQuetions(index) {
    const que_text = document.querySelector(".que_text");

    // creating a new span and div tag for questions and option and passing the value using array
    let que_tag =
        "<span>" +
        questions[index].numb + ". " +
        questions[index].question +
        "</span>";

    let option_tag =
        '<div class="option"><span>' +
        questions[index].options[0] +
        "</span></div>" +
        '<div class="option"><span>' +
        questions[index].options[1] +
        "</span></div>" +
        '<div class="option"><span>' +
        questions[index].options[2] +
        "</span></div>" +
        '<div class="option"><span>' +
        questions[index].options[3] +
        "</span></div>";

    que_text.innerHTML = que_tag; //adding new span tag inside que_tag
    option_list.innerHTML = option_tag; //adding new div tag inside option_tag

    const option = option_list.querySelectorAll(".option");

    //set on-click attribute to all available options
    for (i = 0; i < option.length; i++) {
        option[i].setAttribute("onclick", "optionSelected(this)");
    }
}

let counter;
let counterLine;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let timeValue = 15;
let widthValue = 0;

let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

function optionSelected(answer) {
    clearInterval(counter); //clear counter
    clearInterval(counterLine); //clear counterLine
    let userAns = answer.textContent; //getting user selected option
    let correcAns = questions[que_count].answer; //getting correct answer
    const allOptions = option_list.children.length; //getting all options items

    if (userAns == correcAns) {
        userScore += 1; //incrementing the user's score
        answer.classList.add("correct"); //adding green color to correct selected option
        answer.insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to correct selected option
        console.log("Correct Answer");
        console.log("Your correct answer = " + userScore);
    }
    else {
        answer.classList.add("incorrect"); //adding red color to incorrect selected option
        answer.insertAdjacentHTML("beforeend", crossIconTag); //adding cross icon to incorrect selected option
        console.log("Wrong Answer");

        for (i = 0; i < allOptions; i++) {
            if (option_list.children[i].textContent == correcAns) {
                //if there is an option which is matched to an array answer
                option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
                option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
                console.log("Auto Selected correct answer.");
            }
        }
    }
    for (i = 0; i < allOptions; i++) {
        option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
    }
    next_btn.classList.add("show"); //show the next button if user selected any option
}

const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");

// if next ques button clicked
next_btn.onclick = () => {
    if (que_count < questions.length - 1) {
        //if question count is less than total questions
        que_count++;
        que_numb++;
        showQuetions(que_count);
        queCounter(que_numb);
        clearInterval(counter);
        clearInterval(counterLine);
        startTimer(timeValue);
        startTimerLine(widthValue);
        timeText.textContent = 'Time Left';
        next_btn.classList.remove("show");
    }
    else {
        clearInterval(counter);
        clearInterval(counterLine);
        showResult();
    }
};

function queCounter(index) {
    //creating a new span tag and passing the question number and total questions
    let totalQueCounTag =
        "<span><p>" +
        index +
        "</p> of <p>" +
        questions.length +
        "</p> Questions</span>"
    bottom_ques_counter.innerHTML = totalQueCounTag;
}

function startTimer(time) {
    counter = setInterval(timer, 1000);
    function timer() {
        timeCount.textContent = time; //changing the value of timeCount with time value
        time--; //decrement the time value

        if (time < 9) {
            //if timer is less than 9
            let addZero = timeCount.textContent;
            timeCount.textContent = "0" + addZero; //add a 0 before the time value
        }

        if (time < 0) {
            //if timer is less than 0
            clearInterval(counter);
            timeText.textContent = "Time Off"; //change the time text to timeOff
            const allOptions = option_list.children.length;
            let correcAns = questions[que_count].answer;
            for (i = 0; i < allOptions; i++) {
                if (option_list.children[i].textContent == correcAns) {
                    option_list.children[i].setAttribute("class", "option correct");
                    option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag);
                    console.log("Time Off: Auto selected correct answer.");
                }
            }
            for (i = 0; i < allOptions; i++) {
                option_list.children[i].classList.add("disabled");
            }
            next_btn.classList.add("show");
        }
    }
}

function startTimerLine(time) {
    counterLine = setInterval(timer, 29);
    function timer() {
        time += 1;
        time_line.style.width = time + "px";
        if (time > 549) {
            clearInterval(counterLine);
        }
    }
}

function showResult() {
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.remove("activeQuiz"); //hide quiz box
    result_box.classList.add("activeResult"); //show result box
    const scoreText = result_box.querySelector(".score_text");

    if (userScore > 3) {
        let scoreTag =
            "<span>Congrats! You got <p>" + userScore +
            "</p> out of <p>" + questions.length +
            "</p></span>";
        scoreText.innerHTML = scoreTag;
    }
    else {
        let scoreTag =
            "<span>Nice, You got <p>" + userScore +
            "</p> out of <p>" +
            questions.length +
            "</p></span>";
        scoreText.innerHTML = scoreTag;
    }
    // Wait for 10 seconds (10000 milliseconds) and then redirect to google.com
    setTimeout(function () {
        window.location.href = '/index';
    }, 10000);
}

// Disable screenshot
window.addEventListener('screenshotTaken', function (e) {
    e.preventDefault();
});

// Screen Capture Logic
let screenStream = null;

async function startScreenCapture() {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });

        const videoTrack = screenStream.getVideoTracks()[0];

        videoTrack.onended = () => {
            console.log("Screen sharing stopped by user");
            alert("Screen sharing is required for this exam. Please restart screen sharing.");
            // Optionally redirect or block exam
        };

        // Start sending frames
        sendScreenFrames(screenStream);

    } catch (err) {
        console.error("Error: " + err);
        alert("You must grant screen sharing permissions to take this exam.");
    }
}

async function sendScreenFrames(stream) {
    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    const intervalId = setInterval(async () => {
        if (track.readyState === 'ended') {
            clearInterval(intervalId);
            return;
        }

        try {
            const bitmap = await imageCapture.grabFrame();
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext('2d');
            context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

            const base64Image = canvas.toDataURL('image/jpeg', 0.5); // Compress to 0.5 quality

            // Send to backend
            fetch('/api/method/frappe_proctoring.frappe_proctoring.api.process_screen_frame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                body: JSON.stringify({
                    image_data: base64Image
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message && data.message.status === 'error') {
                        console.error("Server error processing screen frame:", data.message.message);
                    }
                })
                .catch(error => console.error('Error sending screen frame:', error));

        } catch (error) {
            console.error('Error capturing screen frame:', error);
        }
    }, 5000); // Capture every 5 seconds
}

// State tracking for proctoring
let isCameraActive = false;
let isScreenActive = false;

// Disable start button initially
start_btn.disabled = true;
start_btn.classList.add("disabled"); // Add a disabled class for styling if needed
start_btn.innerText = "Waiting for Camera & Screen...";

function checkProctoringStatus() {
    if (isCameraActive && isScreenActive) {
        start_btn.disabled = false;
        start_btn.classList.remove("disabled");
        start_btn.innerText = "Start Quiz";
    }
}

// Auto-start proctoring on load
window.addEventListener('load', async () => {
    console.log("Auto-starting proctoring...");

    // 1. Start Camera
    // Note: The original code had 'camOpen' which seemed to be a selector. 
    // We need to ensure the camera logic is actually triggered.
    // Assuming there is a 'cameraStart()' function or similar that was commented out or implicit.
    // If not, we need to implement a basic camera start here or call the existing one.
    // Looking at previous code, 'camOpen' was just a selector.
    // Let's implement a basic camera start if it's missing or use the existing one if found.

    try {
        await startCamera();
    } catch (e) {
        console.error("Camera start failed", e);
        alert("Camera access is required. Please allow camera access.");
    }

    // 2. Start Screen Capture
    try {
        await startScreenCapture();
    } catch (e) {
        console.error("Screen capture start failed", e);
        // Alert is already handled in startScreenCapture
    }
});

async function startCamera() {
    // Basic camera implementation if not present
    // This connects to the video element with class 'camera' if it exists
    const videoElement = document.querySelector(".camera video") || document.querySelector("video");

    if (navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoElement) {
                videoElement.srcObject = stream;
            }
            isCameraActive = true;
            checkProctoringStatus();

            // Start sending camera frames if needed (similar to screen frames)
            // For now, we assume the backend handles the stream or we just need it active.
            // If we need to send frames like screen capture:
            // sendCameraFrames(stream); 

        } catch (error) {
            console.error("Something went wrong with camera!", error);
            throw error;
        }
    }
}

// Modify startScreenCapture to update state
const originalStartScreenCapture = startScreenCapture;
startScreenCapture = async function () {
    try {
        // Call original logic
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });

        const videoTrack = screenStream.getVideoTracks()[0];

        videoTrack.onended = () => {
            console.log("Screen sharing stopped by user");
            alert("Screen sharing is required. Please refresh and share screen.");
            isScreenActive = false;
            start_btn.disabled = true;
            start_btn.innerText = "Screen Share Stopped";
        };

        // Start sending frames
        sendScreenFrames(screenStream);

        // Update state
        isScreenActive = true;
        checkProctoringStatus();

    } catch (err) {
        console.error("Error: " + err);
        alert("You must grant screen sharing permissions.");
        isScreenActive = false;
    }
}

// Original start button handler (only starts quiz now)
start_btn.onclick = () => {
    info_box.classList.add("activeInfo"); //show info box
    // camOpen; // This line was useless
};



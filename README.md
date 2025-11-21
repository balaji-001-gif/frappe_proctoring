# AI Based Online Exam Proctoring System for Frappe

This is a Frappe Application that integrates an AI-based proctoring system. It uses computer vision to monitor students during online exams, detecting faces, gaze, blinking, and objects.

## Features

- **Face Detection**: Detects if the student is present and if there are multiple faces.
- **Gaze Tracking**: Monitors where the student is looking.
- **Blink Detection**: Counts blinks to detect drowsiness or anomalies.
- **Object Detection**: Detects objects like mobile phones using YOLO.
- **Head Pose Estimation**: Tracks head movements.
- **Mouth Tracking**: Detects if the mouth is open or moving excessively.

## Installation

1.  **Get the App**:
    ```bash
    bench get-app https://github.com/balaji-001-gif/AI_Proctor_BK.git
    ```

2.  **Install the App**:
    ```bash
    bench --site [your-site-name] install-app frappe_proctoring
    ```

3.  **Install Python Dependencies**:
    This app requires several system-level dependencies for `dlib` and `opencv`. Ensure you have `cmake` installed.
    ```bash
    ./env/bin/pip install -r apps/frappe_proctoring/requirements.txt
    ```

## Usage

1.  **Start the Server**:
    ```bash
    bench start
    ```

2.  **Access the Proctoring Interface**:
    Navigate to:
    `http://[your-site-url]/frappe_proctoring/www/index.html`

3.  **Start Quiz**:
    Login and proceed to the quiz page. The camera feed will start automatically.

## Important Notes

- **Server-Side Camera**: Currently, the application is designed to access the webcam connected to the *server* running the Frappe bench. This is suitable for local deployments or specific kiosk setups. For web-based remote proctoring, client-side streaming (WebRTC) would be required (planned for future updates).
- **Large Models**: The app includes large pre-trained models for shape prediction and object detection.

## License

MIT

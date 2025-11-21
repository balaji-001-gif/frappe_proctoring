import cv2
import time
from datetime import datetime
from frappe_proctoring.frappe_proctoring.utils.facial_detections import detectFace
from frappe_proctoring.frappe_proctoring.utils.blink_detection import isBlinking
from frappe_proctoring.frappe_proctoring.utils.mouth_tracking import mouthTrack
from frappe_proctoring.frappe_proctoring.utils.object_detection import detectObject
from frappe_proctoring.frappe_proctoring.utils.eye_tracker import gazeDetection
from frappe_proctoring.frappe_proctoring.utils.head_pose_estimation import head_pose_detection

class ProctoringSession:
    def __init__(self):
        self.cam = cv2.VideoCapture(0)
        self.running = True
        self.data_record = []
        self.blink_count = 0

    def face_count_detection(self, face_count):
        if face_count > 1:
            return "Multiple faces has been detected."
        elif face_count == 0:
            return "No face has been detected."
        else:
            return "Face detecting properly."

    def get_placeholder_frame(self, message="Camera Unavailable"):
        import numpy as np
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(img, message, (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        _, buffer = cv2.imencode('.jpg', img)
        return buffer.tobytes()

    def get_frame(self):
        if not self.cam.isOpened():
            self.cam.open(0)
        
        ret, frame = self.cam.read()
        if not ret:
            return self.get_placeholder_frame()

        record = []
        try:
            current_time = datetime.now().strftime("%H:%M:%S.%f")
            record.append(current_time)

            face_count, faces = detectFace(frame)
            record.append(self.face_count_detection(face_count))

            if face_count == 1:
                # Blink Detection
                blink_status = isBlinking(faces, frame)
                if blink_status[2] == "Blink":
                    self.blink_count += 1
                    record.append(blink_status[2] + " count: " + str(self.blink_count))
                else:
                    record.append(blink_status[2])

                # Gaze Detection
                eye_status = gazeDetection(faces, frame)
                record.append(eye_status)

                # Mouth Position Detection
                record.append(mouthTrack(faces, frame))

                # Object detection
                object_name = detectObject(frame)
                record.append(object_name)

                # Head Pose estimation
                record.append(head_pose_detection(faces, frame))
            else:
                self.data_record.append(record)
            
            self.data_record.append(record)
        except Exception as e:
            print(f"Processing Error: {e}")
            # Continue yielding frame even if processing fails

        _, buffer = cv2.imencode('.jpg', frame)
        return buffer.tobytes()

    def process_external_frame(self, frame):
        """Process a frame received from an external source (e.g., client-side WebRTC)"""
        record = []
        try:
            current_time = datetime.now().strftime("%H:%M:%S.%f")
            record.append(current_time)

            face_count, faces = detectFace(frame)
            record.append(self.face_count_detection(face_count))

            if face_count == 1:
                # Blink Detection
                blink_status = isBlinking(faces, frame)
                if blink_status[2] == "Blink":
                    self.blink_count += 1
                    record.append(blink_status[2] + " count: " + str(self.blink_count))
                else:
                    record.append(blink_status[2])

                # Gaze Detection
                eye_status = gazeDetection(faces, frame)
                record.append(eye_status)

                # Mouth Position Detection
                record.append(mouthTrack(faces, frame))

                # Object detection
                object_name = detectObject(frame)
                record.append(object_name)

                # Head Pose estimation
                record.append(head_pose_detection(faces, frame))
            else:
                self.data_record.append(record)
            
            self.data_record.append(record)
            return record
            
        except Exception as e:
            print(f"Processing Error: {e}")
            return ["Error", str(e)]

    def stop(self):
        self.running = False
        if self.cam.isOpened():
            self.cam.release()
        return self.data_record

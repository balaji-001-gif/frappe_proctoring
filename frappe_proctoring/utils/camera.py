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

    def get_frame(self):
        if not self.cam.isOpened():
            self.cam.open(0)
        
        ret, frame = self.cam.read()
        if not ret:
            return None

        record = []
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

        _, buffer = cv2.imencode('.jpg', frame)
        return buffer.tobytes()

    def stop(self):
        self.running = False
        if self.cam.isOpened():
            self.cam.release()
        return self.data_record

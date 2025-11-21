# This will detect the face  

import dlib
import cv2
from imutils import face_utils
import os
import frappe

def get_model_path(path):
    return os.path.join(os.path.dirname(__file__), path)

detector = None
predictor = None

def load_models():
    global detector, predictor
    if detector is None:
        try:
            detector = dlib.get_frontal_face_detector()
            model_path = get_model_path("shape_predictor_model/shape_predictor_68_face_landmarks.dat")
            if not os.path.exists(model_path) or os.path.getsize(model_path) < 1000000: # Check if < 1MB (likely a git lfs pointer)
                print(f"WARNING: Model file missing or invalid (Git LFS issue?): {model_path}")
                return False
            predictor = dlib.shape_predictor(model_path)
        except Exception as e:
            print(f"Error loading facial detection models: {e}")
            return False
    return True

def detectFace(frame):
    if not load_models() or not predictor:
        return 0, []
    
    # ... rest of the function ...
    """
    Input: It will receive a video frame, from the front camera
    Output: Returns the counts of faces (detect all the faces and localize them) detected by the dlib's face detector
    """
    #Converting 3-channel images to 1-channel image
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faceDetector = dlib.get_frontal_face_detector()
    faces = faceDetector(gray,0)

    #Count the number of the faces
    faceCount = len(faces)

    for face in faces:

        x,y,w,h = face.left(), face.top(), face.width(), face.height()


        # Draw fancy corners of the rectangle around the face
        # Top left corner
        # cv2.circle(frame, (x, y), 10, (0, 255, 255), -1)
        cv2.line(frame, (x, y), (x + 20, y), (0, 255, 255), 2)
        cv2.line(frame, (x, y), (x, y + 20), (0, 255, 255), 2)

        # Top right corner
        # cv2.circle(frame, (x + w, y), 10, (255, 0, 0), -1)
        cv2.line(frame, (x + w, y), (x + w - 20, y), (0, 255, 255), 2)
        cv2.line(frame, (x + w, y), (x + w, y + 20), (0, 255, 255), 2)

        # Bottom left corner
        # cv2.circle(frame, (x, y + h), 10, (255, 0, 0), -1)
        cv2.line(frame, (x, y + h), (x + 20, y + h), (0, 255, 255), 2)
        cv2.line(frame, (x, y + h), (x, y + h - 20), (0, 255, 255), 2)
        
        # Bottom right corner
        # cv2.circle(frame, (x + w, y + h), 10, (255, 0, 0), -1)
        cv2.line(frame, (x + w, y + h), (x + w - 20, y + h), (0, 255, 255), 2)
        cv2.line(frame, (x + w, y + h), (x + w, y + h - 20), (0, 255, 255), 2)


        # cv2.rectangle(frame, (x,y), (x+w, y+h), (255,0,0), 2)

        #Determine the facial landmarks for the face region
        facialLandmarks = shapePredictor(gray, face)

        #Convert the facial landmark (x,y) coordinates to a numpy array
        facialLandmarks = face_utils.shape_to_np(facialLandmarks)

        for (a,b) in facialLandmarks:
            #Draw the circle on the face
            cv2.circle(frame, (a, b),2,(255,255,0),-1)


    return (faceCount, faces)
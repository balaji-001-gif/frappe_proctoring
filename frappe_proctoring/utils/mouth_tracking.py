import dlib
import cv2
import os
from math import hypot

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
            if not os.path.exists(model_path) or os.path.getsize(model_path) < 1000000:
                return False
            predictor = dlib.shape_predictor(model_path)
        except:
            return False
    return True

def calcDistance(pointA, pointB):

    #calc the Eucledian distance between point A and B
    dist = hypot((pointA[0]-pointB[0]), (pointA[1]-pointB[1]))
    return dist


def mouthTrack(faces, frame):
    if not load_models() or not predictor:
        return "Model Error"
    
    for face in faces:

        marks = predictor(frame, face)

        #outer lip top point
        outerTopX = marks.part(51).x
        outerTopY = marks.part(51).y

        #outer lip bottom point
        outerBottomX = facialLandmarks.part(57).x
        outerBottomY = facialLandmarks.part(57).y

        dist = calcDistance((outerTopX, outerTopY), (outerBottomX, outerBottomY))

        if (dist > 23):
            cv2.putText(frame, "Mouth Open", (50,80), cv2.FONT_HERSHEY_PLAIN,2,(0,0,255),2)
            return "Mouth Open"
        else:
            return "Mouth Close"
        return -1

        # cv2.putText(frame, "Threshold - "+ str(30), (50,400), cv2.FONT_HERSHEY_PLAIN,2,(0,255,255),5)
        
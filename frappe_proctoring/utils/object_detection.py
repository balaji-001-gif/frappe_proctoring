import cv2
import numpy as np
import time
import os

def get_model_path(path):
    return os.path.join(os.path.dirname(__file__), path)

net = None
classes = []

def load_models():
    global net, classes
    if net is None:
        try:
            weights = get_model_path("object_detection_model/yolov3.weights")
            cfg = get_model_path("object_detection_model/yolov3.cfg")
            names = get_model_path("object_detection_model/coco.names")
            
            if not os.path.exists(weights) or not os.path.exists(cfg):
                return False

            net = cv2.dnn.readNet(weights, cfg)
            with open(names, "r") as f:
                classes = [line.strip() for line in f.readlines()]
            
            # Define output_layers after net is loaded
            layer_names = net.getLayerNames()
            output_layers = [layer_names[layer[0] - 1] for layer in net.getUnconnectedOutLayers()]

        except Exception as e: # Catch specific exception for better debugging
            print(f"Error loading models: {e}")
            return False
    return True

# The original global definitions for layer_names and output_layers are moved inside load_models
# layer_names = net.getLayerNames()
# # print(type(layer_names))
# # layer_names = [i for i in layer_names]
# # print(type(layer_names))
# output_layers = [layer_names[layer-1] for layer in net.getUnconnectedOutLayers()]

# Assuming label_classes should be 'classes' from coco.names
colors = np.random.uniform(0,255,size=(len(classes),3))

font = cv2.FONT_HERSHEY_PLAIN
start_time = time.time()
frame_id = 0

def detectObject(frame):

    if not load_models() or net is None or output_layers is None:
        return []

    labels_this_frame = []

    height, width, _ = frame.shape

    blob = cv2.dnn.blobFromImage(frame, 1/255, (416, 416), (0,0,0), swapRB=True, crop=False)

    #Feeding Blob as an input to our Yolov3-tiny model
    net.setInput(blob)

    #Output labels received at the output of model
    outs = net.forward(output_layers)

    #show informations on the screen
    class_ids = []
    confidences = []
    boxes = []

    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            if confidence > 0.5:

                #object detected
                center_x = int(detection[0]*width)
                center_y = int(detection[1]*height)

                w = int(detection[2]*width)
                h = int(detection[3]*height)

                #rectangle co-ordinates
                x = int(center_x - w/2)
                y = int(center_y - h/2)

                boxes.append([x,y,w,h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

    for i in range(len(boxes)):
        if i in indexes:
            #show the box only if it comes in non-max supression box
            #x,y,w,h = boxes[i]
            label = str(label_classes[class_ids[i]])

            #color = colors[class_ids[i]]
            labels_this_frame.append((label, confidences[i]))
            # cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
	 		# cv2.putText(frame, label, (x, y + 30), font, 3, color, 3)

    return labels_this_frame
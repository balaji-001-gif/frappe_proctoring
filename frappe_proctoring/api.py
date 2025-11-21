import frappe
from werkzeug.wrappers import Response

# Global session store (simple implementation for single user/session)
session_store = {}

@frappe.whitelist()
def start_proctoring():
    from frappe_proctoring.frappe_proctoring.utils.camera import ProctoringSession
    user = frappe.session.user
    if user not in session_store:
        try:
            session_store[user] = ProctoringSession()
        except Exception as e:
            frappe.log_error(f"Proctoring Error: {str(e)}")
            return f"Error starting session: {str(e)}"
    return "Started"

@frappe.whitelist()
def stop_proctoring():
    user = frappe.session.user
    if user in session_store:
        data = session_store[user].stop()
        del session_store[user]
        return data
    return "No session found"

def video_feed():
    user = frappe.session.user
    # Note: This might not work perfectly with standard Frappe auth in a raw route
    # For now, we assume a single global session for simplicity or need a way to pass session ID
    # This is a limitation of the "direct port" approach without a proper streaming server
    
    # Fallback to a global instance if user context is lost in raw route
    # In production, use a token or session ID in URL
    
    proctoring_session = None
    if session_store:
        proctoring_session = list(session_store.values())[0]
    
    if not proctoring_session:
        return Response("No active session", status=404)

    def generate():
        while True:
            frame = proctoring_session.get_frame()
            if frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            else:
                break

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@frappe.whitelist()
def process_frame(image_data):
    import base64
    import cv2
    import numpy as np
    from frappe_proctoring.frappe_proctoring.utils.camera import ProctoringSession

    user = frappe.session.user
    if user not in session_store:
        # Auto-start session if not exists
        try:
            session_store[user] = ProctoringSession()
        except Exception as e:
            return {"status": "error", "message": str(e)}

    session = session_store[user]
    
    try:
        # Decode base64 image
        header, encoded = image_data.split(",", 1)
        data = base64.b64decode(encoded)
        nparr = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Process frame (using existing logic)
        # We need to adapt ProctoringSession to accept an external frame
        # For now, we'll just run the detections directly or add a method to ProctoringSession
        
        result = session.process_external_frame(frame)
        return {"status": "success", "analysis": result}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

import frappe
from frappe_proctoring.frappe_proctoring.utils.camera import ProctoringSession
from werkzeug.wrappers import Response

# Global session store (simple implementation for single user/session)
# In a real app, this should be managed per user/session ID
session_store = {}

@frappe.whitelist()
def start_proctoring():
    user = frappe.session.user
    if user not in session_store:
        session_store[user] = ProctoringSession()
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

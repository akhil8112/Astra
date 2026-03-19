import cv2
import mediapipe as mp
import numpy as np

# --- Initialization (This is fine, it runs only once) ---
mp_hands = mp.solutions.hands
hands = mp.solutions.Hands(max_num_hands=1, min_detection_confidence=0.7)
# ---------------------------------------------------------

def process_frame_for_magic_canvas(frame_bytes: bytes) -> dict:
    """
    Processes a single video frame to detect hand gestures for the Magic Canvas.
    This function is STATELESS and does not draw anything. It only returns data.
    """
    try:
        # Decode image bytes to a numpy array
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"isDrawing": False, "x": None, "y": None, "gesture": "Error"}

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        
        # Process the frame with MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        # Default response if no hand is detected
        response = {"isDrawing": False, "x": None, "y": None, "gesture": "No hand"}

        if results.multi_hand_landmarks:
            lm = results.multi_hand_landmarks[0].landmark
            
            # Get coordinates of the index finger tip
            index_finger_tip_x = int(lm[8].x * w)
            index_finger_tip_y = int(lm[8].y * h)

            # Check if the index finger is up and the middle finger is down (Drawing Gesture)
            is_index_up = lm[8].y < lm[6].y
            is_middle_up = lm[12].y < lm[10].y

            if is_index_up and not is_middle_up:
                response = {
                    "isDrawing": True,
                    "x": index_finger_tip_x,
                    "y": index_finger_tip_y,
                    "gesture": "Drawing"
                }
            else:
                # Any other gesture stops the drawing
                response = {
                    "isDrawing": False,
                    "x": index_finger_tip_x,
                    "y": index_finger_tip_y,
                    "gesture": "Not Drawing"
                }
                
        return response

    except Exception as e:
        print(f"Error processing frame: {e}")
        return {"isDrawing": False, "x": None, "y": None, "gesture": "Error"}
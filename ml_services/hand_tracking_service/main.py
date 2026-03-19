import asyncio
import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from websockets.exceptions import ConnectionClosed

# --- Basic FastAPI App Setup ---
app = FastAPI()

# --- MediaPipe Hand Tracking Setup ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1, # We only need to track one hand for our use case
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7,
)
mp_drawing = mp.solutions.drawing_utils

# --- WebSocket Endpoint for Hand Tracking ---
@app.websocket("/ws/track")
async def websocket_endpoint(websocket: WebSocket):
    """
    This WebSocket endpoint receives raw video frames (as bytes),
    processes them using MediaPipe Hand Tracking, and sends back
    the detected landmark coordinates.
    """
    await websocket.accept()
    print("Client connected to hand tracking service.")
    
    try:
        while True:
            # Receive image data from the client
            image_bytes = await websocket.receive_bytes()
            
            # 1. Decode the image bytes into an OpenCV image
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                print("Could not decode image.")
                continue

            # 2. Process the frame with MediaPipe
            # Convert the BGR image to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb_frame.flags.writeable = False # Improve performance
            
            results = hands.process(rgb_frame)
            
            # 3. Extract and send landmarks if a hand is detected
            landmarks_data = {"landmarks": []}
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0] # Get the first hand
                
                # Create a list of all 21 landmark coordinates
                landmarks_list = []
                for landmark in hand_landmarks.landmark:
                    landmarks_list.append({"x": landmark.x, "y": landmark.y, "z": landmark.z})
                
                landmarks_data["landmarks"] = landmarks_list

            # Send the data back to the client as JSON
            await websocket.send_json(landmarks_data)

    except (WebSocketDisconnect, ConnectionClosed):
        print("Client disconnected.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        print("Closing connection.")



@app.get("/")
def read_root():
    return {"Status": "Hand Tracking Service is running"}
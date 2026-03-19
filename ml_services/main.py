import cv2
import mediapipe as mp
import pygame
import time
import numpy as np
import random

# --- Initialization ---
pygame.mixer.init()

# --- Load Sounds ---
# Make sure you have these sound files in a 'sounds' folder
sounds = {
    'crash': pygame.mixer.Sound('sounds/crash.mp3'),
    'hi_hat': pygame.mixer.Sound('sounds/hi_hat.mp3'),
    'kick-drum': pygame.mixer.Sound('sounds/kick-drum.mp3'),
    'snare-drum': pygame.mixer.Sound('sounds/snare-drum.mp3'),
    # You can find simple .wav files online for success/failure sounds
    'success': pygame.mixer.Sound('sounds/success.mp3'),
    'failure': pygame.mixer.Sound('sounds/failure.mp3')
}

# --- Define Drum Zones ---
drum_zones = {
    (0.7, 0.1, 0.9, 0.4): {'name': 'crash', 'color': (0, 255, 0), 'last_hit': 0},
    (0.1, 0.1, 0.3, 0.4): {'name': 'hi_hat', 'color': (255, 0, 0), 'last_hit': 0},
    (0.1, 0.6, 0.3, 0.9): {'name': 'kick-drum', 'color': (0, 0, 255), 'last_hit': 0},
    (0.7, 0.6, 0.9, 0.9): {'name': 'snare-drum', 'color': (255, 255, 0), 'last_hit': 0}
}

HIT_COOLDOWN = 1.50 # A half-second delay between hits

# --- Initialize MediaPipe ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# --- Game Sequence Logic Variables ---
sequence = ['hi_hat', 'snare-drum', 'kick-drum', 'crash']
random.shuffle(sequence)
current_step_in_sequence = 0

# --- Start Webcam Capture ---
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        continue

    # Flip the frame and get dimensions
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    
    # Create a transparent overlay for the glowing effect
    overlay = frame.copy()
    
    # --- Drawing Logic with Continuous Highlighting ---
    drum_to_hit = sequence[current_step_in_sequence]

    for zone, data in drum_zones.items():
        x1_norm, y1_norm, x2_norm, y2_norm = zone
        start_point = (int(x1_norm * w), int(y1_norm * h))
        end_point = (int(x2_norm * w), int(y2_norm * h))
        
        # Highlight the next drum in the sequence
        if data['name'] == drum_to_hit:
            # Draw a filled rectangle on the overlay for the glow effect
            cv2.rectangle(overlay, start_point, end_point, data['color'], -1)
            
            # Blend the overlay with the original frame
            alpha = 0.4 # Transparency factor
            frame = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)
            
            # Add a more prominent text cue
            cv2.putText(frame, "HIT THIS!", (start_point[0], end_point[1] + 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 3)

        # Draw the outer box and text
        cv2.rectangle(frame, start_point, end_point, data['color'], 2)
        cv2.putText(frame, data['name'], (start_point[0], start_point[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, data['color'], 2)

    # --- Hand Tracking and Hit Detection ---
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            
            landmarks_to_check = [mp_hands.HandLandmark.INDEX_FINGER_TIP, mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
            current_time = time.time()

            for landmark_index in landmarks_to_check:
                landmark = hand_landmarks.landmark[landmark_index]
                
                for zone, data in drum_zones.items():
                    x1_norm, y1_norm, x2_norm, y2_norm = zone
                    
                    if x1_norm < landmark.x < x2_norm and y1_norm < landmark.y < y2_norm:
                        if current_time - data['last_hit'] > HIT_COOLDOWN:
                            data['last_hit'] = current_time
                            
                            # Check if the correct drum was hit
                            if data['name'] == drum_to_hit:
                                print(f"Correct! Hit {drum_to_hit}")
                                sounds[data['name']].play()
                                sounds['success'].play()
                                current_step_in_sequence += 1
                                
                                # Check if sequence is complete
                                if current_step_in_sequence >= len(sequence):
                                    print("Sequence Complete! Starting new round.")
                                    current_step_in_sequence = 0
                                    random.shuffle(sequence) # Create a new sequence
                            else:
                                print(f"Wrong! You hit {data['name']}, but needed {drum_to_hit}. Resetting.")
                                sounds['failure'].play()
                                current_step_in_sequence = 0 # Reset on wrong hit
                            break 

    # --- Display the Frame ---
    cv2.imshow('Magic Drums', frame)
    if cv2.waitKey(5) & 0xFF == ord('q'):
        break

# --- Cleanup ---
cap.release()
cv2.destroyAllWindows()
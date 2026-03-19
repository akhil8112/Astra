import cv2
import mediapipe as mp
import numpy as np
import time

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)
cap = cv2.VideoCapture(0)

ret, frame = cap.read()
h, w, _ = frame.shape
canvas = np.ones((h, w, 3), dtype="uint8") * 255

colors = [(0,0,0), (0,0,255), (0,255,0), (255,0,0), (0,255,255), (255,0,255)]
color_names = ["Black","Red","Green","Blue","Yellow","Magenta"]
selected_color = colors[0]

brush_sizes = [4, 8, 16]
brush_names = ["S", "M", "L"]
selected_brush = brush_sizes[1]

extra_buttons = ["Save","Clear"]

prev_x, prev_y = 0, 0
drawing = False

def draw_toolbar(img, selected_color_idx, selected_brush_idx):
    h, w, _ = img.shape
    toolbar_height = int(h * 0.08)
    total_buttons = len(colors) + len(brush_sizes) + len(extra_buttons)
    btn_width = w // total_buttons

    # Colors
    for i, col in enumerate(colors):
        x1, y1, x2, y2 = i*btn_width, 0, (i+1)*btn_width, toolbar_height
        cv2.rectangle(img, (x1,y1), (x2,y2), col, -1)
        if i == selected_color_idx:
            cv2.rectangle(img, (x1,y1), (x2,y2), (255,255,255), 2)
        cv2.putText(img, color_names[i], (x1+5,y1+toolbar_height-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

    # Brushes
    for j, name in enumerate(brush_names):
        idx = len(colors)+j
        x1, y1, x2, y2 = idx*btn_width, 0, (idx+1)*btn_width, toolbar_height
        cv2.rectangle(img, (x1,y1), (x2,y2), (100,100,100), -1)
        if j == selected_brush_idx:
            cv2.rectangle(img, (x1,y1), (x2,y2), (255,255,255), 2)
        cv2.putText(img, name, (x1+btn_width//3, y1+toolbar_height-15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    # Extra buttons
    start_idx = len(colors) + len(brush_sizes)
    for k, name in enumerate(extra_buttons):
        idx = start_idx + k
        x1, y1, x2, y2 = idx*btn_width, 0, (idx+1)*btn_width, toolbar_height
        cv2.rectangle(img, (x1,y1), (x2,y2), (50,50,50), -1)
        cv2.putText(img, name, (x1+10,y1+toolbar_height-15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    if canvas.shape[:2] != (h, w):
        canvas = np.ones((h, w, 3), dtype="uint8") * 255

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        lm = results.multi_hand_landmarks[0].landmark
        x1, y1 = int(lm[8].x * w), int(lm[8].y * h)
        x2, y2 = int(lm[12].x * w), int(lm[12].y * h)

        fingers = [lm[i].y < lm[i-2].y for i in [8,12,16,20]]
        thumb = lm[4].x > lm[3].x
        if all(fingers) and thumb:
            canvas[:] = 255
            prev_x, prev_y = 0,0
            drawing = False

        toolbar_height = int(h * 0.08)
        total_buttons = len(colors) + len(brush_sizes) + len(extra_buttons)
        btn_width = w // total_buttons

        if y1 < toolbar_height:
            btn_idx = x1 // btn_width
            if btn_idx < len(colors):
                selected_color = colors[btn_idx]
            elif btn_idx < len(colors) + len(brush_sizes):
                selected_brush = brush_sizes[btn_idx - len(colors)]
            elif btn_idx == len(colors) + len(brush_sizes):
                cv2.imwrite("drawing.png", canvas)
            elif btn_idx == len(colors) + len(brush_sizes) + 1:
                canvas[:] = 255
            prev_x, prev_y = 0,0

        elif lm[8].y < lm[6].y and not (lm[12].y < lm[10].y):
            if prev_x == 0 and prev_y == 0:
                prev_x, prev_y = x1, y1
            cv2.line(canvas, (prev_x, prev_y), (x1, y1), selected_color, selected_brush)
            prev_x, prev_y = x1, y1
            drawing = True

        elif lm[8].y < lm[6].y and lm[12].y < lm[10].y:
            cv2.circle(canvas, (x1, y1), 30, (255,255,255), -1)
            prev_x, prev_y = 0, 0
            drawing = False
        else:
            prev_x, prev_y = 0, 0
            drawing = False

    overlay = cv2.addWeighted(frame, 0.5, canvas, 0.5, 0)
    draw_toolbar(overlay, colors.index(selected_color), brush_sizes.index(selected_brush))
    cv2.imshow("Air Drawing", overlay)
    cv2.imshow("Canvas", canvas)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()

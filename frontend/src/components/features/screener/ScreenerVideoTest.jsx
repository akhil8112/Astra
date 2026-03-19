"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Loader2 } from "lucide-react";

// The test will run for 30 seconds
const TEST_DURATION = 30;

export default function ScreenerVideoTest({ onTestComplete }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const handLandmarker = useRef(null);
    const testTimerId = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [statusText, setStatusText] = useState("Initializing...");
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION);

    // State for UI display
    const [mode, setMode] = useState("Normal");
    const [score, setScore] = useState(0);
    const [repetitiveBehaviorCount, setRepetitiveBehaviorCount] = useState(0);

    const focusStartTime = useRef(0);
    const lastY = useRef(0);
    const lastSwitchTime = useRef(0);

    // Initialize MediaPipe HandLandmarker
    useEffect(() => {
        const createHandLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
                handLandmarker.current = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numHands: 1,
                });
                setIsLoading(false);
                setStatusText("Ready to start.");
            } catch (error) {
                console.error("Error initializing HandLandmarker:", error);
                setStatusText("Error loading model.");
            }
        };
        createHandLandmarker();

        return () => {
            handLandmarker.current?.close();
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            if (testTimerId.current) clearInterval(testTimerId.current);
            const video = videoRef.current;
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const predictWebcam = useCallback(() => {
        // ... (The prediction and drawing logic is the same as your HandFocusTracker)
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !handLandmarker.current || video.readyState !== 4) {
            animationFrameId.current = requestAnimationFrame(predictWebcam);
            return;
        }
        if (video.videoWidth > 0 && (canvas.width !== video.videoWidth)) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
        const results = handLandmarker.current.detectForVideo(video, performance.now());
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            const is_thumb_up = landmarks[4].y < landmarks[2].y;
            const is_index_up = landmarks[8].y < landmarks[6].y;
            const is_middle_up = landmarks[12].y < landmarks[10].y;
            const is_ring_up = landmarks[16].y < landmarks[14].y;
            const is_pinky_up = landmarks[20].y < landmarks[18].y;
            const all_fingers_up = is_thumb_up && is_index_up && is_middle_up && is_ring_up && is_pinky_up;
            const isFocusMode = mode === "Focus";

            if (all_fingers_up && !isFocusMode) {
                setMode("Focus");
                focusStartTime.current = performance.now();
            } else if (!all_fingers_up && isFocusMode) {
                setMode("Normal");
                const elapsedTime = (performance.now() - focusStartTime.current) / 1000;
                setScore(prevScore => prevScore + elapsedTime);
                focusStartTime.current = 0;
            }
            const y_change_threshold = 0.04;
            const current_y = landmarks.reduce((sum, lm) => sum + lm.y, 0) / landmarks.length;
            const now = performance.now();
            if (Math.abs(current_y - lastY.current) > y_change_threshold) {
                if (now - lastSwitchTime.current > 500) {
                    setRepetitiveBehaviorCount(prev => prev + 1);
                    lastSwitchTime.current = now;
                }
            }
            lastY.current = current_y;
        }
        animationFrameId.current = requestAnimationFrame(predictWebcam);
    }, [mode]);

    // Start the camera and the test timer automatically on mount
    useEffect(() => {
        if (!isLoading && !isCameraOn) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener("loadeddata", () => {
                        setIsCameraOn(true);
                        setStatusText("Test in progress...");
                        requestAnimationFrame(predictWebcam);

                        // Start the countdown
                        testTimerId.current = setInterval(() => {
                            setTimeLeft(prev => prev - 1);
                        }, 1000);
                    });
                })
                .catch(err => {
                    console.error("Error accessing webcam:", err);
                    setStatusText("Could not access camera.");
                });
        }
    }, [isLoading, isCameraOn, predictWebcam]);

    // Effect to handle test completion
    useEffect(() => {
        if (timeLeft <= 0) {
            clearInterval(testTimerId.current);
            setStatusText("Test complete! Analyzing...");

            // Stop the camera
            const video = videoRef.current;
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
            cancelAnimationFrame(animationFrameId.current);
            setIsCameraOn(false);

            // Send results back to the parent component
            onTestComplete({
                focusScore: score,
                repetitiveCount: repetitiveBehaviorCount,
            });
        }
    }, [timeLeft, onTestComplete, score, repetitiveBehaviorCount]);

    return (
        <div className="p-6 flex flex-col items-center">
            <div className="w-full max-w-lg">
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <p className="text-xs font-medium text-blue-800">MODE</p>
                        <p className="text-xl font-bold text-blue-900">{mode}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                        <p className="text-xs font-medium text-green-800">FOCUS SCORE</p>
                        <p className="text-xl font-bold text-green-900">{score.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <p className="text-xs font-medium text-orange-800">REPETITIVE COUNT</p>
                        <p className="text-xl font-bold text-orange-900">{repetitiveBehaviorCount}</p>
                    </div>
                </div>
                <div className="relative w-full aspect-video bg-gray-200 rounded-md overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline style={{ display: "none" }}></video>
                    <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0"></canvas>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <p className="text-4xl font-mono">{timeLeft}s</p>}
                        <p className="mt-2 font-semibold">{statusText}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
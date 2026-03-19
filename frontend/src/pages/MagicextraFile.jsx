import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Helper Icons (for tools, colors, etc.)
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M3 6h18" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> <line x1="10" y1="11" x2="10" y2="17" /> <line x1="14" y1="11" x2="14" y2="17" /> </svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M21 12H3" /> <path d="M8 7l-5 5l5 5" /> </svg>; / / Example, usually it's a curved arrow
const Spinner = () => (
    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" > </div>
);

const MagicCanvasPage = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const drawingCanvasRef = useRef(null); // Separate canvas for drawing strokes
    const [handLandmarker, setHandLandmarker] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [drawingColor, setDrawingColor] = useState('#4A90E2'); // Default to accent color
    const [brushSize, setBrushSize] = useState(8);
    const [drawingHistory, setDrawingHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(0);

    // --- 1. Initialize HandLandmarker Model ---
    useEffect(() => {
        const createHandLandmarker = async () => {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                const landmarker = await HandLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                setHandLandmarker(landmarker);
                setModelLoading(false); // <-- Change: Set loading to false after model loads
                console.log("HandLandmarker loaded.");
            } catch (error) {
                console.error("Error loading HandLandmarker:", error);
                setModelLoading(false); // Also stop loading on error
            }
        };
        createHandLandmarker();
    }, []);

    // --- 2. Start Camera Stream ---
    const enableCam = useCallback(() => {
        if (handLandmarker) {
            setIsCameraReady(true);
            // The webcam component handles stream starting.
            // We'll then start detecting hands in the loop below.
        } else {
            console.warn("HandLandmarker is not loaded yet.");
        }
    }, [handLandmarker]);


    // --- 3. Real-time Hand Detection & Drawing Loop ---
    useEffect(() => {
        let animationFrameId;
        let lastVideoTime = -1;

        const drawLoop = async () => {
            if (webcamRef.current && webcamRef.current.video && isCameraReady && handLandmarker) {
                const video = webcamRef.current.video;
                const context = canvasRef.current.getContext('2d');
                const drawingContext = drawingCanvasRef.current.getContext('2d');

                // Set canvas dimensions to video dimensions
                canvasRef.current.width = video.videoWidth;
                canvasRef.current.height = video.videoHeight;
                drawingCanvasRef.current.width = video.videoWidth;
                drawingCanvasRef.current.height = video.videoHeight;

                // Clear previous detections
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                // Mirror the video for intuitive drawing
                context.save();
                context.scale(-1, 1);
                context.translate(-canvasRef.current.width, 0);
                context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
                context.restore();

                // Only perform detection if video time has updated
                if (video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;
                    const detections = await handLandmarker.detectForVideo(video, lastVideoTime);

                    if (detections.landmarks && detections.landmarks.length > 0) {
                        // We'll use the tip of the index finger (landmark 8) for drawing
                        const indexFingerTip = detections.landmarks[0][8];

                        // Convert normalized coordinates to canvas coordinates
                        const x = (1 - indexFingerTip.x) * canvasRef.current.width; // Mirror X coordinate
                        const y = indexFingerTip.y * canvasRef.current.height;

                        // Draw a circle on the main canvas to visualize the finger tip
                        context.beginPath();
                        context.arc(x, y, brushSize / 2 + 5, 0, 2 * Math.PI); // Bigger circle for visibility
                        context.fillStyle = 'rgba(255,255,255,0.7)';
                        context.fill();

                        // Draw on the drawing canvas
                        drawingContext.fillStyle = drawingColor;
                        drawingContext.beginPath();
                        drawingContext.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
                        drawingContext.fill();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(drawLoop);
        };

        if (isCameraReady && handLandmarker) {
            animationFrameId = requestAnimationFrame(drawLoop);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isCameraReady, handLandmarker, drawingColor, brushSize]);


    // --- Drawing History (for Undo/Clear) ---
    const saveDrawingState = useCallback(() => {
        if (drawingCanvasRef.current) {
            const currentDrawing = drawingCanvasRef.current.toDataURL();
            // Clear history if we're "ahead" of current step (e.g., drawing after undo)
            const newHistory = drawingHistory.slice(0, historyStep + 1);
            setDrawingHistory([...newHistory, currentDrawing]);
            setHistoryStep(newHistory.length);
        }
    }, [drawingHistory, historyStep]);

    // We'd typically call saveDrawingState at intervals or after a stroke ends.
    // For simplicity in a hackathon, we can add a manual "Save" button or capture on clear/undo.

    const clearCanvas = () => {
        if (drawingCanvasRef.current) {
            drawingCanvasRef.current.getContext('2d').clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
            saveDrawingState(); // Save empty state
        }
    };

    const undoDrawing = () => {
        if (historyStep > 0) {
            const prevStep = historyStep - 1;
            const img = new Image();
            img.onload = () => {
                const context = drawingCanvasRef.current.getContext('2d');
                context.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
                context.drawImage(img, 0, 0);
            };
            img.src = drawingHistory[prevStep];
            setHistoryStep(prevStep);
        } else {
            clearCanvas(); // If no history, clear completely
        }
    };

    return (
        <div className="flex flex-col items-center" >
            <Card className="w-full max-w-4xl p-0 overflow-hidden" >
                <h1 className="text-3xl font-bold font-heading text-center p-6 pb-0" > Magic Canvas </h1>
                < p className="text-center text-primary-text/70 mb-6 px-6" >
                    Use your finger in front of the camera to draw!
                </p>

                < div className="relative w-full h-[400px] bg-gray-900 overflow-hidden rounded-b-xl" >
                    {/* Webcam */}
                    < Webcam
                        ref={webcamRef}
                        className="absolute inset-0 w-full h-full object-cover transform scaleX(-1)" // Mirror
                        mirrored={true}
                        audio={false}
                        videoConstraints={{
                            facingMode: "user",
                            width: { ideal: 640 },
                            height: { ideal: 480 }
                        }
                        }
                        onUserMedia={() => { /* Not directly calling enableCam here, triggered by button */ }}
                        onUserMediaError={(error) => console.error("Webcam Error:", error)}
                    />

                    {/* Detections Overlay Canvas */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scaleX(-1) z-10" />

                    {/* Drawing Canvas */}
                    < canvas ref={drawingCanvasRef} className="absolute inset-0 w-full h-full z-20" />

                    {!isCameraReady && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-background/90 z-30 flex flex-col items-center justify-center p-4 text-center"
                        >
                            {
                                modelLoading ? (
                                    <>
                                        <Spinner />
                                        < h2 className="text-2xl font-heading mt-4" > Loading AI Model...</h2>
                                        < p className="text-primary-text/70" > This may take a moment.</p>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-heading mb-4" > Ready to Start ? </h2>
                                        < Button variant="primary" size="lg" onClick={enableCam} >
                                            Activate Magic
                                        </Button>
                                    </>
                                )}
                        </motion.div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 border-t border-foreground flex flex-wrap items-center justify-center gap-4" >
                    {/* Color Palette */}
                    < div className="flex gap-2" >
                        {
                            ['#4A90E2', '#34D399', '#FF8C66', '#FFFFFF', '#1A202C'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setDrawingColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 ${drawingColor === color ? 'border-accent' : 'border-transparent'} hover:scale-110 transition-transform`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                    </div>

                    {/* Brush Size */}
                    <input
                        type="range"
                        min="2"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-32 accent-accent"
                    />

                    {/* Action Buttons */}
                    < Button variant="secondary" size="sm" onClick={clearCanvas} > <ClearIcon /> Clear</Button >
                    {/* <Button variant="secondary" size="sm" onClick={undoDrawing} disabled={historyStep === 0}><UndoIcon /> Undo</Button> */}
                </div>
            </Card>
        </div>
    );
};

export default MagicCanvasPage;
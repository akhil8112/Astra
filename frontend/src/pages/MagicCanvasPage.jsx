import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
// THE FIX IS ON THIS LINE: Added CardFooter to the import list
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from '@/components/ui/Label';
import { Hand, Trash2 } from "lucide-react";

// --- Configuration ---
const colors = ["#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00"];
const brushSizes = [4, 8, 16];

const MagicCanvasPage = () => {
    // --- Refs and State ---
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [handLandmarker, setHandLandmarker] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [loadingModel, setLoadingModel] = useState(true);

    // Drawing state
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [selectedBrushSize, setSelectedBrushSize] = useState(brushSizes[1]);
    const lastPoint = useRef({ x: 0, y: 0 });

    // --- 1. Model Initialization ---
    useEffect(() => {
        const createHandLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
                const landmarkDetector = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: `/hand_landmarker.task`, delegate: "GPU" },
                    runningMode: "VIDEO", numHands: 1
                });
                setHandLandmarker(landmarkDetector);
                setLoadingModel(false);
            } catch (error) { console.error("Failed to create HandLandmarker:", error); }
        };
        createHandLandmarker();
    }, []);

    // --- 2. The Main Detection & Drawing Loop ---
    useEffect(() => {
        let animationFrameId;

        const runDetection = () => {
            if (!isCameraReady || !handLandmarker || !webcamRef.current || !webcamRef.current.video) {
                animationFrameId = requestAnimationFrame(runDetection);
                return;
            }

            const video = webcamRef.current.video;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            const results = handLandmarker.detectForVideo(video, Date.now());

            if (results.landmarks && results.landmarks.length > 0) {
                const lm = results.landmarks[0];
                const h = canvas.height;
                const w = canvas.width;

                const x1 = (1 - lm[8].x) * w; // Index finger tip X (flipped)
                const y1 = lm[8].y * h;     // Index finger tip Y

                const fingers = [8, 12, 16, 20].map(tip => lm[tip].y < lm[tip - 2].y);
                const thumb = lm[4].x > lm[3].x;

                if (fingers.every(f => f) && thumb) { // 1. Open Palm: Clear Canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                } else if (fingers[0] && fingers[1]) { // 2. Index + Middle up: Erasing
                    lastPoint.current = { x: 0, y: 0 };
                    ctx.strokeStyle = "#FFFFFF";
                    ctx.lineWidth = 30;
                    ctx.beginPath();
                    ctx.moveTo(x1 - 0.1, y1 - 0.1);
                    ctx.lineTo(x1, y1);
                    ctx.stroke();
                } else if (fingers[0]) { // 3. Index up only: Drawing
                    if (lastPoint.current.x === 0 && lastPoint.current.y === 0) {
                        lastPoint.current = { x: x1, y: y1 };
                    }
                    ctx.strokeStyle = selectedColor;
                    ctx.lineWidth = selectedBrushSize;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
                    ctx.lineTo(x1, y1);
                    ctx.stroke();
                    lastPoint.current = { x: x1, y: y1 };
                } else { // 4. No specific gesture: Stop drawing
                    lastPoint.current = { x: 0, y: 0 };
                }
            } else { // No hand detected: Stop drawing
                lastPoint.current = { x: 0, y: 0 };
            }

            animationFrameId = requestAnimationFrame(runDetection);
        };
        animationFrameId = requestAnimationFrame(runDetection);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isCameraReady, handLandmarker, selectedColor, selectedBrushSize]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className="container py-12 flex flex-col items-center">
            <Card className="w-full max-w-6xl">
                <CardHeader>
                    <CardTitle>Magic Canvas</CardTitle>
                    <CardDescription>Use your hand in the air to draw. Open palm to clear, or use the controls below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 relative">
                        {/* Left Panel: Webcam Feed */}
                        <div className="w-full aspect-video bg-secondary rounded-lg overflow-hidden">
                            <Webcam
                                ref={webcamRef}
                                className="w-full h-full object-cover"
                                mirrored={true}
                            />
                        </div>
                        {/* Right Panel: Drawing Canvas */}
                        <div className="w-full aspect-video bg-white rounded-lg overflow-hidden border">
                            <canvas ref={canvasRef} className="w-full h-full" />
                        </div>

                        {!isCameraReady && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90 p-4 text-center rounded-lg">
                                {loadingModel ? (<p>Loading AI Model...</p>) : (
                                    <>
                                        <Button size="lg" onClick={() => setIsCameraReady(true)}>
                                            <Hand className="mr-2 h-5 w-5" /> Activate Magic Canvas
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">Allow camera access.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Color:</Label>
                        {colors.map(c => (
                            <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-primary' : 'border-background'}`} style={{ backgroundColor: c }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>Brush Size:</Label>
                        {brushSizes.map(b => (
                            <Button key={b} variant={selectedBrushSize === b ? 'default' : 'outline'} onClick={() => setSelectedBrushSize(b)}>{b}</Button>
                        ))}
                    </div>
                    <Button variant="destructive" onClick={clearCanvas}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default MagicCanvasPage;


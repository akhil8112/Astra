import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Webcam from 'react-webcam';
import * as Tone from 'tone';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Music } from "lucide-react";

// --- Configuration ---
const initialDrumZones = {
    'hi_hat':     { x1: 0.1, y1: 0.1, x2: 0.3, y2: 0.4, color: 'rgba(255, 0, 0, 0.5)', lastHit: 0 },
    'crash':      { x1: 0.7, y1: 0.1, x2: 0.9, y2: 0.4, color: 'rgba(0, 255, 0, 0.5)', lastHit: 0 },
    'kick-drum':  { x1: 0.1, y1: 0.6, x2: 0.3, y2: 0.9, color: 'rgba(0, 0, 255, 0.5)', lastHit: 0 },
    'snare-drum': { x1: 0.7, y1: 0.6, x2: 0.9, y2: 0.9, color: 'rgba(255, 255, 0, 0.5)', lastHit: 0 }
};
const HIT_COOLDOWN = 500; // Cooldown in milliseconds

// --- Main Component ---
const MagicDrumsPage = () => {
    const webcamRef = useRef(null);
    const uiCanvasRef = useRef(null);
    const [handLandmarker, setHandLandmarker] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [loadingModel, setLoadingModel] = useState(true);
    
    const [drumZones, setDrumZones] = useState(initialDrumZones);
    const [sequence, setSequence] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const synths = useRef(null);

    // --- 1. Initialize Model & Sounds ---
    useEffect(() => {
        const createHandLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
                const landmarkDetector = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: `/hand_landmarker.task`, delegate: "GPU" },
                    runningMode: "VIDEO", numHands: 1, minHandDetectionConfidence: 0.7
                });
                setHandLandmarker(landmarkDetector);
                setLoadingModel(false);
            } catch (error) { console.error("Failed to create HandLandmarker:", error); }
        };
        createHandLandmarker();

        synths.current = {
            'hi_hat': new Tone.MetalSynth().toDestination(),
            'crash': new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.4, release: 0.2 } }).toDestination(),
            'kick-drum': new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 6 }).toDestination(),
            'snare-drum': new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination(),
            'success': new Tone.Synth().toDestination(),
            'failure': new Tone.Synth().toDestination(),
        };
    }, []);

    const startNewRound = useCallback(() => {
        const newSequence = Object.keys(initialDrumZones).sort(() => 0.5 - Math.random());
        setSequence(newSequence);
        setCurrentStep(0);
    }, []);

    useEffect(() => {
        if (isCameraReady) {
            startNewRound();
        }
    }, [isCameraReady, startNewRound]);

    // --- 2. The Main Detection & Game Loop ---
    useEffect(() => {
        let animationFrameId;
        const runDetection = () => {
            if (!isCameraReady || !handLandmarker || !webcamRef.current?.video || sequence.length === 0) {
                animationFrameId = requestAnimationFrame(runDetection); return;
            }
            const video = webcamRef.current.video;
            const uiCanvas = uiCanvasRef.current;
            const uiCtx = uiCanvas.getContext('2d');

            if (video.videoWidth > 0 && (uiCanvas.width !== video.videoWidth)) {
                uiCanvas.width = video.videoWidth;
                uiCanvas.height = video.videoHeight;
            }

            const results = handLandmarker.detectForVideo(video, Date.now());
            uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
            
            const w = uiCanvas.width;
            const h = uiCanvas.height;
            const drumToHit = sequence[currentStep];

            // Draw drum zones
            Object.entries(drumZones).forEach(([name, data]) => {
                const { x1, y1, x2, y2, color } = data;
                const startX = x1 * w;
                const startY = y1 * h;
                const width = (x2 - x1) * w;
                const height = (y2 - y1) * h;

                // Draw the outline for all drums
                uiCtx.strokeStyle = color.replace('0.5', '1');
                uiCtx.lineWidth = 4;
                uiCtx.strokeRect(startX, startY, width, height);

                // If this is the drum to hit, fill it
                if (name === drumToHit) {
                    uiCtx.fillStyle = color;
                    uiCtx.fillRect(startX, startY, width, height);
                    uiCtx.fillStyle = "white";
                    uiCtx.font = "bold 24px Arial";
                    uiCtx.fillText("HIT THIS!", startX + 10, startY + 30);
                }

                // Draw the label for all drums
                uiCtx.fillStyle = color.replace('0.5', '1');
                uiCtx.font = "18px Arial";
                uiCtx.fillText(name.replace('-', ' '), startX + 5, startY - 10);
            });

            // Draw hand landmarks if detected
            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                uiCtx.fillStyle = 'aqua';
                landmarks.forEach(landmark => {
                    uiCtx.beginPath();
                    // Flip the X coordinate for drawing to match the mirrored video
                    uiCtx.arc((1 - landmark.x) * w, landmark.y * h, 5, 0, 2 * Math.PI);
                    uiCtx.fill();
                });

                // Hit detection logic
                const fingersToCheck = [8, 12]; // Index and Middle finger tips
                const currentTime = Date.now();

                for (const fingerIndex of fingersToCheck) {
                    const fingerTip = landmarks[fingerIndex];
                    const x = 1 - fingerTip.x; // Flip for mirrored view
                    const y = fingerTip.y;

                    for (const [name, data] of Object.entries(drumZones)) {
                        if (x > data.x1 && x < data.x2 && y > data.y1 && y < data.y2) {
                            if (currentTime - data.lastHit > HIT_COOLDOWN) {
                                setDrumZones(prevZones => ({
                                    ...prevZones,
                                    [name]: { ...prevZones[name], lastHit: currentTime }
                                }));

                                if (name === drumToHit) {
                                    synths.current[name].triggerAttackRelease("C4", "8n");
                                    synths.current.success.triggerAttackRelease("C5", "8n", Tone.now() + 0.1);
                                    if (currentStep + 1 >= sequence.length) {
                                        startNewRound();
                                    } else {
                                        setCurrentStep(s => s + 1);
                                    }
                                } else {
                                    synths.current.failure.triggerAttackRelease("C3", "8n");
                                    setCurrentStep(0);
                                }
                            }
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(runDetection);
        };
        animationFrameId = requestAnimationFrame(runDetection);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isCameraReady, handLandmarker, sequence, currentStep, startNewRound, drumZones]);

    const handleStart = async () => {
        await Tone.start();
        setIsCameraReady(true);
    };

    return (
        <div className="container py-12 flex flex-col items-center">
            <Card className="w-full max-w-5xl">
                <CardHeader>
                    <CardTitle>Magic Drums</CardTitle>
                    <CardDescription>Follow the highlighted sequence and hit the virtual drums with your hand!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden">
                        <Webcam
                            ref={webcamRef}
                            className="absolute inset-0 w-full h-full object-fill" // <-- FIX: Changed object-cover to object-fill to align video and canvas
                            mirrored={true}
                        />
                        <canvas ref={uiCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                        {!isCameraReady && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90 p-4 text-center rounded-lg">
                                {loadingModel ? (<p>Loading AI Model...</p>) : (
                                    <>
                                        <Button size="lg" onClick={handleStart}>
                                            <Music className="mr-2 h-5 w-5" /> Start Drum Session
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">Allow camera access and turn up your volume.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MagicDrumsPage;


// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
// import Webcam from 'react-webcam';
// import * as Tone from 'tone';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Music, Trophy, RefreshCw, Volume2 } from "lucide-react";

// // --- Configuration ---
// const initialDrumZones = {
//     'hi-hat':     { x1: 0.05, y1: 0.1, x2: 0.35, y2: 0.4, color: 'rgba(255, 99, 71, 0.6)', emoji: '🥁', lastHit: 0 },
//     'crash':      { x1: 0.65, y1: 0.1, x2: 0.95, y2: 0.4, color: 'rgba(50, 205, 50, 0.6)', emoji: '🎵', lastHit: 0 },
//     'kick':       { x1: 0.05, y1: 0.6, x2: 0.35, y2: 0.9, color: 'rgba(30, 144, 255, 0.6)', emoji: '🎶', lastHit: 0 },
//     'snare':      { x1: 0.65, y1: 0.6, x2: 0.95, y2: 0.9, color: 'rgba(255, 215, 0, 0.6)', emoji: '🎼', lastHit: 0 }
// };

// const HIT_COOLDOWN = 400; // Reduced cooldown for better responsiveness
// const SEQUENCE_LEVELS = {
//     1: { length: 3, speed: 'slow', name: 'Beginner' },
//     2: { length: 4, speed: 'medium', name: 'Intermediate' },
//     3: { length: 5, speed: 'fast', name: 'Advanced' }
// };

// // --- Main Component ---
// const MagicDrumsTherapy = () => {
//     const webcamRef = useRef(null);
//     const uiCanvasRef = useRef(null);
//     const [handLandmarker, setHandLandmarker] = useState(null);
//     const [isCameraReady, setIsCameraReady] = useState(false);
//     const [loadingModel, setLoadingModel] = useState(true);
//     const [modelError, setModelError] = useState(false);
    
//     const [drumZones, setDrumZones] = useState(initialDrumZones);
//     const [sequence, setSequence] = useState([]);
//     const [currentStep, setCurrentStep] = useState(0);
//     const [score, setScore] = useState(0);
//     const [streak, setStreak] = useState(0);
//     const [level, setLevel] = useState(1);
//     const [gameMode, setGameMode] = useState('sequence'); // 'free' or 'sequence'
//     const [showSuccess, setShowSuccess] = useState(false);
//     const [lastHitDrum, setLastHitDrum] = useState(null);

//     const synths = useRef(null);
//     const animationFrameId = useRef(null);

//     // --- Initialize Model & Sounds ---
//     useEffect(() => {
//         const createHandLandmarker = async () => {
//             try {
//                 const vision = await FilesetResolver.forVisionTasks(
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
//                 );
//                 const landmarkDetector = await HandLandmarker.createFromOptions(vision, {
//                     baseOptions: { 
//                         modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
//                         delegate: "GPU" 
//                     },
//                     runningMode: "VIDEO",
//                     numHands: 2, // Support two hands for better interaction
//                     minHandDetectionConfidence: 0.5,
//                     minHandPresenceConfidence: 0.5,
//                     minTrackingConfidence: 0.5
//                 });
//                 setHandLandmarker(landmarkDetector);
//                 setLoadingModel(false);
//             } catch (error) {
//                 console.error("Failed to create HandLandmarker:", error);
//                 setModelError(true);
//                 setLoadingModel(false);
//             }
//         };
//         createHandLandmarker();

//         // Initialize audio with therapeutic, pleasant sounds
//         synths.current = {
//             'hi-hat': new Tone.MetalSynth({
//                 frequency: 200,
//                 envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
//                 harmonicity: 5.1,
//                 modulationIndex: 32,
//                 resonance: 4000,
//                 octaves: 1.5
//             }).toDestination(),
//             'crash': new Tone.MetalSynth({
//                 frequency: 300,
//                 envelope: { attack: 0.001, decay: 0.4, release: 0.2 }
//             }).toDestination(),
//             'kick': new Tone.MembraneSynth({
//                 pitchDecay: 0.05,
//                 octaves: 10,
//                 oscillator: { type: 'sine' },
//                 envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
//             }).toDestination(),
//             'snare': new Tone.NoiseSynth({
//                 noise: { type: 'pink' },
//                 envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
//             }).toDestination(),
//             'success': new Tone.PolySynth(Tone.Synth, {
//                 oscillator: { type: 'triangle' }
//             }).toDestination(),
//             'failure': new Tone.Synth({
//                 oscillator: { type: 'sawtooth' },
//                 envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 }
//             }).toDestination(),
//         };

//         // Set volume for therapeutic experience
//         Tone.Destination.volume.value = -10;

//         return () => {
//             if (animationFrameId.current) {
//                 cancelAnimationFrame(animationFrameId.current);
//             }
//             if (handLandmarker) {
//                 handLandmarker.close();
//             }
//         };
//     }, []);

//     const startNewRound = useCallback(() => {
//         const drumNames = Object.keys(initialDrumZones);
//         const sequenceLength = SEQUENCE_LEVELS[level].length;
//         const newSequence = Array.from({ length: sequenceLength }, () => 
//             drumNames[Math.floor(Math.random() * drumNames.length)]
//         );
//         setSequence(newSequence);
//         setCurrentStep(0);
//         setShowSuccess(false);
//     }, [level]);

//     const playSuccessSound = () => {
//         const notes = ['C4', 'E4', 'G4', 'C5'];
//         notes.forEach((note, i) => {
//             synths.current.success.triggerAttackRelease(note, '8n', Tone.now() + i * 0.1);
//         });
//     };

//     const handleDrumHit = useCallback((drumName) => {
//         const currentTime = Date.now();
        
//         // Update last hit time
//         setDrumZones(prev => ({
//             ...prev,
//             [drumName]: { ...prev[drumName], lastHit: currentTime }
//         }));

//         // Visual feedback
//         setLastHitDrum(drumName);
//         setTimeout(() => setLastHitDrum(null), 200);

//         // Play drum sound
//         if (synths.current[drumName]) {
//             if (drumName === 'kick') {
//                 synths.current[drumName].triggerAttackRelease('C1', '8n');
//             } else {
//                 synths.current[drumName].triggerAttackRelease('C4', '8n');
//             }
//         }

//         // Game logic for sequence mode
//         if (gameMode === 'sequence' && sequence.length > 0) {
//             const expectedDrum = sequence[currentStep];
            
//             if (drumName === expectedDrum) {
//                 // Correct hit
//                 setScore(prev => prev + 10);
//                 setStreak(prev => prev + 1);
                
//                 if (currentStep + 1 >= sequence.length) {
//                     // Round complete
//                     playSuccessSound();
//                     setShowSuccess(true);
//                     setScore(prev => prev + 50); // Bonus points
                    
//                     // Level up logic
//                     if (streak >= 5 && level < 3) {
//                         setLevel(prev => prev + 1);
//                     }
                    
//                     setTimeout(() => startNewRound(), 2000);
//                 } else {
//                     setCurrentStep(prev => prev + 1);
//                 }
//             } else {
//                 // Wrong hit
//                 synths.current.failure.triggerAttackRelease('A2', '8n');
//                 setStreak(0);
//                 setCurrentStep(0); // Reset to beginning of sequence
//             }
//         }
//     }, [gameMode, sequence, currentStep, streak, level, startNewRound]);

//     // --- Main Detection Loop ---
//     useEffect(() => {
//         const runDetection = () => {
//             if (!isCameraReady || !handLandmarker || !webcamRef.current?.video) {
//                 animationFrameId.current = requestAnimationFrame(runDetection);
//                 return;
//             }

//             const video = webcamRef.current.video;
//             const uiCanvas = uiCanvasRef.current;
//             if (!uiCanvas) {
//                 animationFrameId.current = requestAnimationFrame(runDetection);
//                 return;
//             }

//             const uiCtx = uiCanvas.getContext('2d');

//             // Ensure canvas matches video dimensions
//             if (video.videoWidth > 0 && video.videoHeight > 0) {
//                 if (uiCanvas.width !== video.videoWidth || uiCanvas.height !== video.videoHeight) {
//                     uiCanvas.width = video.videoWidth;
//                     uiCanvas.height = video.videoHeight;
//                 }
//             }

//             try {
//                 const results = handLandmarker.detectForVideo(video, Date.now());
//                 uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
                
//                 const w = uiCanvas.width;
//                 const h = uiCanvas.height;
//                 const drumToHit = gameMode === 'sequence' ? sequence[currentStep] : null;

//                 // Draw drum zones
//                 Object.entries(drumZones).forEach(([name, data]) => {
//                     const { x1, y1, x2, y2, color, emoji } = data;
//                     const startX = x1 * w;
//                     const startY = y1 * h;
//                     const width = (x2 - x1) * w;
//                     const height = (y2 - y1) * h;

//                     // Fill effect for active drum
//                     if (name === lastHitDrum) {
//                         uiCtx.fillStyle = color.replace('0.6', '0.8');
//                         uiCtx.fillRect(startX, startY, width, height);
//                     } else if (name === drumToHit) {
//                         // Pulsing effect for target drum
//                         const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.6;
//                         uiCtx.fillStyle = color.replace('0.6', pulse.toString());
//                         uiCtx.fillRect(startX, startY, width, height);
//                     } else {
//                         uiCtx.fillStyle = color.replace('0.6', '0.3');
//                         uiCtx.fillRect(startX, startY, width, height);
//                     }

//                     // Draw border
//                     uiCtx.strokeStyle = color.replace('0.6', '1');
//                     uiCtx.lineWidth = name === drumToHit ? 6 : 3;
//                     uiCtx.strokeRect(startX, startY, width, height);

//                     // Draw emoji and label
//                     uiCtx.font = "40px Arial";
//                     uiCtx.fillText(emoji, startX + width/2 - 20, startY + height/2);
                    
//                     uiCtx.fillStyle = "white";
//                     uiCtx.font = "bold 20px Arial";
//                     uiCtx.textAlign = "center";
//                     uiCtx.fillText(name.toUpperCase(), startX + width/2, startY + height - 10);
                    
//                     if (name === drumToHit) {
//                         uiCtx.fillStyle = "yellow";
//                         uiCtx.font = "bold 24px Arial";
//                         uiCtx.fillText("HIT ME! ✨", startX + width/2, startY + 35);
//                     }
//                 });

//                 // Process hand landmarks
//                 if (results.landmarks && results.landmarks.length > 0) {
//                     const currentTime = Date.now();
                    
//                     results.landmarks.forEach((landmarks, handIndex) => {
//                         // Draw hand skeleton
//                         uiCtx.strokeStyle = handIndex === 0 ? 'cyan' : 'magenta';
//                         uiCtx.lineWidth = 2;
                        
//                         // Draw connections
//                         const connections = HandLandmarker.HAND_CONNECTIONS;
//                         connections.forEach(([start, end]) => {
//                             uiCtx.beginPath();
//                             uiCtx.moveTo((1 - landmarks[start].x) * w, landmarks[start].y * h);
//                             uiCtx.lineTo((1 - landmarks[end].x) * w, landmarks[end].y * h);
//                             uiCtx.stroke();
//                         });

//                         // Draw landmarks
//                         uiCtx.fillStyle = handIndex === 0 ? 'aqua' : 'pink';
//                         landmarks.forEach((landmark, idx) => {
//                             const radius = [4, 8, 12, 16, 20].includes(idx) ? 8 : 5; // Fingertips are bigger
//                             uiCtx.beginPath();
//                             uiCtx.arc((1 - landmark.x) * w, landmark.y * h, radius, 0, 2 * Math.PI);
//                             uiCtx.fill();
//                         });

//                         // Check fingertip collisions (index, middle, ring fingers)
//                         const fingertips = [8, 12, 16];
                        
//                         for (const fingerIndex of fingertips) {
//                             const fingerTip = landmarks[fingerIndex];
//                             // Note: x is already flipped in detection
//                             const x = fingerTip.x;
//                             const y = fingerTip.y;

//                             for (const [name, data] of Object.entries(drumZones)) {
//                                 // Check if fingertip is in drum zone
//                                 if (x >= data.x1 && x <= data.x2 && 
//                                     y >= data.y1 && y <= data.y2) {
                                    
//                                     if (currentTime - data.lastHit > HIT_COOLDOWN) {
//                                         handleDrumHit(name);
//                                     }
//                                 }
//                             }
//                         }
//                     });
//                 }

//                 // Draw success message
//                 if (showSuccess) {
//                     uiCtx.fillStyle = 'rgba(0, 255, 0, 0.8)';
//                     uiCtx.font = 'bold 60px Arial';
//                     uiCtx.textAlign = 'center';
//                     uiCtx.fillText('🎉 AWESOME! 🎉', w/2, h/2);
//                 }

//             } catch (error) {
//                 console.error('Detection error:', error);
//             }

//             animationFrameId.current = requestAnimationFrame(runDetection);
//         };

//         if (isCameraReady && handLandmarker) {
//             animationFrameId.current = requestAnimationFrame(runDetection);
//         }

//         return () => {
//             if (animationFrameId.current) {
//                 cancelAnimationFrame(animationFrameId.current);
//             }
//         };
//     }, [isCameraReady, handLandmarker, gameMode, sequence, currentStep, drumZones, lastHitDrum, showSuccess, handleDrumHit]);

//     const handleStart = async () => {
//         await Tone.start();
//         setIsCameraReady(true);
//         if (gameMode === 'sequence') {
//             startNewRound();
//         }
//     };

//     const toggleGameMode = () => {
//         setGameMode(prev => prev === 'free' ? 'sequence' : 'free');
//         setScore(0);
//         setStreak(0);
//         setLevel(1);
//         if (gameMode === 'free') {
//             startNewRound();
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//             <div className="container max-w-6xl mx-auto">
//                 <Card className="shadow-2xl">
//                     <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
//                         <CardTitle className="text-3xl flex items-center gap-2">
//                             <Music className="h-8 w-8" />
//                             Magic Drums - Therapeutic Music Activity
//                         </CardTitle>
//                         <CardDescription className="text-purple-100">
//                             Part of Astra: Autism Spectrum Therapeutic & Resource Assistant
//                         </CardDescription>
//                     </CardHeader>
                    
//                     <CardContent className="p-6">
//                         {/* Stats Bar */}
//                         {isCameraReady && (
//                             <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
//                                 <Card className="p-3 bg-yellow-50">
//                                     <div className="text-sm text-gray-600">Score</div>
//                                     <div className="text-2xl font-bold text-yellow-600">{score}</div>
//                                 </Card>
//                                 <Card className="p-3 bg-green-50">
//                                     <div className="text-sm text-gray-600">Streak</div>
//                                     <div className="text-2xl font-bold text-green-600">{streak} 🔥</div>
//                                 </Card>
//                                 <Card className="p-3 bg-blue-50">
//                                     <div className="text-sm text-gray-600">Level</div>
//                                     <div className="text-xl font-bold text-blue-600">
//                                         {SEQUENCE_LEVELS[level].name}
//                                     </div>
//                                 </Card>
//                                 <Card className="p-3 bg-purple-50">
//                                     <div className="text-sm text-gray-600">Mode</div>
//                                     <div className="text-xl font-bold text-purple-600 capitalize">{gameMode}</div>
//                                 </Card>
//                                 <Button 
//                                     onClick={toggleGameMode}
//                                     variant="outline"
//                                     className="h-full"
//                                 >
//                                     <RefreshCw className="mr-2 h-4 w-4" />
//                                     Switch Mode
//                                 </Button>
//                             </div>
//                         )}

//                         {/* Game Area */}
//                         <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-inner">
//                             <Webcam
//                                 ref={webcamRef}
//                                 className="absolute inset-0 w-full h-full object-cover"
//                                 mirrored={true}
//                                 audio={false}
//                             />
//                             <canvas 
//                                 ref={uiCanvasRef} 
//                                 className="absolute inset-0 w-full h-full pointer-events-none"
//                             />

//                             {!isCameraReady && (
//                                 <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-900/95 p-8 text-center">
//                                     {loadingModel ? (
//                                         <div className="text-white">
//                                             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
//                                             <p className="text-lg">Loading AI Hand Tracking Model...</p>
//                                             <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
//                                         </div>
//                                     ) : modelError ? (
//                                         <div className="text-white">
//                                             <p className="text-lg text-red-400 mb-4">Failed to load AI model</p>
//                                             <p className="text-sm">Please refresh the page and try again</p>
//                                         </div>
//                                     ) : (
//                                         <div className="space-y-6">
//                                             <div className="text-white">
//                                                 <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-400" />
//                                                 <h2 className="text-2xl font-bold mb-2">Ready to Play Magic Drums!</h2>
//                                                 <p className="text-gray-300 mb-4">
//                                                     Use your hands to hit the virtual drums and create music!
//                                                 </p>
//                                             </div>
                                            
//                                             <div className="bg-white/10 backdrop-blur p-4 rounded-lg text-left text-white max-w-md">
//                                                 <h3 className="font-bold mb-2">How to Play:</h3>
//                                                 <ul className="text-sm space-y-1">
//                                                     <li>✋ Move your hands in front of the camera</li>
//                                                     <li>👆 Touch the colorful drum zones with your fingertips</li>
//                                                     <li>🎵 In Sequence Mode: Follow the highlighted drums</li>
//                                                     <li>🎨 In Free Mode: Create your own rhythm!</li>
//                                                     <li>🏆 Build streaks to level up!</li>
//                                                 </ul>
//                                             </div>

//                                             <Button 
//                                                 size="lg" 
//                                                 onClick={handleStart}
//                                                 className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
//                                             >
//                                                 <Volume2 className="mr-2 h-6 w-6" />
//                                                 Start Playing!
//                                             </Button>
                                            
//                                             <p className="text-xs text-gray-400">
//                                                 Please allow camera access and ensure good lighting
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Instructions */}
//                         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//                             <h3 className="font-bold text-blue-900 mb-2">Therapeutic Benefits:</h3>
//                             <div className="grid md:grid-cols-3 gap-3 text-sm text-blue-800">
//                                 <div>🎯 <strong>Motor Skills:</strong> Improves hand-eye coordination</div>
//                                 <div>🧠 <strong>Cognitive:</strong> Enhances pattern recognition</div>
//                                 <div>🎵 <strong>Sensory:</strong> Provides auditory-visual feedback</div>
//                                 <div>📊 <strong>Sequencing:</strong> Builds memory and attention</div>
//                                 <div>😊 <strong>Emotional:</strong> Reduces anxiety through music</div>
//                                 <div>🏆 <strong>Motivation:</strong> Gamification encourages practice</div>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default MagicDrumsTherapy;

// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
// import Webcam from 'react-webcam';
// import * as Tone from 'tone';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Music, Trophy, RefreshCw, Volume2 } from "lucide-react";

// // --- Configuration ---
// const initialDrumZones = {
//     'hi-hat':    { x1: 0.05, y1: 0.1, x2: 0.35, y2: 0.4, color: 'rgba(255, 99, 71, 0.6)', emoji: '🥁', lastHit: 0 },
//     'crash':     { x1: 0.65, y1: 0.1, x2: 0.95, y2: 0.4, color: 'rgba(50, 205, 50, 0.6)', emoji: '🎵', lastHit: 0 },
//     'kick':      { x1: 0.05, y1: 0.6, x2: 0.35, y2: 0.9, color: 'rgba(30, 144, 255, 0.6)', emoji: '🎶', lastHit: 0 },
//     'snare':     { x1: 0.65, y1: 0.6, x2: 0.95, y2: 0.9, color: 'rgba(255, 215, 0, 0.6)', emoji: '🎼', lastHit: 0 }
// };

// const HIT_COOLDOWN = 400; // Reduced cooldown for better responsiveness
// const SEQUENCE_LEVELS = {
//     1: { length: 3, name: 'Beginner' },
//     2: { length: 4, name: 'Intermediate' },
//     3: { length: 5, name: 'Advanced' }
// };

// // --- Main Component ---
// const MagicDrumsTherapy = () => {
//     const webcamRef = useRef(null);
//     const uiCanvasRef = useRef(null);
//     const [handLandmarker, setHandLandmarker] = useState(null);
//     const [isCameraReady, setIsCameraReady] = useState(false);
//     const [loadingModel, setLoadingModel] = useState(true);
//     const [modelError, setModelError] = useState(false);
    
//     const [drumZones, setDrumZones] = useState(initialDrumZones);
//     const [sequence, setSequence] = useState([]);
//     const [currentStep, setCurrentStep] = useState(0);
//     const [score, setScore] = useState(0);
//     const [streak, setStreak] = useState(0);
//     const [level, setLevel] = useState(1);
//     const [gameMode, setGameMode] = useState('sequence'); // 'free' or 'sequence'
//     const [showSuccess, setShowSuccess] = useState(false);
//     const [lastHitDrum, setLastHitDrum] = useState(null);

//     const synths = useRef(null);
//     const animationFrameId = useRef(null);

//     // --- Initialize Model & Sounds ---
//     useEffect(() => {
//         const createHandLandmarker = async () => {
//             try {
//                 const vision = await FilesetResolver.forVisionTasks(
//                     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
//                 );
//                 const landmarkDetector = await HandLandmarker.createFromOptions(vision, {
//                     baseOptions: { 
//                         // ## CHANGE: Using local model file ##
//                         modelAssetPath: `/hand_landmarker.task`,
//                         delegate: "GPU" 
//                     },
//                     runningMode: "VIDEO",
//                     numHands: 2, // Support two hands
//                     minHandDetectionConfidence: 0.5,
//                     minHandPresenceConfidence: 0.5,
//                     minTrackingConfidence: 0.5
//                 });
//                 setHandLandmarker(landmarkDetector);
//                 setLoadingModel(false);
//             } catch (error) {
//                 console.error("Failed to create HandLandmarker:", error);
//                 setModelError(true);
//                 setLoadingModel(false);
//             }
//         };
//         createHandLandmarker();

//         synths.current = {
//             'hi-hat': new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination(),
//             'crash': new Tone.MetalSynth({ frequency: 300, envelope: { attack: 0.001, decay: 0.4, release: 0.2 } }).toDestination(),
//             'kick': new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 10, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 } }).toDestination(),
//             'snare': new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination(),
//             'success': new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' } }).toDestination(),
//             'failure': new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 } }).toDestination(),
//         };
//         Tone.Destination.volume.value = -10;

//         return () => {
//             if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
//             if (handLandmarker) handLandmarker.close();
//         };
//     }, []); // Empty dependency array ensures this runs only once

//     const startNewRound = useCallback(() => {
//         const drumNames = Object.keys(initialDrumZones);
//         const sequenceLength = SEQUENCE_LEVELS[level].length;
//         const newSequence = Array.from({ length: sequenceLength }, () => 
//             drumNames[Math.floor(Math.random() * drumNames.length)]
//         );
//         setSequence(newSequence);
//         setCurrentStep(0);
//         setShowSuccess(false);
//     }, [level]);

//     const playSuccessSound = () => {
//         const notes = ['C4', 'E4', 'G4', 'C5'];
//         notes.forEach((note, i) => {
//             synths.current.success.triggerAttackRelease(note, '8n', Tone.now() + i * 0.1);
//         });
//     };

//     const handleDrumHit = useCallback((drumName) => {
//         const currentTime = Date.now();
        
//         setDrumZones(prev => ({ ...prev, [drumName]: { ...prev[drumName], lastHit: currentTime } }));
//         setLastHitDrum(drumName);
//         setTimeout(() => setLastHitDrum(null), 200);

//         if (synths.current[drumName]) {
//             if (drumName === 'kick') {
//                 synths.current[drumName].triggerAttackRelease('C1', '8n');
//             } else if (drumName === 'snare') {
//                 synths.current[drumName].triggerAttackRelease('8n');
//             } else {
//                 synths.current[drumName].triggerAttackRelease('C4', '8n');
//             }
//         }

//         if (gameMode === 'sequence' && sequence.length > 0) {
//             const expectedDrum = sequence[currentStep];
//             if (drumName === expectedDrum) {
//                 setScore(prev => prev + 10);
//                 setStreak(prev => prev + 1);
                
//                 if (currentStep + 1 >= sequence.length) {
//                     playSuccessSound();
//                     setShowSuccess(true);
//                     setScore(prev => prev + 50);
//                     if (streak >= 5 && level < 3) {
//                         setLevel(prev => prev + 1);
//                     }
//                     setTimeout(() => startNewRound(), 2000);
//                 } else {
//                     setCurrentStep(prev => prev + 1);
//                 }
//             } else {
//                 synths.current.failure.triggerAttackRelease('A2', '8n');
//                 setStreak(0);
//                 setCurrentStep(0);
//             }
//         } else if (gameMode === 'free') {
//             setScore(prev => prev + 5);
//             setStreak(prev => prev + 1);
//         }
//     }, [gameMode, sequence, currentStep, streak, level, startNewRound]);

//     // --- Main Detection Loop ---
//     useEffect(() => {
//         const runDetection = () => {
//             if (!isCameraReady || !handLandmarker || !webcamRef.current?.video || !uiCanvasRef.current) {
//                 animationFrameId.current = requestAnimationFrame(runDetection);
//                 return;
//             }

//             const video = webcamRef.current.video;
//             const uiCanvas = uiCanvasRef.current;
//             const uiCtx = uiCanvas.getContext('2d');

//             if (video.videoWidth > 0 && (uiCanvas.width !== video.videoWidth || uiCanvas.height !== video.videoHeight)) {
//                 uiCanvas.width = video.videoWidth;
//                 uiCanvas.height = video.videoHeight;
//             }

//             try {
//                 const results = handLandmarker.detectForVideo(video, Date.now());
//                 uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
                
//                 const w = uiCanvas.width;
//                 const h = uiCanvas.height;
//                 const drumToHit = gameMode === 'sequence' ? sequence[currentStep] : null;

//                 // Draw drum zones
//                 Object.entries(drumZones).forEach(([name, data]) => {
//                     const { x1, y1, x2, y2, color, emoji } = data;
//                     const startX = x1 * w;
//                     const startY = y1 * h;
//                     const width = (x2 - x1) * w;
//                     const height = (y2 - y1) * h;

//                     if (name === lastHitDrum) {
//                         uiCtx.fillStyle = color.replace('0.6', '0.8');
//                         uiCtx.fillRect(startX, startY, width, height);
//                     } else if (name === drumToHit) {
//                         const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.6;
//                         uiCtx.fillStyle = color.replace('0.6', pulse.toString());
//                         uiCtx.fillRect(startX, startY, width, height);
//                     } else {
//                         uiCtx.fillStyle = color.replace('0.6', '0.3');
//                         uiCtx.fillRect(startX, startY, width, height);
//                     }

//                     uiCtx.strokeStyle = color.replace('0.6', '1');
//                     uiCtx.lineWidth = name === drumToHit ? 6 : 3;
//                     uiCtx.strokeRect(startX, startY, width, height);
                    
//                     uiCtx.font = "40px Arial";
//                     uiCtx.textAlign = "center";
//                     uiCtx.fillText(emoji, startX + width / 2, startY + height / 2 + 10);
                    
//                     uiCtx.fillStyle = "white";
//                     uiCtx.font = "bold 20px Arial";
//                     uiCtx.fillText(name.toUpperCase(), startX + width / 2, startY + height - 15);
                    
//                     if (name === drumToHit) {
//                         uiCtx.fillStyle = "yellow";
//                         uiCtx.font = "bold 24px Arial";
//                         uiCtx.fillText("HIT ME! ✨", startX + width / 2, startY + 35);
//                     }
//                 });

//                 // Process and draw hand landmarks
//                 if (results.landmarks && results.landmarks.length > 0) {
//                     const currentTime = Date.now();
                    
//                     results.landmarks.forEach((landmarks) => {
//                         // Draw hand skeleton for visual feedback
//                         const connections = HandLandmarker.HAND_CONNECTIONS;
//                         uiCtx.strokeStyle = 'white';
//                         uiCtx.lineWidth = 3;
//                         connections.forEach(([start, end]) => {
//                             uiCtx.beginPath();
//                             uiCtx.moveTo((1 - landmarks[start].x) * w, landmarks[start].y * h);
//                             uiCtx.lineTo((1 - landmarks[end].x) * w, landmarks[end].y * h);
//                             uiCtx.stroke();
//                         });

//                         // Hit detection logic
//                         const fingertips = [8, 12, 16]; // Index, Middle, Ring fingertips
//                         for (const fingerIndex of fingertips) {
//                             const fingerTip = landmarks[fingerIndex];
//                             const x = 1 - fingerTip.x;
//                             const y = fingerTip.y;

//                             for (const [name, data] of Object.entries(drumZones)) {
//                                 if (x >= data.x1 && x <= data.x2 && y >= data.y1 && y <= data.y2) {
//                                     if (currentTime - data.lastHit > HIT_COOLDOWN) {
//                                         handleDrumHit(name);
//                                     }
//                                 }
//                             }
//                         }
//                     });
//                 }

//                 if (showSuccess) {
//                     uiCtx.fillStyle = 'rgba(0, 255, 0, 0.8)';
//                     uiCtx.font = 'bold 60px Arial';
//                     uiCtx.textAlign = 'center';
//                     uiCtx.fillText('🎉 AWESOME! 🎉', w / 2, h / 2);
//                 }

//             } catch (error) {
//                 console.error('Detection error:', error);
//             }

//             animationFrameId.current = requestAnimationFrame(runDetection);
//         };
        
//         if (isCameraReady && handLandmarker) {
//             animationFrameId.current = requestAnimationFrame(runDetection);
//         }

//         return () => {
//             if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
//         };
//     }, [isCameraReady, handLandmarker, gameMode, sequence, currentStep, drumZones, lastHitDrum, showSuccess, handleDrumHit]);

//     const handleStart = async () => {
//         await Tone.start();
//         setIsCameraReady(true);
//         if (gameMode === 'sequence') {
//             startNewRound();
//         }
//     };

//     const toggleGameMode = () => {
//         setGameMode(prev => prev === 'free' ? 'sequence' : 'free');
//         setScore(0);
//         setStreak(0);
//         setLevel(1);
//         if (gameMode === 'free') { // About to switch to 'sequence'
//             startNewRound();
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//             <div className="container max-w-6xl mx-auto">
//                 <Card className="shadow-2xl">
//                     <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
//                         <CardTitle className="text-3xl flex items-center gap-2">
//                             <Music className="h-8 w-8" />
//                             Magic Drums - Therapeutic Music Activity
//                         </CardTitle>
//                         <CardDescription className="text-purple-100">
//                             Part of Astra: Autism Spectrum Therapeutic & Resource Assistant
//                         </CardDescription>
//                     </CardHeader>
                    
//                     <CardContent className="p-6">
//                         {isCameraReady && (
//                             <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
//                                 <Card className="p-3 bg-yellow-50 text-center"><div className="text-sm text-gray-600">Score</div><div className="text-2xl font-bold text-yellow-600">{score}</div></Card>
//                                 <Card className="p-3 bg-green-50 text-center"><div className="text-sm text-gray-600">Streak</div><div className="text-2xl font-bold text-green-600">{streak} 🔥</div></Card>
//                                 <Card className="p-3 bg-blue-50 text-center"><div className="text-sm text-gray-600">Level</div><div className="text-xl font-bold text-blue-600">{SEQUENCE_LEVELS[level].name}</div></Card>
//                                 <Card className="p-3 bg-purple-50 text-center"><div className="text-sm text-gray-600">Mode</div><div className="text-xl font-bold text-purple-600 capitalize">{gameMode}</div></Card>
//                                 <Button onClick={toggleGameMode} variant="outline" className="h-full"><RefreshCw className="mr-2 h-4 w-4" />Switch Mode</Button>
//                             </div>
//                         )}

//                         <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-inner">
//                             <Webcam ref={webcamRef} className="absolute inset-0 w-full h-full object-cover" mirrored={true} audio={false} />
//                             <canvas ref={uiCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

//                             {!isCameraReady && (
//                                 <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-900/95 p-8 text-center">
//                                     {loadingModel ? (
//                                         <div className="text-white">
//                                             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
//                                             <p className="text-lg">Loading AI Hand Tracking Model...</p>
//                                         </div>
//                                     ) : modelError ? (
//                                         <div className="text-white"><p className="text-lg text-red-400 mb-4">Failed to load AI model. Please refresh and try again.</p></div>
//                                     ) : (
//                                         <div className="space-y-6">
//                                             <div className="text-white">
//                                                 <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-400" />
//                                                 <h2 className="text-2xl font-bold mb-2">Ready to Play Magic Drums!</h2>
//                                                 <p className="text-gray-300 mb-4">Use your hands to hit the virtual drums and create music!</p>
//                                             </div>
                                            
//                                             <div className="bg-white/10 backdrop-blur p-4 rounded-lg text-left text-white max-w-md">
//                                                 <h3 className="font-bold mb-2">How to Play:</h3>
//                                                 <ul className="text-sm space-y-1">
//                                                     <li>✋ Move your hands in front of the camera</li>
//                                                     <li>👆 Touch the colorful drum zones with your fingertips</li>
//                                                     <li>🎵 In Sequence Mode: Follow the highlighted drums</li>
//                                                     <li>🎨 In Free Mode: Create your own rhythm!</li>
//                                                     <li>🏆 Build streaks to level up!</li>
//                                                 </ul>
//                                             </div>

//                                             <Button size="lg" onClick={handleStart} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg">
//                                                 <Volume2 className="mr-2 h-6 w-6" />
//                                                 Start Playing!
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//                             <h3 className="font-bold text-blue-900 mb-2">Therapeutic Benefits:</h3>
//                             <div className="grid md:grid-cols-3 gap-3 text-sm text-blue-800">
//                                 <div>🎯 <strong>Motor Skills:</strong> Improves hand-eye coordination</div>
//                                 <div>🧠 <strong>Cognitive:</strong> Enhances pattern recognition</div>
//                                 <div>🎵 <strong>Sensory:</strong> Provides auditory-visual feedback</div>
//                                 <div>📊 <strong>Sequencing:</strong> Builds memory and attention</div>
//                                 <div>😊 <strong>Emotional:</strong> Reduces anxiety through music</div>
//                                 <div>🏆 <strong>Motivation:</strong> Gamification encourages practice</div>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default MagicDrumsTherapy;


import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { CardDescription, CardTitle } from '@/components/ui/Card';
import { PlayCircle, Camera } from 'lucide-react';

const VideoTest = () => {
    return (
        <motion.div
            key="video-test"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center"
        >
            <CardTitle className="text-2xl md:text-3xl">Part 2: Play-Along Video</CardTitle>
            <CardDescription className="mt-2">
                Your child will watch a short video. Please ensure they are visible to the camera.
            </CardDescription>
            <div className="w-full grid md:grid-cols-2 gap-4 mt-6">
                {/* Placeholder for the stimulus video */}
                <div className="w-full aspect-video bg-secondary rounded-lg flex flex-col items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Stimulus video plays here</p>
                </div>
                {/* Live webcam feed */}
                <div className="w-full aspect-video bg-secondary rounded-lg overflow-hidden relative">
                    <Webcam
                        mirrored={true}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm p-2 rounded-full">
                        <Camera className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VideoTest;
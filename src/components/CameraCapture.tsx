 import { useState, useRef, useCallback, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Camera, X, RefreshCw } from 'lucide-react';
 
 interface CameraCaptureProps {
   isOpen: boolean;
   onClose: () => void;
   onCapture: (file: File) => void;
 }
 
 const CameraCapture = ({ isOpen, onClose, onCapture }: CameraCaptureProps) => {
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const streamRef = useRef<MediaStream | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
 
   const startCamera = useCallback(async () => {
     setIsLoading(true);
     setError(null);
     
     // Stop any existing stream
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
     }
 
     try {
       const stream = await navigator.mediaDevices.getUserMedia({
         video: {
           facingMode: facingMode,
           width: { ideal: 1920 },
           height: { ideal: 1080 },
         },
         audio: false,
       });
 
       streamRef.current = stream;
       
       if (videoRef.current) {
         videoRef.current.srcObject = stream;
         await videoRef.current.play();
       }
     } catch (err) {
       if (err instanceof Error) {
         if (err.name === 'NotAllowedError') {
           setError('Camera access denied. Please allow camera access in your browser settings.');
         } else if (err.name === 'NotFoundError') {
           setError('No camera found on this device.');
         } else {
           setError('Unable to access camera. Please try again.');
         }
       }
     } finally {
       setIsLoading(false);
     }
   }, [facingMode]);
 
   const stopCamera = useCallback(() => {
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
     }
     if (videoRef.current) {
       videoRef.current.srcObject = null;
     }
   }, []);
 
   const handleCapture = useCallback(() => {
     if (!videoRef.current || !canvasRef.current) return;
 
     const video = videoRef.current;
     const canvas = canvasRef.current;
     
     canvas.width = video.videoWidth;
     canvas.height = video.videoHeight;
     
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
     
     ctx.drawImage(video, 0, 0);
     
     canvas.toBlob((blob) => {
       if (blob) {
         const file = new File([blob], `camera-photo-${Date.now()}.png`, { type: 'image/png' });
         stopCamera();
         onCapture(file);
         onClose();
       }
     }, 'image/png', 1.0);
   }, [onCapture, onClose, stopCamera]);
 
   const switchCamera = useCallback(() => {
     setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
   }, []);
 
   useEffect(() => {
     if (isOpen) {
       startCamera();
     } else {
       stopCamera();
     }
     
     return () => {
       stopCamera();
     };
   }, [isOpen, startCamera, stopCamera]);
 
   const handleClose = useCallback(() => {
     stopCamera();
     onClose();
   }, [stopCamera, onClose]);
 
   if (!isOpen) return null;
 
   return (
     <AnimatePresence>
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
         onClick={handleClose}
       >
         <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           exit={{ scale: 0.9, opacity: 0 }}
           className="relative w-full max-w-2xl bg-background rounded-2xl overflow-hidden shadow-2xl"
           onClick={(e) => e.stopPropagation()}
         >
           {/* Header */}
           <div className="flex items-center justify-between p-4 border-b border-border">
             <h3 className="text-lg font-semibold">Take Photo</h3>
             <button
               onClick={handleClose}
               className="p-2 rounded-lg hover:bg-muted transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
           </div>
 
           {/* Camera View */}
           <div className="relative aspect-video bg-black">
             {isLoading && (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
               </div>
             )}
             
             {error && (
               <div className="absolute inset-0 flex items-center justify-center p-6">
                 <div className="text-center">
                   <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                     <Camera className="w-8 h-8 text-destructive" />
                   </div>
                   <p className="text-destructive text-sm">{error}</p>
                   <button
                     onClick={startCamera}
                     className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                   >
                     Try Again
                   </button>
                 </div>
               </div>
             )}
 
             <video
               ref={videoRef}
               autoPlay
               playsInline
               muted
               className={`w-full h-full object-cover ${error || isLoading ? 'invisible' : 'visible'}`}
             />
             <canvas ref={canvasRef} className="hidden" />
           </div>
 
           {/* Controls */}
           <div className="flex items-center justify-center gap-4 p-6">
             <button
               onClick={switchCamera}
               className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
               title="Switch camera"
             >
               <RefreshCw className="w-5 h-5" />
             </button>
             
             <button
               onClick={handleCapture}
               disabled={!!error || isLoading}
               className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg"
             >
               <div className="w-12 h-12 rounded-full border-4 border-primary-foreground" />
             </button>
             
             <div className="w-11" /> {/* Spacer for centering */}
           </div>
         </motion.div>
       </motion.div>
     </AnimatePresence>
   );
 };
 
 export default CameraCapture;
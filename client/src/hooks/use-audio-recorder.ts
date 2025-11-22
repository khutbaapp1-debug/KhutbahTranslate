import { useState, useRef, useCallback } from "react";
import { encodeWAV } from "@/utils/wav-encoder";

export interface TranslationSegment {
  id: number;
  arabic: string;
  english: string;
  timestamp: number;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  translations: TranslationSegment[];
  nextTranslationIn: number; // Countdown timer: seconds until next translation
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  onTranslation?: (segment: TranslationSegment) => void;
}

const SAMPLE_RATE = 16000; // 16kHz is optimal for speech recognition
const CHUNK_DURATION = 10; // seconds - longer chunks provide better context and reduce costs by 50%

export function useAudioRecorder(): AudioRecorderState & AudioRecorderControls {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationSegment[]>([]);
  const [nextTranslationIn, setNextTranslationIn] = useState(CHUNK_DURATION);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pcmBufferRef = useRef<Float32Array[]>([]);
  const timerRef = useRef<number | null>(null);
  const chunkTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const sequenceNumberRef = useRef(0);
  const isPausedRef = useRef(false);

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const startCountdownTimer = useCallback(() => {
    setNextTranslationIn(CHUNK_DURATION); // Reset to 10 seconds
    countdownTimerRef.current = window.setInterval(() => {
      setNextTranslationIn((prev) => {
        if (prev <= 1) {
          return CHUNK_DURATION; // Reset when it hits 0
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const stopMediaTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const sendAudioChunkForTranscription = useCallback(async (blob: Blob, sequenceNumber: number) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "audio.wav");
      formData.append("sequenceNumber", sequenceNumber.toString());
      
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Only log non-format errors
        if (!errorData.error?.includes("could not be decoded")) {
          console.error("Transcription error:", errorData);
        }
        return;
      }
      
      const result = await response.json();
      
      if (result.arabic && result.translation) {
        const segment: TranslationSegment = {
          id: Date.now() + sequenceNumber,
          arabic: result.arabic,
          english: result.translation, // Keep "english" property name for backward compatibility in frontend
          timestamp: sequenceNumber * CHUNK_DURATION,
        };
        
        setTranslations(prev => [...prev, segment]);
      }
    } catch (err) {
      console.error("Failed to transcribe chunk:", err);
    }
  }, []);

  const processChunk = useCallback(() => {
    if (pcmBufferRef.current.length === 0) return;

    // Combine all buffered PCM samples
    const totalLength = pcmBufferRef.current.reduce((acc, arr) => acc + arr.length, 0);
    const combined = new Float32Array(totalLength);
    let offset = 0;
    for (const buffer of pcmBufferRef.current) {
      combined.set(buffer, offset);
      offset += buffer.length;
    }

    // Encode to WAV with proper headers
    const wavBlob = encodeWAV(combined, SAMPLE_RATE);
    
    // Store for final audio file
    audioChunksRef.current.push(wavBlob);
    
    // Send for transcription (only if chunk has sufficient data)
    if (wavBlob.size > 5000) {
      sendAudioChunkForTranscription(wavBlob, sequenceNumberRef.current++);
    }

    // Clear buffer for next chunk
    pcmBufferRef.current = [];
  }, [sendAudioChunkForTranscription]);

  const startRecording = useCallback(async () => {
    try {
      stopMediaTracks();
      setError(null);
      audioChunksRef.current = [];
      pcmBufferRef.current = [];
      sequenceNumberRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      mediaStreamRef.current = stream;

      // Create Web Audio API context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      
      // Use ScriptProcessor to capture PCM samples
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isPausedRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const samples = new Float32Array(inputData);
        pcmBufferRef.current.push(samples);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Process chunks every 10 seconds
      chunkTimerRef.current = window.setInterval(processChunk, CHUNK_DURATION * 1000);

      setIsRecording(true);
      setRecordingTime(0);
      startTimer();
      startCountdownTimer(); // Start countdown for next translation
    } catch (err: any) {
      console.error("Error starting recording:", err);
      stopMediaTracks();
      setError(err.message || "Failed to start recording. Please allow microphone access.");
    }
  }, [startTimer, startCountdownTimer, stopMediaTracks, processChunk]);

  const stopRecording = useCallback(() => {
    if (chunkTimerRef.current) {
      clearInterval(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }

    // Process any remaining buffered audio
    processChunk();

    // Create final complete audio file
    if (audioChunksRef.current.length > 0) {
      const finalBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioBlob(finalBlob);
      setAudioUrl(URL.createObjectURL(finalBlob));
    }

    stopMediaTracks();
    setIsRecording(false);
    setIsPaused(false);
    stopTimer();
    stopCountdownTimer();
  }, [processChunk, stopMediaTracks, stopTimer, stopCountdownTimer]);

  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      setIsPaused(true);
      isPausedRef.current = true;
      stopTimer();
      stopCountdownTimer();
    }
  }, [isRecording, isPaused, stopTimer, stopCountdownTimer]);

  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      startTimer();
      startCountdownTimer();
    }
  }, [isRecording, isPaused, startTimer, startCountdownTimer]);

  const clearRecording = useCallback(() => {
    stopMediaTracks();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setError(null);
    setTranslations([]);
    audioChunksRef.current = [];
    pcmBufferRef.current = [];
    sequenceNumberRef.current = 0;
  }, [audioUrl, stopMediaTracks]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    translations,
    nextTranslationIn,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  };
}

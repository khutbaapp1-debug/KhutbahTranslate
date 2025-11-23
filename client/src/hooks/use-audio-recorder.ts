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
  transcriptionError: string | null; // API errors from transcription (e.g., 429 limit reached)
  translations: TranslationSegment[];
  nextTranslationIn: number; // Countdown timer: seconds until next translation
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  clearErrors: () => void; // Clear error states without losing translations/audio
  onTranslation?: (segment: TranslationSegment) => void;
}

export interface AudioRecorderOptions {
  minutesRemaining?: number; // Latest backend minutes - used for proactive limit check
  onLimitReached?: () => void; // Callback when about to hit limit
  onBeforeChunkSent?: () => void; // Callback BEFORE sending chunk (for unflushed counter)
  onChunkSent?: () => void; // Callback after successful chunk transcription (for refreshing usage)
}

const SAMPLE_RATE = 16000; // 16kHz is optimal for speech recognition
const CHUNK_DURATION = 10; // seconds - longer chunks provide better context and reduce costs by 50%
const CHUNK_COST_MINUTES = CHUNK_DURATION / 60; // ~0.167 minutes per chunk
const SAFETY_BUFFER_CHUNKS = 3; // Stop recording with buffer for 3 chunks (0.5 min) to prevent mid-khutbah interruption
const MINIMUM_MINUTES_REQUIRED = CHUNK_COST_MINUTES * SAFETY_BUFFER_CHUNKS; // ~0.5 minutes minimum

export function useAudioRecorder(options?: AudioRecorderOptions): AudioRecorderState & AudioRecorderControls {
  const { minutesRemaining, onLimitReached, onBeforeChunkSent, onChunkSent } = options || {};
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
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
    // Proactive limit check: Stop sending chunks when approaching limit to prevent mid-khutbah interruption
    if (minutesRemaining !== undefined && minutesRemaining < MINIMUM_MINUTES_REQUIRED) {
      setTranscriptionError("limit_reached");
      if (onLimitReached) {
        onLimitReached();
      }
      return;
    }
    
    // Increment unflushed chunk counter BEFORE sending
    if (onBeforeChunkSent) {
      onBeforeChunkSent();
    }
    
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
        // Set transcription error for 429 (limit reached) or other API errors
        if (response.status === 429) {
          setTranscriptionError("limit_reached");
          if (onLimitReached) {
            onLimitReached();
          }
        } else if (!errorData.error?.includes("could not be decoded")) {
          setTranscriptionError(errorData.error || "Transcription failed");
          console.error("Transcription error:", errorData);
        }
        return;
      }
      
      // Clear transcription error on successful response
      setTranscriptionError(null);
      
      const result = await response.json();
      
      if (result.arabic && result.translation) {
        const segment: TranslationSegment = {
          id: Date.now() + sequenceNumber,
          arabic: result.arabic,
          english: result.translation, // Keep "english" property name for backward compatibility in frontend
          timestamp: sequenceNumber * CHUNK_DURATION,
        };
        
        setTranslations(prev => [...prev, segment]);
        
        // Notify parent that chunk was successfully sent (so usage can be refreshed)
        if (onChunkSent) {
          onChunkSent();
        }
      }
    } catch (err) {
      console.error("Failed to transcribe chunk:", err);
    }
  }, [minutesRemaining, onLimitReached, onBeforeChunkSent, onChunkSent]);

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
    setTranscriptionError(null); // Clear transcription errors on reset
    setTranslations([]);
    audioChunksRef.current = [];
    pcmBufferRef.current = [];
    sequenceNumberRef.current = 0;
  }, [audioUrl, stopMediaTracks]);

  const clearErrors = useCallback(() => {
    // Clear error states only - preserve translations and audio
    setError(null);
    setTranscriptionError(null);
  }, []);

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    transcriptionError,
    translations,
    nextTranslationIn,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    clearErrors,
  };
}

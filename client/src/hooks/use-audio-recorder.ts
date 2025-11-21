import { useState, useRef, useCallback } from "react";

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
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  onTranslation?: (segment: TranslationSegment) => void;
}

export function useAudioRecorder(): AudioRecorderState & AudioRecorderControls {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationSegment[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const chunkTimerRef = useRef<number | null>(null);
  const onTranslationRef = useRef<((segment: TranslationSegment) => void) | undefined>();

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopMediaTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const sendAudioChunkForTranscription = useCallback(async (blob: Blob, sequenceNumber: number) => {
    try {
      const formData = new FormData();
      // Add proper filename with extension to help OpenAI decode the audio
      formData.append("audio", blob, "audio.webm");
      formData.append("sequenceNumber", sequenceNumber.toString());
      
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error("Transcription error:", await response.json());
        return;
      }
      
      const result = await response.json();
      
      if (result.arabic && result.english) {
        const segment: TranslationSegment = {
          id: Date.now() + sequenceNumber,
          arabic: result.arabic,
          english: result.english,
          timestamp: sequenceNumber,
        };
        
        setTranslations(prev => [...prev, segment]);
        if (onTranslationRef.current) {
          onTranslationRef.current(segment);
        }
      }
    } catch (err) {
      console.error("Failed to transcribe chunk:", err);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Stop any existing streams first
      stopMediaTracks();
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Mono
          sampleRate: 48000, // 48kHz
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      mediaStreamRef.current = stream;

      // Try to use Opus codec (WebM container) for smallest file size
      const mimeTypes = [
        "audio/webm;codecs=opus", // Best: Opus in WebM
        "audio/webm", // Fallback: WebM
        "audio/ogg;codecs=opus", // Alternative: Opus in OGG
        "audio/mp4", // Fallback: MP4
        "audio/mpeg", // Fallback: MP3
      ];

      let selectedMimeType = "";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error("No supported audio format found");
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 48000, // 48kbps for good speech quality
      });

      mediaRecorderRef.current = mediaRecorder;

      let chunkSequenceNumber = 0;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // Only send chunk for transcription if it has sufficient audio data
          // Skip chunks smaller than 5KB (likely silence or corrupted)
          if (event.data.size > 5000) {
            sendAudioChunkForTranscription(event.data, chunkSequenceNumber++);
          }
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMimeType,
        });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));

        // Stop all media tracks
        stopMediaTracks();
      };

      mediaRecorder.start(5000); // Capture data every 5 seconds
      setIsRecording(true);
      setRecordingTime(0);
      startTimer();
    } catch (err: any) {
      console.error("Error starting recording:", err);
      stopMediaTracks();
      setError(err.message || "Failed to start recording. Please allow microphone access.");
    }
  }, [startTimer, stopMediaTracks]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  }, [isRecording, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  }, [isRecording, isPaused, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  }, [isRecording, isPaused, startTimer]);

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
  }, [audioUrl, stopMediaTracks]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    translations,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  };
}

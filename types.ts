export enum AppMode {
  CHAT = 'CHAT',
  TRANSCRIBE = 'TRANSCRIBE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface TranscriptionState {
  file: File | null;
  previewUrl: string | null;
  transcription: string;
  isLoading: boolean;
  error: string | null;
  progress: string; // "Uploading", "Processing", etc.
}

export type FileType = 'audio' | 'video' | null;
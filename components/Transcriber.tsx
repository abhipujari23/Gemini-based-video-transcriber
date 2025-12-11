import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, FileVideo, X, Play, Pause, AlertTriangle, FileText, CheckCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TranscriptionState } from '../types';
import { fileToBase64, getMimeType } from '../services/utils';
import { transcribeMedia } from '../services/geminiService';

const Transcriber: React.FC = () => {
  const [state, setState] = useState<TranscriptionState>({
    file: null,
    previewUrl: null,
    transcription: '',
    isLoading: false,
    error: null,
    progress: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB soft warning, though Gemini API limit is higher (20MB for prompt part generally safe, but can go higher with File API - sticking to base64 inline limits for demo)
         // Actually, GoogleGenAI inlineData is limited. For larger files, we should use File API, but that requires more setup. 
         // We'll proceed but warn.
         setState(prev => ({ ...prev, error: "File is large. Transcription may fail if it exceeds API inline limits (~20MB). For larger files, use the official AI Studio." }));
      }
      
      const url = URL.createObjectURL(file);
      setState({
        file,
        previewUrl: url,
        transcription: '',
        isLoading: false,
        error: null,
        progress: ''
      });
    }
  };

  const clearFile = () => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    setState({
      file: null,
      previewUrl: null,
      transcription: '',
      isLoading: false,
      error: null,
      progress: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTranscribe = async () => {
    if (!state.file) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 'Reading file...' }));

    try {
      const base64 = await fileToBase64(state.file);
      const mimeType = getMimeType(state.file);

      setState(prev => ({ ...prev, progress: 'Sending to Gemini...' }));
      
      const transcript = await transcribeMedia(base64, mimeType);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        transcription: transcript,
        progress: ''
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Failed to transcribe. Please try again or use a smaller file.",
        progress: ''
      }));
    }
  };

  const isVideo = state.file?.type.startsWith('video/');

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 overflow-hidden">
      
      {/* Left Panel: Input */}
      <div className="w-full md:w-1/2 p-6 border-r border-slate-800 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FileAudio className="text-purple-400" />
          Media Input
        </h2>

        {!state.file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-900 hover:border-purple-500 transition-all min-h-[400px]"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="audio/*,video/*" 
              className="hidden" 
            />
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Click to Upload</h3>
            <p className="text-slate-500 max-w-xs">
              Select an audio or video file. <br/>
              Support for Hinglish & English transcription.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative">
              <button 
                onClick={clearFile}
                className="absolute top-2 right-2 p-1 bg-slate-800 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                {isVideo ? <FileVideo className="text-blue-400" /> : <FileAudio className="text-purple-400" />}
                <span className="font-medium text-slate-200 truncate">{state.file.name}</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  {(state.file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                {state.previewUrl && (
                  isVideo ? (
                    <video src={state.previewUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <audio src={state.previewUrl} controls className="w-full px-4" />
                  )
                )}
              </div>
            </div>

            {state.error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm">{state.error}</p>
              </div>
            )}

            <button
              onClick={handleTranscribe}
              disabled={state.isLoading}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                state.isLoading 
                  ? 'bg-slate-800 text-slate-400 cursor-wait' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
              }`}
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {state.progress}
                </>
              ) : (
                <>
                  <FileText />
                  Generate Transcript
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Right Panel: Output */}
      <div className="w-full md:w-1/2 p-6 bg-slate-900/50 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <CheckCircle className="text-emerald-400" />
          Transcript
        </h2>

        {state.transcription ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm min-h-[400px]">
             <div className="prose prose-invert max-w-none">
               <ReactMarkdown>{state.transcription}</ReactMarkdown>
             </div>
          </div>
        ) : (
          <div className="h-[400px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
             <FileText className="w-16 h-16 mb-4 opacity-20" />
             <p>Transcript will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transcriber;
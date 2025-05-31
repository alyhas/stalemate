// src/liveClient.ts

import {
    GoogleGenAI,
    LiveServerMessage,
    Modality,
    MediaResolution,
    Session,
  } from '@google/genai';
  
  let session: Session | null = null;
  // simple list of callbacks to fan out every incoming message
  const subscribers: Array<(msg: LiveServerMessage) => void> = [];
  
  /**
   * Opens (or re-uses) a live audio session.
   */
  export async function getLiveSession(): Promise<Session> {
    if (session) return session;
  
    const ai = new GoogleGenAI({
      apiKey: process.env.REACT_APP_GEMINI_API_KEY!,
    });
  
    session = await ai.live.connect({
      model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
      callbacks: {
        onopen: () => console.debug('[Live] open'),
        onmessage: (msg) => {
          // broadcast to all subscribers
          subscribers.forEach((cb) => cb(msg));
        },
        onerror: (e) => console.error('[Live] error', e),
        onclose: () => console.debug('[Live] closed'),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Zephyr', // or swap in another prebuilt voice
            },
          },
        },
      },
    });
  
    return session;
  }
  
  /**
   * Sends one user turn and resolves when turnComplete arrives.
   * onMsg will be called for every LiveServerMessage that comes back.
   */
  export async function sendTurn(
    prompt: string,
    onMsg: (msg: LiveServerMessage) => void
  ): Promise<void> {
    const sess = await getLiveSession();
  
    return new Promise<void>((resolve) => {
      const wrapper = (msg: LiveServerMessage) => {
        onMsg(msg);
        if (msg.serverContent?.turnComplete) {
          // unsubscribe and resolve
          const i = subscribers.indexOf(wrapper);
          if (i >= 0) subscribers.splice(i, 1);
          resolve();
        }
      };
  
      subscribers.push(wrapper);
      sess.sendClientContent({ turns: [prompt] });
    });
  }
  

export enum ToolType {
  CLIPPER = 'CLIPPER',
  SCREENSHOT = 'SCREENSHOT',
  DOWNLOAD = 'DOWNLOAD',
  NONE = 'NONE'
}

export interface TimedWord {
  word: string;
  start: number; // seconds relative to clip start
  end: number; // seconds
}

export interface VideoClip {
  id: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  duration: number;
  description: string;
  score: number;
  captions?: TimedWord[];
}

export interface CaptionStyle {
  id: string;
  name: string;
  font: string;
  color: string;
  secondaryColor: string;
  shadow: string;
  case: 'uppercase' | 'capitalize' | 'none';
  animation: 'pop' | 'slide' | 'glow';
}

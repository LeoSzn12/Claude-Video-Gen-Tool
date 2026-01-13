export interface TimelineBeat {
  id: string;
  label: string;
  text: string;
  duration: number;
}

export interface TimelinePlan {
  total_duration: number;
  beats: TimelineBeat[];
  transitions: string[];
}

export interface TemplateConfig {
  beats?: Array<{ role: string; minDuration: number; maxDuration: number }>;
  pacingCurve?: string;
  cutDensityBand?: string;
  transitions?: Record<string, number>;
  textRules?: {
    maxCards: number;
    maxWordsPerCard: number;
    minDuration: number;
  };
  defaults?: {
    runtime: number;
    aspectRatio: string;
  };
}

interface TimelineInputs {
  templateName: string;
  templateConfig?: TemplateConfig;
  book: {
    title: string;
    author?: string;
    synopsis: string;
    quote?: string;
  };
}

export function buildTimelinePlan(inputs: TimelineInputs): TimelinePlan {
  const defaultBeats = [
    { role: 'hook', minDuration: 3, maxDuration: 4 },
    { role: 'world', minDuration: 4, maxDuration: 5 },
    { role: 'cta', minDuration: 3, maxDuration: 4 },
  ];

  const beatConfig = inputs.templateConfig?.beats ?? defaultBeats;
  const pickDuration = (beat: { minDuration: number; maxDuration: number }) =>
    Math.max(beat.minDuration, Math.round((beat.minDuration + beat.maxDuration) / 2));

  const beats: TimelineBeat[] = beatConfig.map((beat) => ({
    id: beat.role,
    label: beat.role.charAt(0).toUpperCase() + beat.role.slice(1),
    text:
      beat.role === 'hook'
        ? inputs.book.quote || `Discover ${inputs.book.title}`
        : beat.role === 'cta'
          ? `${inputs.book.title} — ${inputs.book.author ?? 'Available now'}`
          : inputs.book.synopsis.slice(0, 120),
    duration: pickDuration(beat),
  }));

  const totalDuration = beats.reduce((acc, beat) => acc + beat.duration, 0);

  return {
    total_duration: totalDuration,
    beats,
    transitions: Array.from({ length: Math.max(beats.length - 1, 0) }, () => 'fade'),
  };
}

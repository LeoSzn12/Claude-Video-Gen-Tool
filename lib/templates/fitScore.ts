import { TemplateConfig } from '../render/timelinePlan';

interface FitScoreBreakdown {
  structure: number;
  pacing: number;
  text_density: number;
  transitions: number;
  continuity: number;
  output_quality: number;
}

interface FitScoreResult {
  score: number;
  breakdown: FitScoreBreakdown;
  alerts: string[];
  recommendations: string[];
}

export function computeFitScore(config: TemplateConfig): FitScoreResult {
  const alerts: string[] = [];
  const recommendations: string[] = [];

  const beats = config.beats ?? [];
  const beatCount = beats.length || 1;
  const avgDuration =
    beats.reduce((acc, beat) => acc + (beat.minDuration + beat.maxDuration) / 2, 0) / beatCount;

  const structure = Math.max(60, 100 - Math.abs(beatCount - 4) * 10);
  const pacing = Math.max(50, 100 - Math.abs(avgDuration - 4) * 8);
  const textRules = config.textRules;
  const textDensity = textRules
    ? Math.max(50, 100 - Math.abs(textRules.maxWordsPerCard - 12) * 3)
    : 70;
  const transitions = config.transitions ? 80 : 65;
  const continuity = config.pacingCurve ? 85 : 70;
  const outputQuality = config.defaults?.aspectRatio ? 90 : 75;

  if (avgDuration < 2.5) {
    alerts.push('Shots are very short; pacing may feel rushed.');
    recommendations.push('Increase minimum beat durations to 3s.');
  }

  if (textRules && textRules.maxWordsPerCard > 18) {
    alerts.push('Text density is high and may be hard to read.');
    recommendations.push('Reduce max words per card to 12-14.');
  }

  if (!config.transitions) {
    alerts.push('No transition distribution provided.');
    recommendations.push('Add transition weights for hard cut, dip, zoom, blur.');
  }

  const breakdown = {
    structure,
    pacing,
    text_density: textDensity,
    transitions,
    continuity,
    output_quality: outputQuality,
  };

  const score = Math.round(
    (structure + pacing + textDensity + transitions + continuity + outputQuality) / 6
  );

  return { score, breakdown, alerts, recommendations };
}

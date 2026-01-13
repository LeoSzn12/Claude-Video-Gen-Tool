import { TimelinePlan, TimelineBeat } from './timelinePlan';

interface RemixSettings {
  beatId?: string;
  fasterCuts?: boolean;
  moreText?: boolean;
  characterFocus?: boolean;
}

function clampDuration(value: number, min = 1, max = 10) {
  return Math.min(Math.max(value, min), max);
}

export function applyRemix(plan: TimelinePlan, settings: RemixSettings): TimelinePlan {
  const beats = plan.beats.map((beat) => {
    if (settings.beatId && beat.id !== settings.beatId) {
      return beat;
    }

    let duration = beat.duration;
    if (settings.fasterCuts) {
      duration = clampDuration(duration - 1, 1, 6);
    }
    if (settings.moreText) {
      duration = clampDuration(duration + 1, 2, 8);
    }

    let text = beat.text;
    if (settings.characterFocus) {
      text = `${text} — focus on character`;
    }

    return { ...beat, duration, text } as TimelineBeat;
  });

  const totalDuration = beats.reduce((acc, beat) => acc + beat.duration, 0);

  return {
    ...plan,
    beats,
    total_duration: totalDuration,
  };
}

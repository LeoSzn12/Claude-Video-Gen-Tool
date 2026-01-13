import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

interface Shot {
  start: number;
  end: number;
  duration: number;
}

interface StudyDna {
  duration_sec: number;
  fps: number;
  resolution: { width: number; height: number };
  shots: Shot[];
  cut_density: number;
  avg_shot_length: number;
  pacing_by_thirds: {
    first: number;
    middle: number;
    last: number;
  };
}

function parseFrameRate(rate: string) {
  if (!rate.includes('/')) {
    return Number(rate);
  }
  const [num, den] = rate.split('/').map(Number);
  return den ? num / den : Number(rate);
}

function buildShots(cutTimes: number[], duration: number) {
  const times = [0, ...cutTimes.filter((t) => t > 0 && t < duration), duration];
  const shots: Shot[] = [];

  for (let i = 0; i < times.length - 1; i += 1) {
    const start = times[i];
    const end = times[i + 1];
    shots.push({ start, end, duration: Number((end - start).toFixed(3)) });
  }

  return shots;
}

function computePacing(shots: Shot[], duration: number) {
  const thirds = {
    first: [] as Shot[],
    middle: [] as Shot[],
    last: [] as Shot[],
  };

  shots.forEach((shot) => {
    const midpoint = (shot.start + shot.end) / 2;
    const ratio = midpoint / duration;
    if (ratio < 1 / 3) {
      thirds.first.push(shot);
    } else if (ratio < 2 / 3) {
      thirds.middle.push(shot);
    } else {
      thirds.last.push(shot);
    }
  });

  const average = (list: Shot[]) =>
    list.length === 0 ? 0 : list.reduce((acc, shot) => acc + shot.duration, 0) / list.length;

  return {
    first: Number(average(thirds.first).toFixed(3)),
    middle: Number(average(thirds.middle).toFixed(3)),
    last: Number(average(thirds.last).toFixed(3)),
  };
}

async function probeVideo(filePath: string) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height,r_frame_rate',
    '-show_entries',
    'format=duration',
    '-of',
    'json',
    filePath,
  ]);

  const parsed = JSON.parse(stdout);
  const stream = parsed.streams?.[0];
  const duration = Number(parsed.format?.duration ?? 0);
  const width = Number(stream?.width ?? 0);
  const height = Number(stream?.height ?? 0);
  const fps = parseFrameRate(stream?.r_frame_rate ?? '0');

  return { duration, width, height, fps };
}

async function detectCuts(filePath: string) {
  const { stderr } = await execFileAsync('ffmpeg', [
    '-i',
    filePath,
    '-vf',
    "select='gt(scene,0.3)',showinfo",
    '-f',
    'null',
    '-',
  ]);

  const cutTimes: number[] = [];
  const regex = /pts_time:([0-9.]+)/g;
  let match = regex.exec(stderr);
  while (match) {
    cutTimes.push(Number(match[1]));
    match = regex.exec(stderr);
  }

  return cutTimes;
}

export async function extractStudyDna(filePath: string): Promise<StudyDna> {
  const { duration, width, height, fps } = await probeVideo(filePath);
  const cutTimes = await detectCuts(filePath);
  const shots = buildShots(cutTimes, duration);
  const avgShotLength = shots.length
    ? Number((duration / shots.length).toFixed(3))
    : 0;
  const cutDensity = duration ? Number((cutTimes.length / duration).toFixed(3)) : 0;

  return {
    duration_sec: Number(duration.toFixed(3)),
    fps: Number(fps.toFixed(3)),
    resolution: { width, height },
    shots,
    cut_density: cutDensity,
    avg_shot_length: avgShotLength,
    pacing_by_thirds: computePacing(shots, duration || 1),
  };
}

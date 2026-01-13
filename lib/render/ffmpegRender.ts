import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { TimelinePlan } from './timelinePlan';

const execFileAsync = promisify(execFile);

const DEFAULT_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

function escapeDrawText(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/\n/g, ' ');
}

export async function renderTimelinePlan(plan: TimelinePlan) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'trailer-dna-'));
  const outputPath = path.join(tempDir, 'render.mp4');

  const inputs: string[] = [];
  const filters: string[] = [];

  plan.beats.forEach((beat, index) => {
    inputs.push(
      '-f',
      'lavfi',
      '-i',
      `color=c=black:s=1280x720:d=${beat.duration}`
    );

    const safeText = escapeDrawText(beat.text);
    const drawText = `drawtext=fontfile=${DEFAULT_FONT}:text='${safeText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`;
    filters.push(`[${index}:v]${drawText}[v${index}]`);
  });

  const concatInputs = plan.beats.map((_, index) => `[v${index}]`).join('');
  const concatFilter = `${concatInputs}concat=n=${plan.beats.length}:v=1:a=0,format=yuv420p[v]`;
  const filterComplex = `${filters.join(';')};${concatFilter}`;

  await execFileAsync('ffmpeg', [
    ...inputs,
    '-filter_complex',
    filterComplex,
    '-map',
    '[v]',
    '-c:v',
    'libx264',
    '-movflags',
    '+faststart',
    outputPath,
  ]);

  const buffer = await fs.readFile(outputPath);
  await fs.rm(tempDir, { recursive: true, force: true });
  return { buffer };
}

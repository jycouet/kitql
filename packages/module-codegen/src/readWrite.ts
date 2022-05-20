import path from 'path';
import fs from 'fs';

export function read(pathFile: string): string {
  return fs.readFileSync(pathFile, { encoding: 'utf8' });
}

export function readLines(pathFile: string): string[] {
  return read(pathFile).split('\n');
}

export function write(pathFile: string, data: string[]) {
  fs.writeFileSync(path.join(pathFile), data.join('\n'));
}

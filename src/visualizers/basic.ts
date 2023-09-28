import { color, range } from "../variables";
import { rgbFromHex } from '../utils'
import type { DrawParams } from "./types";

export const initVariables = {
  barFillStyle: color('#668ff0'),
  backgroundColor: color('#494fa7'),
  compression: range(.25),
  height: range(.5),
};

export function draw({ ctx, analyser, dimensions: { height, width }, variables }: DrawParams<typeof initVariables>) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  analyser.getByteFrequencyData(dataArray);

  const bass = dataArray[5];
  const rgb = rgbFromHex(variables.backgroundColor).map(n => n * bass / 255)
  ctx.fillStyle = `rgb(${rgb.toString()}, 0.3)`;
  ctx.fillRect(0, 0, width, height);

  const avgFreq = dataArray.reduce((total, curr) => total + curr, 0) / dataArray.length;
  for (let i = 0; i < dataArray.length; i++) {
    if (dataArray[i] === 0) continue;
    dataArray[i] += (avgFreq - dataArray[i]) * variables.compression;
  }

  const frequencies = [
    ...[...dataArray].reverse(), 
    ...dataArray,
  ];

  ctx.fillStyle = variables.barFillStyle;
  for (const [index, byte] of frequencies.entries()) {
    const barWidth = width / frequencies.length;
    const barHeight = (byte / 255) * height * 2 * variables.height;

    ctx.fillRect(
      index * barWidth,
      height / 2 - barHeight / 2,
      (barWidth + 5) * (bass / 255),
      barHeight
    );
  }
}

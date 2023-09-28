import { color, range } from "../variables";
import { rgbFromHex } from '../utils'
import type { DrawParams } from "./types";

export const initVariables = {
  strokeFillStyle: color('#668ff0'),
  backgroundColor: color('#134063'),
  smoothness: range(0, 0, 10, 1),
  height: range(.5),
};

export function draw({ ctx, analyser, dimensions: { height, width }, variables }: DrawParams<typeof initVariables>) {
  const bufferLength = analyser.frequencyBinCount;
  let dataArray = new Uint8Array(bufferLength);

  analyser.getByteFrequencyData(dataArray);

  const bass = dataArray[5];
  const rgb = rgbFromHex(variables.backgroundColor).map(n => n * bass / 255)
  ctx.fillStyle = `rgb(${rgb.toString()}, 0.3)`;
  ctx.fillRect(0, 0, width, height);

  for (let j = 0; j < variables.smoothness; j++) {
    for (let i = 1; i < dataArray.length - 1; i++) {
      const avg = (dataArray[i - 1] + dataArray[i] + dataArray[i + 1]) / 3
      dataArray[i] = avg;
    }
  }
  
  const frequencies = [
    ...[...dataArray].reverse(), 
    ...dataArray,
  ];

  ctx.beginPath();
  ctx.strokeStyle = variables.strokeFillStyle;
  for (const [index, byte] of frequencies.entries()) {
    const barWidth = width / frequencies.length;
    const barHeight = (byte / 255) * height * 2 * variables.height;

    ctx.lineTo((index - 0.5) * barWidth, height / 2 + barHeight / 2);
    ctx.lineTo(index * barWidth, height / 2 - barHeight / 2);
  }
  ctx.stroke();
}

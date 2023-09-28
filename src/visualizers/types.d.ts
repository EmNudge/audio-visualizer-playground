import type { InitVariables, VariablesOf } from "../variables";

interface DrawParams<T extends InitVariables> {
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNode,
  dimensions: { height: number, width: number },
  variables: VariablesOf<T>;
}

export type DrawModule = { draw: (params: DrawParams<any>) => void, initVariables: InitVariables };
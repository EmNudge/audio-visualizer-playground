export const color = (value: string) => ({ type: "COLOR" as const, value });

export const range = (value = 0, min = 0, max = 1, step = 0.05) => ({
  type: "RANGE" as const,
  value,
  min,
  max,
  step,
});

export const boolean = (value = false) => ({ type: "BOOLEAN" as const, value });

export type InitVariables = { [key: string]: ReturnType<typeof range | typeof color | typeof boolean> };
export type VariablesOf<T extends InitVariables> = {
  [key in keyof T]: T[key]["value"];
};

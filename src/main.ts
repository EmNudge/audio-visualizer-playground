import "../style.css";
import { draw, initVariables } from "./visualizers/line";
import moduleText from './visualizers/line?raw';
import { configureInputs, getAudio, setCode } from "./utils";
import type { VariablesOf } from "./variables";

setCode(moduleText);

const canvas = document.querySelector("canvas");

const args = {
  ctx: canvas.getContext("2d"), 
  analyser: getAudio(128), 
  dimensions: { height: canvas.height, width: canvas.width },
  variables: {} as VariablesOf<typeof initVariables>,
};

configureInputs(initVariables, args.variables);

let drawFunc = draw;

if (import.meta.hot) {
  import.meta.hot.accept('./visualizers/line.ts?raw', (moduleText) => {
    setCode(moduleText.default);
  });

  import.meta.hot.accept('./visualizers/line.ts', (newModule) => {
    try {
      // update draw function
      newModule?.draw(args);
      drawFunc = newModule.draw;

      // update variables
      const newVarKeys = Object.keys(newModule?.initVariables ?? {}).sort()
        .toString();
      const oldVarKeys = Object.keys(args.variables).sort().toString();

      if (newVarKeys !== oldVarKeys) {
        configureInputs(newModule?.initVariables, args.variables);
      }
    } catch (e) {
      console.error(e);
    }
  });

}

function loop() {
  drawFunc(args);

  requestAnimationFrame(loop);
}

loop();

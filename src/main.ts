import "./style.css";
import { draw, initVariables } from "./visualizers/line";
import moduleText from './visualizers/line?raw';
import { configureInputs, getAudio, setCode } from "./utils";
import type { VariablesOf } from "./variables";

// handle audio loading and caching
{
  const songContainerEl = document.querySelector('.song-name-container');
  const nameEl = songContainerEl.querySelector('h2');
  const inputEl = songContainerEl.querySelector('input');
  const audioEl = document.querySelector('audio');

  caches.open('audioCache').then(async cache => {
    const audioResp = await cache.match('audioFile');
    if (!audioResp) return;

    const blob = await audioResp.blob();
    const name = await cache.match('audioName').then((resp) => resp.text());

    audioEl.src = URL.createObjectURL(blob);
    nameEl.textContent = name;
  });

  inputEl.addEventListener('input', () => {
    const file = inputEl.files[0];
    audioEl.src = URL.createObjectURL(file);
    nameEl.textContent = file.name;

    caches.open('audioCache').then(async cache => {
      await cache.put('audioFile', new Response(file));
      await cache.put('audioName', new Response(file.name));
    });
  });
}

const canvas = document.querySelector("canvas");

const args = {
  ctx: canvas.getContext("2d"), 
  analyser: getAudio(128), 
  dimensions: { height: canvas.height, width: canvas.width },
  variables: {} as VariablesOf<typeof initVariables>,
};

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

setCode(moduleText);
configureInputs(initVariables, args.variables);

function loop() {
  drawFunc(args);

  requestAnimationFrame(loop);
}

loop();

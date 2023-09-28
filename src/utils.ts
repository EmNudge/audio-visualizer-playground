import Prism from "prismjs";
import type { InitVariables, VariablesOf } from "./variables";

export const rgbFromHex = (hex: string) =>
  hex.slice(1).match(/.{2}/g).map((n) => parseInt(n, 16));

const FUNC_REGEX = /function\s+draw.+?\)\s*{([\s\S]+)}\s*$/;
const funcFromText = (text: string) => {
  const funcContents = text
    .match(FUNC_REGEX)[1]
    .replace(/^ {2}/gm, "")
    .trim();

  return funcContents;
};

export function setCode(moduleText: string) {
  const codeEl = document.createElement("code");
  const html = Prism.highlight(
    funcFromText(moduleText),
    Prism.languages.javascript,
    "javascript",
  );
  codeEl.innerHTML = `<pre>${html}</pre>`;

  const codeContainer = document.querySelector(".code-container");
  codeContainer.innerHTML = "";
  codeContainer.append(codeEl);
}

export function getAudio(fftSize = 1024) {
  const audio = document.querySelector("audio");
  audio.volume = 0.15;

  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;

  const source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);

  const gainNode = audioContext.createGain();
  gainNode.gain.value = .8;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Allow testing with the mic!
  {
    let mediaNode: MediaStreamAudioSourceNode;
    // @ts-ignore
    window.useMic = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      mediaNode = new MediaStreamAudioSourceNode(audioContext, {
        mediaStream: stream,
      });
      source.disconnect(gainNode);
      source.disconnect(analyser);
      mediaNode.connect(gainNode);
      mediaNode.connect(analyser);
    };
    // @ts-ignore
    window.removeMic = () => {
      if (!mediaNode) {
        console.log('mic is not connected');
        return;
      }

      source.connect(gainNode);
      source.connect(analyser);
      mediaNode.connect(gainNode);
      mediaNode.connect(analyser);
    }
  }

  return analyser;
}

export function configureInputs(
  initVariables: InitVariables,
  variables: VariablesOf<any>,
) {
  const fieldSet = document.querySelector(".variables-container");

  for (const key in variables) {
    if (key in initVariables) continue;
    delete variables[key];
  }
  for (const key in initVariables) {
    variables[key] = initVariables[key].value;
  }

  const getInputForInitVar = (initVar: InitVariables[string]) => {
    if (initVar.type === "RANGE") {
      return `<input type="range" step="${initVar.step}" min="${initVar.min}" max="${initVar.max}" value="${initVar.value}">`;
    }
    if (initVar.type === "COLOR") {
      return `<input class="border-opacity-0" type="color" value="${initVar.value}">`;
    }
    return `<input type="checkbox" checked="${String(initVar.value)}">`;
  };

  fieldSet.innerHTML = Object
    .entries(initVariables)
    .map(([key, initVar]) => `
      <div class="key">${key}</div>
      <div class="h-10 w-10">${getInputForInitVar(initVar)}</div>
    `).join("");

  const keyEls = document.querySelectorAll(".variables-container .key");
  const inputEls = document.querySelectorAll(".variables-container input") as NodeListOf<HTMLInputElement>;

  for (const [index, keyEl] of keyEls.entries()) {
    const key = keyEl.textContent;
    const input = inputEls[index];
    input.addEventListener("input", () => {
      variables[key] = input.type === 'checkbox' ? input.checked : input.value;
    });
  }
}

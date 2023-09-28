# Audio Visualizer Playground

This is a quick project for use with iterating on audio visualizers.

It uses vite's HMR boundaries to allow editing an audio visualizer while the audio plays.
We can also declare dynamic variables that are type checked and editable in the GUI for more experimentation.

## Usage

This project uses `pnpm`. You can alternatively still use `npm` as the `package.json` still exists.

```sh
pnpm install
npm run dev
```

You can then choose a local audio file on your computer. This file is persisted using the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache).

Edit the visualizers in the `src/visualizers/` folder. You must update the imports in `src/main.ts` to change the active visualizer.

Variables can be declared via the `initVariables` export.

```js
export const initVariables = {
  strokeFillStyle: color('#668ff0'),
  backgroundColor: color('#134063'),
  smoothness: range(0, 0, 10, 1),
  height: range(.5),
};
```

This declares 4 GUI variables which can be used in our draw function. We can edit this file and save to dynamically update the view without reloading the application as long as our dev server is still running.

The global functions `useMic` and `removeMic` are available if you'd like to test using your microphone instead of an audio file.
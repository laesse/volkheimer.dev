import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js';

type Vector = readonly [number, number];

const gameWidth = 40;
const gameHeight = 24;

const [snakePos, setSnakePos] = createSignal<Vector>([0, 0]);
const [snakeDir, setSnakeDir] = createSignal<Vector>([1, 0]);
const [applePos, setApplePos] = createSignal<Vector>([
  Math.floor(Math.random() * gameWidth),
  Math.floor(Math.random() * gameHeight),
]);
const [snakePastPos, setSnakePastPos] = createSignal<Vector[]>([], { equals: false });
const [snakeLen, setSnakeLen] = createSignal(3);

const Snake = () => {
  createEffect(() => console.log(snakePastPos()));
  return (
    <For each={snakePastPos()}>
      {(snakeElem) => (
        <div
          style={`position:absolute; left: ${snakeElem[0]}rem; top: ${snakeElem[1]}rem; `}
          class="h-4 bg-blue-500 w-4"
        ></div>
      )}
    </For>
  );
};

const Apple = () => {
  return (
    <Show when={applePos()} fallback={<div>no apple</div>}>
      <div
        style={`position:absolute; left: ${applePos()?.[0]}rem; top: ${applePos()?.[1]}rem; `}
        class="h-4 bg-green-500 w-4"
      ></div>
    </Show>
  );
};

const Board = () => {
  return (
    <div
      class="border border-green-600 relative"
      id="board"
      style={`width: ${gameWidth}rem; height: ${gameHeight}rem; `}
    >
      <Snake />
      <Apple />
    </div>
  );
};

const goDown = (snakeDir: Vector) => (snakeDir[1] !== -1 ? ([0, 1] as const) : snakeDir);
const goUp = (snakeDir: Vector) => (snakeDir[1] !== 1 ? ([0, -1] as const) : snakeDir);
const goLeft = (snakeDir: Vector) => (snakeDir[0] !== 1 ? ([-1, 0] as const) : snakeDir);
const goRight = (snakeDir: Vector) => (snakeDir[0] !== -1 ? ([1, 0] as const) : snakeDir);
const handleKeyPresses = () => {
  const handleSnakeUpdate = (event: Event) => {
    switch ((event as KeyboardEvent).code) {
      case 'KeyS':
      case 'ArrowDown':
        setSnakeDir(goDown);
        break;
      case 'KeyW':
      case 'ArrowUp':
        setSnakeDir(goUp);
        break;
      case 'KeyA':
      case 'ArrowLeft':
        setSnakeDir(goLeft);
        break;
      case 'KeyD':
      case 'ArrowRight':
        setSnakeDir(goRight);
        break;
    }
  };

  document.addEventListener('keydown', handleSnakeUpdate);
};

const handleSwipe = () => {
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);

  let xDown: number = 0;
  let yDown: number = 0;

  function handleTouchStart(evt: TouchEvent) {
    console.log('touch start');
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  }

  function handleTouchMove(evt: TouchEvent) {
    console.log('touch move');

    if (!xDown || !yDown) {
      return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff < 0) {
        setSnakeDir(goRight);
      } else {
        setSnakeDir(goLeft);
      }
    } else {
      if (yDiff < 0) {
        setSnakeDir(goDown);
      } else {
        setSnakeDir(goUp);
      }
    }
    xDown = 0;
    yDown = 0;
  }
};

const resetApplePos = () => {
  setApplePos([Math.floor(Math.random() * gameWidth), Math.floor(Math.random() * gameHeight)]);
};

const gameLoop = () => {
  const snakeUpdate = setInterval(() => {
    const newSnakePos = [
      (snakePos()[0] + snakeDir()[0] + gameWidth) % gameWidth,
      (snakePos()[1] + snakeDir()[1] + gameHeight) % gameHeight,
    ] as const;

    if (applePos()?.[0] === newSnakePos[0] && applePos()?.[1] === newSnakePos[1]) {
      setSnakeLen((len) => len + 1);
      resetApplePos();
    }

    setSnakePastPos((pastPos) => {
      if (pastPos.length === snakeLen()) {
        pastPos.shift();
      }
      pastPos.push(snakePos());
      return pastPos;
    });
    setSnakePos(newSnakePos);
  }, 100);

  onCleanup(() => clearInterval(snakeUpdate));
};
export const SnakeGame = () => {
  gameLoop();
  handleSwipe();
  handleKeyPresses();

  return (
    <div class="flex justify-center">
      <Board />
    </div>
  );
};

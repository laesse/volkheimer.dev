import { createSignal, For, Index, JSX } from 'solid-js';
import { RookLight } from '../components/pieces/rl';
import classnames from 'classnames';
import {
  createDraggable,
  createDroppable,
  DragDropProvider,
  DragDropSensors,
  useDragDropContext,
} from '@thisbeyond/solid-dnd';

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      draggable: boolean;
      droppable: boolean;
    }
  }
}

const Empty = 0;
const Pawn = 1;
const Knight = 2;
const Bishop = 3;
const Rook = 4;
const Queen = 5;
const King = 6;

const White = 8;
const Black = 16;

let nameMap = ['', 'p', 'n', 'b', 'r', 'q', 'k', '', 'l'];
nameMap[16] = 'd';

type FigureColor = typeof White | typeof Black;
type FigureType =
  | typeof Pawn
  | typeof Knight
  | typeof Bishop
  | typeof Rook
  | typeof Queen
  | typeof King;

const getColour = (figure: ChessFigureValue): FigureColor => (0b11000 & figure) as FigureColor;
const getType = (figure: ChessFigureValue): FigureType => (0b00111 & figure) as FigureType;
const getImgName = (figure: ChessFigureValue) => {
  const name = `p/${nameMap[getType(figure)]}${nameMap[getColour(figure)]}.svg`;

  if (name.length < 8) {
    return null;
  }
  return name;
};

type ChessFigureValue = number;
type RankValues = [
  ChessFigureValue,
  ChessFigureValue,
  ChessFigureValue,
  ChessFigureValue,
  ChessFigureValue,
  ChessFigureValue,
  ChessFigureValue,
  ChessFigureValue
];
type BoardValues = [
  RankValues,
  RankValues,
  RankValues,
  RankValues,
  RankValues,
  RankValues,
  RankValues,
  RankValues
];

const makeBoard = (): BoardValues => {
  const rank: RankValues = [Empty, Empty, Empty, Empty, Empty, Empty, Empty, Empty];
  return [rank, rank, rank, rank, rank, rank, rank, rank];
};

function isNumber(n: string) {
  return !isNaN(parseInt(n));
}

const makeBoardFromFen = (fen: string): BoardValues => {
  const fenParts = fen.split(' ');
  const fenRanks = fenParts[0].split('/');
  return fenRanks
    .map(
      (fenRank) =>
        fenRank
          .split('')
          .flatMap((char) =>
            isNumber(char)
              ? Array(parseInt(char)).fill(Empty)
              : char.charCodeAt(0) <= 'z'.charCodeAt(0) && char.charCodeAt(0) >= 'a'.charCodeAt(0)
              ? nameMap.indexOf(char) | Black
              : nameMap.indexOf(char.toLowerCase()) | White
          ) as RankValues
    )
    .reverse() as BoardValues;
};

const updateBoard =
  (board: BoardValues) =>
  (fromFile: number, fromRank: number) =>
  (toFile: number, toRank: number) => {
    if (board[fromFile][toFile] === 0) {
    }
  };

const fenStartingPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const [baord, setBoard] = createSignal<BoardValues>(makeBoardFromFen(fenStartingPos));

const Piece = ({ figure }: { figure: number }) => {
  const draggable = createDraggable(1);

  const imgLoc = getImgName(figure);
  return (
    <div class="flex place-content-stretch">
      {imgLoc ? (
        <img
          src={imgLoc}
          use:draggable
          class="w-full h-full"
          classList={{ 'scale-90': draggable.isActiveDraggable }}
        />
      ) : (
        <img src="p/test.svg" class="w-full h-full" />
      )}
    </div>
  );
};

const Field = (props: {
  children: JSX.Element;
  pos: { rank: number; file: number };
  classList: Record<string, boolean>;
}) => {
  const droppable = createDroppable(, {
    pos: props.pos,
  });

  const context = useDragDropContext();

  return (
    <div use:droppable classList={props.classList}>
      {props.children}
    </div>
  );
};

export const Chess = () => {
  return (
    <section class="flex justify-center place-content-center h-screen border border-emerald-500">
      <DragDropProvider onDragEnd={() => console.log('test')}>
        <DragDropSensors />
        <div class="grid grid-cols-8 place-content-stretch place-self-center border-red-600 border-spacing-2 w-[90vh] h-[90vh]">
          <Index each={baord()}>
            {(rankArr, rankIndex) => (
              <Index each={rankArr()}>
                {(figure, fileIndex) => {
                  return (
                    <Field
                      pos={{ rank: rankIndex, file: fileIndex }}
                      classList={{
                        'bg-slate-200': (fileIndex + rankIndex) % 2 === 0,
                        'bg-blue-900': (fileIndex + rankIndex) % 2 !== 0,
                      }}
                    >
                      <Piece figure={figure()} />
                    </Field>
                  );
                }}
              </Index>
            )}
          </Index>
        </div>
      </DragDropProvider>
    </section>
  );
};

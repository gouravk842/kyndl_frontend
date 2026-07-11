"use client";

import { useMemo } from "react";

import {
  cellForPosition,
  GRID,
  RING_PATH,
  type SeatId,
  SEATS,
  STAR_RING_INDICES,
} from "../../lib/board";
import { SEAT_COLORS, type SeatColor } from "../../lib/colors";
import { useLudoStore } from "../../store";
import { Token, type TokenView } from "./token";

const SIZE_PCT = (1 / GRID) * 100;

function cellBox(r: number, c: number, span = 1) {
  return {
    left: `${(c / GRID) * 100}%`,
    top: `${(r / GRID) * 100}%`,
    width: `${SIZE_PCT * span}%`,
    height: `${SIZE_PCT * span}%`,
  } as const;
}

/** ring index → owning seat, for colouring the four start cells. */
const START_SEAT: Record<number, SeatId> = { 0: 0, 13: 1, 26: 2, 39: 3 };

export function Board() {
  const players = useLudoStore((s) => s.players);
  const turn = useLudoStore((s) => s.turn);
  const movable = useLudoStore((s) => s.movable);
  const pendingMove = useLudoStore((s) => s.pendingMove);
  const activity = useLudoStore((s) => s.activity);
  const busy = useLudoStore((s) => s.busy);
  const selectToken = useLudoStore((s) => s.selectToken);

  // seat → its colour (only seats that have a player)
  const seatColor = useMemo(() => {
    const map = new Map<SeatId, SeatColor>();
    for (const p of players) map.set(p.seat, SEAT_COLORS[p.color]);
    return map;
  }, [players]);

  const currentSeat = players[turn]?.seat;

  // Build token views with cluster offsets so co-located tokens fan out.
  const tokenViews = useMemo<TokenView[]>(() => {
    const groups = new Map<string, { seat: SeatId; index: number }[]>();
    for (const p of players) {
      for (const t of p.tokens) {
        const cell = cellForPosition(p.seat, t.pos, t.index);
        const key = `${Math.round(cell.r * 2)}-${Math.round(cell.c * 2)}`;
        const arr = groups.get(key) ?? [];
        arr.push({ seat: p.seat, index: t.index });
        groups.set(key, arr);
      }
    }

    const offsetFor = (key: string, seat: SeatId, index: number) => {
      const g = groups.get(key)!;
      if (g.length <= 1) return { dx: 0, dy: 0 };
      const i = g.findIndex((x) => x.seat === seat && x.index === index);
      const radius = 1.45;
      const a = (i / g.length) * Math.PI * 2;
      return { dx: Math.cos(a) * radius, dy: Math.sin(a) * radius };
    };

    return players.flatMap((p) =>
      p.tokens.map((t) => {
        const cell = cellForPosition(p.seat, t.pos, t.index);
        const key = `${Math.round(cell.r * 2)}-${Math.round(cell.c * 2)}`;
        const { dx, dy } = offsetFor(key, p.seat, t.index);
        const isMoving =
          pendingMove?.seat === p.seat && pendingMove.tokenIndex === t.index;
        const canMove =
          !busy &&
          !activity &&
          p.seat === currentSeat &&
          movable.includes(t.index);
        return {
          seat: p.seat,
          color: p.color,
          index: t.index,
          pos: t.pos,
          dx: isMoving ? 0 : dx,
          dy: isMoving ? 0 : dy,
          movable: canMove,
          waypoints: isMoving ? pendingMove.waypoints : undefined,
        };
      }),
    );
  }, [players, pendingMove, movable, currentSeat, busy, activity]);

  return (
    <div className="kyndl-ludo-board relative aspect-square w-full select-none overflow-hidden rounded-[20px]">
      {/* corner bases */}
      {(Object.keys(SEATS) as unknown as SeatId[]).map((seatKey) => {
        const seat = Number(seatKey) as SeatId;
        const color = seatColor.get(seat);
        return <Base key={`base-${seat}`} seat={seat} color={color ?? null} />;
      })}

      {/* track cells */}
      {RING_PATH.map((cell, idx) => {
        const startSeat = START_SEAT[idx];
        const startColor =
          startSeat !== undefined ? seatColor.get(startSeat) : undefined;
        const isStar = STAR_RING_INDICES.has(idx);
        return (
          <div
            key={`ring-${idx}`}
            className="absolute p-[2px]"
            style={cellBox(cell.r, cell.c)}
          >
            <div
              className="grid h-full w-full place-items-center rounded-[5px] border"
              style={{
                background: startColor ? startColor.soft : "#FFFDFB",
                borderColor: startColor ? startColor.base : "#EAD8C8",
              }}
            >
              {isStar && (
                <span
                  className="text-[60%] leading-none"
                  style={{ color: "#D9952B" }}
                >
                  ★
                </span>
              )}
              {startColor && !isStar && (
                <span
                  className="text-[58%] leading-none"
                  style={{ color: startColor.ink }}
                >
                  ➤
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* home columns */}
      {(Object.keys(SEATS) as unknown as SeatId[]).map((seatKey) => {
        const seat = Number(seatKey) as SeatId;
        const color = seatColor.get(seat) ?? null;
        return SEATS[seat].homeColumn.map((cell, i) => (
          <div
            key={`home-${seat}-${i}`}
            className="absolute p-[2px]"
            style={cellBox(cell.r, cell.c)}
          >
            <div
              className="h-full w-full rounded-[5px] border"
              style={{
                background: color ? color.base : "#F3E5D7",
                borderColor: color ? color.shade : "#E2CDB9",
                opacity: color ? 0.9 : 0.5,
              }}
            />
          </div>
        ));
      })}

      {/* centre home triangle */}
      <CenterTriangle seatColor={seatColor} />

      {/* tokens */}
      {tokenViews.map((view) => (
        <Token
          key={`${view.seat}-${view.index}`}
          view={view}
          onClick={view.movable ? () => selectToken(view.index) : undefined}
        />
      ))}
    </div>
  );
}

function Base({ seat, color }: { seat: SeatId; color: SeatColor | null }) {
  const box = SEATS[seat].baseBox;
  return (
    <div className="absolute p-[3px]" style={cellBox(box.r0, box.c0, 6)}>
      <div
        className="h-full w-full rounded-[14px]"
        style={{
          background: color
            ? `linear-gradient(150deg, ${color.base}, ${color.shade})`
            : "linear-gradient(150deg, #EFE0D2, #E4D2C0)",
        }}
      >
        <div className="grid h-full w-full place-items-center">
          <div
            className="grid grid-cols-2 gap-[14%] rounded-[10px] p-[12%]"
            style={{
              width: "78%",
              height: "78%",
              background: "rgba(255,253,251,0.92)",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  border: `2px dashed ${color ? color.base : "#D8C4B0"}`,
                  background: color ? color.soft : "#F6ECE1",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CenterTriangle({ seatColor }: { seatColor: Map<SeatId, SeatColor> }) {
  // Four triangles meeting at the middle, each tinted toward its seat.
  const tint = (seat: SeatId) => seatColor.get(seat)?.base ?? "#E7D6C5";
  return (
    <div className="absolute grid place-items-center" style={cellBox(6, 6, 3)}>
      <div className="relative h-full w-full overflow-hidden rounded-[8px]">
        <div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 45deg, ${tint(0)} 0deg 90deg, ${tint(1)} 90deg 180deg, ${tint(2)} 180deg 270deg, ${tint(3)} 270deg 360deg)`,
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[150%] drop-shadow">🏆</span>
        </div>
      </div>
    </div>
  );
}

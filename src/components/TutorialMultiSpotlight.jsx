// boundsRect 영역을 어둡게 덮고, holes로 전달된 영역들만 구멍을 내서 보이게/클릭 가능하게 함.
// (겹치는 구멍에서도 항상 정확하게 동작하도록 격자 분할 방식으로 어두운 영역만 타일링)
export const SPOTLIGHT_PAD = 0

export default function TutorialMultiSpotlight({ boundsRect, holes, pad = SPOTLIGHT_PAD }) {
  if (!boundsRect) return null
  const valid = (holes || []).filter(Boolean)
  if (valid.length === 0) return null

  const { left: bx, top: by, width: bw, height: bh } = boundsRect

  // 각 hole은 평범한 rect이거나, { rect, pad }처럼 개별 패딩을 지정할 수도 있음
  const boxes = valid.map(h => {
    const rect = h.rect || h
    const p = h.rect ? (h.pad ?? pad) : pad
    return {
      x: rect.left - bx - p,
      y: rect.top - by - p,
      w: rect.width + p * 2,
      h: rect.height + p * 2,
    }
  })

  const inHole = (px, py) => boxes.some(b => px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h)
  const clamp = v => Math.max(0, Math.min(bw, v))
  const clampY = v => Math.max(0, Math.min(bh, v))

  const xs = Array.from(new Set([0, bw, ...boxes.flatMap(b => [b.x, b.x + b.w])].map(clamp))).sort((a, b) => a - b)
  const ys = Array.from(new Set([0, bh, ...boxes.flatMap(b => [b.y, b.y + b.h])].map(clampY))).sort((a, b) => a - b)

  const darkCells = []
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const cx = (xs[i] + xs[i + 1]) / 2
      const cy = (ys[j] + ys[j + 1]) / 2
      if (!inHole(cx, cy)) {
        darkCells.push({ x: xs[i], y: ys[j], w: xs[i + 1] - xs[i], h: ys[j + 1] - ys[j] })
      }
    }
  }

  return (
    <>
      {darkCells.map((c, idx) => (
        <div key={idx} style={{
          position: 'fixed', left: bx + c.x, top: by + c.y, width: c.w, height: c.h,
          zIndex: 3000, background: 'rgba(0,0,0,0.6)',
        }} />
      ))}
    </>
  )
}

const SWISS_PALETTE: number[] = [210, 262, 330, 190, 40, 300, 160]

export function placeholderImage(hue: number): string {
  const h = hue
  const svg = [
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 300'>`,
    `<rect width='480' height='300' fill='hsl(${h} 45% 14%)'/>`,
    `<rect x='36' y='36' width='252' height='228' fill='hsl(${h} 65% 55% / .25)'/>`,
    `<rect x='300' y='36' width='144' height='108' fill='hsl(${h + 40} 65% 60% / .18)'/>`,
    `<rect x='300' y='156' width='144' height='108' fill='hsl(${h} 65% 60% / .12)'/>`,
    `<rect x='36' y='282' width='408' height='4' fill='hsl(${h} 70% 65% / .5)'/>`,
    `<circle cx='80' cy='150' r='30' fill='hsl(${h + 24} 80% 65% / .45)'/>`,
    `</svg>`,
  ].join('')
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function hueAt(index: number): number {
  return SWISS_PALETTE[index % SWISS_PALETTE.length]
}

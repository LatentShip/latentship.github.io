/*
 * The rocket: the brand mark, drawn in a 24 unit box. It points up and to the
 * right; its flame sits at the tail and burns down and to the left. The puff
 * is the logo's resting exhaust; once lit, the animated flame takes over.
 */

const PATHS = {
  puff: "M6.517 17.569c-1.157-1.145-3.364-.909-4.379.121-1.132 1.149-1.008 3.87-.959 4.381.046.483.432.863.916.902.13.01 3.028.294 4.356-1.019.97-1.049 1.218-3.185.066-4.386Z",
  body: "M18.196 15.759c6.363-6.464 4.385-13.443 4.298-13.737-.097-.323-.348-.576-.67-.672-.291-.088-7.207-2.073-13.552 4.372l-4.641 4.714c-.63.641-.9 1.553-.719 2.44.175.862.755 1.576 1.557 1.908 1.154.479 2.107 1.101 2.896 1.896.768.78 1.353 1.791 1.869 2.95 1.041 2.336 3.666 1.747 4.321.844l4.641-4.715Zm-6.125-3.801-.029-.029c-1.636-1.662-.703-3.106 0-3.82.611-.62 2.095-1.71 3.805 0 1.649 1.649.703 3.106 0 3.82-.61.62-2.05 1.755-3.776.029Z",
  glass: "M12.071 11.958l-.029-.029c-1.636-1.662-.703-3.106 0-3.82.611-.62 2.095-1.71 3.805 0 1.649 1.649.703 3.106 0 3.82-.61.62-2.05 1.755-3.776.029Z",
  finA: "M2.206 9.034 6.847 4.32c.45-.457.904-.877 1.359-1.262-1.382-.48-2.856-.22-3.73.192-1.688.795-2.935 2.844-3.072 3.075-.075.127-.121.268-.135.415-.021.215-.129 1.627.358 3.012.167-.255.36-.495.578-.717Z",
  finB: "M20.638 19.608c.402-.881.642-2.367.172-3.762-.364.44-.76.88-1.189 1.316l-4.641 4.715c-.233.237-.488.445-.759.624 1.365.49 2.751.386 2.964.366.151-.014.298-.062.428-.142.227-.138 2.245-1.405 3.026-3.117Z",
};

// Where the flame leaves the tail, and the way the nose points.
export const NOZZLE = { x: 6.2, y: 17.9 };
export const HEADING = -45; // degrees, screen space: the nose points up and right

// The flame's size for a given thrust (0 is out, 1 is a steady burn).
export const flameScale = (power) => `scale(${(0.55 + power * 0.45).toFixed(3)}, ${(0.15 + power * 0.85).toFixed(3)})`;

// A cubic Bezier and its tangent, for flight paths.
export const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};
export const bezTangent = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
};

export function rocketParts({ flame = true } = {}) {
  const flameMarkup = flame
    ? `<g transform="translate(${NOZZLE.x} ${NOZZLE.y}) rotate(45)"><g class="rk-flame">` +
      '<path class="rk-flame-glow" d="M-3.7 0C-3.7 4.1-1.7 9.2 0 14.4 1.7 9.2 3.7 4.1 3.7 0 3.7-2.7-3.7-2.7-3.7 0Z"/>' +
      '<path class="rk-flame-outer" d="M-2.8 0C-2.8 3.4-1.3 7.6 0 11.6 1.3 7.6 2.8 3.4 2.8 0 2.8-2.2-2.8-2.2-2.8 0Z"/>' +
      '<path class="rk-flame-mid" d="M-1.9 0C-1.9 2.4-.9 5.2 0 8.1.9 5.2 1.9 2.4 1.9 0 1.9-1.5-1.9-1.5-1.9 0Z"/>' +
      '<path class="rk-flame-core" d="M-1 0C-1 1.4-.45 3 0 4.7.45 3 1 1.4 1 0 1-.8-1-.8-1 0Z"/>' +
      "</g></g>"
    : "";
  return (
    flameMarkup +
    `<path class="rk-puff" d="${PATHS.puff}"/>` +
    `<path class="rk-glass" d="${PATHS.glass}"/>` +
    `<path class="rk-fin" d="${PATHS.finA}"/>` +
    `<path class="rk-fin" d="${PATHS.finB}"/>` +
    `<path class="rk-body" d="${PATHS.body}"/>`
  );
}

export function rocketSVG({ flame = true, className = "" } = {}) {
  return `<svg class="rocket ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${rocketParts({ flame })}</svg>`;
}

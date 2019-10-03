const getHandle = (x, y, index, extraAttributes = {}) =>
  Object.assign(
    {
      x,
      y,
      index,
      drawnIndependently: false,
      allowedOutsideImage: false,
      highlight: true,
      active: false
    },
    extraAttributes
  );

export default function(mouseEventData) {
  const { x, y } = mouseEventData.currentPoints.image;
  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    toolType: this.name,
    isCreating: true,
    visible: true,
    active: true,
    invalidated: true,
    handles: {
      start: getHandle(x, y, 0),
      end: getHandle(x, y, 1, { active: true }),
      perpendicularStart: getHandle(x, y, 2, { locked: true }),
      perpendicularEnd: getHandle(x, y, 3),
      perpendicularStart2: getHandle(x, y, 4, { locked: true }),
      perpendicularEnd2: getHandle(x, y, 5),
      angleStart: getHandle(x, y, 6, { locked: true }),
      angleEnd: getHandle(x, y, 7),
      angleStart2: getHandle(x, y, 8),
      angleEnd2: getHandle(x, y, 9),
      textBox: getHandle(x, y - 70, null, {
        highlight: false,
        hasMoved: true,
        active: false,
        movesIndependently: false,
        drawnIndependently: true,
        allowedOutsideImage: true,
        hasBoundingBox: true
      })
    },
    longestDiameter: 0,
    shortestDiameter: 0
  };

  return measurementData;
}

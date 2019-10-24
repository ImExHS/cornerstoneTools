const getHandle = (x, y, index, extraAttributes = {}) =>
  Object.assign(
    {
      x,
      y,
      index,
      drawnIndependently: false,
      allowedOutsideImage: false,
      highlight: true,
      active: false,
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
      leftStart: getHandle(x, y, 4),
      leftEnd: getHandle(x, y, 5),
      rightStart: getHandle(x, y, 6),
      rightEnd: getHandle(x, y, 7),
      textBox: getHandle(x - 120, y - 70, null, {
        highlight: false,
        hasMoved: true,
        active: false,
        movesIndependently: false,
        drawnIndependently: true,
        allowedOutsideImage: true,
        hasBoundingBox: true,
      }),
    },
    A: 0,
    B: 0,
    C: 0,
    index: 0
  };

  return measurementData;
}

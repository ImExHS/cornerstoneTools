// Update the  perpendicular line handles
export default function(eventData, data) {

  if (!data.handles.perpendicularStart.locked) {
    return;
  }

  let startX, startY, endX, endY;

  const { start, end } = data.handles;
  const columnPixelSpacing = (eventData.image.columnPixelSpacing || 1);
  const rowPixelSpacing = (eventData.image.rowPixelSpacing || 1);

  if (start.x === end.x && start.y === end.y) {
    startX = start.x;
    startY = start.y;
    endX = end.x;
    endY = end.y;
  } else {
    // Mid point of long-axis line
    const mid = {
      x: (start.x + end.x) * columnPixelSpacing / 2,
      y: (start.y + end.y) * rowPixelSpacing / 2,
    };

    // Length of long-axis
    const dx = (start.x - end.x) * columnPixelSpacing;
    const dy = (start.y - end.y) * rowPixelSpacing;
    const length = Math.sqrt(dx * dx + dy * dy);

    const vectorX = dx / length;
    const vectorY = dy / length;

    const perpendicularLineLength = length / 2;

    startX = (mid.x + (perpendicularLineLength / 2) * vectorY) / columnPixelSpacing;
    startY = (mid.y - (perpendicularLineLength / 2) * vectorX) / rowPixelSpacing;
    endX = (mid.x - (perpendicularLineLength / 2) * vectorY) / columnPixelSpacing;
    endY = (mid.y + (perpendicularLineLength / 2) * vectorX) / rowPixelSpacing;
  }

  data.handles.perpendicularStart.x = startX;
  data.handles.perpendicularStart.y = startY;
  data.handles.perpendicularEnd.x = endX;
  data.handles.perpendicularEnd.y = endY;

  data.invalidated = true;
}

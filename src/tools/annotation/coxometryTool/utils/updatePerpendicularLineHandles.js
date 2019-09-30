// Update the  perpendicular line handles
export default function(eventData, data) {
  if (!data.handles.perpendicularStart.locked) {
    return;
  }

  let startX_p1, startY_p1, endX_p1, endY_p1;
  let startX_p2, startY_p2, endX_p2, endY_p2;

  const { start, end } = data.handles;

  if (start.x === end.x && start.y === end.y) {
    startX_p1 = start.x;
    startY_p1 = start.y;
    endX_p1 = end.x;
    endY_p1 = end.y;
  } else {
    // Mid point of long-axis line
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
    // Length of long-axis
    const dx = (start.x - end.x) * (eventData.image.columnPixelSpacing || 1);
    const dy = (start.y - end.y) * (eventData.image.rowPixelSpacing || 1);
    const length = Math.sqrt(dx * dx + dy * dy);

    const baseline_angle = Math.abs(Math.atan2(dy, dx));
    let perpendicular_angle, dx_perpendicular, dy_perpendicular;

    if (baseline_angle > Math.PI / 2) {
      perpendicular_angle = baseline_angle - Math.PI / 2;
    } else {
      perpendicular_angle = Math.PI / 2 - baseline_angle;
    }

    if (dy < 0) {
      dx_perpendicular = length * Math.cos(perpendicular_angle);
    } else {
      dx_perpendicular = -1 * length * Math.cos(perpendicular_angle);
    }

    if (dx < 0) {
      dy_perpendicular = -1 * length * Math.sin(perpendicular_angle);
    } else {
      dy_perpendicular = length * Math.sin(perpendicular_angle);
    }

    startX_p1 = start.x - dx_perpendicular / 4 + 10;
    startY_p1 = start.y - dy_perpendicular / 4 + 10;
    endX_p1 = start.x + dx_perpendicular / 4 + 10;
    endY_p1 = start.y + dy_perpendicular / 4 + 10;

    startX_p2 = end.x - dx_perpendicular / 4 - 10;
    startY_p2 = end.y - dy_perpendicular / 4 + 10;
    endX_p2 = end.x + dx_perpendicular / 4 - 10;
    endY_p2 = end.y + dy_perpendicular / 4 + 10;
  }
  data.handles.perpendicularStart.x = startX_p1;
  data.handles.perpendicularStart.y = startY_p1;
  data.handles.perpendicularEnd.x = endX_p1;
  data.handles.perpendicularEnd.y = endY_p1;

  data.handles.perpendicularStart2.x = startX_p2;
  data.handles.perpendicularStart2.y = startY_p2;
  data.handles.perpendicularEnd2.x = endX_p2;
  data.handles.perpendicularEnd2.y = endY_p2;
}

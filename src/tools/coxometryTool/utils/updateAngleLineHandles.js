import external from "../../../externalModules";

// Update the  angle line handles
export default function(eventData, data) {
  // if (!data.handles.angleStart.locked) {
  //   return;
  // }

  let startX_p1, startY_p1, endX_p1, endY_p1;
  let startX_p2, startY_p2, endX_p2, endY_p2;

  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
    perpendicularStart2,
    perpendicularEnd2
  } = data.handles;

  const longLine = {
    start: {
      x: start.x,
      y: start.y
    },
    end: {
      x: end.x,
      y: end.y
    }
  };

  const perpendicularLine1 = {
    start: {
      x: perpendicularStart.x,
      y: perpendicularStart.y
    },
    end: {
      x: perpendicularEnd.x,
      y: perpendicularEnd.y
    }
  };

  const perpendicularLine2 = {
    start: {
      x: perpendicularStart2.x,
      y: perpendicularStart2.y
    },
    end: {
      x: perpendicularEnd2.x,
      y: perpendicularEnd2.y
    }
  };

  const intersectionP1 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine1
  );

  const intersectionP2 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine2
  );

  if (start.x === end.x && start.y === end.y) {
    startX_p1 = start.x;
    startY_p1 = start.y;
    endX_p1 = end.x;
    endY_p1 = end.y;
  } else {
    if (intersectionP1 && intersectionP2) {
      // Length of long-axis
      const dx =
        (intersectionP1.x - intersectionP2.x) *
        (eventData.image.columnPixelSpacing || 1);
      const dy =
        (intersectionP1.y - intersectionP2.y) *
        (eventData.image.rowPixelSpacing || 1);
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

      startX_p1 = intersectionP1.x - dx_perpendicular / 6 + 50;
      startY_p1 = intersectionP1.y - dy_perpendicular / 10;
      endX_p1 = data.handles.perpendicularEnd.x;
      endY_p1 = data.handles.perpendicularEnd.y;

      startX_p2 = intersectionP2.x - dx_perpendicular / 6 - 50;
      startY_p2 = intersectionP2.y - dy_perpendicular / 10;
      endX_p2 = data.handles.perpendicularEnd2.x;
      endY_p2 = data.handles.perpendicularEnd2.y;
    }
  }
  data.handles.angleStart.x = startX_p1;
  data.handles.angleStart.y = startY_p1;
  data.handles.angleEnd.x = endX_p1;
  data.handles.angleEnd.y = endY_p1;

  data.handles.angleStart2.x = startX_p2;
  data.handles.angleStart2.y = startY_p2;
  data.handles.angleEnd2.x = endX_p2;
  data.handles.angleEnd2.y = endY_p2;
}

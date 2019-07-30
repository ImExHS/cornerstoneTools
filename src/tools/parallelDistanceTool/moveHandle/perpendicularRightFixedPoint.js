import external from './../../../externalModules.js';

// Move perpendicular line end point
export default function(movedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const { start, end, perpendicularStart, perpendicularEnd } = data.handles;

  const fudgeFactor = 1;

  const fixedPoint = perpendicularStart;

  const distanceFromFixed = external.cornerstoneMath.lineSegment.distanceToPoint(
    data.handles,
    fixedPoint
  );
  const distanceFromMoved = external.cornerstoneMath.lineSegment.distanceToPoint(
    data.handles,
    movedPoint
  );

  const distanceBetweenPoints = distance(fixedPoint, movedPoint);

  const total = distanceFromFixed + distanceFromMoved;

  if (distanceBetweenPoints <= distanceFromFixed) {
    return false;
  }

  // check if linep1 is before line p2
  const intersectionP1 = getIntersectionPointProposed(data, movedPoint)[0];
  const intersectionP2 = getIntersectionPointProposed(data, movedPoint)[1];

  const distance_end_p1_proposed = distance(data.handles.end, intersectionP1);
  const offset_p1_p2 = 3;
  const distance_end_p2 = distance(data.handles.end, intersectionP2);

  if (distance_end_p1_proposed <= distance_end_p2 + offset_p1_p2) {
    return false;
  }

  const length = distance(start, end);
  const dx = (start.x - end.x) / length;
  const dy = (start.y - end.y) / length;

  const adjustedLineP1 = {
    x: start.x - fudgeFactor * dx,
    y: start.y - fudgeFactor * dy,
  };
  const adjustedLineP2 = {
    x: end.x + fudgeFactor * dx,
    y: end.y + fudgeFactor * dy,
  };

  perpendicularStart.x = movedPoint.x + total * dy;
  perpendicularStart.y = movedPoint.y - total * dx;
  perpendicularEnd.x = movedPoint.x;
  perpendicularEnd.y = movedPoint.y;
  perpendicularEnd.locked = false;
  perpendicularStart.locked = false;

  const longLine = {
    start: {
      x: start.x,
      y: start.y,
    },
    end: {
      x: end.x,
      y: end.y,
    },
  };

  const perpendicularLine = {
    start: {
      x: perpendicularStart.x,
      y: perpendicularStart.y,
    },
    end: {
      x: perpendicularEnd.x,
      y: perpendicularEnd.y,
    },
  };

  const intersection = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine
  );

  if (!intersection) {
    if (distance(movedPoint, start) > distance(movedPoint, end)) {
      perpendicularEnd.x = adjustedLineP2.x - distanceFromMoved * dy;
      perpendicularEnd.y = adjustedLineP2.y + distanceFromMoved * dx;
      perpendicularStart.x = perpendicularEnd.x + total * dy;
      perpendicularStart.y = perpendicularEnd.y - total * dx;
    } else {
      perpendicularEnd.x = adjustedLineP1.x - distanceFromMoved * dy;
      perpendicularEnd.y = adjustedLineP1.y + distanceFromMoved * dx;
      perpendicularStart.x = perpendicularEnd.x + total * dy;
      perpendicularStart.y = perpendicularEnd.y - total * dx;
    }
  }

  return true;
}

const getIntersectionPointProposed = (data, movedPoint) => {
  const longLine = {
    start: {
      x: data.handles.start.x,
      y: data.handles.start.y,
    },
    end: {
      x: data.handles.end.x,
      y: data.handles.end.y,
    },
  };

  const perpendicularLine1 = {
    start: {
      x: data.handles.perpendicularStart.x,
      y: data.handles.perpendicularStart.y,
    },
    end: {
      x: movedPoint.x,
      y: movedPoint.y,
    },
  };

  const perpendicularLine2 = {
    start: {
      x: data.handles.perpendicularStart2.x,
      y: data.handles.perpendicularStart2.y,
    },
    end: {
      x: data.handles.perpendicularEnd2.x,
      y: data.handles.perpendicularEnd2.y,
    },
  };

  const intersectionP1 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine1
  );

  const intersectionP2 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine2
  );
  return [intersectionP1, intersectionP2];
};
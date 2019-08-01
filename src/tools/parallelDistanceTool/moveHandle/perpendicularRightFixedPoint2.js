import external from './../../../externalModules.js';

// Move perpendicular line end point
export default function(movedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
    perpendicularStart2,
    perpendicularEnd2,
  } = data.handles;

  const fudgeFactor = 1;

  const fixedPoint = perpendicularStart2;

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

  perpendicularStart2.x = movedPoint.x + total * dy;
  perpendicularStart2.y = movedPoint.y - total * dx;
  perpendicularEnd2.x = movedPoint.x;
  perpendicularEnd2.y = movedPoint.y;
  perpendicularEnd.locked = false;
  perpendicularStart.locked = false;
  perpendicularEnd2.locked = false;
  perpendicularStart2.locked = false;
  

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
      x: perpendicularStart2.x,
      y: perpendicularStart2.y,
    },
    end: {
      x: perpendicularEnd2.x,
      y: perpendicularEnd2.y,
    },
  };

  const intersection = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine
  );

  if (!intersection) {
    if (distance(movedPoint, start) > distance(movedPoint, end)) {
      perpendicularEnd2.x = adjustedLineP2.x - distanceFromMoved * dy;
      perpendicularEnd2.y = adjustedLineP2.y + distanceFromMoved * dx;
      perpendicularStart2.x = perpendicularEnd2.x + total * dy;
      perpendicularStart2.y = perpendicularEnd2.y - total * dx;
    } else {
      perpendicularEnd2.x = adjustedLineP1.x - distanceFromMoved * dy;
      perpendicularEnd2.y = adjustedLineP1.y + distanceFromMoved * dx;
      perpendicularStart2.x = perpendicularEnd2.x + total * dy;
      perpendicularStart2.y = perpendicularEnd2.y - total * dx;
    }
  }

  return true;
}

import external from './../../../../externalModules.js';

// Move long-axis end point
export default function(proposedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
    perpendicularStart2,
    perpendicularEnd2,
  } = data.handles;

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

  const perpendicularLine2 = {
    start: {
      x: perpendicularStart2.x,
      y: perpendicularStart2.y,
    },
    end: {
      x: perpendicularEnd2.x,
      y: perpendicularEnd2.y,
    },
  };

  const intersection2 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine2
  );

  const offset_baseline = 3;
  const newLineLength = distance(start, proposedPoint);
  const distanceToLineP4 = distance(start, intersection2);

  if (newLineLength - offset_baseline <= distanceToLineP4) {
    return false;
  }

  // Perpendicular Line 1

  const intersection = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine
  );

  const distanceFromPerpendicularP1 = distance(
    perpendicularStart,
    intersection
  );
  const distanceFromPerpendicularP2 = distance(perpendicularEnd, intersection);

  const distanceToLineP2 = distance(start, intersection);

  const dx = (start.x - proposedPoint.x) / newLineLength;
  const dy = (start.y - proposedPoint.y) / newLineLength;

  const k = distanceToLineP2 / newLineLength;

  const newIntersection = {
    x: start.x + (proposedPoint.x - start.x) * k,
    y: start.y + (proposedPoint.y - start.y) * k,
  };

  perpendicularStart.x = newIntersection.x + distanceFromPerpendicularP1 * dy;
  perpendicularStart.y = newIntersection.y - distanceFromPerpendicularP1 * dx;

  perpendicularEnd.x = newIntersection.x - distanceFromPerpendicularP2 * dy;
  perpendicularEnd.y = newIntersection.y + distanceFromPerpendicularP2 * dx;

  // Perpendicular Line 2

  const distanceFromPerpendicularP3 = distance(
    perpendicularStart2,
    intersection2
  );
  const distanceFromPerpendicularP4 = distance(
    perpendicularEnd2,
    intersection2
  );

  const k2 = distanceToLineP4 / newLineLength;

  const newIntersection2 = {
    x: start.x + (proposedPoint.x - start.x) * k2,
    y: start.y + (proposedPoint.y - start.y) * k2,
  };

  perpendicularStart2.x = newIntersection2.x + distanceFromPerpendicularP3 * dy;
  perpendicularStart2.y = newIntersection2.y - distanceFromPerpendicularP3 * dx;

  perpendicularEnd2.x = newIntersection2.x - distanceFromPerpendicularP4 * dy;
  perpendicularEnd2.y = newIntersection2.y + distanceFromPerpendicularP4 * dx;

  return true;
}

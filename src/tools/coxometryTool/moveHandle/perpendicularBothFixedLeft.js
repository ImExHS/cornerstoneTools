import external from "./../../../externalModules.js";

// Move long-axis start point
export default function(proposedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
    perpendicularStart2,
    perpendicularEnd2,
    angleStart,
    angleEnd,
    angleStart2,
    angleEnd2
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

  const perpendicularLine = {
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

  const angleLine = {
    start: {
      x: angleStart.x,
      y: angleStart.y
    },
    end: {
      x: angleEnd.x,
      y: angleEnd.y
    }
  };

  const angleLine2 = {
    start: {
      x: angleStart2.x,
      y: angleStart2.y
    },
    end: {
      x: angleEnd2.x,
      y: angleEnd2.y
    }
  };

  // Perpendicular line 1

  const intersection = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine
  );

  const distanceFromPerpendicularP1 = distance(
    perpendicularStart,
    intersection
  );
  const distanceFromPerpendicularP2 = distance(perpendicularEnd, intersection);

  const offset_baseline = 3;
  const distanceToLineP2 = distance(end, intersection);
  const newLineLength = distance(end, proposedPoint);

  if (newLineLength - offset_baseline <= distanceToLineP2) {
    return false;
  }

  const dx = (end.x - proposedPoint.x) / newLineLength;
  const dy = (end.y - proposedPoint.y) / newLineLength;

  const k = distanceToLineP2 / newLineLength;

  const newIntersection = {
    x: end.x + (proposedPoint.x - end.x) * k,
    y: end.y + (proposedPoint.y - end.y) * k
  };

  perpendicularStart.x = newIntersection.x - distanceFromPerpendicularP1 * dy;
  perpendicularStart.y = newIntersection.y + distanceFromPerpendicularP1 * dx;

  perpendicularEnd.x = newIntersection.x + distanceFromPerpendicularP2 * dy;
  perpendicularEnd.y = newIntersection.y - distanceFromPerpendicularP2 * dx;

  // Angle line 1
  // const intersectionAn1 = external.cornerstoneMath.lineSegment.intersectLine(
  //   longLine,
  //   angleLine
  // );

  // const distanceFromAngle1 = distance(angleStart, intersectionAn1);
  // const distanceFromAngle2 = distance(angleEnd, intersectionAn1);

  // const distanceToLineAn2 = distance(end, intersectionAn1);

  // const kAn = distanceToLineAn2 / newLineLength;

  // const newIntersectionAn = {
  //   x: end.x + (proposedPoint.x - end.x) * kAn,
  //   y: end.y + (proposedPoint.y - end.y) * kAn,
  // };

  // angleStart.x = newIntersectionAn.x - distanceFromAngle1 * dy;
  // angleStart.y = newIntersectionAn.y + distanceFromAngle1 * dx;

  // angleEnd.x = newIntersection.x + distanceFromAngle2 * dy;
  // angleEnd.y = newIntersection.y - distanceFromAngle2 * dx;

  // Perpendicular line 2
  const intersection2 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine2
  );

  const distanceFromPerpendicularP3 = distance(
    perpendicularStart2,
    intersection2
  );
  const distanceFromPerpendicularP4 = distance(
    perpendicularEnd2,
    intersection2
  );

  const distanceToLineP4 = distance(end, intersection2);

  const k2 = distanceToLineP4 / newLineLength;

  const newIntersection2 = {
    x: end.x + (proposedPoint.x - end.x) * k2,
    y: end.y + (proposedPoint.y - end.y) * k2
  };

  perpendicularStart2.x = newIntersection2.x - distanceFromPerpendicularP3 * dy;
  perpendicularStart2.y = newIntersection2.y + distanceFromPerpendicularP3 * dx;

  perpendicularEnd2.x = newIntersection2.x + distanceFromPerpendicularP4 * dy;
  perpendicularEnd2.y = newIntersection2.y - distanceFromPerpendicularP4 * dx;

  // Angle line 2
  // const intersectionAn2 = external.cornerstoneMath.lineSegment.intersectLine(
  //   longLine,
  //   angleLine2
  // );

  // const distanceFromAngle3 = distance(angleStart2, intersectionAn2);
  // const distanceFromAngle4 = distance(angleEnd2, intersectionAn2);

  // const distanceToLineAn4 = distance(end, intersectionAn2);

  // const kAn2 = distanceToLineAn4 / newLineLength;

  // const newIntersectionAn2 = {
  //   x: end.x + (proposedPoint.x - end.x) * kAn2,
  //   y: end.y + (proposedPoint.y - end.y) * kAn2,
  // };

  // angleStart2.x = newIntersectionAn2.x - distanceFromAngle3 * dy;
  // angleStart2.y = newIntersectionAn2.y + distanceFromAngle3 * dx;

  // angleEnd2.x = newIntersection2.x + distanceFromAngle4 * dy;
  // angleEnd2.y = newIntersection2.y - distanceFromAngle4 * dx;

  return true;
}

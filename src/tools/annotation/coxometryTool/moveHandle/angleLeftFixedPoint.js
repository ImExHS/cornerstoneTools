import external from '../../../../externalModules.js';

// Move perpendicular line start point
export default function(movedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const {
    start,
    end,
    angleStart,
    angleEnd,
    perpendicularStart2,
    perpendicularEnd2,
  } = data.handles;

  const fudgeFactor = 1;
  const fixedPoint = perpendicularEnd2;

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

  // check if angle1 is before angle2
  const intersectionA1 = getIntersectionPointProposed(data, movedPoint)[2];
  const intersectionA2 = getIntersectionPointProposed(data, movedPoint)[3];

  const distance_end_p1 = distance(data.handles.angleEnd, intersectionA2);
  const offset_p1_p2 = 3;
  // const distance_end_p2_proposed = distance(data.handles.end, intersectionP2);

  console.log(distance_end_p1);
  if (distance_end_p1 <= offset_p1_p2) {
    return false;
  }

  const length = distance(start, end);

  if (length === 0) {
    return false;
  }

  // const dx = (start.x - end.x) / length;
  // const dy = (start.y - end.y) / length;

  // const adjustedLineP1 = {
  //   x: start.x - fudgeFactor * dx,
  //   y: start.y - fudgeFactor * dy,
  // };
  // const adjustedLineP2 = {
  //   x: end.x + fudgeFactor * dx,
  //   y: end.y + fudgeFactor * dy,
  // };

  // perpendicularStart2.x = movedPoint.x;
  // perpendicularStart2.y = movedPoint.y;
  // perpendicularEnd2.x = movedPoint.x - total * dy;
  // perpendicularEnd2.y = movedPoint.y + total * dx;
  // perpendicularEnd2.locked = false;
  // perpendicularStart2.locked = false;

  // const longLine = {
  //   start: {
  //     x: start.x,
  //     y: start.y,
  //   },
  //   end: {
  //     x: end.x,
  //     y: end.y,
  //   },
  // };

  // const perpendicularLine = {
  //   start: {
  //     x: perpendicularStart2.x,
  //     y: perpendicularStart2.y,
  //   },
  //   end: {
  //     x: perpendicularEnd2.x,
  //     y: perpendicularEnd2.y,
  //   },
  // };

  // const intersection = external.cornerstoneMath.lineSegment.intersectLine(
  //   longLine,
  //   perpendicularLine
  // );

  // if (!intersection) {
  //   if (distance(movedPoint, start) > distance(movedPoint, end)) {
  //     perpendicularStart2.x = adjustedLineP2.x + distanceFromMoved * dy;
  //     perpendicularStart2.y = adjustedLineP2.y - distanceFromMoved * dx;
  //     perpendicularEnd2.x = perpendicularStart2.x - total * dy;
  //     perpendicularEnd2.y = perpendicularStart2.y + total * dx;
  //   } else {
  //     perpendicularStart2.x = adjustedLineP1.x + distanceFromMoved * dy;
  //     perpendicularStart2.y = adjustedLineP1.y - distanceFromMoved * dx;
  //     perpendicularEnd2.x = perpendicularStart2.x - total * dy;
  //     perpendicularEnd2.y = perpendicularStart2.y + total * dx;
  //   }
  // }

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
      x: data.handles.perpendicularEnd.x,
      y: data.handles.perpendicularEnd.y,
    },
  };

  const perpendicularLine2 = {
    start: {
      x: movedPoint.x,
      y: movedPoint.y,
    },
    end: {
      x: data.handles.perpendicularEnd2.x,
      y: data.handles.perpendicularEnd2.y,
    },
  };

  const angleLine = {
    start: {
      x: data.handles.angleStart.x,
      y: data.handles.angleStart.y,
    },
    end: {
      x: data.handles.angleEnd.x,
      y: data.handles.angleEnd.y,
    },
  };

  const angleLine2 = {
    start: {
      x: data.handles.angleStart2.x,
      y: data.handles.angleStart2.y,
    },
    end: {
      x: data.handles.angleEnd2.x,
      y: data.handles.angleEnd2.y,
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

  const intersectionA1 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    angleLine
  );

  const intersectionA2 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    angleLine2
  );

  return [intersectionP1, intersectionP2, intersectionA1, intersectionA2];
};

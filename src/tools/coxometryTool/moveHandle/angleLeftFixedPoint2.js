import external from "./../../../externalModules.js";

// Move angle2 line start point
export default function(movedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const {
    start,
    end,
    angleStart,
    angleEnd,
    angleStart2,
    perpendicularStart,
    perpendicularStart2,
    angleEnd2
  } = data.handles;

  const fixedPoint = angleEnd2;

  const distanceFromFixed = external.cornerstoneMath.lineSegment.distanceToPoint(
    data.handles,
    fixedPoint
  );

  const distanceBetweenPoints = distance(fixedPoint, movedPoint);

  if (distanceBetweenPoints <= distanceFromFixed) {
    return false;
  }

  // check if linep1 is before line p2
  const intersectionP2 = getIntersectionPointProposed(data, movedPoint)[0];
  const intersectionA1 = getIntersectionPointProposed(data, movedPoint)[1];
  const intersectionA2 = getIntersectionPointProposed(data, movedPoint)[2];

  if (intersectionP2 && intersectionA1 && intersectionA2) {
    const distance_end_a1_proposed = distance(data.handles.end, intersectionA1);
    const offset_p1_p2 = 3;
    const distance_end_a2 = distance(data.handles.end, intersectionA2);
  
    if (distance_end_a1_proposed <= distance_end_a2 + offset_p1_p2) {
      return false;
    }
  
    // check if angle is before line p2
    const distance_end_p2_proposed = distance(data.handles.end, intersectionP2);
    if (distance_end_p2_proposed >= distance_end_a2 - offset_p1_p2) {
      return false;
    }
  }

  // check that new point is on right side
  const cross = new external.cornerstoneMath.Vector3();
  const vecA = { x: end.x-start.x, y: end.y-start.y, z: 0 };
  const vecB = { x: movedPoint.x-start.x, y: movedPoint.y-start.y, z: 0 };
  cross.crossVectors(vecA,vecB);
  if (cross.z <= 0) {
    return false;
  }

  const length = distance(start, end);

  if (length === 0) {
    return false;
  }

  angleStart2.x = movedPoint.x;
  angleStart2.y = movedPoint.y;
  angleEnd.locked = false;
  angleStart.locked = false;
  angleEnd2.locked = false;
  angleStart2.locked = false;
  perpendicularStart.locked = false;
  perpendicularStart2.locked = false;

  return true;
}

const getIntersectionPointProposed = (data, movedPoint) => {
  const longLine = {
    start: {
      x: data.handles.start.x,
      y: data.handles.start.y
    },
    end: {
      x: data.handles.end.x,
      y: data.handles.end.y
    }
  };

  const perpendicularLine2 = {
    start: {
      x: data.handles.perpendicularStart2.x,
      y: data.handles.perpendicularStart2.y
    },
    end: {
      x: data.handles.perpendicularEnd2.x,
      y: data.handles.perpendicularEnd2.y
    }
  };

  const angleLine = {
    start: {
      x: data.handles.angleStart.x,
      y: data.handles.angleStart.y
    },
    end: {
      x: data.handles.angleEnd.x,
      y: data.handles.angleEnd.y
    }
  };

  const angleLine2 = {
    start: {
      x: movedPoint.x,
      y: movedPoint.y
    },
    end: {
      x: data.handles.angleEnd2.x,
      y: data.handles.angleEnd2.y
    }
  };

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

  return [intersectionP2, intersectionA1, intersectionA2];
};

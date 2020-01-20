import external from './../../../externalModules.js';
import getSpPoint from '../utils/getSpPoint.js';

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

  // Perpendicular line 1

  let intersection = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine
  );
  if ( !intersection ) {
    console.log('Warning: ParallelDistanceTool - null intersection');
    const pointInLine = getSpPoint(longLine.start,longLine.end,perpendicularLine.start);
    const lengthSp = distance(longLine.start, pointInLine);
    const lengthEp = distance(longLine.end, pointInLine);
    if ( lengthSp < lengthEp ) {
      intersection = longLine.start;
    } else { 
      intersection = longLine.end;
    }    
  }

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
    y: end.y + (proposedPoint.y - end.y) * k,
  };

  perpendicularStart.x = newIntersection.x - distanceFromPerpendicularP1 * dy;
  perpendicularStart.y = newIntersection.y + distanceFromPerpendicularP1 * dx;

  perpendicularEnd.x = newIntersection.x + distanceFromPerpendicularP2 * dy;
  perpendicularEnd.y = newIntersection.y - distanceFromPerpendicularP2 * dx;

  // Perpendicular line 2
  let intersection2 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine2
  );
  if ( !intersection2 ) {
    console.log('Warning: ParallelDistanceTool - null intersection');
    const pointInLine = getSpPoint(longLine.start,longLine.end,perpendicularLine2.start);
    const lengthSp = distance(longLine.start, pointInLine);
    const lengthEp = distance(longLine.end, pointInLine);
    if ( lengthSp < lengthEp ) {
      intersection2 = longLine.start;
    } else { 
      intersection2 = longLine.end;
    }    
  }

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
    y: end.y + (proposedPoint.y - end.y) * k2,
  };

  perpendicularStart2.x = newIntersection2.x - distanceFromPerpendicularP3 * dy;
  perpendicularStart2.y = newIntersection2.y + distanceFromPerpendicularP3 * dx;

  perpendicularEnd2.x = newIntersection2.x + distanceFromPerpendicularP4 * dy;
  perpendicularEnd2.y = newIntersection2.y - distanceFromPerpendicularP4 * dx;

  return true;
}
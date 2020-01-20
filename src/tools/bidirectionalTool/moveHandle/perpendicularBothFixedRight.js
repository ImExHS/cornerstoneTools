import external from './../../../externalModules.js';
import getSpPoint from '../utils/getSpPoint.js';

// Move long-axis end point
export default function(proposedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const { start, end, perpendicularStart, perpendicularEnd } = data.handles;

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

  let intersection = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine
  );
  if ( !intersection ) {
    console.log('Warning: BidirectionalTool - null intersection');
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

  const distanceToLineP2 = distance(start, intersection);
  const newLineLength = distance(start, proposedPoint);

  if (newLineLength <= distanceToLineP2) {
    return false;
  }

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

  return true;
}

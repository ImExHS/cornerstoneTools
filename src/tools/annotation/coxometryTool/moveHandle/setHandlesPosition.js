import external from '../../../../externalModules.js';
import perpendicularBothFixedLeft from './perpendicularBothFixedLeft.js';
import perpendicularBothFixedRight from './perpendicularBothFixedRight.js';
import perpendicularLeftFixedPoint from './perpendicularLeftFixedPoint.js';
import perpendicularRightFixedPoint from './perpendicularRightFixedPoint.js';
import perpendicularLeftFixedPoint2 from './perpendicularLeftFixedPoint2.js';
import perpendicularRightFixedPoint2 from './perpendicularRightFixedPoint2.js';
import angleLeftFixedPoint from './angleLeftFixedPoint.js';
import angleLeftFixedPoint2 from './angleLeftFixedPoint2.js';

// Sets position of handles(start, end, perpendicularStart, perpendicularEnd)
export default function(handle, eventData, data, distanceFromTool) {
  let movedPoint;
  let outOfBounds;
  let result;
  let intersection;
  let intersectionAn;
  let d1;
  let d2;
  let d3;

  const longLine = {};
  const perpendicularLine = {};
  const angleLine = {};
  const proposedPoint = {
    x: eventData.currentPoints.image.x + distanceFromTool.x,
    y: eventData.currentPoints.image.y + distanceFromTool.y,
  };

  if (handle.index === 0) {
    // If long-axis start point is moved
    result = perpendicularBothFixedLeft(proposedPoint, data);
    if (result) {
      handle.x = proposedPoint.x;
      handle.y = proposedPoint.y;
    } else {
      eventData.currentPoints.image.x = handle.x;
      eventData.currentPoints.image.y = handle.y;
    }
  } else if (handle.index === 1) {
    // If long-axis end point is moved
    result = perpendicularBothFixedRight(proposedPoint, data);
    if (result) {
      handle.x = proposedPoint.x;
      handle.y = proposedPoint.y;
    } else {
      eventData.currentPoints.image.x = handle.x;
      eventData.currentPoints.image.y = handle.y;
    }
  } else if (handle.index === 2) {
    outOfBounds = false;
    // If perpendicular start point is moved
    longLine.start = {
      x: data.handles.start.x,
      y: data.handles.start.y,
    };
    longLine.end = {
      x: data.handles.end.x,
      y: data.handles.end.y,
    };

    angleLine.start = {
      x: data.handles.angleStart.x,
      y: data.handles.angleStart.y,
    };
    angleLine.end = {
      x: data.handles.angleEnd.x,
      y: data.handles.angleEnd.y,
    };

    perpendicularLine.start = {
      x: data.handles.perpendicularEnd.x,
      y: data.handles.perpendicularEnd.y,
    };
    perpendicularLine.end = {
      x: proposedPoint.x,
      y: proposedPoint.y,
    };

    intersection = external.cornerstoneMath.lineSegment.intersectLine(
      longLine,
      perpendicularLine
    );
    intersectionAn = external.cornerstoneMath.lineSegment.intersectLine(
      perpendicularLine,
      angleLine
    );
    if (!intersection) {
      perpendicularLine.end = {
        x: data.handles.perpendicularStart.x,
        y: data.handles.perpendicularStart.y,
      };

      intersection = external.cornerstoneMath.lineSegment.intersectLine(
        longLine,
        perpendicularLine
      );

      d1 = external.cornerstoneMath.point.distance(
        intersection,
        data.handles.start
      );
      d2 = external.cornerstoneMath.point.distance(
        intersection,
        data.handles.end
      );

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
      // if (perpendicularLine.start.x >= angleLine.start.x) {
      //   console.log('here');
      //   outOfBounds = true;
      // }
    }

    // if (perpendicularLine.start.x > angleLine.start.x) {
    //   console.log('here');
    //   outOfBounds = true;
    // }

    movedPoint = false;

    if (!outOfBounds) {
      movedPoint = perpendicularLeftFixedPoint(proposedPoint, data);

      if (!movedPoint) {
        eventData.currentPoints.image.x = data.handles.perpendicularStart.x;
        eventData.currentPoints.image.y = data.handles.perpendicularStart.y;
      }
    }
  } else if (handle.index === 3 || handle.index === 7) {
    outOfBounds = false;

    // If perpendicular end point is moved
    longLine.start = {
      x: data.handles.start.x,
      y: data.handles.start.y,
    };
    longLine.end = {
      x: data.handles.end.x,
      y: data.handles.end.y,
    };

    perpendicularLine.start = {
      x: data.handles.perpendicularStart.x,
      y: data.handles.perpendicularStart.y,
    };
    perpendicularLine.end = {
      x: proposedPoint.x,
      y: proposedPoint.y,
    };

    intersection = external.cornerstoneMath.lineSegment.intersectLine(
      longLine,
      perpendicularLine
    );
    if (!intersection) {
      perpendicularLine.end = {
        x: data.handles.perpendicularEnd.x,
        y: data.handles.perpendicularEnd.y,
      };

      intersection = external.cornerstoneMath.lineSegment.intersectLine(
        longLine,
        perpendicularLine
      );

      d1 = external.cornerstoneMath.point.distance(
        intersection,
        data.handles.start
      );
      d2 = external.cornerstoneMath.point.distance(
        intersection,
        data.handles.end
      );

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    movedPoint = false;

    if (!outOfBounds) {
      movedPoint = perpendicularRightFixedPoint(proposedPoint, data);

      if (!movedPoint) {
        eventData.currentPoints.image.x = data.handles.perpendicularEnd.x;
        eventData.currentPoints.image.y = data.handles.perpendicularEnd.y;
      }
    }
  } else if (handle.index === 4) {
    movedPoint = perpendicularLeftFixedPoint2(proposedPoint, data);
    if (
      !movedPoint &&
      eventData.currentPoints.image &&
      data.handles.leftStart
    ) {
      eventData.currentPoints.image.x = data.handles.leftStart.x;
      eventData.currentPoints.image.y = data.handles.leftStart.y;
    }
  } else if (handle.index === 5 || handle.index === 9) {
    movedPoint = perpendicularRightFixedPoint2(proposedPoint, data);
    if (
      !movedPoint &&
      eventData.currentPoints.image &&
      data.handles.rightStart
    ) {
      eventData.currentPoints.image.x = data.handles.rightStart.x;
      eventData.currentPoints.image.y = data.handles.rightStart.y;
    }
  } else if (handle.index === 6) {
    movedPoint = angleLeftFixedPoint(proposedPoint, data);
    console.log(data.handles);
    if (movedPoint) {
      handle.x = proposedPoint.x;
      handle.y = proposedPoint.y;
    } else {
      eventData.currentPoints.image.x = handle.x;
      eventData.currentPoints.image.y = handle.y;
    }
  } else if (handle.index === 8) {
    movedPoint = angleLeftFixedPoint2(proposedPoint, data);
    if (
      !movedPoint &&
      eventData.currentPoints.image &&
      data.handles.leftStart
    ) {
      eventData.currentPoints.image.x = data.handles.leftStart.x;
      eventData.currentPoints.image.y = data.handles.leftStart.y;
    }
  }
}

import external from "../../../externalModules";

/**
 * Calculates longest and shortest diameters using measurement handles and pixelSpacing
 * @param  {Object} measurementData
 * @param pixelSpacing
 */
export default function calculateLongestAndShortestDiameters(
  measurementData,
  pixelSpacing
) {

  const { rowPixelSpacing, colPixelSpacing } = pixelSpacing;
  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
    perpendicularStart2,
    perpendicularEnd2,
  } = measurementData.handles;

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

  const perpendicularLine1 = {
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

  const intersectionP1 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine1
  );

  const intersectionP2 = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine2
  );

  let parallelDistance = 0;
  if (intersectionP1 && intersectionP2) {
    if (!isNaN(intersectionP1.x) || !isNaN(intersectionP2.x)) {
      const dx =
        (intersectionP2.x - intersectionP1.x) * (colPixelSpacing || 1);
      const dy =
        (intersectionP2.y - intersectionP1.y) * (rowPixelSpacing || 1);
  
      parallelDistance = Math.sqrt(dx * dx + dy * dy).toFixed(2);
    }
  }
  return {
    parallelDistance
  };
}
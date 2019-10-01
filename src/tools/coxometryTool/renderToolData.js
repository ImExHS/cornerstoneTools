/* eslint no-loop-func: 0 */ // --> OFF
import updatePerpendicularLineHandles from "./utils/updatePerpendicularLineHandles.js";

import toolStyle from "./../../stateManagement/toolStyle.js";
import toolColors from "./../../stateManagement/toolColors.js";
import { getToolState } from "./../../stateManagement/toolState.js";
import {
  getNewContext,
  draw,
  setShadow,
  drawLine
} from "./../../util/drawing.js";
import drawLinkedTextBox from "./../../util/drawLinkedTextBox.js";
import drawTextBox from "./../../util/drawTextBox.js";
import getPixelSpacing from "./../../util/getPixelSpacing";
import roundToDecimal from "./../../util/roundToDecimal.js";
import updateAngleLineHandles from "./utils/updateAngleLineHandles.js";
import throttle from "./../../util/throttle";
import drawHandles from "../../manipulators/drawHandles.js";
import external from "../../externalModules.js";

export default function(evt) {
  const eventData = evt.detail;
  const { element, canvasContext, image } = eventData;
  const {
    handleRadius,
    drawHandlesOnHover,
    hideHandlesIfMoved
  } = this.configuration;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(element, this.name);

  if (!toolData) {
    return;
  }

  const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

  // LT-29 Disable Target Measurements when pixel spacing is not available
  if (!rowPixelSpacing || !colPixelSpacing) {
    return;
  }

  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(canvasContext.canvas);

  let color;
  const activeColor = toolColors.getActiveColor();
  const lineWidth = toolStyle.getToolWidth();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    color = data.active ? activeColor : toolColors.getToolColor();

    draw(context, context => {
      // Configurable shadow
      setShadow(context, this.configuration);

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
        angleEnd2,
        textBox
      } = data.handles;

      data.invalidated = true;

      // Draw the measurement line
      drawLine(context, element, start, end, { color, lineDash: [20, 2] });

      // Draw perpendicular line
      const strokeWidth = lineWidth;

      updatePerpendicularLineHandles(eventData, data);
      updateAngleLineHandles(eventData, data);
      drawLine(context, element, perpendicularStart, perpendicularEnd, {
        color,
        strokeWidth
      });

      drawLine(context, element, perpendicularStart2, perpendicularEnd2, {
        color,
        strokeWidth
      });

      // Draw angles lines
      drawLine(context, element, angleStart, angleEnd, {
        color,
        strokeWidth
      });

      drawLine(context, element, angleStart2, angleEnd2, {
        color,
        strokeWidth
      });

      // Draw the handles
      const handleOptions = {
        color,
        handleRadius,
        drawHandlesIfActive: drawHandlesOnHover,
        hideHandlesIfMoved: hideHandlesIfMoved
      };

      // Draw the handles
      drawHandles(context, eventData, data.handles, handleOptions);

      // Calculate the data measurements
      if (data.invalidated === true) {
        if (data.longestDiameter && data.shortestDiameter) {
          throttledUpdateCachedStats(image, element, data);
        } else {
          updateCachedStats(image, element, data);
        }
      }

      let letterOptions = {
        centering: {
          x: true,
          y: true
        }
      };

      // Draw identification letters
      const dxH1 = perpendicularStart.x - perpendicularEnd.x;
      const dyH1 = perpendicularStart.y - perpendicularEnd.y;
      if (dxH1 !== 0 || dyH1 !== 0) {
        const x = (perpendicularStart.x + perpendicularEnd.x) / 2.0 - 8;
        const y = (perpendicularStart.y + start.y) / 2.0;
        const posTextH1 = { x, y };
        const lineCoordsH1 = external.cornerstone.pixelToCanvas(
          element,
          posTextH1
        );
        drawTextBox(
          context,
          "H1",
          lineCoordsH1.x,
          lineCoordsH1.y,
          color,
          letterOptions
        );
      }

      const dxH2 = perpendicularStart2.x - perpendicularEnd2.x;
      const dyH2 = perpendicularStart2.y - perpendicularEnd2.y;
      if (dxH2 !== 0 || dyH2 !== 0) {
        const x = perpendicularStart2.x + 8;
        const y = (perpendicularStart2.y + end.y) / 2.0;
        const posTextH2 = { x, y };
        const lineCoordsH2 = external.cornerstone.pixelToCanvas(
          element,
          posTextH2
        );
        drawTextBox(
          context,
          "H2",
          lineCoordsH2.x,
          lineCoordsH2.y,
          color,
          letterOptions
        );
      }

      const dxd1 = perpendicularStart2.x - perpendicularEnd2.x;
      const dyd1 = perpendicularStart2.y - perpendicularEnd2.y;
      if (dxd1 !== 0 || dyd1 !== 0) {
        const x = (perpendicularStart.x + angleStart.x) / 2.0;
        const y = start.y + 8;
        const posTextd1 = { x, y };
        const lineCoordsd1 = external.cornerstone.pixelToCanvas(
          element,
          posTextd1
        );
        drawTextBox(
          context,
          "D1",
          lineCoordsd1.x,
          lineCoordsd1.y,
          color,
          letterOptions
        );
      }

      const dxd2 = perpendicularStart2.x - perpendicularEnd2.x;
      const dyd2 = perpendicularStart2.y - perpendicularEnd2.y;
      if (dxd2 !== 0 || dyd2 !== 0) {
        const x = angleStart2.x + (perpendicularStart2.x - angleStart2.x) / 2.0;
        const y = end.y + 8;
        const posTextd2 = { x, y };
        const lineCoordsd2 = external.cornerstone.pixelToCanvas(
          element,
          posTextd2
        );
        drawTextBox(
          context,
          "D2",
          lineCoordsd2.x,
          lineCoordsd2.y,
          color,
          letterOptions
        );
      }

      const dxD = perpendicularStart2.x - perpendicularEnd2.x;
      const dyD = perpendicularStart2.y - perpendicularEnd2.y;
      if (dxD !== 0 || dyD !== 0) {
        const x = (perpendicularStart.x + angleStart.x) / 2.0;
        const y = start.y - 8;
        const posTextD = { x, y };
        const lineCoordsD = external.cornerstone.pixelToCanvas(
          element,
          posTextD
        );
        drawTextBox(
          context,
          "D",
          lineCoordsD.x,
          lineCoordsD.y,
          color,
          letterOptions
        );
      }

      const dxI = perpendicularStart2.x - perpendicularEnd2.x;
      const dyI = perpendicularStart2.y - perpendicularEnd2.y;
      if (dxI !== 0 || dyI !== 0) {
        const x = angleStart2.x + (perpendicularStart2.x - angleStart2.x) / 2.0;
        const y = end.y - 8;
        const posTextI = { x, y };
        const lineCoordsI = external.cornerstone.pixelToCanvas(
          element,
          posTextI
        );
        drawTextBox(
          context,
          "I",
          lineCoordsI.x,
          lineCoordsI.y,
          color,
          letterOptions
        );
      }

      // Draw the textbox
      const intersectionP1 = getIntersectionPoints(data)[0];
      const intersectionP2 = getIntersectionPoints(data)[1];
      let xOffset = 0;
      if (intersectionP1 && intersectionP2) {
        xOffset = intersectionP1.x + (intersectionP2.x - intersectionP1.x) / 2;
      }
      let textBoxAnchorPoints = handles => [handles.start, handles.end];
      if (intersectionP1 && intersectionP2) {
        const textboxhandle = {
          x: intersectionP1.x + (intersectionP2.x - intersectionP1.x) / 2,
          y: intersectionP1.y + (intersectionP2.y - intersectionP1.y) / 2
        };
        textBoxAnchorPoints = handles => [textboxhandle];
      }

      const textLines = getTextBoxText(data, rowPixelSpacing, colPixelSpacing);

      drawLinkedTextBox(
        context,
        element,
        textBox,
        textLines,
        data.handles,
        textBoxAnchorPoints,
        color,
        lineWidth,
        xOffset,
        false
      );
    });
  }
}

const length = vector => {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
};

const updateCachedStats = (image, element, data) => {
  const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

  const intersectionP1 = getIntersectionPoints(data)[0];
  const intersectionP2 = getIntersectionPoints(data)[1];
  const intersectionA1 = getIntersectionPoints(data)[2];
  const intersectionA2 = getIntersectionPoints(data)[3];

  if (intersectionP1 && intersectionP2 && intersectionA1 && intersectionA2) {
    const sideA = {
      x: (intersectionA1.x - data.handles.angleEnd.x) * colPixelSpacing,
      y: (intersectionA1.y - data.handles.angleEnd.y) * rowPixelSpacing
    };

    const sideB = {
      x: (intersectionP1.x - intersectionA1.x) * colPixelSpacing,
      y: (intersectionP1.y - intersectionA1.y) * rowPixelSpacing
    };

    const sideC = {
      x: (intersectionP1.x - data.handles.angleEnd.x) * colPixelSpacing,
      y: (intersectionP1.y - data.handles.angleEnd.y) * rowPixelSpacing
    };

    const sideA2 = {
      x: (intersectionA2.x - data.handles.angleEnd2.x) * colPixelSpacing,
      y: (intersectionA2.y - data.handles.angleEnd2.y) * rowPixelSpacing
    };

    const sideB2 = {
      x: (intersectionP2.x - intersectionA2.x) * colPixelSpacing,
      y: (intersectionP2.y - intersectionA2.y) * rowPixelSpacing
    };

    const sideC2 = {
      x: (intersectionP2.x - data.handles.angleEnd2.x) * colPixelSpacing,
      y: (intersectionP2.y - data.handles.angleEnd2.y) * rowPixelSpacing
    };

    const sideALength = length(sideA);
    const sideBLength = length(sideB);
    const sideCLength = length(sideC);

    const sideA2Length = length(sideA2);
    const sideB2Length = length(sideB2);
    const sideC2Length = length(sideC2);

    // Cosine law
    let angle = Math.acos(
      (Math.pow(sideALength, 2) +
        Math.pow(sideBLength, 2) -
        Math.pow(sideCLength, 2)) /
        (2 * sideALength * sideBLength)
    );

    let angle2 = Math.acos(
      (Math.pow(sideA2Length, 2) +
        Math.pow(sideB2Length, 2) -
        Math.pow(sideC2Length, 2)) /
        (2 * sideA2Length * sideB2Length)
    );

    angle *= 180 / Math.PI;

    angle2 *= 180 / Math.PI;

    data.rAngle = roundToDecimal(angle, 2);
    data.rAngle2 = roundToDecimal(angle2, 2);
    data.invalidated = false;
  }
};

const throttledUpdateCachedStats = throttle(updateCachedStats, 110);

const getTextBoxText = (data, rowPixelSpacing, colPixelSpacing) => {
  let suffix = " mm";
  let suffixAn = "";
  const str = "00B0"; // Degrees symbol

  if (!rowPixelSpacing || !colPixelSpacing) {
    suffix = " pixels";
    suffixAn = " (isotropic)";
  }
  const intersectionP1 = getIntersectionPoints(data)[0];
  const intersectionP2 = getIntersectionPoints(data)[1];
  const intersectionA1 = getIntersectionPoints(data)[2];
  const intersectionA2 = getIntersectionPoints(data)[3];

  if (intersectionP1 && intersectionP2 && intersectionA1 && intersectionA2) {
    const dxd1 = (intersectionA1.x - intersectionP1.x) * (colPixelSpacing || 1);
    const dyd1 = (intersectionA1.y - intersectionP1.y) * (rowPixelSpacing || 1);

    const d1 = Math.sqrt(dxd1 * dxd1 + dyd1 * dyd1).toFixed(2);

    const dxd2 = (intersectionP2.x - intersectionA2.x) * (colPixelSpacing || 1);
    const dyd2 = (intersectionP2.y - intersectionA2.y) * (rowPixelSpacing || 1);

    const d2 = Math.sqrt(dxd2 * dxd2 + dyd2 * dyd2).toFixed(2);

    const dxh1 =
      (data.handles.perpendicularStart.x - intersectionP1.x) *
      (colPixelSpacing || 1);
    const dyh1 =
      (data.handles.perpendicularStart.y - intersectionP1.y) *
      (rowPixelSpacing || 1);

    const h1 = Math.sqrt(dxh1 * dxh1 + dyh1 * dyh1).toFixed(2);

    const dxh2 =
      (data.handles.perpendicularStart2.x - intersectionP2.x) *
      (colPixelSpacing || 1);
    const dyh2 =
      (data.handles.perpendicularStart2.y - intersectionP2.y) *
      (rowPixelSpacing || 1);

    const h2 = Math.sqrt(dxh2 * dxh2 + dyh2 * dyh2).toFixed(2);

    const dText = ` D ${data.rAngle}${String.fromCharCode(
      parseInt(str, 16)
    )}${suffixAn}`;
    const iText = ` I ${data.rAngle2}${String.fromCharCode(
      parseInt(str, 16)
    )}${suffixAn}`;
    const d1Text = ` D1 ${d1}${suffix}`;
    const d2Text = ` D2 ${d2}${suffix}`;
    const h1Text = ` H1 ${h1}${suffix}`;
    const h2Text = ` H2 ${h2}${suffix}`;

    const { labels } = data;

    if (labels && Array.isArray(labels)) {
      return [...labels, dText, iText, d1Text, d2Text, h1Text, h2Text];
    }

    return [dText, iText, d1Text, d2Text, h1Text, h2Text];
  }
};

const getIntersectionPoints = data => {
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

  const perpendicularLine1 = {
    start: {
      x: data.handles.perpendicularStart.x,
      y: data.handles.perpendicularStart.y
    },
    end: {
      x: data.handles.perpendicularEnd.x,
      y: data.handles.perpendicularEnd.y
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
      x: data.handles.angleStart2.x,
      y: data.handles.angleStart2.y
    },
    end: {
      x: data.handles.angleEnd2.x,
      y: data.handles.angleEnd2.y
    }
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

/* eslint no-loop-func: 0 */ // --> OFF
import drawHandles from './../../manipulators/drawHandles.js';
import updatePerpendicularLineHandles from './utils/updatePerpendicularLineHandles.js';
import external from './../../externalModules.js';

import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
import { getToolState } from './../../stateManagement/toolState.js';
import {
  getNewContext,
  draw,
  setShadow,
  drawLine,
} from './../../util/drawing.js';
import drawTextBox from './../../util/drawTextBox.js';
import drawLink from './../../util/drawLink.js';
import getPixelSpacing from './../../util/getPixelSpacing';

export default function(evt) {
  const eventData = evt.detail;
  const { element, canvasContext, image } = eventData;
  const { handleRadius, drawHandlesOnHover } = this.configuration;

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

    // Calculate the data measurements
    if (data.invalidated === true) {
      if (data.parallelDistance) {
        this.throttledUpdateCachedStats(image, element, data);
      } else {
        this.updateCachedStats(image, element, data);
      }
    }

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
        textBox,
      } = data.handles;

      // Draw the measurement line
      drawLine(context, element, start, end, { color, lineDash: [20, 2] });

      // Draw perpendicular line
      const strokeWidth = lineWidth;

      updatePerpendicularLineHandles(eventData, data);
      drawLine(context, element, perpendicularStart, perpendicularEnd, {
        color,
        strokeWidth,
      });

      drawLine(context, element, perpendicularStart2, perpendicularEnd2, {
        color,
        strokeWidth,
      });

      // Draw the handles
      const handleOptions = {
        color,
        handleRadius,
        drawHandlesIfActive: drawHandlesOnHover,
      };

      // Draw the handles
      drawHandles(context, eventData, data.handles, color, handleOptions);

      // Draw the textbox
      // Move the textbox slightly to the right and upwards
      // So that it sits beside the length tool handle
      const xOffset = 180;
      const yOffset = 160;
      let textBoxAnchorPoints = handles => [handles.start, handles.end];
      const intersectionPoints = getIntersectionPoints(data);
      const intersectionP1 = intersectionPoints[0];
      const intersectionP2 = intersectionPoints[1];
      if (!isNaN(intersectionP1.x) || !isNaN(intersectionP2.x)) {
        const textboxhandle = {
          x: intersectionP1.x + (intersectionP2.x - intersectionP1.x) / 2,
          y: intersectionP1.y + (intersectionP2.y - intersectionP1.y) / 2,
        };
        // textBox.x = textboxhandle.x;
        // textBox.y = textboxhandle.y + yOffset;
        textBoxAnchorPoints = handles => [textboxhandle];
      }

      const textLines = getTextBoxText(data, rowPixelSpacing, colPixelSpacing);

      drawParallelTextBox(
        context,
        element,
        textBox,
        textLines,
        data.handles,
        textBoxAnchorPoints,
        color,
        lineWidth,
        xOffset,
        yOffset,
        true
      );
    });
  }
}

const getTextBoxText = (data, rowPixelSpacing, colPixelSpacing) => {
  let suffix = ' mm';

  if (!rowPixelSpacing || !colPixelSpacing) {
    suffix = ' pixels';
  }

  const intersectionPoints = getIntersectionPoints(data);
  const intersectionP1 = intersectionPoints[0];
  const intersectionP2 = intersectionPoints[1];

  const dx =
    (intersectionP2.x - intersectionP1.x) * (colPixelSpacing || 1);
  const dy =
    (intersectionP2.y - intersectionP1.y) * (rowPixelSpacing || 1);

  const parallel_distance = Math.sqrt(dx * dx + dy * dy).toFixed(2);

  data.parallelDistance = Math.sqrt(dx * dx + dy * dy);

  const lengthText = ` Distance ${parallel_distance}${suffix}`;

  const { labels } = data;

  if (labels && Array.isArray(labels)) {
    return [...labels, lengthText];
  }

  return [lengthText];
};

const getIntersectionPoints = data => {
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
      x: data.handles.perpendicularStart2.x,
      y: data.handles.perpendicularStart2.y,
    },
    end: {
      x: data.handles.perpendicularEnd2.x,
      y: data.handles.perpendicularEnd2.y,
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
  return [intersectionP1, intersectionP2];
};

const drawParallelTextBox = (context, element, textBox, text, handles, textBoxAnchorPoints,
   color, lineWidth, xOffset, yOffset, yCenter) => {
  
  const cornerstone = external.cornerstone;
  // Convert the textbox Image coordinates into Canvas coordinates
  const textCoords = cornerstone.pixelToCanvas(element, textBox);

  if (xOffset) {
    textCoords.x += xOffset;
    textCoords.y += yOffset;
  }

  const options = {
    centering: {
      x: false,
      y: false
    }
  };

  // Draw the text box
  textBox.boundingBox = drawTextBox(context, text, textCoords.x, textCoords.y, color, options);
  if (textBox.hasMoved) {
    // Identify the possible anchor points for the tool -> text line
    const linkAnchorPoints = textBoxAnchorPoints(handles).map((h) => cornerstone.pixelToCanvas(element, h));

    // Draw dashed link line between tool and text
    drawLink(linkAnchorPoints, textCoords, textBox.boundingBox, context, color, lineWidth);
  }
}



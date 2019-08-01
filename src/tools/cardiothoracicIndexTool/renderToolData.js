/* eslint no-loop-func: 0 */ // --> OFF
import external from './../../externalModules.js';
import drawHandles from './../../manipulators/drawHandles.js';
import updatePerpendicularLineHandles from './utils/updatePerpendicularLineHandles.js';

import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
import { getToolState } from './../../stateManagement/toolState.js';
import {
  getNewContext,
  draw,
  setShadow,
  drawLine,
} from './../../util/drawing.js';
import drawLinkedTextBox from './../../util/drawLinkedTextBox.js';
import getPixelSpacing from './../../util/getPixelSpacing';
import roundToDecimal from '../../util/roundToDecimal.js';
import drawTextBox from '../../util/drawTextBox.js';

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
      if (data.longestDiameter && data.shortestDiameter) {
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
        leftStart,
        leftEnd,
        rightStart,
        rightEnd,
        textBox,
      } = data.handles;

      // Draw the measurement line
      drawLine(context, element, start, end, { color });

      // Draw perpendicular line
      const strokeWidth = lineWidth;

      updatePerpendicularLineHandles(eventData, data);
      drawLine(context, element, perpendicularStart, perpendicularEnd, {
        color,
        strokeWidth,
      });

      // Draw left line
      drawLine(context, element, leftStart, leftEnd, {
        color,
        strokeWidth,
      });

      // Draw right line
      drawLine(context, element, rightStart, rightEnd, {
        color,
        strokeWidth,
      });

      // Draw the handles
      const handleOptions = {
        // color,
        handleRadius,
        drawHandlesIfActive: drawHandlesOnHover,
        hideHandlesIfMoved: true
      };

      let letterOptions = {
        centering: {
          x: true,
          y: true
        }
      };

      //  draw left line identification letter on center point
      const dxA  = leftStart.x - leftEnd.x;
      const dyA  = leftStart.y - leftEnd.y;
      if (dxA !== 0 || dyA !== 0) {
        const x = (leftStart.x + leftEnd.x) / 2.0;
        const y = (leftStart.y + leftEnd.y) / 2.0 - 10;
        const posTextA = { x, y };
        const lineCoordsA = external.cornerstone.pixelToCanvas(element, posTextA);
        drawTextBox(context, 'A', lineCoordsA.x, lineCoordsA.y, color, letterOptions);
      }

      //  draw right line identification letter on center point
      const dxB  = rightStart.x - rightEnd.x;
      const dyB  = rightStart.y - rightEnd.y;
      if (dxB !== 0 || dyB !== 0) {
        const x = (rightStart.x + rightEnd.x) / 2.0;
        const y = (rightStart.y + rightEnd.y) / 2.0 - 10;
        const posTextB = { x, y };
        const lineCoordsB = external.cornerstone.pixelToCanvas(element, posTextB);
        drawTextBox(context, 'B', lineCoordsB.x, lineCoordsB.y, color, letterOptions);
      }

      //  draw right line identification letter near center point
      const dxC  = perpendicularStart.x - perpendicularEnd.x;
      const dyC  = perpendicularStart.y - perpendicularEnd.y;
      if (dxC !== 0 || dyC !== 0) {
        const x = (perpendicularStart.x + perpendicularEnd.x) / 2.0;
        const y = (perpendicularStart.y + perpendicularEnd.y) / 2.0 + 10;
        const posTextC = { x, y };
        const lineCoordsC = external.cornerstone.pixelToCanvas(element, posTextC);
        drawTextBox(context, 'C', lineCoordsC.x, lineCoordsC.y, color, letterOptions);
      }

      // Draw the handles
      drawHandles(context, eventData, data.handles, color, handleOptions);

      // Draw the textbox
      // Move the textbox slightly to the right and upwards
      // So that it sits beside the length tool handle
      const xOffset = 10;
      const textBoxAnchorPoints = handles => [
        handles.start,
        handles.end,
        handles.perpendicularStart,
        handles.perpendicularEnd,
      ];
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

  const { distance } = external.cornerstoneMath.point;  
  let a = distance( data.handles.leftStart, data.handles.leftEnd );
  let b = distance( data.handles.rightStart, data.handles.rightEnd );
  let c = distance( data.handles.perpendicularStart, data.handles.perpendicularEnd );
  a = roundToDecimal(a, 3);
  b = roundToDecimal(b, 3);
  c = roundToDecimal(c, 3);

  let indexText = '';
  if ( c !== 0 ) {
    const ratio = roundToDecimal((a + b)*100.0/c,2);
    indexText = ` index: ${ratio}`;
  }

  const aText = ` A: ${a}${suffix}`;
  const bText = ` B: ${b}${suffix}`;
  const cText = ` C: ${c}${suffix}`;

  return [aText, bText, cText, indexText];
};

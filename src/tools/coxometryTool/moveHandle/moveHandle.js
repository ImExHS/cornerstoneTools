import external from "../../../externalModules.js";
import { state } from "../../../store/index.js";
import EVENTS from "../../../events.js";
import setHandlesPosition from "./setHandlesPosition.js";
import getActiveTool from "../../../util/getActiveTool";
import baseAnnotationTool from "../../../base/baseAnnotationTool.js";

function pointInsideImage(pos, image) {
  if (pos.x < 0 || pos.x >= image.width || pos.y < 0 || pos.y >= image.height) {
    return false;
  }
  return true;
}

export default function(
  mouseEventData,
  toolType,
  data,
  handle,
  doneMovingCallback,
  preventHandleOutsideImage
) {
  const { element, image, buttons } = mouseEventData;
  const distanceFromTool = {
    x: handle.x - mouseEventData.currentPoints.image.x,
    y: handle.y - mouseEventData.currentPoints.image.y
  };

  const _dragCallback = event => {
    const eventData = event.detail;

    handle.hasMoved = true;
    let outsideImage = false;
    let originalOutside = false;
    if (preventHandleOutsideImage) {
      if (!pointInsideImage(eventData.currentPoints.image, eventData.image)) {
        outsideImage = true;
      }
      const {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
        leftStart,
        leftEnd,
        rightStart,
        rightEnd
      } = data.handles;
      if (handle.index == 0) {
        if (!pointInsideImage(start, eventData.image)) {
          originalOutside = true;
        }
      } else if (handle.index == 1) {
        if (!pointInsideImage(end, eventData.image)) {
          originalOutside = true;
        }
      } else if (handle.index == 2) {
        if (!pointInsideImage(perpendicularStart, eventData.image)) {
          originalOutside = true;
        }
      } else if (handle.index == 3) {
        if (!pointInsideImage(perpendicularEnd, eventData.image)) {
          originalOutside = true;
        }
      } else if (handle.index == 4) {
        if (!pointInsideImage(leftStart, eventData.image)) {
          originalOutside = true;
        }
      } else if (handle.index == 6) {
        if (!pointInsideImage(rightStart, eventData.image)) {
          originalOutside = true;
        }
      }
    }
    if (!outsideImage || originalOutside) {
      if (handle.index === undefined || handle.index === null) {
        handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
        handle.y = eventData.currentPoints.image.y + distanceFromTool.y;
      } else {
        setHandlesPosition(handle, eventData, data, distanceFromTool);
      }
    }

    data.invalidated = true;

    external.cornerstone.updateImage(element);

    const activeTool = getActiveTool(element, buttons, "mouse");

    if (activeTool instanceof baseAnnotationTool) {
      activeTool.updateCachedStats(image, element, data);
    }

    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    external.cornerstone.triggerEvent(
      element,
      EVENTS.MEASUREMENT_MODIFIED,
      modifiedEventData
    );
  };

  handle.active = true;
  state.isToolLocked = true;

  element.addEventListener(EVENTS.MOUSE_DRAG, _dragCallback);
  element.addEventListener(EVENTS.TOUCH_DRAG, _dragCallback);

  const currentImage = external.cornerstone.getImage(element);
  const imageRenderedHandler = () => {
    const newImage = external.cornerstone.getImage(element);

    // Check if the rendered image changed during measurement modifying and stop it if so
    if (newImage.imageId !== currentImage.imageId) {
      interactionEndCallback();
    }
  };

  // Bind the event listener for image rendering
  element.addEventListener(EVENTS.IMAGE_RENDERED, imageRenderedHandler);

  const interactionEndCallback = () => {
    handle.active = false;
    state.isToolLocked = false;

    element.removeEventListener(EVENTS.IMAGE_RENDERED, imageRenderedHandler);

    element.removeEventListener(EVENTS.MOUSE_DRAG, _dragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, interactionEndCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, interactionEndCallback);

    element.removeEventListener(EVENTS.TOUCH_DRAG, _dragCallback);
    element.removeEventListener(EVENTS.TOUCH_DRAG_END, interactionEndCallback);
    element.removeEventListener(EVENTS.TAP, interactionEndCallback);

    external.cornerstone.updateImage(element);

    if (typeof doneMovingCallback === "function") {
      doneMovingCallback();
    }
  };

  element.addEventListener(EVENTS.MOUSE_UP, interactionEndCallback);
  element.addEventListener(EVENTS.MOUSE_CLICK, interactionEndCallback);

  element.addEventListener(EVENTS.TOUCH_DRAG_END, interactionEndCallback);
  element.addEventListener(EVENTS.TAP, interactionEndCallback);
}

/* eslint no-loop-func: 0 */ // --> OFF
/* eslint class-methods-use-this: 0 */ // --> OFF
import external from '../externalModules.js';
import baseAnnotationTool from '../base/baseAnnotationTool.js';
// State
import textStyle from '../stateManagement/textStyle.js';
import {
  addToolState,
  getToolState,
  removeToolState
} from '../stateManagement/toolState.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
// Manipulators
import drawHandles from '../manipulators/drawHandles.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
// Drawing
import {
  getNewContext,
  draw,
  setShadow,
  drawLine
} from '../util/drawing.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import lineSegDistance from '../util/lineSegDistance.js';
import roundToDecimal from '../util/roundToDecimal.js';
import EVENTS from './../events.js';
import triggerEvent from '../util/triggerEvent.js';

export default class extends baseAnnotationTool {
  constructor(name = 'anteFemoral') {
    super({
      name,
      supportedInteractionTypes: ['mouse', 'touch']
    });

    this.synchronizationContext = null;
  }

  /**
   * Create the measurement data for this tool with the end handle activated
   *
   * @param {*} eventData
   * @returns
   */
  createNewMeasurement(eventData) {
    // Create the measurement data for this tool with the end handle activated
    return {
      visible: true,
      active: true,
      color: undefined,
      complete: false,
      value: '',
      segElem: undefined,
      segElem2: undefined,
      segImage: undefined,
      segImage2: undefined,
      handles: {
        start: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true
        },
        start2: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
          drawnIndependently: true,
        },
        end2: {
          x: eventData.currentPoints.image.x + 1,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
          drawnIndependently: true,
        },
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true
        }
      }
    };
  }

  /**
   *
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns
   */
  pointNearTool(element, data, coords) {
    if (data.visible === false) {
      return false;
    }

    const maybePending = this.getIncomplete(element);

    if (maybePending) {
      // measurement in progress
      return false;
    }

    // TODO: take into account pixel size
    if (data.segElem === element ) {
      return (
        lineSegDistance( element, data.handles.start, data.handles.end, coords) < 30 
      );
    }
    if (data.segElem2 === element ) {
      return (
        lineSegDistance( element, data.handles.start2, data.handles.end2, coords) < 30 
      );
    }
    return false;
  }

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData(evt) {
    const eventData = evt.detail;

    if ( !this.synchronizationContext ) {
      return;
    }

    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(evt.currentTarget, this.name);
    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);

    // TODO: check if element is in synchronizer?
    // const enabledElements = this.synchronizationContext.getSourceElements();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      // check if visible
      if (data.visible === false) {
        continue;
      }

      // check if annotation is for current image
      const imageId = evt.detail.image.imageId;
      if ( data.segElem === eventData.element && data.segImage.imageId !== imageId ) {
        continue;
      }
      if ( data.segElem2 === eventData.element && data.segImage2.imageId !== imageId ) {
        continue;
      }

      draw(context, (context) => {

        if (data.segElem === eventData.element) {
          this.drawSegment1(eventData.element, data, eventData, context);
        }

        if (data.segElem2 === eventData.element) {
          this.drawSegment2(eventData.element, data, eventData, context);
        }        
      });
    }
  }

  getIncomplete(target) {
    const toolData = getToolState(target, this.name);

    if (toolData === undefined) {
      return;
    }

    for (let i = 0; i < toolData.data.length; i++) {
      if (toolData.data[i].complete === false) {
        return toolData.data[i];
      }
    }
  }

  addNewMeasurement(evt, interactionType) {

    const enabledElements = this.synchronizationContext.getSourceElements();

    // TODO: requires at least two enable elements?
    // if ( enabledElements.length < 2 ) {
    //   console.log('WARNING: Femoral tool requires at least two images');
    //   return;
    // }

    evt.preventDefault();
    evt.stopPropagation();

    const eventData = evt.detail;

    let measurementData;
    let toMoveHandle;

    // Search for incomplete measurements
    const element = evt.detail.element;

    // const maybePending = this.getIncomplete(element);
    let maybePending = undefined;
    enabledElements.forEach( elem => {
      if ( !maybePending ) {
        maybePending = this.getIncomplete(elem);
      }
    });

    if (maybePending) {
      measurementData = maybePending;
      measurementData.complete = true;
      measurementData.segElem2 = element;
      measurementData.segImage2 = evt.detail.image;
      measurementData.handles.start2 = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        drawnIndependently: false,
        highlight: true,
        active: false
      };
      measurementData.handles.end2 = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        drawnIndependently: false,
        highlight: true,
        active: true
      };
      toMoveHandle = measurementData.handles.end2;

      // add to state of current element
      if ( measurementData.segElem !== element ){
        addToolState(element, this.name, measurementData);    
      }
    } else {
      measurementData = this.createNewMeasurement(eventData);
      measurementData.segElem = element;
      measurementData.segImage = evt.detail.image;
      addToolState(element, this.name, measurementData);
      toMoveHandle = measurementData.handles.end;
    }

    // MoveHandle, moveNewHandle, moveHandleTouch, and moveNewHandleTouch
    // All take the same parameters, but register events differentlIy.
    const handleMover =
      interactionType === 'mouse' ? moveNewHandle : moveNewHandleTouch;

    // Associate this data with this imageId so we can render it and manipulate it
    if( measurementData.segElem ) {
      external.cornerstone.updateImage(measurementData.segElem);
    }
    if( measurementData.segElem2 ) {
      external.cornerstone.updateImage(measurementData.segElem2);
    }

    handleMover(
      eventData,
      this.name,
      measurementData,
      toMoveHandle,
      () => {
        measurementData.active = false;
        // TODO: check this values
        measurementData.handles.end.active = false;
        measurementData.handles.end2.active = false;

        // TODO: `anyHandlesOutsideImage` deletion should be a config setting
        // TODO: Maybe globally? Mayber per tool?
        // If any handle is outside image, delete and abort
        // if (anyHandlesOutsideImage(eventData, measurementData.handles)) {
        //   // Delete the measurement
        //   removeToolState(element, this.name, measurementData);
        // }
        
        const eventType = EVENTS.MEASUREMENT_FINISHED;

        toMoveHandle.isMoving = false;
        if (measurementData.complete) {
          const endEventData = {
            toolType: this.name,
            element: element,
            measurementData: measurementData
          };

          triggerEvent(element, eventType, endEventData);
        }

        external.cornerstone.updateImage(element);
      }
    );
  }

  onMeasureModified(ev) {

    if (ev.detail.toolType !== this.name) {
      return;
    }
    const data = ev.detail.measurementData;
    if (!data.segImage || !data.segImage2 ) {
      return;
    }

    // default values
    let columnPixelSpacing1 = data.segImage.columnPixelSpacing || 1;
    let rowPixelSpacing1 = data.segImage.rowPixelSpacing || 1;
    let columnPixelSpacing2 = data.segImage2.columnPixelSpacing || 1;
    let rowPixelSpacing2 = data.segImage2.rowPixelSpacing || 1;

    // try to get spacing from metadata
    const imagePlane1 = external.cornerstone.metaData.get('imagePlaneModule', data.segImage.imageId);
    if (imagePlane1) {
      const rowPixelSpacing = imagePlane1.rowPixelSpacing || imagePlane1.rowImagePixelSpacing;
      const colPixelSpacing = imagePlane1.columnPixelSpacing || imagePlane1.colImagePixelSpacing;
      if ( rowPixelSpacing ) {
        rowPixelSpacing1 = rowPixelSpacing;
      }
      if ( colPixelSpacing ) {
        columnPixelSpacing1 = colPixelSpacing;
      }
    } 
    const imagePlane2 = external.cornerstone.metaData.get('imagePlaneModule', data.segImage2.imageId);
    if (imagePlane2) {
      const rowPixelSpacing = imagePlane2.rowPixelSpacing || imagePlane2.rowImagePixelSpacing;
      const colPixelSpacing = imagePlane2.columnPixelSpacing || imagePlane2.colImagePixelSpacing;
      if ( rowPixelSpacing ) {
        rowPixelSpacing2 = rowPixelSpacing;
      }
      if ( colPixelSpacing ) {
        columnPixelSpacing2 = colPixelSpacing;
      }
    } 
    
    data.value = calculateValue(data, data.segImage, data.segImage2);

    function calculateValue(data, image1, image2) {

      const dx1 = ((data.handles.start.x) - (data.handles.end.x)) * columnPixelSpacing1;
      const dy1 = ((data.handles.start.y) - (data.handles.end.y)) * rowPixelSpacing1;
      const dx2 = ((data.handles.start2.x) - (data.handles.end2.x)) * columnPixelSpacing2;
      const dy2 = ((data.handles.start2.y) - (data.handles.end2.y)) * rowPixelSpacing2;

      // console.log('xxxxxxxxxxxxxxxxxxxxx (' +dx1+','+dy1+')');
      // console.log('xxxxxxxxxxxxxxxxxxxxx (' +dx2+','+dy2+')');

      let angle = Math.acos(Math.abs(((dx1 * dx2) + (dy1 * dy2)) / (Math.sqrt((dx1 * dx1) + (dy1 * dy1)) * Math.sqrt((dx2 * dx2) + (dy2 * dy2)))));

      angle *= (180 / Math.PI);

      const rAngle = roundToDecimal(angle, 2);

      if (!Number.isNaN(data.rAngle)) {
        return textBoxText(
          rAngle
        );
      }
      return '';
    }

    function textBoxText(rAngle, rowPixelSpacing, columnPixelSpacing) {
      const suffix =
        !rowPixelSpacing || !columnPixelSpacing ? ' (isotropic)' : '';
      const str = '00B0'; // Degrees symbol
      return (
        rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix
      );
    }
  }

  drawSegment1(element, data, eventData, context) {

    if (data.segElem !== element) {
      return;
    }

    const lineWidth = toolStyle.getToolWidth();
    const font = textStyle.getFont();
    const config = this.configuration;

    setShadow(context, config);

    const handles = {
      start: data.handles.start,
      end: data.handles.end
    }

    // Differentiate the color of activation tool
    const color = toolColors.getColorIfActive(data);

    drawLine(context, element, handles.start, handles.end, {color});

    const handleOptions = {
      drawHandlesIfActive: config && config.drawHandlesOnHover,
      hideHandlesIfMoved: config && config.hideHandlesIfMoved
    };

    drawHandles(context, eventData, handles, color, handleOptions);

    // Draw the text
    context.fillStyle = color;
    const text = data.value;

    // TODO: take into account pixel size!
    if (!data.handles.textBox.hasMoved) {
      let textCoords;
      textCoords = {
        x: (handles.start.x + handles.end.x) / 2,
        y: (handles.start.y + handles.end.y) / 2 - 10
      };

      context.font = font;
      data.handles.textBox.x = textCoords.x;
      data.handles.textBox.y = textCoords.y;
    }

    drawLinkedTextBox(
      context,
      element,
      data.handles.textBox,
      text,
      handles,
      textBoxAnchorPoints,
      color,
      lineWidth,
      0,
      true
    );

    function textBoxAnchorPoints(handles) {
      return [handles.start, handles.end];
    }
  }

  drawSegment2(element, data, eventData, context) {

    if (data.segElem2 !== element) {
      return;
    }

    // const lineWidth = toolStyle.getToolWidth();
    // const font = textStyle.getFont();
    const config = this.configuration;

    setShadow(context, config);

    const handles = {
      start: data.handles.start2,
      end: data.handles.end2
    }

    // Differentiate the color of activation tool
    const color = toolColors.getColorIfActive(data);

    if (data.complete) {
      drawLine(context, element, handles.start, handles.end, {color});
    }

    const handleOptions = {
      drawHandlesIfActive: config && config.drawHandlesOnHover,
      hideHandlesIfMoved: config && config.hideHandlesIfMoved
    };

    drawHandles(context, eventData, handles, color, handleOptions);
  }

  activeCallback(element) {
    this.onMeasureModified = this.onMeasureModified.bind(this);
    element.addEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);
  }

  passiveCallback(element) {
    this.onMeasureModified = this.onMeasureModified.bind(this);
    element.addEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);
  }

  enabledCallback(element, { synchronizationContext } = {}) {
    this.synchronizationContext = synchronizationContext;
    element.removeEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);
  }

  disabledCallback(element) {
    element.removeEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);
  }
}


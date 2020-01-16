import baseAnnotationTool from '../base/baseAnnotationTool.js';

import createNewMeasurement from './parallelDistanceTool/createNewMeasurement.js';
import pointNearTool from './parallelDistanceTool/pointNearTool.js';
import renderToolData from './parallelDistanceTool/renderToolData.js';
import addNewMeasurement from './parallelDistanceTool/addNewMeasurement.js';
import _moveCallback from './parallelDistanceTool/mouseMoveCallback.js';
import handleSelectedCallback from './parallelDistanceTool/handleSelectedCallback.js';
import handleSelectedMouseCallback from './parallelDistanceTool/handleSelectedMouseCallback.js';
// import handleSelectedTouchCallback from './bidirectionalTool/handleSelectedTouchCallback.js';
import throttle from '../util/throttle';
import getPixelSpacing from '../util/getPixelSpacing';
import calculateLongestAndShortestDiameters from './parallelDistanceTool/utils/calculateLongestAndShortestDiameters';

const emptyLocationCallback = (measurementData, eventData, doneCallback) =>
  doneCallback();

export default class extends baseAnnotationTool {
  constructor(name = 'parallelDistance') {
    const defaultProps = {
      name,
      supportedInteractionTypes: ['mouse'], 
      configuration: {
        changeMeasurementLocationCallback: emptyLocationCallback,
        getMeasurementLocationCallback: emptyLocationCallback,
        textBox: '',
        shadow: '',
        drawHandlesOnHover: true,
        additionalData: [],
      },

    };

    

    super(defaultProps);

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);

    this.createNewMeasurement = createNewMeasurement.bind(this);
    this.pointNearTool = pointNearTool.bind(this);
    this.renderToolData = renderToolData.bind(this);
    this.addNewMeasurement = addNewMeasurement.bind(this);
    this._moveCallback = _moveCallback.bind(this);

    this.handleSelectedCallback = handleSelectedCallback.bind(this);
    this.handleSelectedMouseCallback = handleSelectedMouseCallback.bind(this);
    // this.handleSelectedTouchCallback = handleSelectedTouchCallback.bind(this);
  }

  updateCachedStats(image, element, data) {
    const pixelSpacing = getPixelSpacing(image);
    const {
      parallelDistance
    } = calculateLongestAndShortestDiameters(data, pixelSpacing);

    // Set measurement text to show lesion table
    // data.parallelDistance = parallelDistance;
    data.invalidated = false;
  }
}

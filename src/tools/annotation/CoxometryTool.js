import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

import createNewMeasurement from './coxometryTool/createNewMeasurement.js';
import pointNearTool from './coxometryTool/pointNearTool.js';
import renderToolData from './coxometryTool/renderToolData.js';
import addNewMeasurement from './coxometryTool/addNewMeasurement.js';
import _moveCallback from './coxometryTool/mouseMoveCallback.js';
import handleSelectedCallback from './coxometryTool/handleSelectedCallback.js';
import handleSelectedMouseCallback from './coxometryTool/handleSelectedMouseCallback.js';
import handleSelectedTouchCallback from './coxometryTool/handleSelectedTouchCallback.js';
import { bidirectionalCursor } from '../cursors/index.js';
import throttle from '../../util/throttle';
import getPixelSpacing from '../../util/getPixelSpacing';
import calculateLongestAndShortestDiameters from './coxometryTool/utils/calculateLongestAndShortestDiameters';

const emptyLocationCallback = (measurementData, eventData, doneCallback) =>
  doneCallback();

/**
 * @public
 * @class CoxometryTool
 * @memberof Tools.Annotation
 * @classdesc Create and position an annotation that measures the
 * length and width of a region.
 * @extends Tools.Base.BaseAnnotationTool
 */

export default class CoxometryTool extends BaseAnnotationTool {
  constructor(props) {
    const defaultProps = {
      name: 'Coxometry',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        changeMeasurementLocationCallback: emptyLocationCallback,
        getMeasurementLocationCallback: emptyLocationCallback,
        textBox: '',
        shadow: '',
        drawHandlesOnHover: true,
        additionalData: [],
      },
      svgCursor: bidirectionalCursor,
    };

    super(props, defaultProps);

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);

    this.createNewMeasurement = createNewMeasurement.bind(this);
    this.pointNearTool = pointNearTool.bind(this);
    this.renderToolData = renderToolData.bind(this);
    this.addNewMeasurement = addNewMeasurement.bind(this);
    this._moveCallback = _moveCallback.bind(this);

    this.handleSelectedCallback = handleSelectedCallback.bind(this);
    this.handleSelectedMouseCallback = handleSelectedMouseCallback.bind(this);
    this.handleSelectedTouchCallback = handleSelectedTouchCallback.bind(this);
  }

  updateCachedStats(image, element, data) {
    const pixelSpacing = getPixelSpacing(image);
    const {
      longestDiameter,
      shortestDiameter,
    } = calculateLongestAndShortestDiameters(data, pixelSpacing);

    // Set measurement text to show lesion table
    data.longestDiameter = longestDiameter;
    data.shortestDiameter = shortestDiameter;
    data.invalidated = false;
  }
}

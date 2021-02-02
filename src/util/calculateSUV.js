import external from '../externalModules.js';

// Returns a decimal value given a fractional value
function fracToDec (fractionalValue) {
  return parseFloat(`.${fractionalValue}`);
}

function convertRadioactivity(count, sourceUnits, targetUnits) {

  sourceUnits = sourceUnits.trim();
  let conversion = count;
  
  if( sourceUnits == 'Bq' ) 
  {
    switch(targetUnits) {
      case 'MBq': conversion *= 0.000001; break;
      case 'kBq': conversion *= 0.001; break;
      case 'mBq': conversion *= 1000.0; break;
      case 'uBq': conversion *= 1000000.0; break;
      case 'MCi': conversion *= 0.000000000000000027027027027027; break;
      case 'kCi': conversion *= 0.000000000000027027027027027; break;
      case 'Ci':  conversion *= 0.000000000027027027027027; break;
      case 'mCi': conversion *= 0.000000027027027027027; break;
      case 'uCi': conversion *= 0.000027027027027027; break;
    }
  }
  return conversion;  
}

function decayDose(dose, doseData) {

  const {startTime, halfLife, seriesAcquisitionTime} = doseData;
  
  const acquisitionTimeInSeconds = fracToDec(seriesAcquisitionTime.fractionalSeconds || 0) + seriesAcquisitionTime.seconds + seriesAcquisitionTime.minutes * 60 + seriesAcquisitionTime.hours * 60 * 60;
  const injectionStartTimeInSeconds = fracToDec(startTime.fractionalSeconds) + startTime.seconds + startTime.minutes * 60 + startTime.hours * 60 * 60;
  const durationInSeconds = acquisitionTimeInSeconds - injectionStartTimeInSeconds;
  const correctedDose = dose * Math.pow(2.0, -(durationInSeconds / halfLife) )
  return correctedDose;
}

export default function (image, storedPixelValue) {
  const cornerstone = external.cornerstone;
  const patientStudyModule = cornerstone.metaData.get('patientStudyModule', image.imageId);
  const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);

  if (!patientStudyModule || !seriesModule) {
    return;
  }

  const modality = seriesModule.modality;

  // Image must be PET
  if (modality !== 'PT') {
    return;
  }

  const modalityPixelValue = storedPixelValue * image.slope + image.intercept;
  const patientWeight = patientStudyModule.patientWeight;

  if (!patientWeight) {
    return;
  }

  const petSequenceModule = cornerstone.metaData.get('petIsotopeModule', image.imageId);

  if (!petSequenceModule) {
    return;
  }  

  const radiopharmaceuticalInfo = petSequenceModule.radiopharmaceuticalInfo;
  const startTime = radiopharmaceuticalInfo.radiopharmaceuticalStartTime;
  const totalDose = radiopharmaceuticalInfo.radionuclideTotalDose;
  const halfLife = radiopharmaceuticalInfo.radionuclideHalfLife;
  const seriesAcquisitionTime = seriesModule.seriesTime;

  if (!startTime || !totalDose || !halfLife || !seriesAcquisitionTime) {
    return;
  }
  if (totalDose <= 0){
    return;
  }

  const doseData = {
    startTime, totalDose, halfLife, seriesAcquisitionTime
  }

  let units = '';
  const petUnitsModule = cornerstone.metaData.get('petUnitsModule', image.imageId);

  if (petUnitsModule && petUnitsModule.units) {
    units = petUnitsModule.units;
  }
  else {
    units = image.data.string('x00541001');
  }

  if ( units.trim() !== 'BQML') {
    console.log('Pet suv: only BQML units supported', units);
    // only BQML supported
    return;
  }  
 
  // convert pixel to kBq
  const kBqPixel = convertRadioactivity(modalityPixelValue, 'Bq', 'kBq');
  // convert dose to MBq
  const kBqDose = convertRadioactivity(totalDose, 'Bq', 'MBq');
  // calculate decay
  const correctedDose = decayDose(kBqDose, doseData );
  // get suv
  const suv = kBqPixel * patientWeight / correctedDose;

  return suv;
}


import * as tf from '@tensorflow/tfjs';

let model = null;

export const loadModel = async () => {
  if (!model) {
    model = await tf.loadGraphModel('/web-model/model.json');
  }
  return model;
};


import { loadModel } from './utils/loadModel';
import tokenizer from './tokenizer.json';
import labelMap from './label_map.json';
import * as tf from '@tensorflow/tfjs';


const MAX_LENGTH = 40;
const OOV_TOKEN = '<OOV>';

const tokenize = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const sequence = words.map(w => tokenizer[w] || tokenizer[OOV_TOKEN] || 0);
  const padded = Array(MAX_LENGTH).fill(0);
  for (let i = 0; i < Math.min(sequence.length, MAX_LENGTH); i++) {
    padded[i] = sequence[i];
  }
  return tf.tensor([padded], [1, MAX_LENGTH], 'float32');
};

export const predictCategory = async (sms) => {
  const model = await loadModel();
  const input = tokenize(sms);
  const output = model.predict(input);
  const result = await output.array();
  const index = result[0].indexOf(Math.max(...result[0]));
  return labelMap[index.toString()] || 'Other';
};

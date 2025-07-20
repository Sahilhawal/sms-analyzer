
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import tokenizer from './tokenizer.json';
import labelMap from './label_map.json';

const OOV_TOKEN = '<OOV>';
const MAX_LENGTH = 40;

let tfliteModel = null;

export const loadModel = async () => {
  if (!tfliteModel) {
    tfliteModel = await tflite.loadTFLiteModel('/sms_categorizer.tflite');
  }
  return tfliteModel;
};

const tokenize = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const sequence = words.map(word => tokenizer[word] || tokenizer[OOV_TOKEN] || 0);
  const padded = new Array(MAX_LENGTH).fill(0);
  for (let i = 0; i < Math.min(sequence.length, MAX_LENGTH); i++) {
    padded[i] = sequence[i];
  }
  return tf.tensor([padded], [1, MAX_LENGTH], 'int32');
};

export const getCategory = async (text) => {
  const model = await loadModel();
  const input = tokenize(text);
  const output = await model.predict(input);
  const result = await output.array();
  const index = result[0].indexOf(Math.max(...result[0]));
  return labelMap[index.toString()] || 'Other';
};

// Regex-based data extraction
export const extractDetails = (text) => {
  const amountMatch = text.match(/(?:Rs\.?|INR)?\s?([\d,]+\.\d{2})/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  const debit = /debited|spent|sent/i.test(text);
  const credit = /credited|received/i.test(text);
  const type = debit ? 'Debit' : credit ? 'Credit' : null;

  const dateMatch = text.match(/\d{2}[-/][A-Za-z]{3}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}/);
  const date = dateMatch ? dateMatch[0] : null;

  const toMatch = text.match(/(?:to|TO|at|AT|by|BY)\s+([A-Z0-9 .&-]{3,})/);
  const recipient = toMatch ? toMatch[1].trim() : null;

  return { amount, type, date, recipient };
};

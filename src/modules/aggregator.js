import { QUESTION_TYPES, normalizeOptions } from '../config/constants.js';

// computeResults(questions, responses) → { [questionId]: ResultData }
// questions: array of { id, type, config, ... }
// responses: array of { answers: { [qId]: value } }
export function computeResults(questions, responses) {
  const result = {};
  for (const q of questions) {
    const values = responses
      .map((r) => r.answers?.[q.id])
      .filter((v) => v !== undefined && v !== null);
    result[q.id] = computeForQuestion(q, values);
  }
  return result;
}

function computeForQuestion(q, values) {
  switch (q.type) {
    case QUESTION_TYPES.BINARY: {
      let totalA = 0;
      let totalB = 0;
      for (const v of values) {
        if (v === 'A') totalA++;
        else if (v === 'B') totalB++;
      }
      return { totalA, totalB, total: totalA + totalB };
    }

    case QUESTION_TYPES.RANKING: {
      const items = q.config?.items || [];
      const selectCount = q.config?.selectCount || 0;
      // frequency[itemId][rank] = count, rank is 1-based
      const frequency = {};
      const rankSum = {};
      const rankCount = {};
      for (const it of items) {
        frequency[it.id] = {};
        rankSum[it.id] = 0;
        rankCount[it.id] = 0;
      }
      let total = 0;
      for (const v of values) {
        if (!Array.isArray(v)) continue;
        total++;
        v.forEach((itemId, idx) => {
          const rank = idx + 1;
          if (!frequency[itemId]) frequency[itemId] = {};
          frequency[itemId][rank] = (frequency[itemId][rank] || 0) + 1;
          rankSum[itemId] = (rankSum[itemId] || 0) + rank;
          rankCount[itemId] = (rankCount[itemId] || 0) + 1;
        });
      }
      const averages = {};
      for (const it of items) {
        averages[it.id] = rankCount[it.id] > 0 ? rankSum[it.id] / rankCount[it.id] : null;
      }
      return { averages, frequency, total, selectCount };
    }

    case QUESTION_TYPES.NUMBER: {
      const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
      if (nums.length === 0) return { avg: null, min: null, max: null, total: 0 };
      const sum = nums.reduce((a, b) => a + b, 0);
      return {
        avg: sum / nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
        total: nums.length,
      };
    }

    case QUESTION_TYPES.TEXT: {
      const texts = values.filter((v) => typeof v === 'string' && v.trim().length > 0);
      return { responses: texts, total: texts.length };
    }

    case QUESTION_TYPES.DROPDOWN: {
      const counts = {};
      for (const o of normalizeOptions(q.config?.options)) counts[o.label] = 0;
      let total = 0;
      for (const v of values) {
        if (typeof v !== 'string') continue;
        counts[v] = (counts[v] || 0) + 1;
        total++;
      }
      return { counts, total };
    }

    case QUESTION_TYPES.CHECK: {
      const counts = {};
      for (const o of normalizeOptions(q.config?.options)) counts[o.label] = 0;
      let total = 0; // number of respondents
      for (const v of values) {
        if (!Array.isArray(v)) continue;
        total++;
        for (const o of v) counts[o] = (counts[o] || 0) + 1;
      }
      return { counts, total };
    }

    default:
      return { total: values.length };
  }
}

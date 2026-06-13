import { QUESTION_TYPES } from '../../config/constants.js';
import BinaryViz from './BinaryViz.jsx';
import RankingViz from './RankingViz.jsx';
import NumberViz from './NumberViz.jsx';
import TextViz from './TextViz.jsx';
import DropdownViz from './DropdownViz.jsx';
import CheckViz from './CheckViz.jsx';

const MAP = {
  [QUESTION_TYPES.BINARY]: BinaryViz,
  [QUESTION_TYPES.RANKING]: RankingViz,
  [QUESTION_TYPES.NUMBER]: NumberViz,
  [QUESTION_TYPES.TEXT]: TextViz,
  [QUESTION_TYPES.DROPDOWN]: DropdownViz,
  [QUESTION_TYPES.CHECK]: CheckViz,
};

export default function QuestionViz({ question, result }) {
  const Component = MAP[question.type];
  if (!Component) return null;
  return <Component question={question} result={result} />;
}

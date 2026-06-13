import { QUESTION_TYPES } from '../../config/constants.js';
import BinaryRenderer from './BinaryRenderer.jsx';
import RankingRenderer from './RankingRenderer.jsx';
import NumberRenderer from './NumberRenderer.jsx';
import TextRenderer from './TextRenderer.jsx';
import DropdownRenderer from './DropdownRenderer.jsx';
import CheckRenderer from './CheckRenderer.jsx';

const MAP = {
  [QUESTION_TYPES.BINARY]: BinaryRenderer,
  [QUESTION_TYPES.RANKING]: RankingRenderer,
  [QUESTION_TYPES.NUMBER]: NumberRenderer,
  [QUESTION_TYPES.TEXT]: TextRenderer,
  [QUESTION_TYPES.DROPDOWN]: DropdownRenderer,
  [QUESTION_TYPES.CHECK]: CheckRenderer,
};

export default function QuestionRenderer({ question, value, onChange }) {
  const Component = MAP[question.type];
  if (!Component) return null;
  return <Component question={question} value={value} onChange={onChange} />;
}

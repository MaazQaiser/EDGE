import { enumResponseType } from 'src/utils/constants';

/** API may send `aIModifiedAnswers` or `aiModifiedAnswers`. */
export const getAiSuggestedAnswers = (question) =>
  question?.aIModifiedAnswers ?? question?.aiModifiedAnswers;

/** Text (0) and description (11) use the same AI compare / submit flags. */
export const isAiTextCompareResponseType = (responseType) =>
  responseType === enumResponseType.text || responseType === enumResponseType.description;

/**
 * When original + suggested AI strings are present and non-empty, pair exists for compare UI.
 */
export const hasDescriptionAIPair = (question) => {
  if (!question) return false;
  const a = question.originalTextFlagAnswers;
  const b = getAiSuggestedAnswers(question);
  if (a == null || b == null) return false;
  if (String(a).trim() === '' || String(b).trim() === '') return false;
  return true;
};

/**
 * Show compare UI when `hasAiSuggestions === true` on the report root or the question.
 */
export const shouldShowDescriptionAiCompare = (reportRoot, question) =>
  reportRoot?.hasAiSuggestions === true || question?.hasAiSuggestions === true;

/**
 * Report / template root from API: `isAIModified` present means do not mount per-question compare UI.
 */
export const hasIsAIModifiedKeyOnReportRoot = (reportRoot) =>
  reportRoot != null && Object.hasOwn(reportRoot || {}, 'isAIModified');

/**
 * Mount side-by-side compare when AI suggestions apply and the API has **not** sent
 * `isAIModified` on the **report root** (no key → user still chooses at question level; key on root → plain fields).
 */
export const shouldMountAIDescriptionCompare = (reportRoot, question) =>
  shouldShowDescriptionAiCompare(reportRoot, question) &&
  !hasIsAIModifiedKeyOnReportRoot(reportRoot);

/**
 * After assignTheAnswers, set isAIModified only for questions that showed compare UI.
 */
export const applyDescriptionAIIsAIModifiedFlags = (uploadedData, selections) => {
  if (!uploadedData?.sectionsAttributes) return uploadedData;
  for (const section of uploadedData.sectionsAttributes) {
    for (const q of section?.questionsAttributes || []) {
      if (!isAiTextCompareResponseType(q.responseType)) continue;
      if (!shouldMountAIDescriptionCompare(uploadedData, q)) continue;
      const mode = selections?.[q.id] ?? selections?.[String(q.id)];
      q.isAIModified = mode === 'suggested';
    }
  }
  return uploadedData;
};

/**
 * Root submit payload flag: true if any question has accepted AI suggestion (`isAIModified`).
 */
export const getSubmitReportIsAIModified = (payload) => {
  if (!payload?.sectionsAttributes) return false;
  for (const section of payload.sectionsAttributes) {
    for (const q of section?.questionsAttributes || []) {
      if (q?.isAIModified === true) return true;
    }
  }
  return false;
};

export const normDescriptionText = (s) => String(s ?? '').trim();

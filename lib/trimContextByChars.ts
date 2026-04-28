/**
 * Trim context to fit within token budget
 * IMPROVED: Better token estimation and preserves complete sentences
 */
function trimContextByChars(
  context: string,
  maxTokens = 12000 // Increased default from 6000
) {
  // Gemini typically uses ~3-4 characters per token for English
  // Using 3.5 as a conservative estimate
  const approxCharsPerToken = 3.5;
  const maxChars = Math.floor(maxTokens * approxCharsPerToken);

  if (context.length <= maxChars) {
    return context;
  }

  // IMPROVED: Try to cut at sentence boundary
  const trimmed = context.slice(0, maxChars);
  
  // Find last sentence-ending punctuation
  const lastSentenceEnd = Math.max(
    trimmed.lastIndexOf('. '),
    trimmed.lastIndexOf('.\n'),
    trimmed.lastIndexOf('? '),
    trimmed.lastIndexOf('! ')
  );

  // If we found a sentence boundary within reasonable distance, use it
  if (lastSentenceEnd > maxChars * 0.9) {
    return trimmed.slice(0, lastSentenceEnd + 1);
  }

  // Otherwise just use character limit
  return trimmed + '...';
}

export default trimContextByChars;
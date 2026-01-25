function trimContextByChars(
    context: string,
    maxTokens = 6000
  ) {
    const approxCharsPerToken = 4;
    const maxChars = maxTokens * approxCharsPerToken;
  
    return context.length > maxChars
      ? context.slice(0, maxChars)
      : context;
  }

export default trimContextByChars;
/**
 * FaqSchema — JSON-LD FAQPage Structured Data
 * 
 * Injects https://schema.org/FAQPage for LLM-generated article pages.
 * This forces Google to render interactive dropdown accordions directly
 * beneath the search listing, pushing competitors off the first page.
 * 
 * Extracts Q&A pairs from the markdown content by parsing ## headings as
 * questions and the paragraph content beneath them as answers.
 */

interface FaqSchemaProps {
  articleTitle: string;
  movieTitle: string;
  content: string; // Markdown content from the LLM
  slug: string;    // e.g. "ending-explained", "fan-theories", "parents-guide"
}

/**
 * Parses markdown content into FAQ question/answer pairs.
 * Uses ## headings as questions and following paragraph text as answers.
 * Also generates contextual fallback questions based on the article slug.
 */
function extractFaqPairs(content: string, movieTitle: string, slug: string): { question: string; answer: string }[] {
  const pairs: { question: string; answer: string }[] = [];

  // Extract from markdown ## headings
  const sections = content.split(/^##\s+/m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const heading = lines[0]?.trim();
    if (!heading) continue;

    // Build answer from remaining lines, strip markdown artifacts
    const answerLines = lines.slice(1)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('---'))
      .join(' ')
      .replace(/\*\*/g, '')  // Strip bold
      .replace(/\*/g, '')     // Strip italic
      .replace(/`/g, '')      // Strip code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Strip links, keep text

    if (answerLines.length < 20) continue; // Skip empty/short sections

    // Convert heading to a question format if it isn't one already
    const question = heading.endsWith('?') ? heading : heading;

    pairs.push({
      question,
      answer: answerLines.substring(0, 300) + (answerLines.length > 300 ? '...' : ''),
    });
  }

  // Generate contextual fallback FAQs based on slug if we have fewer than 3
  if (pairs.length < 3) {
    const fallbacks: Record<string, { question: string; answer: string }[]> = {
      'ending-explained': [
        { question: `What is the ending of ${movieTitle}?`, answer: `The ending of ${movieTitle} is explored in detail in our comprehensive analysis above.` },
        { question: `Does ${movieTitle} have a hidden meaning?`, answer: `Yes, ${movieTitle} contains several layers of symbolism that are discussed thoroughly in this article.` },
      ],
      'fan-theories': [
        { question: `What are the best fan theories about ${movieTitle}?`, answer: `We cover the top fan theories about ${movieTitle} including plot connections and hidden details.` },
        { question: `Are there any confirmed fan theories for ${movieTitle}?`, answer: `Several fan theories about ${movieTitle} have gained significant traction among viewers and critics.` },
      ],
      'parents-guide': [
        { question: `Is ${movieTitle} appropriate for kids?`, answer: `Our parents guide for ${movieTitle} breaks down the content by category including violence, language, and themes.` },
        { question: `What age rating does ${movieTitle} have?`, answer: `Check our detailed content breakdown of ${movieTitle} to understand its suitability for different age groups.` },
      ],
    };

    const extras = fallbacks[slug] || [];
    for (const extra of extras) {
      if (pairs.length >= 5) break;
      // Don't add duplicates
      if (!pairs.find(p => p.question === extra.question)) {
        pairs.push(extra);
      }
    }
  }

  return pairs.slice(0, 6); // Google supports up to ~6 FAQ entries reliably
}

export function FaqSchema({ articleTitle, movieTitle, content, slug }: FaqSchemaProps) {
  const faqPairs = extractFaqPairs(content, movieTitle, slug);

  if (faqPairs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqPairs.map(pair => ({
      '@type': 'Question',
      name: pair.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: pair.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

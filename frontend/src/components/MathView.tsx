'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Parses and renders text that may contain mixed LaTeX math:
 * - $math$ for inline equations
 * - $$math$$ for display equations
 * - Bare LaTeX commands (e.g. \begin{aligned}, \mathbf{C} = \sum...)
 */
export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    if (!math) return '';

    let cleanInput = math
      .trim()
      .replace(/\x08egin/g, '\\begin')
      .replace(/\x09ext/g, '\\text')
      .replace(/\x0crac/g, '\\frac')
      .replace(/\x0dight/g, '\\right');

    // Restore backslash if beginning with begin{ or egin{
    if (/^(e|\\?b)egin\{/.test(cleanInput)) {
      cleanInput = '\\' + cleanInput.replace(/^(e|\\?b)egin\{/, 'begin{');
    }
    if (/(e|\\?e)nd\{/.test(cleanInput) && !/\\end\{/.test(cleanInput)) {
      cleanInput = cleanInput.replace(/(e|\\?e)nd\{/, '\\end{');
    }

    // Check if the entire input is wrapped in delimiters
    if (cleanInput.startsWith('$$') && cleanInput.endsWith('$$') && cleanInput.length > 4) {
      const inner = cleanInput.slice(2, -2).trim();
      try {
        return katex.renderToString(inner, {
          displayMode: true,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        return `<span class="katex-error">${inner}</span>`;
      }
    }

    if (cleanInput.startsWith('\\[') && cleanInput.endsWith('\\]') && cleanInput.length > 4) {
      const inner = cleanInput.slice(2, -2).trim();
      try {
        return katex.renderToString(inner, {
          displayMode: true,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        return `<span class="katex-error">${inner}</span>`;
      }
    }

    // Check if the string has inline/display delimiters embedded in text
    const hasDelimiters = /\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$/.test(cleanInput);

    if (hasDelimiters) {
      // Process $$ display math $$ first
      let processed = cleanInput.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
        try {
          const rendered = katex.renderToString(tex.trim(), {
            displayMode: true,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
          return `<div class="my-3 overflow-x-auto text-center">${rendered}</div>`;
        } catch {
          return tex;
        }
      });

      // Process $ inline math $
      processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, tex) => {
        try {
          const rendered = katex.renderToString(tex.trim(), {
            displayMode: false,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
          return `<span class="inline-block align-middle px-0.5">${rendered}</span>`;
        } catch {
          return tex;
        }
      });

      return processed;
    }

    // If no delimiters, check if it looks like a LaTeX formula or equation
    const looksLikeLatex =
      /\\([a-zA-Z]+)/.test(cleanInput) ||
      (block && /[=+\-\^_\{\}\\]/.test(cleanInput));

    if (looksLikeLatex) {
      try {
        return katex.renderToString(cleanInput, {
          displayMode: block,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        // Fallback to plain text if parse fails
        return cleanInput;
      }
    }

    // Otherwise, it is standard text
    return cleanInput;
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`my-3 overflow-x-auto py-2 text-slate-100 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline text-slate-200 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const MathBlock: React.FC<{ math: string; label?: string; className?: string }> = ({
  math,
  label,
  className = '',
}) => {
  return (
    <div
      className={`relative my-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm ${className}`}
    >
      {label && (
        <div className="mb-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
          {label}
        </div>
      )}
      <MathView math={math} block={true} />
    </div>
  );
};

export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  return <MathView math={text} block={false} className={className} />;
};

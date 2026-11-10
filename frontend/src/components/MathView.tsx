'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      // Clean leading and trailing delimiters if provided
      let cleanMath = math.trim();
      if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
        cleanMath = cleanMath.slice(1, -1).trim();
      } else if (cleanMath.startsWith('\\[') && cleanMath.endsWith('\\]')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith('\\(') && cleanMath.endsWith('\\)')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      }

      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
    } catch (e) {
      console.error('KaTeX rendering error for math:', math, e);
      return `<code class="text-rose-400">${math}</code>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`my-3 overflow-x-auto py-2 text-center text-slate-100 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block text-slate-200 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const MathBlock: React.FC<{ math: string; label?: string; className?: string }> = ({
  math,
  label,
  className = ''
}) => {
  return (
    <div className={`relative my-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm ${className}`}>
      {label && (
        <div className="mb-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
          {label}
        </div>
      )}
      <MathView math={math} block={true} />
    </div>
  );
};

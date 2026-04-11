import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ code }) {
  if (!code) return null;

  return (
    <div dir="ltr" className="rounded-xl overflow-hidden text-sm my-3">
      <SyntaxHighlighter
        language="java"
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: '0.75rem', fontSize: '0.875rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

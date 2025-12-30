import { useState } from 'react';
import { MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from '@fast/shared';

interface TextInputProps {
  onSubmit: (text: string, title?: string) => void;
  isLoading: boolean;
}

export function TextInput({ onSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isValidLength = charCount >= MIN_TEXT_LENGTH && charCount <= MAX_TEXT_LENGTH;
  const canSubmit = isValidLength && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(text, title || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-xs font-medium text-foreground">
          Title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Will be inferred from text if not provided"
          className="flex h-8 w-full px-2 py-1.5 text-sm bg-background text-foreground border border-input placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          maxLength={200}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="text" className="text-xs font-medium text-foreground">
          Text to evaluate
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your conceptual writing here..."
          className="w-full h-64 px-2 py-1.5 text-sm bg-background text-foreground border border-input placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {wordCount.toLocaleString()} words
          </span>
          <span className={charCount < MIN_TEXT_LENGTH ? 'text-amber-600' : charCount > MAX_TEXT_LENGTH ? 'text-destructive' : 'text-muted-foreground'}>
            {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
            {charCount < MIN_TEXT_LENGTH && ` (min ${MIN_TEXT_LENGTH})`}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-1 px-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Evaluating...' : 'Evaluate Writing'}
      </button>
    </form>
  );
}

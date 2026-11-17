import React, { useState } from 'react';
import { apiClient } from '@shared/api-client/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bot, Send, Sparkles, Copy, Check } from 'lucide-react';

export function AiAssistant() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Hackathon AI Assistant. Ask me to generate API models, analyze requirements, or synthesize domain entities.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt;
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await apiClient('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: userText }),
      });

      const reply = res.data?.response || 'Synthesis complete.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `[Error: ${err.message || 'AI request failed'}]` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const suggestions = [
    'Design an e-commerce data model for hackathon',
    'Generate RFC 7807 error handling specifications',
    'Recommend top performance optimizations for React',
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 pb-6 mb-8 border-b border-line">
        <Bot className="w-8 h-8 text-fg" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">AI Studio & Assistant</span>
          </h1>
          <p className="text-sm text-gradient">
            Offline fallback ready. Streaming inferences conforming to Bell MT typography.
          </p>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-line-strong transition-colors cursor-pointer"
          >
            <span className="text-gradient">💡 {s}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <Card className="min-h-[420px] max-h-[550px] overflow-y-auto flex flex-col gap-4 mb-6 p-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-lg border text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-inverse-bg text-inverse-fg border-line-strong'
                  : 'bg-surface-2 border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1 text-xs font-bold opacity-75">
                <span>{m.role === 'user' ? 'You' : 'Arsenal AI'}</span>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(m.content, idx)}
                    className="hover:opacity-100"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className={m.role === 'user' ? 'text-gradient-inverse' : 'text-gradient'}>
                {m.content}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs font-bold text-gradient animate-pulse py-2">
            Synthesizing response with Mock Engine...
          </div>
        )}
      </Card>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="flex gap-3">
        <Input
          placeholder="Ask a question or enter a prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="primary" loading={loading} className="px-6">
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </form>
    </div>
  );
}


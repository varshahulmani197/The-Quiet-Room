import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, Copy, Check, Sparkles, Printer } from 'lucide-react';
import { Moment } from '../types';
import { exportMomentAsFile } from '../utils/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  moment: Moment | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  moment,
}) => {
  const [copied, setCopied] = useState(false);

  if (!moment) return null;

  const handleCopy = () => {
    const text = `${moment.title || 'Untitled Moment'}\n\n${moment.content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintMemoryCard = () => {
    // Generate an elegant, beautifully styled HTML card for download/viewing
    // without opening blocked popups in sandboxed iframes
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${moment.title || 'Untitled Moment'} — The Quiet Room</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Lora:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
    <style>
      @media print {
        @page { margin: 2.5cm; }
        body { background: #fff !important; }
      }
      body {
        font-family: 'Cormorant Garamond', Georgia, serif;
        color: #1a1a1a;
        background-color: #faf8f5;
        max-width: 680px;
        margin: 40px auto;
        padding: 40px;
        line-height: 1.8;
      }
      .header {
        border-bottom: 1px solid #e0dad1;
        padding-bottom: 24px;
        margin-bottom: 32px;
      }
      .title {
        font-size: 32px;
        font-weight: 400;
        margin: 0 0 8px 0;
        color: #111;
      }
      .meta {
        font-size: 13px;
        color: #777;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .body {
        font-size: 18px;
        white-space: pre-wrap;
        color: #222;
        line-height: 1.9;
      }
      .footer {
        margin-top: 60px;
        padding-top: 20px;
        border-top: 1px solid #e0dad1;
        font-size: 12px;
        color: #999;
        display: flex;
        justify-content: space-between;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1 class="title">${moment.title || 'Untitled Moment'}</h1>
      <div class="meta">
        ${new Date(moment.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        · Mood: ${moment.dominantMood}${moment.weatherType ? ` · Weather: ${moment.weatherType}` : ''}${moment.emotionalTags && moment.emotionalTags.length ? ` · Tags: #${moment.emotionalTags.join(' #')}` : ''}
        · Words: ${moment.wordCount}
      </div>
    </div>
    <div class="body">${moment.content}</div>
    <div class="footer">
      <span>Preserved in The Quiet Room</span>
      <span>A writing space that feels what you write</span>
    </div>
  </body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(moment.title || 'Moment').replace(/[^a-z0-9_-]/gi, '_')}_memory_card.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#11141c]/95 border border-white/10 rounded-2xl p-6 shadow-2xl text-stone-200 backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif-cormorant text-xl text-stone-100 font-normal">
                  Preserve & Export
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400 my-4 leading-relaxed font-light">
              Your words belong to you. Export your writing at any time into standard, open formats.
            </p>

            {/* Quick Actions */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => exportMomentAsFile(moment, 'txt')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-stone-400" />
                  <div>
                    <div className="text-sm text-stone-200 font-medium">Plain Text (.txt)</div>
                    <div className="text-[11px] text-stone-400">Universal and clean</div>
                  </div>
                </div>
                <span className="text-xs text-stone-400 font-mono">TXT</span>
              </button>

              <button
                onClick={() => exportMomentAsFile(moment, 'md')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-stone-400" />
                  <div>
                    <div className="text-sm text-stone-200 font-medium">Markdown (.md)</div>
                    <div className="text-[11px] text-stone-400">Preserves headers and emphasis</div>
                  </div>
                </div>
                <span className="text-xs text-stone-400 font-mono">MD</span>
              </button>

              <button
                onClick={handlePrintMemoryCard}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Printer className="w-4 h-4 text-amber-300" />
                  <div>
                    <div className="text-sm text-amber-100 font-medium flex items-center gap-1.5">
                      <span>Export as Memory Card / PDF</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-[11px] text-amber-200/70">
                      Printable literary typography with mood insignia
                    </div>
                  </div>
                </div>
                <span className="text-xs text-amber-300 font-mono">PDF</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Words'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

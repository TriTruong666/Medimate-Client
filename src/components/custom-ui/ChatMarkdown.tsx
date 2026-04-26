/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatResponseMarkdownProps = {
  content: string;
};

export default function ChatResponseMarkdown({
  content,
}: ChatResponseMarkdownProps) {
  return (
    <div className="prose dark:prose-invert max-w-none text-sm leading-loose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // paragraph
          p: ({ ...props }) => (
            <p className="text-gray-900 dark:text-white/90" {...props} />
          ),

          // heading
          h1: ({ ...props }) => (
            <h1
              className="mb-3 text-lg font-bold text-gray-900 dark:text-white"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="mb-3 text-base font-bold text-gray-900 dark:text-white"
              {...props}
            />
          ),

          // list
          ul: ({ ...props }) => (
            <ul
              className="mb-4 list-disc pl-5 text-gray-800 dark:text-white/85"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="mb-4 list-decimal pl-5 text-gray-800 dark:text-white/85"
              {...props}
            />
          ),

          // inline and block code
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-xl border border-gray-400 bg-gray-50 p-4 text-xs text-gray-900 dark:border-white/5 dark:bg-black/40 dark:text-white">
              {children}
            </pre>
          ),
          code: ({ className, children }) => {
            const isInline = !className;

            if (isInline) {
              return (
                <code className="text-primary dark:text-primary-light rounded-md bg-gray-100 px-1.5 py-0.5 text-[12px] font-bold dark:bg-white/10">
                  {children}
                </code>
              );
            }

            return (
              <code className="text-gray-900 dark:text-white/90">
                {children}
              </code>
            );
          },

          // blockquote
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="mb-4 border-l-4 border-gray-300 pl-4 font-medium text-gray-600 italic dark:border-white/20 dark:text-white/70"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

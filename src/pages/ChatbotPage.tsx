import { IoArrowUp } from "react-icons/io5";
import SplitText from "../components/SplitText";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import GlassSelect from "../components/Select";
import { useEffect, useState } from "react";
import { useAutoResizeTextarea } from "../hooks/useResize";
import ChatResponseMarkdown from "../components/ChatMarkdown";

export default function ChatbotPage() {
  const [phase, setPhase] = useState<"welcome" | "main">("welcome");

  return (
    <div className="page-layout flex min-h-[calc(100vh-64px)] flex-col">
      {phase === "welcome" && (
        <div className="flex flex-1 items-center justify-center">
          <WelcomeChatbot onClick={() => setPhase("main")} />
        </div>
      )}

      {phase === "main" && (
        <div className="flex flex-1">
          <MainChat />
        </div>
      )}
    </div>
  );
}

type Suggestion = {
  title: string;
  description: string;
};

const suggestions: Suggestion[] = [
  {
    title: "Tóm tắt tài liệu",
    description: "Giải thích nội dung chính của collection",
  },
  {
    title: "Tìm thông tin",
    description: "Trả lời câu hỏi dựa trên dữ liệu đã index",
  },
  {
    title: "So sánh nội dung",
    description: "So sánh nhiều tài liệu với nhau",
  },
  {
    title: "Sinh câu hỏi",
    description: "Tạo bộ câu hỏi từ tài liệu",
  },
];

function WelcomeChatbot({ onClick }: { onClick?(): void }) {
  const [type, setType] = useState("local");

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-3 select-none">
        <SplitText
          text="Xin chào Tri Truong"
          className="font-sans text-[32px]"
          delay={50}
          duration={1.25}
          ease="power3.out"
          splitType="words, chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          textAlign="center"
        />
        <span className="truncate text-center text-[14px] text-white/40">
          Đây chỉ là phiên bản nhằm mục đích debug, test và cấu hình cho bản
          trên diện thoại{" "}
        </span>
      </div>
      <div className="w-full lg:w-150 xl:w-220">
        <div className="relative h-40 max-h-40 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition duration-300 focus-within:border-white/20 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-white/10 focus-within:outline-none">
          <textarea
            name=""
            id=""
            placeholder="Hỏi gì đó cho Medimate..."
            className="w-full resize-none pr-4 text-sm outline-none placeholder:text-gray-400"
          ></textarea>
          <div className="absolute right-16 bottom-2.5">
            <GlassSelect
              value={type}
              onChange={setType}
              placeholder="Chọn Model AI"
              options={[
                { label: "Qwen 2.5 - 1.5B", value: "local" },
                { label: "Gemini 2.5 Fast", value: "api" },
              ]}
            />
          </div>
          <button
            onClick={onClick}
            className="absolute right-3.5 bottom-2.5 z-2 flex h-10.5 w-10.5 cursor-pointer items-center justify-center rounded-full bg-white/10"
          >
            <IoArrowUp className="text-[16px]" />
          </button>
        </div>
      </div>
      {/* Suggestions */}
      <div className="w-full lg:w-150 xl:w-220">
        <p className="mb-4 text-xs font-medium tracking-wide text-white/40 uppercase">
          Gợi ý
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((item) => (
            <button
              key={item.title}
              className="group cursor-pointer rounded-xl border border-white/10 px-4 py-3 text-left transition hover:border-white/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.title}</span>
                <HiOutlineArrowUpRight className="text-sm opacity-0 transition group-hover:opacity-100" />
              </div>

              <p className="mt-1 text-xs text-white/50">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full text-center">
        <span className="truncate text-xs text-white/40">
          Medimate có thể mắc sai sót và không thể thay thế chuyên gia trong
          lĩnh vực y tế
        </span>
      </div>
    </div>
  );
}

function MainChat() {
  const [value, setValue] = useState("");
  const textareaRef = useAutoResizeTextarea(value, 160);
  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 pt-5">
        <ChatMessages />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-10 rounded-xl bg-linear-to-t from-black/60 to-transparent pt-4">
        <div className="relative mx-auto w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl transition focus-within:border-white/20 focus-within:bg-white/10">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Hỏi gì đó cho Medimate..."
            rows={2}
            className="max-h-40 w-full resize-none bg-transparent pr-12 text-sm text-white outline-none placeholder:text-white/40"
          />

          <button className="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95">
            <IoArrowUp className="text-[16px]" />
          </button>
        </div>
      </div>

      <span className="mt-2 truncate text-center text-xs text-white/40">
        Medimate có thể mắc sai sót và không thể thay thế chuyên gia trong lĩnh
        vực y tế
      </span>
    </div>
  );
}

function ChatMessages() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [demoStep, setDemoStep] = useState(0);

  // Các user + bot response demo
  const demoMessages: ChatMessageProps[] = [
    { role: "user", content: "Hello" },
    {
      role: "assistant",
      content: `Xin chào! Tôi là Medimate, chatbot hỗ trợ phân tích và tóm tắt tài liệu.
Tôi có thể giúp bạn:
- Tóm tắt tài liệu
- So sánh nhiều tài liệu
- Sinh câu hỏi từ dữ liệu
- Giải thích thuật ngữ chuyên ngành

Welcome from Medimate Team <3
`,
    },
    { role: "user", content: "Tóm tắt tài liệu này cho tôi." },
    {
      role: "assistant",
      content: `Dưới đây là tóm tắt tài liệu:
1. Chuẩn hoá dữ liệu
2. Tạo embedding
3. Lưu vector vào database

RAG giúp mô hình trả lời chính xác hơn dựa trên dữ liệu riêng.`,
    },
    { role: "user", content: "So sánh 2 tài liệu này với nhau." },
    {
      role: "assistant",
      content: `So sánh 2 tài liệu:
- Tài liệu 1 tập trung vào cơ chế RAG.
- Tài liệu 2 tập trung vào ứng dụng RAG cho chatbot.
Kết luận: Tài liệu 1 nền tảng, tài liệu 2 ứng dụng thực tiễn.`,
    },
    { role: "user", content: "So sánh 2 tài liệu này với nhau." },
    {
      role: "assistant",
      content: `
## Tóm tắt tài liệu

Tài liệu mô tả **kiến trúc RAG** gồm các bước:

1. Chuẩn hoá dữ liệu
2. Tạo embedding
3. Lưu vector vào database

### Ví dụ code

\`\`\`python
index = VectorStoreIndex.from_documents(docs)
query_engine = index.as_query_engine()
response = query_engine.query("RAG là gì?")
\`\`\`

> RAG giúp mô hình trả lời chính xác hơn dựa trên dữ liệu riêng.
`,
    },
  ];

  useEffect(() => {
    if (demoStep >= demoMessages.length) return;

    const current = demoMessages[demoStep];

    if (current.role === "user") {
      setMessages((prev) => [...prev, current]);
      setDemoStep((prev) => prev + 1);
    } else {
      // Streaming bot
      let i = 0;
      setStreamingText("");
      const interval = setInterval(() => {
        setStreamingText((prev) => prev + current.content[i]);
        i++;
        if (i >= current.content.length) {
          clearInterval(interval);

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: current.content },
          ]);
          setStreamingText("");
          setDemoStep((prev) => prev + 1);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [demoStep]);
  return (
    <div className="flex-1 overflow-y-auto px-2 pt-5">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} role={msg.role} content={msg.content} />
      ))}

      {/* Streaming bot */}
      {streamingText && (
        <ChatMessage role="assistant" content={streamingText} />
      )}
    </div>
  );
}

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};
function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-white/10 text-white" : "bg-white/5 text-white/90"
        } `}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{content}</p>
        ) : (
          <ChatResponseMarkdown content={content} />
        )}
      </div>
    </div>
  );
}

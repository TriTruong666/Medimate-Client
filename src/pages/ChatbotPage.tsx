import { IoArrowUp } from "react-icons/io5";
import SplitText from "../components/SplitText";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import GlassSelect from "../components/Select";
import { useState } from "react";
import { useAutoResizeTextarea } from "../hooks/useResize";
import ChatResponseMarkdown from "../components/ChatMarkdown";

export default function ChatbotPage() {
  return (
    <div className="page-layout">
      <div className="flex min-h-[80vh] max-w-384 items-center justify-center">
        <WelcomeChatbot />
      </div>
      {/* <div className="flex h-[80vh] max-w-384 items-center justify-center">
        <MainChat />
      </div> */}
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

function WelcomeChatbot() {
  const [type, setType] = useState("local");

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-3">
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
            className="w-full resize-none pr-4 text-sm outline-none"
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
          <button className="absolute right-3.5 bottom-2.5 z-2 flex h-10.5 w-10.5 cursor-pointer items-center justify-center rounded-full bg-white/10">
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
    <div className="relative mt-10 flex h-full w-full flex-col">
      {/* Messages */}
      <div className="mb-5 flex-1 overflow-y-auto px-2 pt-5">
        <ChatMessages />
      </div>

      {/* Input */}
      <div className="flex flex-col space-y-4">
        <div className="sticky bottom-0 z-10 bg-linear-to-t from-black/60 to-transparent pt-4">
          <div className="relative mx-auto w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition focus-within:border-white/20 focus-within:bg-white/10">
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
        <span className="truncate text-center text-xs text-white/40">
          Medimate có thể mắc sai sót và không thể thay thế chuyên gia trong
          lĩnh vực y tế
        </span>
      </div>
    </div>
  );
}

function ChatMessages() {
  const responseFromApi = `
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
`;
  return (
    <div className="space-y-4">
      <ChatMessage
        role="assistant"
        content="Xin chào! Tôi có thể giúp gì cho bạn?"
      />
      <ChatMessage role="user" content="Tóm tắt tài liệu này cho tôi." />
      <ChatMessage role="assistant" content={responseFromApi} />
      <ChatMessage role="user" content="Tóm tắt tài liệu này cho tôi." />
      <ChatMessage role="assistant" content={responseFromApi} />
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

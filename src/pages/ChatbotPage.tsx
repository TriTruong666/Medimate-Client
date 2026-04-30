import { IoArrowUp } from "react-icons/io5";
import SplitText from "../components/animations-ui/SplitText";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { useEffect, useState, useRef } from "react";
import { useAutoResizeTextarea } from "../hooks/useResize";
import { useAllAIModels } from "../hooks/data/useRAGAIModelHooks";
import { useRAGChat } from "../hooks/data/useRAGChatHooks";
import { HiChevronDown, HiOutlineTemplate } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import ChatResponseMarkdown from "../components/custom-ui/ChatMarkdown";
import { useAuth } from "@/hooks/useAuth";
import { useStopRAGChat } from "../hooks/data/useRAGChatHooks";
import { HiStop } from "react-icons/hi2";

export default function ChatbotPage() {
  const [phase, setPhase] = useState<"welcome" | "main">("welcome");
  const [initialValue, setInitialValue] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");

  const handleStartChat = (val: string) => {
    if (!val.trim()) return;
    setInitialValue(val);
    setPhase("main");
  };

  return (
    <div className="page-layout relative flex min-h-[calc(100vh-64px)] flex-col">
      {phase === "welcome" && (
        <div className="flex flex-1 items-center justify-center px-4">
          <WelcomeChatbot
            onStart={handleStartChat}
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
          />
        </div>
      )}

      {phase === "main" && (
        <div className="flex flex-1 flex-col">
          <MainChat
            initialValue={initialValue}
            selectedModelId={selectedModelId}
          />
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
    title: "Chế độ ăn cho người tiểu đường",
    description:
      "Gợi ý thực phẩm nên và không nên ăn để kiểm soát đường huyết.",
  },
  {
    title: "Cách giảm căng thẳng hiệu quả",
    description: "Cung cấp các bài tập và thói quen giúp cải thiện tinh thần.",
  },
  {
    title: "Triệu chứng cúm mùa là gì?",
    description: "Phân biệt cúm mùa với cảm lạnh và cách phòng ngừa cơ bản.",
  },
  {
    title: "Tư vấn sức khỏe tim mạch",
    description: "Lời khuyên về lối sống và dinh dưỡng để bảo vệ trái tim.",
  },
];

function ModelSelector({
  value,
  onModelChange,
}: {
  value: string;
  onModelChange(id: string): void;
}) {
  const { data: models } = useAllAIModels();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = models?.find((m) => m.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hover:border-primary/40 flex h-9 items-center gap-2 rounded-lg border border-gray-400 bg-white py-1.5 pr-2 pl-2.5 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      >
        <HiOutlineTemplate className="text-primary text-sm" />
        <span className="max-w-[120px] truncate text-[11px] font-medium text-gray-700 dark:text-white/90">
          {selected?.name || "Chọn AI Model"}
        </span>
        <HiChevronDown
          className={`text-xs text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 bottom-full z-50 mb-2 w-56 overflow-hidden rounded-xl border border-gray-400 bg-white p-1 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#121212]/95"
          >
            <div className="max-h-60 overflow-y-auto overscroll-contain px-1 py-1">
              {models?.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setOpen(false);
                  }}
                  className={`group flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-all ${
                    model.id === value
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate text-[13px] font-medium">
                      {model.name}
                    </span>
                  </div>
                  <span className="text-[11px] dark:opacity-40">
                    Max tokens: {model.max_output_tokens}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WelcomeChatbot({
  onStart,
  selectedModelId,
  onModelChange,
}: {
  onStart?(val: string): void;
  selectedModelId: string;
  onModelChange(id: string): void;
}) {
  const { data: models } = useAllAIModels();
  const [text, setText] = useState("");
  const { user } = useAuth();

  // Tự động chọn model đầu tiên nếu chưa có
  useEffect(() => {
    if (models && models.length > 0 && !selectedModelId) {
      onModelChange(models[0].id);
    }
  }, [models, selectedModelId, onModelChange]);

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-3 select-none">
        <SplitText
          text={`Xin chào ${user?.fullName}`}
          className="font-sans text-[32px] text-gray-900 dark:text-white"
          delay={50}
          duration={1.25}
          ease="power3.out"
          splitType="words, chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          textAlign="center"
        />
        <span className="truncate text-center text-[14px] font-medium text-gray-500 dark:text-white/40">
          Đây chỉ là phiên bản nhằm mục đích debug, test và cấu hình cho bản
          trên điện thoại
        </span>
      </div>
      <div className="w-full lg:w-150 xl:w-220">
        <div className="focus-within:border-primary/40 focus-within:ring-primary/5 relative h-40 max-h-40 w-full rounded-2xl border border-gray-400 bg-white px-4 py-4 shadow-sm transition duration-300 focus-within:bg-white focus-within:ring-4 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white/20 dark:focus-within:bg-white/10">
          <textarea
            value={text}
            rows={4}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onStart?.(text);
              }
            }}
            placeholder="Hỏi gì đó cho Medimate..."
            className="w-full resize-none pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          ></textarea>
          <div className="absolute right-16 bottom-2.5">
            <ModelSelector
              value={selectedModelId}
              onModelChange={onModelChange}
            />
          </div>
          <button
            onClick={() => onStart?.(text)}
            className="bg-primary absolute right-3.5 bottom-2.5 z-2 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
          >
            <IoArrowUp className="text-[18px]" />
          </button>
        </div>
      </div>
      {/* Suggestions */}
      <div className="w-full lg:w-150 xl:w-220">
        <p className="mb-4 text-[11px] font-medium tracking-widest text-gray-400 uppercase dark:text-white/40">
          Gợi ý
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((item) => (
            <button
              key={item.title}
              onClick={() => onStart?.(item.title)}
              className="group hover:border-primary/50 cursor-pointer rounded-2xl border border-gray-400 bg-white px-4 py-4 text-left transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30"
            >
              <div className="flex items-center justify-between">
                <span className="group-hover:text-primary dark:group-hover:text-primary text-[13px] font-medium text-gray-900 transition-colors dark:text-white">
                  {item.title}
                </span>
                <HiOutlineArrowUpRight className="text-primary text-sm opacity-0 transition group-hover:opacity-100" />
              </div>

              <p className="mt-2 text-[11px] leading-relaxed font-medium text-gray-500 dark:text-white/50">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full text-center">
        <span className="truncate text-xs font-medium text-gray-400 dark:text-white/40">
          Medimate có thể mắc sai sót và không thể thay thế chuyên gia trong
          lĩnh vực y tế
        </span>
      </div>
    </div>
  );
}

function MainChat({
  initialValue,
  selectedModelId,
}: {
  initialValue: string;
  selectedModelId: string;
}) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const textareaRef = useAutoResizeTextarea(value, 160);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<any>(null);
  const { user } = useAuth();
  const chatbotMutation = useRAGChat();
  const stopMutation = useStopRAGChat();

  const clientId = user?.userId || "guest_session";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Handle initial message
  useEffect(() => {
    if (initialValue) {
      handleChat(initialValue);
    }
  }, []);

  const simulateStreaming = (text: string) => {
    let i = 0;
    setStreamingText("");
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    streamIntervalRef.current = setInterval(() => {
      // Tốc độ và chunk size nhỏ hơn để tạo cảm giác tự nhiên và dễ đọc hơn
      const chunkSize = Math.floor(Math.random() * 3) + 1;
      if (i < text.length) {
        setStreamingText(text.slice(0, i + chunkSize));
        i += chunkSize;
      } else {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
        setStreamingText("");
      }
    }, 20);
  };

  const handleChat = (content: string) => {
    if (!content.trim() || chatbotMutation.isPending) return;

    // Thêm tin nhắn user vào UI
    const userMsg: ChatMessageProps = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setValue("");

    // Gọi API
    chatbotMutation.mutate(
      {
        question: content,
        ai_model_id: selectedModelId,
        client_id: clientId,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            simulateStreaming(res.data.answer);
          }
        },
      },
    );
  };

  const handleStop = () => {
    if (chatbotMutation.isPending) {
      stopMutation.mutate(clientId);
    }
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setStreamingText("");
  };

  return (
    <>
      <div className="flex-1 pb-52 md:pb-60">
        <div className="flex flex-col space-y-6 px-4 pt-10 pb-10">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))}

          {/* Hiệu ứng loading khi chờ response */}
          {chatbotMutation.isPending && !streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl bg-white/5 px-4 py-3">
                <div className="flex gap-1.5 py-1">
                  <div className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
                  <div className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
                  <div className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Streaming result */}
          {streamingText && (
            <ChatMessage role="assistant" content={streamingText} />
          )}

          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 md:left-64">
        <div className="relative mx-auto max-w-5xl px-4 pb-6 md:pb-8">
          <div className="focus-within:border-primary/50 focus-within:ring-primary/5 relative w-full rounded-2xl border border-gray-400 bg-white/80 p-4 shadow-xl backdrop-blur-xl transition focus-within:ring-4 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white/20 dark:focus-within:bg-white/10">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChat(value);
                }
              }}
              placeholder="Hỏi gì đó cho Medimate..."
              rows={2}
              className="max-h-40 w-full resize-none bg-transparent pr-12 text-[14px] font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/40"
            />

            {chatbotMutation.isPending || streamingText ? (
              <button
                onClick={handleStop}
                disabled={stopMutation.isPending}
                className="absolute right-3.5 bottom-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-40"
              >
                {stopMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                ) : (
                  <HiStop className="text-[20px]" />
                )}
              </button>
            ) : (
              <button
                onClick={() => handleChat(value)}
                disabled={!value.trim()}
                className="bg-primary absolute right-3.5 bottom-3.5 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-40 dark:bg-white dark:text-black"
              >
                <IoArrowUp className="text-[18px]" />
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-[10px] font-medium tracking-tight text-gray-400 dark:text-white/30">
            Medimate có thể mắc sai sót và không thể thay thế chuyên gia trong
            lĩnh vực y tế
          </p>
        </div>
      </div>
    </>
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
        className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm md:max-w-[75%] ${
          isUser
            ? "bg-primary shadow-primary/20 font-medium text-white"
            : "border border-gray-400 bg-white text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white/90"
        } `}
      >
        {isUser ? (
          <p className="text-[14px] leading-relaxed">{content}</p>
        ) : (
          <div className="text-[14px] leading-relaxed">
            <ChatResponseMarkdown content={content} />
          </div>
        )}
      </div>
    </div>
  );
}

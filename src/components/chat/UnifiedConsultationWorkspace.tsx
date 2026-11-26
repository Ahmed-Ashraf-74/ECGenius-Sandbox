import { useState, useEffect, useRef, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Lock,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  Image as ImageIcon,
  MessageSquare,
  X,
  Sparkles,
  UserCheck,
  Star,
  Phone,
  Video,
  FileHeart,
} from "lucide-react";
import Button from "../../components/common/Button";
import PatientAvatar from "../../components/common/PatientAvatar";
import {
  clinicalService,
  AVAILABLE_DOCTORS,
} from "../../services/clinicalMockService";
import type {
  ConsultationThreadDto,
  ChatAttachmentDto,
} from "../../types/ecg.types";

const MEDICAL_EMOJIS = [
  "•",
  "ðŸ©º",
  "ðŸ’Š",
  "ðŸ“‹",
  "ðŸ“ˆ",
  "•",
  "•",
  "ðŸ™",
  "ðŸ‘",
  "ðŸ˜Š",
  "ðŸ‘‹",
  "ðŸ¥",
];

function classifyFile(file: File): ChatAttachmentDto["fileCategory"] {
  const name = file.name.toLowerCase();
  if (file.type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/.test(name)) {
    return "image";
  }
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }
  if (/\.(dat|hea|csv|wfdb|json)$/.test(name)) {
    return "wfdb";
  }
  return "other";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UnifiedConsultationWorkspaceProps {
  role: "doctor" | "patient";
  currentPatientId?: string | null;
  currentPatientName?: string;
  currentPatientAge?: number;
  isGuestUser?: boolean;
}

export default function UnifiedConsultationWorkspace({
  role,
  currentPatientId = "pat-1001",
  currentPatientName = "Mahmoud Abdel-Rahman",
  currentPatientAge = 58,
  isGuestUser = false,
}: UnifiedConsultationWorkspaceProps) {
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatQuery, setInChatQuery] = useState("");
  const [filterTab, setFilterTab] = useState<
    "all" | "unread" | "starred" | "paid"
  >("all");
  const [starredIds, setStarredIds] = useState<string[]>(["thr-301"]);

  const [messageText, setMessageText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] =
    useState<ChatAttachmentDto | null>(null);
  const [attachedExamId, setAttachedExamId] = useState<string>("");

  const [guestSimulation, setGuestSimulation] = useState(isGuestUser);
  const [newConsultOpen, setNewConsultOpen] = useState(false);
  const [doctorSortBy, setDoctorSortBy] = useState<"rating" | "price">(
    "rating",
  );

  const [paymentModalThread, setPaymentModalThread] =
    useState<ConsultationThreadDto | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [cardNumber, setCardNumber] = useState("4532 • • 8841");
  const [cardExpiry, setCardExpiry] = useState("09/29");
  const [cardCvv, setCardCvv] = useState("842");
  const [walletPhone, setWalletPhone] = useState("0100 412 8890");
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["consultation-threads"],
    queryFn: () => clinicalService.getConsultationThreads(),
    refetchInterval: 2000,
  });

  const { data: examinations = [] } = useQuery({
    queryKey: ["examinations"],
    queryFn: () => clinicalService.getExaminations(),
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecgenius_clinical_store_v4") {
        queryClient.invalidateQueries({ queryKey: ["consultation-threads"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [queryClient]);

  const activeThread =
    threads.find((t) => t.threadId === selectedThreadId) || null;

  // ØªØµÙÙŠØ± Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ ØºÙŠØ± Ø§Ù„Ù…Ù‚Ø±ÙˆØ¡Ø© Ù„Ù„Ø·Ø±Ù Ø§Ù„Ù„ÙŠ ÙØªØ­ Ø§Ù„Ø´Ø§Øª
  useEffect(() => {
    if (!selectedThreadId || !activeThread) return;
    const myUnread =
      role === "doctor"
        ? (activeThread.doctorUnreadCount ?? activeThread.unreadCount ?? 0)
        : (activeThread.patientUnreadCount ?? 0);

    if (myUnread > 0) {
      clinicalService
        .markConsultationThreadRead(selectedThreadId, role)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["consultation-threads"] });
        });
    }
  }, [selectedThreadId, role, activeThread, queryClient]);

  const sendMutation = useMutation({
    mutationFn: () => {
      if (!activeThread) throw new Error("No conversation selected");
      return clinicalService.sendConsultationMessage({
        threadId: activeThread.threadId,
        senderRole: role,
        senderName:
          role === "doctor"
            ? activeThread.doctorName || "Dr. Ahmed Ashraf"
            : activeThread.patientName,
        text: messageText.trim(),
        attachedExamId: attachedExamId || undefined,
        attachment: pendingAttachment || undefined,
      });
    },
    onSuccess: () => {
      setMessageText("");
      setPendingAttachment(null);
      setAttachedExamId("");
      setEmojiOpen(false);
      queryClient.invalidateQueries({ queryKey: ["consultation-threads"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const payMutation = useMutation({
    mutationFn: (thread: ConsultationThreadDto) =>
      clinicalService.unlockConsultationPayment({
        threadId: thread.threadId,
        paymentMethod,
        referenceLast4:
          paymentMethod === "card"
            ? cardNumber.replace(/\D/g, "").slice(-4) || "8841"
            : walletPhone.replace(/\D/g, "").slice(-4) || "8890",
      }),
    onSuccess: (unlocked) => {
      setPaymentModalThread(null);
      setSelectedThreadId(unlocked.threadId);
      setBannerMsg(
        `Payment confirmed (${unlocked.feeEgp} EGP). Consultation session is now unlocked!`,
      );
      setTimeout(() => setBannerMsg(null), 4500);
      queryClient.invalidateQueries({ queryKey: ["consultation-threads"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const startNewThreadMutation = useMutation({
    mutationFn: (doctorId: string) =>
      clinicalService.startOrGetConsultationThread({
        patientId: guestSimulation ? null : currentPatientId,
        patientName: guestSimulation
          ? "Guest Visitor (No Primary Doctor)"
          : currentPatientName,
        patientAge: guestSimulation ? 39 : currentPatientAge,
        doctorId,
        isGuestUser: guestSimulation,
      }),
    onSuccess: (thread) => {
      setNewConsultOpen(false);
      setSelectedThreadId(thread.threadId);
      queryClient.invalidateQueries({ queryKey: ["consultation-threads"] });
      if (!thread.isPaid && thread.feeEgp > 0) {
        setPaymentModalThread(thread);
      }
    },
  });

  const toggleStar = (threadId: string) => {
    setStarredIds((prev) =>
      prev.includes(threadId)
        ? prev.filter((id) => id !== threadId)
        : [...prev, threadId],
    );
  };

  const filteredThreads = threads.filter((t) => {
    const q = search.trim().toLowerCase();
    const targetName =
      role === "doctor" ? t.patientName : t.doctorName || "Cardiologist";
    const myUnread =
      role === "doctor"
        ? (t.doctorUnreadCount ?? t.unreadCount ?? 0)
        : (t.patientUnreadCount ?? 0);

    const matchSearch =
      !q ||
      targetName.toLowerCase().includes(q) ||
      t.messages.some((m) => m.text.toLowerCase().includes(q));
    const matchTab =
      filterTab === "all"
        ? true
        : filterTab === "unread"
          ? myUnread > 0
          : filterTab === "starred"
            ? starredIds.includes(t.threadId)
            : t.tier !== "PrimaryFree";
    return matchSearch && matchTab;
  });

  const visibleMessages = activeThread
    ? inChatQuery.trim()
      ? activeThread.messages.filter((m) =>
          m.text.toLowerCase().includes(inChatQuery.trim().toLowerCase()),
        )
      : activeThread.messages
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  const handleFilePicked = (file?: File) => {
    if (!file) return;
    const category = classifyFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        fileName: file.name,
        fileSizeLabel: formatFileSize(file.size),
        fileCategory: category,
        previewUrl:
          category === "image" && typeof reader.result === "string"
            ? reader.result
            : undefined,
      });
    };
    if (category === "image") {
      reader.readAsDataURL(file);
    } else {
      setPendingAttachment({
        fileName: file.name,
        fileSizeLabel: formatFileSize(file.size),
        fileCategory: category,
      });
    }
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;
    if (!messageText.trim() && !pendingAttachment && !attachedExamId) return;
    sendMutation.mutate();
  };

  const patientExams = activeThread?.patientId
    ? examinations.filter((e) => e.patientId === activeThread.patientId)
    : examinations.slice(0, 3);

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-dash-card">
      {bannerMsg && (
        <div className="rounded-2xl bg-emerald-600 text-white px-5 py-3 shadow-md flex items-center gap-2 text-xs sm:text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{bannerMsg}</span>
        </div>
      )}

      {role === "patient" && (
        <div className="rounded-3xl bg-white border border-slate-200/80 px-5 py-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                guestSimulation
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {guestSimulation
                ? "Guest Mode (No Primary Doctor • Paid Consultations)"
                : "Registered Patient • Primary Doctor Free"}
            </span>
            <button
              type="button"
              onClick={() => setGuestSimulation((g) => !g)}
              className="text-xs font-bold text-[#0284c7] hover:underline cursor-pointer"
            >
              Switch to {guestSimulation ? "Registered Patient" : "Guest User"}{" "}
              Mode
            </button>
          </div>

          <button
            type="button"
            onClick={() => setNewConsultOpen(true)}
            className="btn-landing-gradient px-4 py-2 rounded-full text-xs font-extrabold text-white inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-200" />
            Choose Cardiologist (Ratings & Fees)
          </button>
        </div>
      )}

      <div className="rounded-[2rem] bg-white border border-slate-200/80 shadow-xs overflow-hidden grid lg:grid-cols-12 min-h-[660px]">
        {/* Ø§Ù„Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø£ÙŠØ³Ø±: Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col bg-white">
          <div className="p-5 pb-3 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#052e6e] tracking-tight">
                Messages
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  if (searchOpen) setSearch("");
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                  searchOpen
                    ? "bg-[#eef4fb] text-[#0284c7]"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
                title="Search conversations"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {searchOpen && (
              <div className="relative animate-dash-card">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or message..."
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-slate-100/90 text-xs font-semibold text-[#052e6e] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 border-b border-slate-100 text-xs font-extrabold overflow-x-auto">
              {(
                [
                  { id: "all", label: "All messages" },
                  { id: "unread", label: "Unread" },
                  { id: "starred", label: "Starred" },
                  { id: "paid", label: "Paid Tier" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id)}
                  className={`pb-2.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                    filterTab === tab.id
                      ? "border-[#0284c7] text-[#0284c7]"
                      : "border-transparent text-slate-400 hover:text-[#052e6e]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {role === "patient" && (
              <button
                type="button"
                onClick={() => setNewConsultOpen(true)}
                className="btn-landing-gradient w-full py-2.5 px-4 rounded-2xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                Compare Doctors & Start Session
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            {isLoading ? (
              <div className="space-y-2 px-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                No conversations match this filter.
              </p>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.threadId === selectedThreadId;
                const isStarred = starredIds.includes(t.threadId);
                const myUnread =
                  role === "doctor"
                    ? (t.doctorUnreadCount ?? t.unreadCount ?? 0)
                    : (t.patientUnreadCount ?? 0);
                const displayName =
                  role === "doctor"
                    ? t.patientName
                    : t.doctorName || "Dr. Ahmed Ashraf";
                const lastMsg =
                  t.messages[t.messages.length - 1]?.text ||
                  (t.isPaid
                    ? "Session active • Tap to open chat"
                    : `Locked • ${t.feeEgp} EGP consultation fee`);

                return (
                  <div
                    key={t.threadId}
                    onClick={() => setSelectedThreadId(t.threadId)}
                    className={`p-3 rounded-2xl transition flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#f3f8fe] shadow-2xs ring-1 ring-sky-200/80"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <PatientAvatar
                          name={displayName}
                          gender="Male"
                          size="md"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            t.isPaid ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-xs truncate ${
                              myUnread > 0
                                ? "font-black text-[#052e6e]"
                                : "font-extrabold text-[#052e6e]"
                            }`}
                          >
                            {displayName}
                          </p>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold shrink-0 ${
                              t.tier === "PrimaryFree"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {t.tier === "PrimaryFree"
                              ? "FREE"
                              : `${t.feeEgp} EGP`}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            myUnread > 0
                              ? "font-bold text-[#052e6e]"
                              : "text-slate-500"
                          }`}
                        >
                          {lastMsg}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">
                          {new Date(t.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(t.threadId);
                          }}
                          className="text-slate-300 hover:text-amber-400 transition cursor-pointer"
                          title="Star conversation"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isStarred
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      </div>

                      {!t.isPaid ? (
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      ) : myUnread > 0 ? (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#e11d48] text-white text-[10px] font-extrabold flex items-center justify-center">
                          {myUnread}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ø§Ù„Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø£ÙŠÙ…Ù†: ØºØ±ÙØ© Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© */}
        <div className="lg:col-span-8 flex flex-col bg-[#fafcff]">
          {!activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-3 bg-white">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-100 to-[#eef4fb] text-[#0284c7] flex items-center justify-center shadow-2xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-[#052e6e]">
                No conversation selected
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                You can view your conversation in the side bar or start a new
                specialist consultation.
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <PatientAvatar
                      name={
                        role === "doctor"
                          ? activeThread.patientName
                          : activeThread.doctorName || "Dr. Ahmed Ashraf"
                      }
                      gender="Male"
                      size="md"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-[#052e6e]">
                        {role === "doctor"
                          ? activeThread.patientName
                          : activeThread.doctorName || "Dr. Ahmed Ashraf"}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          activeThread.tier === "PrimaryFree"
                            ? "bg-emerald-50 text-emerald-700"
                            : activeThread.isPaid
                              ? "bg-sky-50 text-[#0284c7]"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {activeThread.tier === "PrimaryFree"
                          ? "Primary Doctor • Free"
                          : activeThread.isPaid
                            ? `Unlocked (${activeThread.feeEgp} EGP)`
                            : `Fee Required (${activeThread.feeEgp} EGP)`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {role === "doctor"
                        ? `${activeThread.patientAge} yrs • ${
                            activeThread.patientId || "Guest Visitor"
                          }`
                        : activeThread.doctorSpecialty ||
                          "Consultant Cardiologist"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setBannerMsg(
                        "Tele-cardiology video room link ready inside chat.",
                      );
                      setTimeout(() => setBannerMsg(null), 3000);
                    }}
                    className="w-9 h-9 rounded-full hover:bg-slate-100 hover:text-[#0284c7] flex items-center justify-center transition cursor-pointer"
                    title="Video Consultation"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBannerMsg("Voice consultation line connected.");
                      setTimeout(() => setBannerMsg(null), 3000);
                    }}
                    className="w-9 h-9 rounded-full hover:bg-slate-100 hover:text-[#0284c7] flex items-center justify-center transition cursor-pointer"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInChatSearchOpen((v) => !v);
                      if (inChatSearchOpen) setInChatQuery("");
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                      inChatSearchOpen
                        ? "bg-[#eef4fb] text-[#0284c7]"
                        : "hover:bg-slate-100 hover:text-[#0284c7]"
                    }`}
                    title="Search inside messages"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {role === "doctor" && activeThread.patientId && (
                    <Link
                      to={`/doctor/patients/${activeThread.patientId}`}
                      className="ml-1 px-3 py-1.5 rounded-full bg-[#eef4fb] text-[#052e6e] hover:bg-sky-100 text-xs font-bold inline-flex items-center gap-1 transition"
                      title="Open Patient Medical Record"
                    >
                      <FileHeart className="w-3.5 h-3.5 text-[#0284c7]" />
                      Record
                    </Link>
                  )}
                </div>
              </div>

              {inChatSearchOpen && (
                <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={inChatQuery}
                    onChange={(e) => setInChatQuery(e.target.value)}
                    placeholder="Find text in this conversation..."
                    autoFocus
                    className="flex-1 text-xs text-[#052e6e] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setInChatSearchOpen(false);
                      setInChatQuery("");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}

              {!activeThread.isPaid && activeThread.feeEgp > 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="max-w-md rounded-3xl bg-white border border-sky-200 p-7 shadow-sm space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                      <Lock className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <span className="px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-extrabold">
                        {activeThread.tier === "OneTimeGuestPaid"
                          ? "Guest User • One-Time Consultation"
                          : "External Cardiologist Consultation"}
                      </span>
                      <h4 className="text-lg font-extrabold text-[#052e6e] pt-1">
                        Unlock Specialist Consultation
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {activeThread.tier === "OneTimeGuestPaid"
                          ? "You are consulting without an assigned primary doctor. Complete the consultation payment to unlock live chat and ECG file uploads."
                          : "This cardiologist is outside your primary care plan. Pay the consultation fee to unlock direct messaging and 12-lead ECG review."}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#eef4fb] p-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">
                        Session Fee
                      </span>
                      <span className="text-xl font-black text-[#052e6e]">
                        {activeThread.feeEgp} EGP
                      </span>
                    </div>

                    {role === "patient" ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={() => setPaymentModalThread(activeThread)}
                      >
                        <CreditCard className="w-4 h-4 text-sky-200" />
                        Pay {activeThread.feeEgp} EGP & Open Chat
                      </Button>
                    ) : (
                      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800">
                        Waiting for patient to complete the{" "}
                        {activeThread.feeEgp} EGP payment.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {visibleMessages.length === 0 ? (
                      <div className="text-center py-14 space-y-1">
                        <p className="text-xs font-extrabold text-[#052e6e]">
                          Consultation Channel Active
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Send a message, emoji, or upload Images, PDFs, or
                          WFDB/CSV ECG files below.
                        </p>
                      </div>
                    ) : (
                      visibleMessages.map((msg) => {
                        const isMine = msg.senderRole === role;
                        const timeLabel = new Date(
                          msg.sentAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={msg.messageId}
                            className={`flex items-end gap-2.5 ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isMine && (
                              <PatientAvatar
                                name={msg.senderName}
                                gender="Male"
                                size="sm"
                              />
                            )}

                            {isMine && (
                              <span className="text-[10px] text-slate-400 mb-1">
                                {timeLabel}
                              </span>
                            )}

                            <div
                              className={`max-w-[72%] rounded-2xl px-4 py-3 text-xs space-y-2 shadow-2xs ${
                                isMine
                                  ? "btn-landing-gradient text-white rounded-br-sm"
                                  : "bg-white border border-slate-200/70 text-slate-700 rounded-bl-sm"
                              }`}
                            >
                              {msg.text && (
                                <p className="leading-relaxed whitespace-pre-wrap">
                                  {msg.text}
                                </p>
                              )}

                              {msg.attachment && (
                                <div
                                  className={`rounded-xl p-2.5 border ${
                                    isMine
                                      ? "bg-white/15 border-white/25 text-white"
                                      : "bg-slate-50 border-slate-200 text-[#052e6e]"
                                  }`}
                                >
                                  {msg.attachment.previewUrl && (
                                    <img
                                      src={msg.attachment.previewUrl}
                                      alt={msg.attachment.fileName}
                                      className="max-h-44 rounded-lg mb-2 object-contain"
                                    />
                                  )}
                                  <div className="flex items-center gap-2">
                                    {msg.attachment.fileCategory === "image" ? (
                                      <ImageIcon className="w-4 h-4 shrink-0" />
                                    ) : msg.attachment.fileCategory ===
                                      "wfdb" ? (
                                      <Activity className="w-4 h-4 shrink-0" />
                                    ) : (
                                      <FileText className="w-4 h-4 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-extrabold truncate">
                                        {msg.attachment.fileName}
                                      </p>
                                      <p className="text-[10px] opacity-80 uppercase">
                                        {msg.attachment.fileCategory} •{" "}
                                        {msg.attachment.fileSizeLabel}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {msg.attachedExamId && (
                                <Link
                                  to={`/doctor/examinations/${msg.attachedExamId}`}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                                    isMine
                                      ? "bg-white text-[#052e6e]"
                                      : "bg-[#eef4fb] text-[#0284c7]"
                                  }`}
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                  12-Lead Study:{" "}
                                  {msg.attachedExamId.toUpperCase()}
                                </Link>
                              )}
                            </div>

                            {!isMine && (
                              <span className="text-[10px] text-slate-400 mb-1">
                                {timeLabel}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {(pendingAttachment || attachedExamId) && (
                    <div className="px-6 py-2 bg-[#eef4fb] border-t border-sky-200 flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#052e6e] flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-[#0284c7]" />
                        {pendingAttachment
                          ? `${pendingAttachment.fileName} (${pendingAttachment.fileSizeLabel})`
                          : `ECG Study: ${attachedExamId.toUpperCase()}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingAttachment(null);
                          setAttachedExamId("");
                        }}
                        className="text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {emojiOpen && (
                    <div className="px-6 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
                      {MEDICAL_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() =>
                            setMessageText((prev) => `${prev}${em}`)
                          }
                          className="w-8 h-8 rounded-xl hover:bg-slate-100 text-base flex items-center justify-center transition cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleSend}
                    className="px-5 py-3.5 bg-white border-t border-slate-100 flex items-center gap-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => setEmojiOpen((o) => !o)}
                      className="text-slate-400 hover:text-[#0284c7] p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                      title="Emojis"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-400 hover:text-[#0284c7] p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                      title="Attach Image, PDF, or WFDB/CSV File"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.dat,.hea,.csv,.json"
                      className="hidden"
                      onChange={(e) => handleFilePicked(e.target.files?.[0])}
                    />

                    {patientExams.length > 0 && (
                      <select
                        value={attachedExamId}
                        onChange={(e) => setAttachedExamId(e.target.value)}
                        className="hidden sm:block px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-bold text-[#052e6e] max-w-[155px]"
                      >
                        <option value="">Attach ECG...</option>
                        {patientExams.map((ex) => (
                          <option
                            key={ex.examinationId}
                            value={ex.examinationId}
                          >
                            {ex.examinationId.toUpperCase()} ({ex.riskLevel})
                          </option>
                        ))}
                      </select>
                    )}

                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none px-2"
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={
                        sendMutation.isPending ||
                        (!messageText.trim() &&
                          !pendingAttachment &&
                          !attachedExamId)
                      }
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal 1: Ø§Ø®ØªÙŠØ§Ø± Ø¯ÙƒØªÙˆØ± Ù…Ø¹ Ø§Ù„ØªÙ‚ÙŠÙŠÙ… ÙˆØ§Ù„Ø®Ø¨Ø±Ø© ÙˆØ³Ø¹Ø± Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø© ÙˆØ§Ù„ÙØ±Ø² */}
      {newConsultOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#052e6e]/15 backdrop-blur-[3px]"
              onClick={() => setNewConsultOpen(false)}
            />
            <div className="relative z-10 w-full max-w-xl rounded-3xl bg-white border border-sky-200 p-6 shadow-2xl space-y-4 animate-dash-card max-h-[88vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#052e6e]">
                    Choose Your Cardiologist
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compare verified patient ratings, clinical experience, and
                    consultation fees.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewConsultOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 px-2">
                  Sort specialists by:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDoctorSortBy("rating")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      doctorSortBy === "rating"
                        ? "btn-landing-gradient text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    • Highest Rated
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorSortBy("price")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      doctorSortBy === "price"
                        ? "btn-landing-gradient text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Lowest Price (EGP)
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[...AVAILABLE_DOCTORS]
                  .sort((a, b) => {
                    const priceA =
                      !guestSimulation && a.isPrimaryForCurrentPatient
                        ? 0
                        : guestSimulation
                          ? 300
                          : a.feeEgp;
                    const priceB =
                      !guestSimulation && b.isPrimaryForCurrentPatient
                        ? 0
                        : guestSimulation
                          ? 300
                          : b.feeEgp;
                    if (doctorSortBy === "rating") {
                      return b.rating - a.rating;
                    }
                    return priceA - priceB;
                  })
                  .map((doc) => {
                    const isFree =
                      !guestSimulation && doc.isPrimaryForCurrentPatient;
                    const price = isFree
                      ? 0
                      : guestSimulation
                        ? 300
                        : doc.feeEgp || 250;

                    return (
                      <div
                        key={doc.doctorId}
                        className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0284c7] hover:bg-[#fafcff] transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-extrabold text-[#052e6e]">
                              {doc.fullName}
                            </p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-extrabold border border-amber-200/70">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {doc.rating.toFixed(2)} ({doc.reviewsCount})
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-700">
                            {doc.specialty}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {doc.hospital} • {doc.experienceYears} yrs exp •{" "}
                            {doc.responseTimeLabel}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span
                              className={`text-sm font-black ${
                                isFree ? "text-emerald-600" : "text-[#052e6e]"
                              }`}
                            >
                              {isFree ? "FREE" : `${price} EGP`}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {isFree
                                ? "Assigned Primary Doctor"
                                : "Per consultation"}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={startNewThreadMutation.isPending}
                            onClick={() =>
                              startNewThreadMutation.mutate(doc.doctorId)
                            }
                          >
                            {isFree ? "Open Chat" : `Book • ${price} EGP`}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal 2: Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ù…ØªÙƒØ§Ù…Ù„Ø© */}
      {paymentModalThread &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#052e6e]/20 backdrop-blur-[3px]"
              onClick={() => setPaymentModalThread(null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-sky-200 p-6 shadow-2xl space-y-5 animate-dash-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#eef4fb] text-[#0284c7] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#052e6e]">
                      ECGenius Secure Checkout
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {paymentModalThread.doctorName} • Specialist Consultation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentModalThread(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl bg-[#eef4fb] p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[#052e6e]">
                  Total Amount Due
                </span>
                <span className="text-2xl font-black text-[#052e6e]">
                  {paymentModalThread.feeEgp} EGP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-[#0284c7] bg-sky-50 text-[#052e6e]"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#0284c7]" />
                  Bank Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === "wallet"
                      ? "border-[#0284c7] bg-sky-50 text-[#052e6e]"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#0284c7]" />
                  Mobile Wallet
                </button>
              </div>

              {paymentMethod === "card" ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#052e6e] block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#052e6e] block mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#052e6e] block mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-[#052e6e] block">
                    Vodafone Cash / InstaPay Mobile Number
                  </label>
                  <input
                    type="text"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-800"
                  />
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                disabled={payMutation.isPending}
                onClick={() => payMutation.mutate(paymentModalThread)}
              >
                <CheckCircle2 className="w-4 h-4 text-sky-200" />
                {payMutation.isPending
                  ? "Processing Secure Payment..."
                  : `Confirm & Pay ${paymentModalThread.feeEgp} EGP`}
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}


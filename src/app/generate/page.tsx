"use client";

import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { KeywordPicker } from "@/components/keyword-picker";
import { KeywordDock } from "@/components/keyword-dock";
import { SerendipityCard } from "@/components/serendipity-card";
import { IdeaCard } from "@/components/idea-card";
import { generateIdeas, patchIdea, fetchKeywords } from "@/lib/api";
import { useNavigationBlock } from "@/hooks/use-navigation-block";
import { Sparkles, RotateCcw, AlertCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Keyword, GenerationMode, IdeaGenerated } from "@/types";

const BLOCK_MESSAGES = [
  { emoji: "🤔", text: "AI가 지금 막 열심히 생각 중이에요" },
  { emoji: "⚡", text: "잠깐! 거의 다 왔어요" },
  { emoji: "✨", text: "아이디어들이 방금 완성 직전이에요" },
  { emoji: "🏃", text: "어디 가세요? 결과가 나오려는 참인데요" },
  { emoji: "😢", text: "나가면 저 혼자 만들어 놓고 슬퍼해요" },
  { emoji: "💡", text: "조금만 기다려줘요, 곧 보여드릴게요" },
];

type GenerateStep = "pick" | "loading" | "results";

const SESSION_KEY = "ideabank_last_session";

interface GeneratedIdea extends IdeaGenerated {
  id: string;
  bookmarked: boolean;
}

interface SavedSession {
  ideas: GeneratedIdea[];
  keywords: Keyword[];
  mode: GenerationMode;
  timestamp: number;
}

export default function GeneratePageWrapper() {
  return (
    <Suspense>
      <GeneratePage />
    </Suspense>
  );
}

function GeneratePage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<GenerateStep>("pick");
  const [selectedKeywords, setSelectedKeywords] = useState<Keyword[]>([]);
  const [selectedMode, setSelectedMode] =
    useState<GenerationMode>("full_match");
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [lastSession, setLastSession] = useState<SavedSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 생성 중 페이지 이탈 차단
  const { showModal, confirmLeave, cancelLeave } = useNavigationBlock(step === "loading");
  const blockMessage = useMemo(
    () => BLOCK_MESSAGES[Math.floor(Math.random() * BLOCK_MESSAGES.length)],
    // showModal이 열릴 때마다 새 메시지 뽑기
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showModal],
  );

  // sessionStorage에서 이전 결과 복원
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const session: SavedSession = JSON.parse(saved);
        // 1시간 이내 세션 → 바로 결과 복원
        if (Date.now() - session.timestamp < 60 * 60 * 1000) {
          setLastSession(session);
          setGeneratedIdeas(session.ideas);
          setSelectedKeywords(session.keywords);
          setSelectedMode(session.mode);
          setStep("results");
        }
      }
    } catch {
      // sessionStorage 접근 실패 무시
    }
  }, []);

  // 결과를 sessionStorage에 저장
  const saveSession = useCallback(
    (ideas: GeneratedIdea[], keywords: Keyword[], mode: GenerationMode) => {
      const session: SavedSession = {
        ideas,
        keywords,
        mode,
        timestamp: Date.now(),
      };
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setLastSession(session);
      } catch {
        // 저장 실패 무시
      }
    },
    [],
  );

  // 이전 세션 결과 복원
  const restoreSession = () => {
    if (!lastSession) return;
    setGeneratedIdeas(lastSession.ideas);
    setSelectedKeywords(lastSession.keywords);
    setSelectedMode(lastSession.mode);
    setStep("results");
  };

  // 타이머: loading 시작 시 1초마다 카운트
  useEffect(() => {
    if (step === "loading") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // 대시보드에서 추천 조합 클릭 시 → 자동으로 키워드 채우기
  useEffect(() => {
    const serendipityIds = searchParams.get("serendipity");
    if (!serendipityIds) return;

    const ids = serendipityIds.split(",");
    fetchKeywords().then((data) => {
      const matched = data.keywords.filter((k) => ids.includes(k.id));
      if (matched.length > 0) {
        setSelectedKeywords(matched);
        setSelectedMode("serendipity");
      }
    });
  }, [searchParams]);

  const handleSerendipitySelect = (keywords: Keyword[]) => {
    setSelectedKeywords(keywords);
    setSelectedMode("serendipity");
  };

  const handleToggle = (keyword: Keyword) => {
    setSelectedKeywords((prev) => {
      const exists = prev.find((k) => k.id === keyword.id);
      if (exists) return prev.filter((k) => k.id !== keyword.id);
      return [...prev, keyword];
    });
  };

  const handleRemove = (keyword: Keyword) => {
    setSelectedKeywords((prev) => prev.filter((k) => k.id !== keyword.id));
  };

  const handleGenerate = async () => {
    setStep("loading");
    setError(null);
    try {
      const keywordStrings = selectedKeywords.map((k) => k.keyword);
      const result = await generateIdeas({
        keywords: keywordStrings,
        mode: selectedMode,
      });
      const ideasWithState: GeneratedIdea[] = result.ideas.map((idea, i) => ({
        ...idea,
        id: result.saved_ids[i],
        bookmarked: false,
      }));
      setGeneratedIdeas(ideasWithState);
      saveSession(ideasWithState, selectedKeywords, selectedMode);
      setStep("results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "생성 중 오류가 발생했습니다",
      );
      setStep("pick");
    }
  };

  const handleBookmarkToggle = async (id: string, bookmarked: boolean) => {
    try {
      await patchIdea(id, { bookmarked });
      setGeneratedIdeas((prev) => {
        const updated = prev.map((idea) =>
          idea.id === id ? { ...idea, bookmarked } : idea,
        );
        // 북마크 변경도 세션에 반영
        saveSession(updated, selectedKeywords, selectedMode);
        return updated;
      });
    } catch {
      // Silently fail — user can retry
    }
  };

  const handleReset = () => {
    setStep("pick");
    setSelectedKeywords([]);
    setGeneratedIdeas([]);
    setError(null);
  };

  return (
    <div className="pb-28">
      {/* 이탈 차단 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-card-xl shadow-float border border-border p-8 max-w-sm w-full mx-4 text-center">
            <div className="text-4xl mb-4">{blockMessage.emoji}</div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              {blockMessage.text}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              지금 나가면 생성 결과를 못 볼 수도 있어요.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={confirmLeave}
              >
                그냥 나갈게요
              </Button>
              <Button
                className="flex-1"
                onClick={cancelLeave}
              >
                기다릴게요
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">발산 세션</h1>
        <p className="text-text-muted mt-1">
          새로운 아이디어를 만들어보세요
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step: PICK */}
      {step === "pick" && (
        <>
          {/* 이전 세션 결과 복원 배너 */}
          {lastSession && (
            <div className="mb-6 bg-surface rounded-card-lg shadow-marshmallow border border-white/80 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="size-5 text-primary" />
                <div>
                  <span className="text-sm font-semibold text-text-main">
                    이전 결과 ({lastSession.ideas.length}개 아이디어)
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    {lastSession.keywords.map((kw) => (
                      <span
                        key={kw.id}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-text-muted"
                      >
                        {kw.keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={restoreSession}>
                결과 보기
              </Button>
            </div>
          )}

          {/* Serendipity recommendations */}
          <div className="mb-8">
            <SerendipityCard onSelect={handleSerendipitySelect} />
          </div>

          <KeywordPicker
            selectedKeywords={selectedKeywords}
            onToggle={handleToggle}
          />
          <KeywordDock
            selectedKeywords={selectedKeywords}
            onRemove={handleRemove}
            onGenerate={handleGenerate}
            mode={selectedMode}
            onModeChange={setSelectedMode}
            generating={false}
          />
        </>
      )}

      {/* Step: LOADING */}
      {step === "loading" && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="bg-surface rounded-card-xl shadow-marshmallow p-12 text-center">
            <Sparkles className="size-12 text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-text-main mb-2">
              아이디어를 만들고 있어요...
            </h2>
            <p className="text-2xl font-black text-primary tabular-nums">
              {elapsed}<span className="text-sm font-semibold text-text-muted">초</span>
            </p>
          </div>
        </div>
      )}

      {/* Step: RESULTS */}
      {step === "results" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-text-main">
                아이디어 {generatedIdeas.length}개 준비됐어요
              </h2>
              <div className="flex gap-1.5">
                {selectedKeywords.map((kw) => (
                  <span
                    key={kw.id}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-text-muted"
                  >
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-4" />
              <span>다시 선택</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

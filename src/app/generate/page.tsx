"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { KeywordPicker } from "@/components/keyword-picker";
import { KeywordDock } from "@/components/keyword-dock";
import { SerendipityCard } from "@/components/serendipity-card";
import { IdeaCard } from "@/components/idea-card";
import { generateIdeas, patchIdea, fetchKeywords } from "@/lib/api";
import { Sparkles, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Keyword, GenerationMode, IdeaGenerated } from "@/types";

type GenerateStep = "pick" | "loading" | "results";

export default function GeneratePageWrapper() {
  return (
    <Suspense>
      <GeneratePage />
    </Suspense>
  );
}

interface GeneratedIdea extends IdeaGenerated {
  id: string;
  bookmarked: boolean;
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setGeneratedIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id ? { ...idea, bookmarked } : idea,
        ),
      );
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">발산 세션</h1>
        <p className="text-text-muted mt-1">
          키워드를 조합하여 비즈니스 아이디어를 생성하세요
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
              아이디어를 생성하고 있어요...
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
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-text-main">
                {generatedIdeas.length}개 아이디어 생성 완료
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

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * 지정된 조건에서 페이지 이탈을 가로채는 훅.
 * - 브라우저 닫기/새로고침: beforeunload로 막음 (브라우저 고정 문구 표시)
 * - 앱 내 링크 클릭: pushState 인터셉트 → showModal: true
 */
export function useNavigationBlock(enabled: boolean) {
  const [showModal, setShowModal] = useState(false);
  const pendingNav = useRef<(() => void) | null>(null);
  const originalPushState = useRef<typeof window.history.pushState | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 브라우저 닫기/새로고침 차단
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 앱 내 이동 차단 (Next.js는 내부적으로 pushState 사용)
    originalPushState.current = window.history.pushState.bind(window.history);
    window.history.pushState = (...args: Parameters<typeof window.history.pushState>) => {
      pendingNav.current = () => originalPushState.current!(...args);
      setShowModal(true);
    };

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (originalPushState.current) {
        window.history.pushState = originalPushState.current;
        originalPushState.current = null;
      }
    };
  }, [enabled]);

  // 나갈게요 → 원래 pushState 복원 후 이동
  const confirmLeave = useCallback(() => {
    if (originalPushState.current) {
      window.history.pushState = originalPushState.current;
      originalPushState.current = null;
    }
    setShowModal(false);
    pendingNav.current?.();
    pendingNav.current = null;
  }, []);

  // 기다릴게요 → 모달만 닫기
  const cancelLeave = useCallback(() => {
    setShowModal(false);
    pendingNav.current = null;
  }, []);

  return { showModal, confirmLeave, cancelLeave };
}

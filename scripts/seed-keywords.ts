import { collections, db } from "../src/server/firebase";

const KEYWORDS: Record<string, string[]> = {
  who: [
    "1인 가구", "Z세대", "알파세대", "실버 세대", "N잡러",
    "딩크족", "주니어 개발자", "반려동물 가구", "디지털 노마드", "소상공인(SME)",
    "취준생", "외국인 거주자", "1인 크리에이터", "환경 운동가", "나홀로 여행객",
    "사이드 프로젝트 팀", "중소기업 의사결정자(C-level)", "워킹맘/워킹대디",
    "장애인/접근성 사용자", "디지털 네이티브 시니어",
  ],
  domain: [
    "핀테크", "헬스케어", "에듀테크", "커머스", "로지스틱스",
    "스마트홈", "로컬 커뮤니티", "프롭테크", "K-컬처", "뷰티테크",
    "멘탈헬스", "트래블테크", "리걸테크", "HR-tech", "F&B(외식업)",
    "엔터테인먼트", "슬립테크", "스페이스테크", "기후테크", "사이버보안",
    "농업테크(AgriTech)", "데이팅/관계",
  ],
  tech: [
    "LLM 에이전트", "RAG(검색 증강)", "멀티모달", "노코드/로코드", "엣지 AI",
    "웨어러블", "개인화 알고리즘", "자동화 워크플로우", "벡터 데이터베이스", "TTS/STT",
    "이미지 생성 AI", "온디바이스 AI", "추천 엔진", "데이터 시각화", "디지털 트윈",
    "지식 그래프", "합성 데이터",
  ],
  value: [
    "시간 단축", "외로움 해소", "생산성 극대화", "자아실현", "비용 절감",
    "심리 케어", "연결성", "재미(Gamification)", "안전/보안", "결정 피로 감소",
    "소속감", "스킬 향상", "데이터 프라이버시", "창의적 영감", "건강 트래킹",
    "노력의 시각화", "심리적 안전감", "디지털 디톡스",
  ],
  money: [
    "구독형(SaaS)", "프리미엄(Freemium)", "중개 수수료", "데이터 판매", "광고 기반",
    "API 과금", "D2C(직판)", "화이트 라벨링", "건당 결제(Pay-per-use)", "라이선싱",
    "리퍼럴(제휴)", "하드웨어 결합형", "크라우드 펀딩", "성공 보수형", "티어드 프라이싱",
    "토큰 경제", "번들링", "마켓플레이스 수수료", "임베디드 파이낸스",
  ],
};

async function seed() {
  // Check if already seeded
  const existing = await collections.keywords.limit(1).get();
  if (!existing.empty) {
    console.log("⚠️  Keywords already exist. Delete collection first to re-seed.");
    const countResult = await collections.keywords.count().get();
    console.log(`   Current count: ${countResult.data().count}`);
    return;
  }

  const batch = db.batch();
  let total = 0;

  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      const ref = collections.keywords.doc();
      batch.set(ref, {
        keyword,
        category,
        source: "fixed",
        added_at: new Date(),
        used_count: 0,
        last_used: null,
      });
      total++;
    }
  }

  await batch.commit();
  console.log(`✅ Seeded ${total} keywords across ${Object.keys(KEYWORDS).length} categories`);

  // Verify counts per category
  for (const category of Object.keys(KEYWORDS)) {
    const countResult = await collections.keywords
      .where("category", "==", category)
      .count()
      .get();
    console.log(`   ${category}: ${countResult.data().count}`);
  }
}

seed().catch(console.error);

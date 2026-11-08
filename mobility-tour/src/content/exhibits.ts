// 샘플 콘텐츠 (PRD v0.4 §5 기반). 교육사 검토 후 교체해야 합니다.
// 향후 Admin CMS가 붙으면 이 파일은 "발행된 콘텐츠"의 오프라인 기본값 역할만 합니다.
import type { Exhibit, ExhibitId } from "./types";

export const EXHIBITS: Record<ExhibitId, Exhibit> = {
  car: {
    id: "car",
    icon: "🚗",
    name: { ko: "자율주행 자동차 디오라마", en: "Autonomous Driving Diorama" },
    tagline: { ko: "센서로 길을 읽는 자동차를 만나 보세요.", en: "Meet a car that reads the road with sensors." },
    stages: {
      approach: {
        title: { ko: "자율주행 자동차를 만나요", en: "Meet the Self-Driving Car" },
        body: {
          ko: "교육장 가운데의 도로 디오라마를 찾아보세요. 작은 자동차가 스스로 길을 따라 움직입니다.",
          en: "Find the road diorama in the middle of the room. A small car is driving along the road by itself.",
        },
        cta: { ko: "가까이 가 보기", en: "Go Closer" },
      },
      engage: {
        title: { ko: "자세히 보기", en: "Look Closer" },
        body: { ko: "자동차의 앞부분을 살펴보세요.", en: "Look at the front of the car." },
        question: {
          ko: "장애물을 알아차리는 센서를 찾을 수 있나요?",
          en: "Can you find the sensor that detects obstacles?",
        },
        hint: {
          ko: "동그란 '눈' 두 개처럼 생긴 부품을 찾아보세요.",
          en: "Look for a part that looks like two round 'eyes'.",
        },
        cta: { ko: "더 알아보기", en: "Explore Deeper" },
      },
      experience: {
        title: { ko: "관찰해 보기", en: "Watch It Happen" },
        body: {
          ko: "자동차가 달리다가 앞에 물체가 있으면 어떻게 하는지 지켜보세요. 바닥의 선 색깔이 바뀔 때도 관찰해 보세요.",
          en: "Watch what the car does when something is in front of it. Also watch what happens when the color of the line on the floor changes.",
        },
        hint: {
          ko: "장애물 배치는 교육사 선생님의 안내가 있을 때만 해 주세요.",
          en: "Please place obstacles only when a museum educator guides you.",
        },
        cta: { ko: "무슨 일이 일어났나요?", en: "What Happened?" },
      },
      reflect: {
        title: { ko: "어떻게 가능할까요?", en: "How Does It Work?" },
        body: {
          ko: "자동차 앞의 초음파 센서는 소리를 보내고 되돌아오는 시간을 재서 물체까지의 거리를 알아냅니다. 바닥을 향한 색상·빛 센서는 선의 색을 읽습니다. 자동차의 컴퓨터는 이 정보를 바탕으로 '멈춤', '속도 줄이기', '방향 바꾸기'를 결정합니다.",
          en: "The ultrasonic sensor sends out sound and measures how long the echo takes to come back, so the car knows how far away an object is. A color/light sensor facing the floor reads the line. The car's computer uses this information to decide to stop, slow down, or turn.",
        },
        cta: { ko: "계속 탐색하기", en: "Continue Exploring" },
      },
      disengage: {
        title: { ko: "잘 관찰했어요!", en: "Great Observing!" },
        body: {
          ko: "실제 자율주행차는 카메라, 레이더, 라이다 등 더 많은 센서를 함께 사용해요. 다른 전시물도 살펴볼까요?",
          en: "Real self-driving cars combine many more sensors, such as cameras, radar and lidar. Shall we explore another exhibit?",
        },
      },
    },
    faqs: [
      {
        id: "car-faq-1",
        q: { ko: "초음파는 사람 귀에 들리나요?", en: "Can people hear ultrasound?" },
        a: {
          ko: "아니요. 초음파는 사람이 들을 수 있는 소리보다 높은 소리라서 들리지 않아요. 박쥐도 비슷한 방법으로 길을 찾아요.",
          en: "No. Ultrasound is higher than the sounds people can hear. Bats find their way in a similar way.",
        },
      },
      {
        id: "car-faq-2",
        q: { ko: "진짜 자율주행차도 이 센서를 쓰나요?", en: "Do real self-driving cars use these sensors?" },
        a: {
          ko: "주차를 도와주는 초음파 센서는 많은 자동차에 쓰여요. 도로를 달릴 때는 카메라·레이더·라이다를 함께 사용해 더 멀리, 더 정확하게 봐요.",
          en: "Many cars use ultrasonic sensors to help with parking. On the road, cameras, radar and lidar are combined to see farther and more accurately.",
        },
      },
    ],
    next: ["quiz", "mural"],
  },

  quiz: {
    id: "quiz",
    icon: "❓",
    name: { ko: "자율주행 퀴즈", en: "Autonomous Driving Quiz" },
    tagline: { ko: "자율주행의 단계를 퀴즈로 알아봐요.", en: "Learn the levels of self-driving with a quiz." },
    stages: {
      approach: {
        title: { ko: "나도 자율주행 전문가", en: "I'm a Self-Driving Expert, Too" },
        body: {
          ko: "교육장 왼쪽의 큰 퀴즈 화면을 찾아보세요. 전시를 보고 퀴즈를 풀며 자율주행차에 대한 지식을 확인해 볼 거예요.",
          en: "Find the large quiz screen on the left side of the room. Look around the exhibits, then test what you know about self-driving cars.",
        },
        cta: { ko: "시작하기", en: "Let's Start" },
      },
      engage: {
        title: { ko: "먼저 생각해 보기", en: "Think First" },
        body: { ko: "정답을 보기 전에 함께 이야기해 보세요.", en: "Talk about it together before you see the answer." },
        question: {
          ko: "모든 자율주행차는 운전자 없이 달릴 수 있을까요?",
          en: "Can all self-driving cars drive without a human driver?",
        },
        cta: { ko: "더 알아보기", en: "Explore Deeper" },
      },
      experience: {
        title: { ko: "퀴즈 풀기", en: "Take the Quiz" },
        body: { ko: "답을 고르고 제출해 보세요.", en: "Choose an answer and submit it." },
        cta: { ko: "해설 보기", en: "See Explanation" },
      },
      reflect: {
        title: { ko: "자율주행의 6단계", en: "The Six Levels of Driving Automation" },
        body: {
          ko: "자율주행은 0단계(자동화 없음)부터 5단계(완전 자율주행)까지 나뉩니다. 2단계까지는 운전자가 항상 운전에 책임을 지고, 3단계부터 특정 조건에서 시스템이 운전을 맡습니다. 그래서 '자율주행차'라도 모두 운전자 없이 달릴 수 있는 것은 아니에요.",
          en: "Driving automation ranges from Level 0 (no automation) to Level 5 (full automation). Up to Level 2 the human driver is always responsible; from Level 3 the system drives under certain conditions. So not every 'self-driving' car can drive without a human.",
        },
        cta: { ko: "계속 탐색하기", en: "Continue Exploring" },
      },
      disengage: {
        title: { ko: "퀴즈 완료!", en: "Quiz Complete!" },
        body: {
          ko: "자율주행 단계를 알게 되었어요. 이제 진짜 센서가 어떻게 작동하는지 보러 갈까요?",
          en: "Now you know the levels of automation. Want to see how real sensors work?",
        },
      },
    },
    // ⚠ 실제 퀴즈 TV 문항으로 교체 필요 (PRD §5.2)
    quiz: [
      {
        id: "quiz-q1",
        question: {
          ko: "운전자가 전혀 필요 없는 '완전 자율주행'은 몇 단계일까요?",
          en: "Which level is 'full automation', where no human driver is needed at all?",
        },
        options: [
          { key: "a", text: { ko: "2단계", en: "Level 2" } },
          { key: "b", text: { ko: "3단계", en: "Level 3" } },
          { key: "c", text: { ko: "5단계", en: "Level 5" } },
        ],
        answer: "c",
        explanation: {
          ko: "5단계는 모든 도로와 환경에서 시스템이 스스로 운전하는 단계예요.",
          en: "At Level 5 the system drives itself on every road and in every condition.",
        },
      },
      {
        id: "quiz-q2",
        question: {
          ko: "차선 유지와 속도 조절을 도와주지만 운전자가 계속 지켜봐야 하는 단계는?",
          en: "Which level helps with lane keeping and speed, but the driver must keep watching?",
        },
        options: [
          { key: "a", text: { ko: "0단계", en: "Level 0" } },
          { key: "b", text: { ko: "2단계", en: "Level 2" } },
          { key: "c", text: { ko: "4단계", en: "Level 4" } },
        ],
        answer: "b",
        explanation: {
          ko: "2단계는 '부분 자동화'예요. 오늘날 많은 자동차의 운전 보조 기능이 여기에 해당해요.",
          en: "Level 2 is 'partial automation'. Many driver-assistance features in today's cars are at this level.",
        },
      },
    ],
    faqs: [
      {
        id: "quiz-faq-1",
        q: { ko: "지금 도로에 4단계 자동차가 있나요?", en: "Are there Level 4 cars on the road now?" },
        a: {
          ko: "일부 도시에서는 정해진 지역 안에서만 달리는 4단계 로보택시가 운행되고 있어요.",
          en: "In some cities, Level 4 robotaxis operate only within designated areas.",
        },
      },
    ],
    next: ["car", "mural"],
  },

  mural: {
    id: "mural",
    icon: "🖼️",
    name: { ko: "미래 모빌리티 벽화", en: "Future Mobility Mural" },
    tagline: { ko: "벽화 속 미래 도시를 탐험해요.", en: "Explore the future city in the mural." },
    stages: {
      approach: {
        title: { ko: "미래 모빌리티 벽화", en: "The Future Mobility Mural" },
        body: {
          ko: "교육장 벽면의 큰 그림을 찾아보세요. 미래 도시의 이동수단이 그려져 있어요.",
          en: "Find the large painting on the wall. It shows how people might travel in a future city.",
        },
        cta: { ko: "살펴보기", en: "Take a Look" },
      },
      engage: {
        title: { ko: "숨은 그림 찾기", en: "Hidden Logos" },
        body: { ko: "실제 벽화를 천천히 살펴보세요.", en: "Look slowly at the real mural." },
        question: {
          ko: "벽화 속에 자동차 로고 4개가 숨어 있어요. 찾을 수 있나요?",
          en: "There are four car logos hidden in the mural. Can you find them?",
        },
        hint: { ko: "건물 간판과 차량 옆면을 살펴보세요.", en: "Check the building signs and the sides of the vehicles." },
        cta: { ko: "더 알아보기", en: "Explore Deeper" },
      },
      experience: {
        title: { ko: "벽화 탐험", en: "Explore the Mural" },
        body: {
          ko: "아래 그림에서 빛나는 점을 눌러 벽화 속 이동수단을 알아보세요.",
          en: "Tap the glowing dots below to learn about the vehicles in the mural.",
        },
        cta: { ko: "무엇을 발견했나요?", en: "What Did You Find?" },
      },
      reflect: {
        title: { ko: "미래의 이동", en: "Moving in the Future" },
        body: {
          ko: "PBV(목적 기반 모빌리티)는 하나의 차체에 용도에 맞는 공간을 바꿔 끼워 카페, 병원, 택배 차량 등으로 쓰는 이동수단이에요. 미래 도시는 전기·수소 에너지와 공유 이동수단으로 더 깨끗하고 효율적인 교통을 만들려고 해요.",
          en: "A PBV (Purpose-Built Vehicle) swaps cabins on the same base to become a café, clinic or delivery van. Future cities aim for cleaner, more efficient transport using electric and hydrogen power and shared mobility.",
        },
        cta: { ko: "계속 탐색하기", en: "Continue Exploring" },
      },
      disengage: {
        title: { ko: "멋진 탐험이었어요!", en: "Great Exploring!" },
        body: {
          ko: "여러분이 상상하는 미래의 이동수단은 무엇인가요? 다른 전시물도 둘러보세요.",
          en: "What vehicle do you imagine for the future? Take a look at the other exhibits too.",
        },
      },
    },
    // 좌표는 벽화 이미지(mural.webp) 기준 %
    hotspots: [
      {
        id: "mural-pbv",
        x: 46.5, y: 63,
        label: { ko: "자율주행 셔틀 (PBV)", en: "Self-Driving Shuttle (PBV)" },
        desc: {
          ko: "운전석 없이 실내를 용도에 맞게 꾸민 차량이에요. 전용 도로를 따라 스스로 달려요. 이런 차량을 목적 기반 모빌리티(PBV)라고 불러요.",
          en: "A vehicle with no driver's seat whose cabin is designed for a purpose. It drives itself along a dedicated lane. This is called a Purpose-Built Vehicle (PBV).",
        },
      },
      {
        id: "mural-raim",
        x: 63, y: 50,
        label: { ko: "서울로봇인공지능과학관", en: "Seoul Robot & AI Museum" },
        desc: {
          ko: "바로 여러분이 있는 이곳! 벽화 속 미래 도시에도 과학관이 그려져 있어요.",
          en: "That's where you are right now! The museum appears in the future city, too.",
        },
      },
      {
        id: "mural-speed",
        x: 74.6, y: 21,
        label: { ko: "속도 제한 표지판", en: "Speed Limit Sign" },
        desc: {
          ko: "자율주행차는 카메라로 표지판을 읽고 제한 속도를 지켜요. 사람이 많은 곳에서는 더 천천히 달려요.",
          en: "Self-driving cars read signs with cameras and keep to the speed limit, driving more slowly where there are many people.",
        },
      },
      {
        id: "mural-parking",
        x: 87.5, y: 30,
        label: { ko: "스마트 주차", en: "Smart Parking" },
        desc: {
          ko: "센서로 빈자리를 찾아 차가 스스로 주차해요. 주차장을 찾느라 도로를 빙빙 도는 차가 줄어들어요.",
          en: "Cars use sensors to find an empty space and park themselves, so fewer cars circle around looking for parking.",
        },
      },
      {
        id: "mural-crosswalk",
        x: 91.5, y: 76,
        label: { ko: "보행자 보호", en: "Pedestrian Safety" },
        desc: {
          ko: "자율주행차는 횡단보도의 사람을 감지하면 멈춰요. 디오라마 자동차의 장애물 센서와 같은 원리예요.",
          en: "Self-driving cars stop when they detect people at a crosswalk — the same idea as the obstacle sensor on the diorama car.",
        },
      },
    ],
    faqs: [
      {
        id: "mural-faq-1",
        q: { ko: "PBV는 지금도 있나요?", en: "Do PBVs exist today?" },
        a: {
          ko: "여러 자동차 회사가 PBV를 개발하고 있고, 일부는 배송·이동 서비스에 시범 운행되고 있어요.",
          en: "Several carmakers are developing PBVs, and some are being trialed for delivery and ride services.",
        },
      },
    ],
    next: ["car", "quiz"],
  },
};

export const EXHIBIT_ORDER: ExhibitId[] = ["car", "quiz", "mural"];

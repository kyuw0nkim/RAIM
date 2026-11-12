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
          ko: "교육장 가운데의 도로 디오라마 앞으로 가 보세요. 작은 자동차가 스스로 길을 따라 달리고 있어요.",
          en: "Walk over to the road diorama in the middle of the room. A small car is driving along the road by itself.",
        },
        cta: { ko: "도착했어요", en: "I'm There" },
      },
      engage: {
        title: { ko: "자세히 보기", en: "Look Closer" },
        body: {
          ko: "디오라마 앞에 서서 레고로 만든 자율주행 자동차의 앞부분을 가까이 들여다보세요.",
          en: "Stand by the diorama and look closely at the front of the autonomous driving car built with LEGO.",
        },
        question: {
          ko: "센서들을 찾을 수 있나요?",
          en: "Can you find the sensors?",
        },
        hint: {
          ko: "하나는 정면에서 차를 바라봤을 때, 하나는 차의 바닥에서 찾을 수 있어요.",
          en: "You can see one when you look at the car from the front. The other is on the bottom of the car.",
        },
        cta: { ko: "더 알아보기", en: "Explore Deeper" },
      },
      experience: {
        title: { ko: "관찰해 보기", en: "Watch It Happen" },
        body: {
          ko: "자동차가 도로를 달리는 모습을 지켜보세요. 자동차가 다가오면 앞에 장애물을 놓아 보세요. 앞에 무언가 있으면 자동차는 어떻게 하나요?",
          en: "Watch the car drive around the road. Place obstacles when a car approaches you. What does it do when something is in front of it?",
        },
        hint: {
          ko: "손으로 직접 자동차를 막아 봐도 돼요.",
          en: "You can also block the car with your own hand.",
        },
        cta: { ko: "무슨 일이 일어났나요?", en: "What Happened?" },
      },
      reflect: {
        title: { ko: "어떻게 가능할까요?", en: "How Does It Work?" },
        body: {
          ko: "여러분이 찾은 동그란 두 '눈'이 초음파 센서예요. 소리를 보내고 되돌아오는 시간을 재서 물체까지의 거리를 알아내요. 바닥을 향한 컬러 센서는 선의 색을 읽어요. 자동차의 컴퓨터는 이 정보로 '멈춤', '속도 줄이기', '방향 바꾸기'를 결정해요.",
          en: "The two round 'eyes' you found are an ultrasonic sensor. It sends out sound and times the echo to work out how far away an object is. A color sensor facing the floor reads the line. The car's computer uses this to decide to stop, slow down or turn.",
        },
        cta: { ko: "계속 탐색하기", en: "Continue Exploring" },
      },
      disengage: {
        title: { ko: "잘 관찰했어요!", en: "Great Observing!" },
        body: {
          ko: "실제 자율주행차는 카메라, 레이더, 라이다 등 더 많은 센서를 함께 써요. 이제 다음 전시물로 걸어가 볼까요?",
          en: "Real self-driving cars combine many more sensors, like cameras, radar and lidar. Ready to walk over to the next exhibit?",
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
          ko: "교육장 왼쪽의 큰 퀴즈 화면 앞으로 가 보세요. 전시를 둘러본 뒤, 자율주행차에 대해 얼마나 알게 되었는지 확인해 봐요.",
          en: "Head to the large quiz screen on the left side of the room. After exploring the exhibits, see how much you've learned about self-driving cars.",
        },
        cta: { ko: "도착했어요", en: "I'm There" },
      },
      engage: {
        title: { ko: "먼저 생각해 보기", en: "Think First" },
        body: {
          ko: "퀴즈 화면 앞에서, 정답을 보기 전에 함께 온 사람과 먼저 이야기해 보세요.",
          en: "In front of the quiz screen, talk it over with the people you came with before you see the answer.",
        },
        question: {
          ko: "모든 자율주행차는 운전자 없이 달릴 수 있을까요?",
          en: "Can all self-driving cars drive without a human driver?",
        },
        cta: { ko: "더 알아보기", en: "Explore Deeper" },
      },
      experience: {
        title: { ko: "퀴즈 풀기", en: "Take the Quiz" },
        body: { ko: "", en: "" },
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
          ko: "자율주행 단계를 알게 되었어요. 이제 디오라마로 가서 진짜 센서가 어떻게 움직이는지 직접 볼까요?",
          en: "Now you know the levels of automation. Want to go to the diorama and see real sensors at work?",
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
          ko: "교육장 벽면의 큰 벽화 앞으로 가 보세요. 미래 도시의 이동수단이 그려져 있어요.",
          en: "Walk up to the large mural on the wall. It shows how people might travel in a future city.",
        },
        cta: { ko: "도착했어요", en: "I'm There" },
      },
      engage: {
        title: { ko: "숨은 그림 찾기", en: "Hidden Logos" },
        body: {
          ko: "벽화 앞에 서서 천천히 둘러보세요.",
          en: "Stand in front of the mural and take your time.",
        },
        question: {
          ko: "벽화 속에 자동차 로고 4개가 숨어 있어요. 찾을 수 있나요?",
          en: "There are four car logos hidden in the mural. Can you find them?",
        },
        hint: { ko: "건물 간판을 살펴보세요.", en: "Check the building signs." },
        cta: { ko: "더 알아보기", en: "Explore Deeper" },
      },
      experience: {
        title: { ko: "벽화 탐험", en: "Explore the Mural" },
        body: {
          ko: "고개를 들어 벽화를 보세요. 이 화면의 원을 누르면 벽화에서 무엇을 찾을지 알려 줘요.",
          en: "Look up at the mural. Tap a ring here to see what to find on it.",
        },
        cta: { ko: "무엇을 발견했나요?", en: "What Did You Find?" },
      },
      reflect: {
        title: { ko: "미래 도시를 상상해 봐요", en: "Imagine the Future City" },
        body: {
          ko: "벽화에서 찾은 것들은 서로 연결되어 있어요. 표지판을 읽고 사람을 보면 멈추는 자동차, 함께 타는 셔틀, 스스로 주차하는 차가 모이면 도시는 더 안전하고, 깨끗하고, 덜 붐비게 돼요.",
          en: "The things you found work together. Cars that read signs and stop for people, shuttles we share, and cars that park themselves can make a city safer, cleaner and less crowded.",
        },
        question: {
          ko: "이 벽화에 하나를 더 그려 넣을 수 있다면, 무엇을 그리고 싶나요?",
          en: "If you could add one thing to this mural, what would it be?",
        },
        cta: { ko: "계속 탐색하기", en: "Continue Exploring" },
      },
      disengage: {
        title: { ko: "멋진 탐험이었어요!", en: "Great Exploring!" },
        body: {
          ko: "벽화를 한 번 더 둘러본 뒤, 다음 전시물로 걸어가 보세요.",
          en: "Take one more look at the mural, then walk to the next exhibit.",
        },
      },
    },
    credit: { ko: "작가 최지수", en: "Artwork by Jisoo Choi" },
    // 좌표는 벽화 이미지(mural.webp) 기준 %. find = 실제 벽에서 찾을 것, desc = 설명
    hotspots: [
      {
        // TODO(교육사): 실제 영상 내용에 맞게 문구 교체
        id: "mural-video",
        kind: "video",
        points: [
          { x: 14.9, y: 54.2 },
          { x: 38, y: 53.8 },
          { x: 84.8, y: 48.5 },
        ],
        label: { ko: "벽화 속 영상", en: "Videos in the Mural" },
        find: {
          ko: "벽화에서 영상이 나오는 화면 세 곳을 찾아보세요. 왼쪽, 가운데, 오른쪽에 있어요.",
          en: "Find the three video screens on the mural: left, center and right.",
        },
        desc: {
          ko: "잠시 서서, 자율주행차와 함께하는 미래가 어떤 모습일지 영상으로 지켜보세요.",
          en: "Stand for a moment and watch what the future with self-driving cars will look like.",
        },
      },
      {
        id: "mural-pbv",
        points: [{ x: 46.5, y: 63 }],
        label: { ko: "자율주행 셔틀 (PBV)", en: "Self-Driving Shuttle (PBV)" },
        find: {
          ko: "벽화 가운데 도로에서, 안이 훤히 보이는 차량을 찾아보세요.",
          en: "On the center road of the mural, find the vehicles you can see inside.",
        },
        desc: {
          ko: "운전석 없이 스스로 달리는 셔틀이에요. 하나의 차체에 용도에 맞는 공간을 바꿔 끼워 카페, 병원, 택배 차량 등으로 써요. 이런 차량을 목적 기반 모빌리티(PBV)라고 불러요.",
          en: "A shuttle with no driver's seat that drives itself. It swaps cabins on the same base to become a café, clinic or delivery van. This is called a Purpose-Built Vehicle (PBV).",
        },
      },
      {
        id: "mural-raim",
        points: [{ x: 63, y: 50 }],
        label: { ko: "서울로봇인공지능과학관", en: "Seoul Robot & AI Museum" },
        find: {
          ko: "'RAIM'이라고 쓰인 둥근 건물을 찾아보세요.",
          en: "Find the round building labeled 'RAIM'.",
        },
        desc: {
          ko: "바로 여러분이 있는 이곳! 벽화 속 미래 도시에도 과학관이 그려져 있어요.",
          en: "That's where you are right now! The museum appears in the future city, too.",
        },
      },
      {
        id: "mural-speed",
        points: [{ x: 74.6, y: 21 }],
        label: { ko: "속도 제한 표지판", en: "Speed Limit Sign" },
        find: {
          ko: "벽화 오른쪽 위에서 숫자 '30'이 적힌 표지판을 찾아보세요.",
          en: "At the upper right of the mural, find the sign with '30' on it.",
        },
        desc: {
          ko: "자율주행차는 카메라로 표지판을 읽고 제한 속도를 지켜요. 사람이 많은 곳에서는 더 천천히 달려요.",
          en: "Self-driving cars read signs with cameras and keep to the speed limit, driving more slowly where there are many people.",
        },
      },
      {
        id: "mural-parking",
        points: [{ x: 87.5, y: 30 }],
        label: { ko: "스마트 주차", en: "Smart Parking" },
        find: {
          ko: "오른쪽 끝에서 'P' 표지판과 줄지어 선 차들을 찾아보세요.",
          en: "At the far right, find the 'P' sign and the row of parked cars.",
        },
        desc: {
          ko: "센서로 빈자리를 찾아 차가 스스로 주차해요. 주차장을 찾느라 도로를 빙빙 도는 차가 줄어들어요.",
          en: "Cars use sensors to find an empty space and park themselves, so fewer cars circle around looking for parking.",
        },
      },
      {
        id: "mural-crosswalk",
        points: [{ x: 91.5, y: 76 }],
        label: { ko: "보행자 보호", en: "Pedestrian Safety" },
        find: {
          ko: "오른쪽 아래에서 걷는 사람 표지판과 횡단보도를 찾아보세요.",
          en: "At the lower right, find the walking-person sign and the crosswalk.",
        },
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

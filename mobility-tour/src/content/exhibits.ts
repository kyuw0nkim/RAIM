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
        hint: {
          ko: "디오라마 양 옆의 태블릿에서 레고 자동차가 도로를 스스로 달리는 원리를 확인해 보세요.",
          en: "Check the tablets on both sides of the diorama to see how the LEGO car drives itself along the road.",
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
        id: "car-faq-corner",
        q: { ko: "왜 코너에서 자꾸 부딪히나요?", en: "Why do the cars keep bumping into each other at the corners?" },
        a: {
          ko: "자동차에 장애물을 인식하는 센서가 한 곳에만 달려 있어, 그 센서 하나에만 의존하기 때문입니다.\n이는 사람이 운전석에 앉아 앞만 보고 운전하는 것과 비슷합니다. 그래서 코너를 돌 때 보이지 않는 영역, 즉 '사각지대'가 커지고, 그곳에 있는 차를 놓쳐 서로 부딪히게 됩니다.\n그런데 실제 자율주행 자동차가 이렇게 부딪힌다면 매우 위험하겠지요?\n그래서 실제 자율주행 자동차는 차량 곳곳에 센서를 달아 사방을 살피고, 사각지대를 최소화하고 있습니다.",
          en: "Each car has a sensor for detecting obstacles in only one place, so it relies on that single sensor.\nIt's like a driver who only looks straight ahead. When the car turns a corner, the area it can't see, its 'blind spot', gets bigger, so it misses the car there and they bump into each other.\nIf a real self-driving car crashed like this, it would be very dangerous, right?\nThat's why real self-driving cars have sensors all around the vehicle to watch in every direction and keep blind spots as small as possible.",
        },
      },
      {
        id: "car-faq-build",
        q: { ko: "자동차는 무엇으로 만들었나요? 어떻게 도로를 따라가나요?", en: "What is the car made of? How does it follow the road?" },
        a: {
          ko: "이 자동차는 레고로 만들었습니다. 자동차에는 레고에서 쓰는 센서 두 개가 달려 있습니다.\n앞쪽에 돼지코처럼 생긴 부분이 초음파 센서입니다. 이 센서로 앞에 있는 장애물을 인식합니다.\n그 아래에서 바닥을 향해 빛을 비추고 있는 것은 컬러 센서입니다. 이 센서는 바닥에 빛을 쏜 뒤 반사되어 돌아오는 빛의 양을 측정합니다. 그 값에 따라 바퀴의 움직임을 조절해서 자동차가 도로를 따라 달리게 합니다.",
          en: "This car is built with LEGO. It has two sensors used in LEGO kits.\nThe part at the front that looks like a pig's nose is the ultrasonic sensor. It detects obstacles in front of the car.\nBelow it, the part shining light at the floor is the color sensor. It shines light on the floor and measures how much light bounces back. Based on that value, it adjusts how the wheels move so the car follows the road.",
        },
      },
    ],
    next: ["quiz", "mural"],
  },

  quiz: {
    id: "quiz",
    icon: "❓",
    name: { ko: "자율주행 퀴즈", en: "Autonomous Driving Quiz" },
    tagline: { ko: "퀴즈로 자율주행 지식을 확인해요.", en: "Test what you know about self-driving cars." },
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
        title: { ko: "자율주행차는 다 똑같을까?", en: "Are All Self-Driving Cars the Same?" },
        body: {
          ko: "퀴즈를 풀기 전에, 함께 온 사람과 먼저 이야기해 보세요.",
          en: "Before the quiz, talk it over with the people you came with.",
        },
        question: {
          ko: "자율주행차라면 모두 운전자 없이 달릴 수 있을까요?",
          en: "Can every self-driving car drive with no one at the wheel?",
        },
        hint: {
          ko: "오늘 타고 온 차를 떠올려 보세요. 차가 스스로 해 주는 일이 있나요? (속도 맞추기, 차선 지키기, 주차…)",
          en: "Think about the car you came in today. Does it do anything by itself? (keeping speed, staying in the lane, parking…)",
        },
        cta: { ko: "더 알아보기", en: "Explore Deeper" },
      },
      experience: {
        title: { ko: "퀴즈 풀기", en: "Take the Quiz" },
        body: {
          ko: "앞의 퀴즈 화면에서 풀어 보세요! 몇 개나 맞출 수 있을까요?",
          en: "Take the quiz on the screen in front of you! How many can you get right?",
        },
        cta: { ko: "다 풀었어요", en: "I'm Done" },
      },
      reflect: {
        title: { ko: "자율주행에도 단계가 있어요", en: "Self-Driving Has Levels" },
        body: {
          ko: "자율주행은 0~5단계로 나뉘어요. 0~2단계는 사람이 운전하고, 차는 속도 조절이나 차선 유지 같은 운전을 도와요. 3단계는 차가 운전하지만, 요청하면 사람이 바로 넘겨받아야 해요. 4단계는 정해진 지역 안에서는 사람 없이 스스로 달려요. 5단계는 어디서든, 어떤 날씨에도 스스로 달리는 단계로, 아직 이런 차는 없어요.",
          en: "Self-driving has six levels, from 0 to 5. At Levels 0–2, a person drives and the car helps, for example by keeping speed or staying in the lane. At Level 3, the car drives, but a person must take over when asked. At Level 4, the car drives itself with no one at the wheel, but only in set areas. Level 5 means driving itself anywhere, in any weather, and no car can do that yet.",
        },
        question: {
          ko: "운전자가 없는 차를 타 보고 싶나요? 어디로 가 보고 싶나요?",
          en: "Would you ride in a car with no driver? Where would you want it to take you?",
        },
        cta: { ko: "계속 탐색하기", en: "Continue Exploring" },
      },
      disengage: {
        title: { ko: "퀴즈 완료!", en: "Quiz Complete!" },
        body: {
          ko: "몇 개나 맞혔나요? 아리송했던 문제가 있다면, 관련된 전시물로 다시 가서 살펴보세요.",
          en: "How many did you get right? If a question was tricky, walk back to the related exhibit and take another look.",
        },
      },
    },
    // 퀴즈는 교육장의 퀴즈 화면에서 진행 (앱에서 푸는 문항 없음)
    faqs: [
      {
        id: "quiz-faq-seoul",
        q: { ko: "서울에도 자율주행 자동차가 다니고 있나요?", en: "Are there self-driving cars in Seoul?" },
        a: {
          ko: "그럼요. 실제 자율주행 자동차는 이미 서울 도로를 달리고 있습니다.\n청계천에서는 운전석이 없는 자율주행 셔틀이, 합정에서 동대문까지는 늦은 밤 시민들의 귀갓길을 돕는 심야 자율주행버스가 다닙니다. 강남에서는 자율주행 택시를 호출해 탈 수도 있습니다.\n셔틀과 택시, 마을버스, 심야버스까지, 형태도 점점 다양해지고 있습니다.",
          en: "Yes! Real self-driving vehicles are already on Seoul's roads.\nAlong Cheonggyecheon, self-driving shuttles with no driver's seat carry passengers, and between Hapjeong and Dongdaemun, late-night self-driving buses help people get home. In Gangnam, you can even call a self-driving taxi.\nFrom shuttles and taxis to neighborhood buses and late-night buses, they come in more and more forms.",
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
          ko: "교육장 벽면의 큰 벽화 앞으로 가 보세요. 최지수 작가가 미래 모빌리티를 상상하며 그린 벽화예요.",
          en: "Walk up to the large mural on the wall. Artist Jisoo Choi painted it imagining the future of mobility.",
        },
        cta: { ko: "도착했어요", en: "I'm There" },
      },
      engage: {
        title: { ko: "작가가 그린 미래", en: "The Artist's Future" },
        body: {
          ko: "벽화의 일부 장면은 영상으로도 재현해 두었으니, 함께 보러 가 볼까요?",
          en: "Some scenes from the mural have also been recreated as videos. Shall we go and watch them together?",
        },
        question: {
          ko: "작가는 미래의 이동 수단을 어떤 모습으로 상상했을까요?",
          en: "How did the artist imagine the vehicles of the future?",
        },
        hint: {
          ko: "그림 속에서 미래의 모습을 떠올리게 하는 부분은 어디인가요? 지금은 없지만 미래에는 생길 것 같은 로봇을 찾아보세요.",
          en: "Which parts of the picture make you think of the future? Look for robots that don't exist yet but might one day.",
        },
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
        title: { ko: "벽화 속 미래, 우리의 하루", en: "The Mural's Future, Our Day" },
        body: { ko: "", en: "" },
        question: {
          ko: "작가가 그린 미래의 이동은 지금과 무엇이 다를까요?\n이 벽화 속 풍경이 현실이 된다면 우리의 하루는 어떻게 달라질까요?",
          en: "How is the future of travel the artist painted different from today?\nIf the scenes in this mural came true, how would our days change?",
        },
        cta: { ko: "계속 탐색하기", en: "Continue Exploring" },
      },
      disengage: {
        title: { ko: "멋진 탐험이었어요!", en: "Great Exploring!" },
        body: {
          ko: "벽화를 한 번 더 둘러본 뒤, 다음 전시물로 걸어가 보세요.",
          en: "Take one more look at the mural, then walk to the next exhibit.",
        },
        bonus: {
          question: {
            ko: "벽화 속 건물을 잘 살펴보면 자동차 회사 로고 4개가 숨어 있습니다. 어떤 로고들이 있을까요? 그리고 왜 그려져 있을까요?",
            en: "Look closely at the buildings in the mural. Four car company logos are hidden there. Which ones are they, and why are they there?",
          },
          button: { ko: "찾았다면 눌러 보세요!", en: "Found them? Tap here!" },
          answer: {
            ko: "이 공간은 폭스바겐그룹우리재단과 함께 만든 공간이기 때문입니다.\n2층은 이렇게 여러 기업과 협업한 공간으로 꾸며져 있습니다. 다른 공간은 어떤 기업과 함께 만들었을지 찾아보세요!",
            en: "Because this space was created together with the Volkswagen Group Woori Foundation.\nThe 2nd floor is made up of spaces created with different companies. See if you can find which companies helped build the other spaces!",
          },
        },
      },
    },
    credit: { ko: "작가 최지수", en: "Artwork by Jisoo Choi" },
    // 좌표는 벽화 이미지(mural.webp) 기준 %. find = 벽화에서 찾을 것, desc = 생각해 볼 질문·설명
    hotspots: [
      {
        id: "mural-video",
        kind: "video",
        points: [
          { x: 15.0, y: 54.2 },
          { x: 38, y: 53.8 },
          { x: 84.8, y: 48.5 },
        ],
        label: { ko: "벽화 속 영상", en: "Videos in the Mural" },
        find: {
          ko: "벽화에서 영상이 나오는 화면 세 곳을 찾아보세요. 왼쪽, 가운데, 오른쪽에 있어요.",
          en: "Find the three video screens on the mural: left, center and right.",
        },
        desc: {
          ko: "벽화의 일부 장면을 영상으로 재현해 두었어요. 잠시 서서 지켜보세요.",
          en: "Some scenes from the mural have been recreated as videos. Stand for a moment and watch.",
        },
      },
      {
        id: "mural-cars",
        points: [{ x: 47.5, y: 72 }],
        label: { ko: "속이 보이는 자동차", en: "See-Through Cars" },
        find: {
          ko: "벽화 가운데 도로에서 속이 훤히 보이는 자동차들을 찾아보세요.",
          en: "On the center road of the mural, find the cars you can see inside.",
        },
        desc: {
          ko: "그림 속 자동차는 우리가 지금 타는 자동차와 무엇이 다를까요?\n여러분이 생각하는 미래의 자동차와 그림 속 모습은 얼마나 닮았나요?",
          en: "How are the cars in the picture different from the cars we ride today?\nHow close are they to the future car you imagine?",
        },
      },
      {
        id: "mural-charging",
        points: [{ x: 73.9, y: 51.4 }],
        label: { ko: "충전소", en: "Charging Station" },
        find: {
          ko: "RAIM 건물 오른쪽에서 자동차를 충전하는 곳을 찾아보세요.",
          en: "To the right of the RAIM building, find the place where a car is being charged.",
        },
        desc: {
          ko: "그림 속에서 자동차를 충전해 주는 것은 누구일까요?",
          en: "Who is charging the car in the picture?",
        },
      },
      {
        id: "mural-intersection",
        points: [{ x: 92.0, y: 33.6 }],
        label: { ko: "교차로의 신호등", en: "The Intersection" },
        find: {
          ko: "벽화 오른쪽 교차로의 도로를 자세히 보세요.",
          en: "Look closely at the roads at the intersection on the right.",
        },
        desc: {
          ko: "지금의 도로에는 있지만, 이 그림에는 없는 것이 있습니다. 무엇일까요?\n자동차를 위한 신호등이 보이나요?\n그림 속에 하나뿐인 신호등은 누구를 위한 것일까요?",
          en: "Today's roads have something this picture doesn't. What is it?\nCan you see any traffic lights for cars?\nWho is the only traffic light in the picture for?",
        },
      },
    ],
    faqs: [],
    next: ["car", "quiz"],
  },
};

export const EXHIBIT_ORDER: ExhibitId[] = ["car", "quiz", "mural"];

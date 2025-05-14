import { PrismaClient, Contents } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * basic100 컨텐츠에 100개의 영어 문장과 한글 번역을 추가하는 함수
 */
async function addBasic100Sentences() {
  try {
    // 기존에 basic100 컨텐츠의 문장이 있는지 확인합니다
    const existingSentence = await prisma.sentence.findFirst({
      where: {
        contents: Contents.basic100,
      },
    });

    if (existingSentence) {
      console.log("basic100 컨텐츠의 문장이 이미 존재합니다.");
      return;
    }

    // 추가할 문장들의 배열
    const sentences = [
      { no: 1, en: "Hello, how are you?", ko: "안녕하세요, 어떻게 지내세요?" },
      { no: 2, en: "My name is John.", ko: "제 이름은 존입니다." },
      { no: 3, en: "I live in Seoul.", ko: "나는 서울에 살아요." },
      { no: 4, en: "What time is it?", ko: "지금 몇 시인가요?" },
      { no: 5, en: "I love learning English.", ko: "나는 영어 배우는 것을 좋아해요." },
      { no: 6, en: "Let's have lunch together.", ko: "함께 점심을 먹읍시다." },
      { no: 7, en: "This book is very interesting.", ko: "이 책은 매우 흥미롭습니다." },
      { no: 8, en: "Can you help me?", ko: "저를 도와주실 수 있나요?" },
      { no: 9, en: "I'm sorry, I don't understand.", ko: "죄송합니다, 이해하지 못했어요." },
      { no: 10, en: "Where is the bathroom?", ko: "화장실이 어디에 있나요?" },
      { no: 11, en: "I want to go shopping.", ko: "쇼핑하러 가고 싶어요." },
      { no: 12, en: "How much does this cost?", ko: "이것은 얼마인가요?" },
      { no: 13, en: "I have a question.", ko: "질문이 있습니다." },
      { no: 14, en: "Thank you very much.", ko: "정말 감사합니다." },
      { no: 15, en: "You're welcome.", ko: "천만에요." },
      { no: 16, en: "I'm studying Korean.", ko: "저는 한국어를 공부하고 있어요." },
      { no: 17, en: "What's your favorite food?", ko: "당신이 가장 좋아하는 음식은 무엇인가요?" },
      { no: 18, en: "I like kimchi very much.", ko: "나는 김치를 매우 좋아해요." },
      { no: 19, en: "It's raining today.", ko: "오늘은 비가 오고 있어요." },
      { no: 20, en: "I need to buy some groceries.", ko: "식료품을 좀 사야 해요." },
      { no: 21, en: "Do you have any siblings?", ko: "형제자매가 있나요?" },
      { no: 22, en: "I have two brothers and a sister.", ko: "남동생 둘과 여동생 하나가 있어요." },
      { no: 23, en: "What do you do for a living?", ko: "직업이 무엇인가요?" },
      { no: 24, en: "I'm a software developer.", ko: "저는 소프트웨어 개발자입니다." },
      { no: 25, en: "How old are you?", ko: "몇 살이세요?" },
      { no: 26, en: "I'm twenty-five years old.", ko: "저는 스물다섯 살입니다." },
      { no: 27, en: "Where were you born?", ko: "어디에서 태어났나요?" },
      { no: 28, en: "I was born in Busan.", ko: "저는 부산에서 태어났어요." },
      { no: 29, en: "Do you have any pets?", ko: "반려동물이 있나요?" },
      { no: 30, en: "I have a dog and two cats.", ko: "개 한 마리와 고양이 두 마리가 있어요." },
      { no: 31, en: "What's the weather like today?", ko: "오늘 날씨가 어떤가요?" },
      { no: 32, en: "It's sunny and warm.", ko: "맑고 따뜻해요." },
      { no: 33, en: "What time do you usually wake up?", ko: "보통 몇 시에 일어나세요?" },
      { no: 34, en: "I wake up at 7 o'clock.", ko: "7시에 일어납니다." },
      { no: 35, en: "What's your favorite movie?", ko: "가장 좋아하는 영화는 무엇인가요?" },
      { no: 36, en: "I enjoy watching action movies.", ko: "저는 액션 영화 보는 것을 즐깁니다." },
      { no: 37, en: "How was your weekend?", ko: "주말 잘 보내셨나요?" },
      { no: 38, en: "I visited my parents.", ko: "부모님을 방문했어요." },
      { no: 39, en: "What did you eat for breakfast?", ko: "아침으로 무엇을 드셨나요?" },
      { no: 40, en: "I had toast and eggs.", ko: "토스트와 계란을 먹었어요." },
      { no: 41, en: "Do you like spicy food?", ko: "매운 음식을 좋아하세요?" },
      { no: 42, en: "Yes, I love spicy Korean food.", ko: "네, 저는 매운 한국 음식을 좋아해요." },
      { no: 43, en: "What hobbies do you have?", ko: "어떤 취미가 있으세요?" },
      { no: 44, en: "I enjoy playing the piano.", ko: "저는 피아노 치는 것을 즐깁니다." },
      { no: 45, en: "How do I get to the train station?", ko: "기차역에 어떻게 가나요?" },
      { no: 46, en: "Go straight and turn left at the corner.", ko: "직진하다가 모퉁이에서 왼쪽으로 도세요." },
      { no: 47, en: "What's your phone number?", ko: "전화번호가 어떻게 되세요?" },
      { no: 48, en: "My phone number is 010-1234-5678.", ko: "제 전화번호는 010-1234-5678입니다." },
      { no: 49, en: "I'd like to order a coffee, please.", ko: "커피 한 잔 주문하고 싶습니다." },
      { no: 50, en: "Could you speak more slowly, please?", ko: "좀 더 천천히 말씀해 주시겠어요?" },
      { no: 51, en: "I need to practice my English.", ko: "영어 연습을 해야 해요." },
      { no: 52, en: "What time does the movie start?", ko: "영화가 몇 시에 시작하나요?" },
      { no: 53, en: "I'll meet you at the coffee shop.", ko: "커피숍에서 만나요." },
      { no: 54, en: "Do you know how to cook?", ko: "요리할 줄 아세요?" },
      { no: 55, en: "I can make simple dishes.", ko: "간단한 요리는 할 수 있어요." },
      { no: 56, en: "Where did you learn English?", ko: "영어는 어디서 배웠어요?" },
      { no: 57, en: "I learned it in school and by myself.", ko: "학교에서 그리고 스스로 배웠어요." },
      { no: 58, en: "What are your plans for the weekend?", ko: "주말 계획이 어떻게 되세요?" },
      { no: 59, en: "I'm going to visit a museum.", ko: "박물관에 방문할 예정이에요." },
      { no: 60, en: "How long have you been studying English?", ko: "영어를 얼마나 오래 공부했나요?" },
      { no: 61, en: "I've been studying for three years.", ko: "3년 동안 공부해 왔어요." },
      { no: 62, en: "Would you like to join us for dinner?", ko: "저녁 식사에 함께하시겠어요?" },
      { no: 63, en: "I'd love to, thank you for inviting me.", ko: "네, 초대해 주셔서 감사합니다." },
      { no: 64, en: "How do you say this in Korean?", ko: "이것을 한국어로 어떻게 말하나요?" },
      { no: 65, en: "What is your favorite season?", ko: "가장 좋아하는 계절은 무엇인가요?" },
      { no: 66, en: "I like spring because of the cherry blossoms.", ko: "벚꽃 때문에 봄을 좋아해요." },
      { no: 67, en: "Do you prefer coffee or tea?", ko: "커피와 차 중 어떤 것을 더 선호하시나요?" },
      { no: 68, en: "I usually drink coffee in the morning.", ko: "보통 아침에 커피를 마셔요." },
      { no: 69, en: "Where is the nearest subway station?", ko: "가장 가까운 지하철역이 어디인가요?" },
      { no: 70, en: "It's about a five-minute walk from here.", ko: "여기서 약 5분 거리에 있어요." },
      { no: 71, en: "What kind of music do you like?", ko: "어떤 종류의 음악을 좋아하세요?" },
      { no: 72, en: "I enjoy listening to classical music.", ko: "클래식 음악 듣는 것을 즐깁니다." },
      { no: 73, en: "How was your trip to Jeju Island?", ko: "제주도 여행은 어땠나요?" },
      { no: 74, en: "It was amazing, I had a great time.", ko: "정말 좋았어요, 즐거운 시간을 보냈어요." },
      { no: 75, en: "What do you usually do on weekends?", ko: "주말에 보통 무엇을 하세요?" },
      { no: 76, en: "I often go hiking or meet friends.", ko: "자주 등산을 가거나 친구들을 만나요." },
      { no: 77, en: "How long does it take to get there?", ko: "그곳에 가는 데 얼마나 걸리나요?" },
      { no: 78, en: "It takes about 30 minutes by bus.", ko: "버스로 약 30분 정도 걸려요." },
      { no: 79, en: "Can I pay by credit card?", ko: "신용카드로 결제할 수 있나요?" },
      { no: 80, en: "Yes, we accept all major credit cards.", ko: "네, 모든 주요 신용카드를 받습니다." },
      { no: 81, en: "What's your favorite Korean dish?", ko: "가장 좋아하는 한국 음식은 무엇인가요?" },
      { no: 82, en: "I love bibimbap and kimchi jjigae.", ko: "비빔밥과 김치찌개를 좋아해요." },
      { no: 83, en: "How do you spend your free time?", ko: "여가 시간을 어떻게 보내세요?" },
      { no: 84, en: "I enjoy reading books and watching movies.", ko: "책 읽고 영화 보는 것을 즐깁니다." },
      { no: 85, en: "What did you do yesterday?", ko: "어제 무엇을 했나요?" },
      { no: 86, en: "I stayed home and cleaned my apartment.", ko: "집에 머물면서 아파트를 청소했어요." },
      { no: 87, en: "Do you exercise regularly?", ko: "정기적으로 운동하시나요?" },
      { no: 88, en: "Yes, I go to the gym three times a week.", ko: "네, 일주일에 세 번 헬스장에 가요." },
      { no: 89, en: "What's your dream job?", ko: "꿈의 직업은 무엇인가요?" },
      { no: 90, en: "I want to become a teacher someday.", ko: "언젠가 선생님이 되고 싶어요." },
      { no: 91, en: "How was the exam?", ko: "시험은 어땠나요?" },
      { no: 92, en: "It was quite difficult, but I think I did well.", ko: "꽤 어려웠지만, 잘 본 것 같아요." },
      { no: 93, en: "What are you doing this weekend?", ko: "이번 주말에 무엇을 하세요?" },
      { no: 94, en: "I'm planning to visit my grandparents.", ko: "조부모님을 방문할 계획이에요." },
      { no: 95, en: "Do you have any recommendations for restaurants?", ko: "추천할 만한 식당이 있나요?" },
      { no: 96, en: "There's a great Korean restaurant nearby.", ko: "근처에 좋은 한식당이 있어요." },
      { no: 97, en: "Could you take a picture of me, please?", ko: "제 사진 좀 찍어주시겠어요?" },
      { no: 98, en: "I'm looking forward to seeing you again.", ko: "다시 만나길 기대하고 있어요." },
      { no: 99, en: "What's the best way to learn a language?", ko: "언어를 배우는 가장 좋은 방법은 무엇인가요?" },
      { no: 100, en: "Practice speaking every day with native speakers.", ko: "원어민과 매일 말하기 연습을 하세요." },
    ];

    // 데이터베이스에 문장들을 추가합니다
    const createdSentences = await prisma.sentence.createMany({
      data: sentences.map((sentence) => ({
        ...sentence,
        contents: Contents.basic100,
      })),
      skipDuplicates: true, // no 필드가 unique로 설정되어 있으므로, 중복된 번호는 건너뜁니다
    });

    console.log(`${createdSentences.count}개의 문장이 추가되었습니다.`);
    return createdSentences;
  } catch (error) {
    console.error("문장 추가 중 오류가 발생했습니다:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 함수 실행
addBasic100Sentences()
  .then(() => console.log("문장 추가가 완료되었습니다."))
  .catch((error) => console.error("오류:", error));

export { addBasic100Sentences };

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedBasicSentences() {
  try {
    const basicSentences = [
      { contents: "wh100", no: 201, en: "What is your name?", ko: "당신의 이름은 무엇인가요?" },
      { contents: "wh100", no: 202, en: "How are you?", ko: "어떻게 지내세요?" },
      { contents: "wh100", no: 203, en: "I am fine, thank you.", ko: "저는 잘 지내요, 감사합니다." },
      { contents: "wh100", no: 204, en: "Where are you from?", ko: "당신은 어디서 오셨나요?" },
      { contents: "wh100", no: 205, en: "I am from Korea.", ko: "저는 한국에서 왔어요." },
      { contents: "wh100", no: 206, en: "Nice to meet you.", ko: "만나서 반가워요." },
      { contents: "wh100", no: 207, en: "What do you do?", ko: "당신은 무슨 일을 하세요?" },
      { contents: "wh100", no: 208, en: "I am a student.", ko: "저는 학생이에요." },
      { contents: "wh100", no: 209, en: "Can you help me?", ko: "저를 도와줄 수 있나요?" },
      { contents: "wh100", no: 210, en: "Sure, no problem.", ko: "물론이죠, 문제 없어요." },
      { contents: "wh100", no: 211, en: "What time is it?", ko: "지금 몇 시예요?" },
      { contents: "wh100", no: 212, en: "It's 3 o'clock.", ko: "3시예요." },
      { contents: "wh100", no: 213, en: "Where is the bathroom?", ko: "화장실이 어디에 있나요?" },
      { contents: "wh100", no: 214, en: "It's over there.", ko: "저쪽에 있어요." },
      { contents: "wh100", no: 215, en: "How much is this?", ko: "이거 얼마예요?" },
      { contents: "wh100", no: 216, en: "It is ten dollars.", ko: "10달러예요." },
      { contents: "wh100", no: 217, en: "Do you speak English?", ko: "영어 할 수 있나요?" },
      { contents: "wh100", no: 218, en: "A little bit.", ko: "조금이요." },
      { contents: "wh100", no: 219, en: "I don't understand.", ko: "이해하지 못했어요." },
      { contents: "wh100", no: 220, en: "Please say it again.", ko: "다시 말해 주세요." },
      { contents: "wh100", no: 221, en: "What does this mean?", ko: "이게 무슨 뜻이에요?" },
      { contents: "wh100", no: 222, en: "I like it.", ko: "마음에 들어요." },
      { contents: "wh100", no: 223, en: "I don't like it.", ko: "마음에 들지 않아요." },
      { contents: "wh100", no: 224, en: "I’m hungry.", ko: "배고파요." },
      { contents: "wh100", no: 225, en: "I’m thirsty.", ko: "목말라요." },
      { contents: "wh100", no: 226, en: "Let’s go.", ko: "가자요." },
      { contents: "wh100", no: 227, en: "Wait a moment, please.", ko: "잠시만 기다려 주세요." },
      { contents: "wh100", no: 228, en: "Excuse me.", ko: "실례합니다." },
      { contents: "wh100", no: 229, en: "I’m sorry.", ko: "죄송합니다." },
      { contents: "wh100", no: 230, en: "Thank you very much.", ko: "정말 감사합니다." },
      { contents: "wh100", no: 231, en: "You’re welcome.", ko: "천만에요." },
      { contents: "wh100", no: 232, en: "Good morning.", ko: "좋은 아침이에요." },
      { contents: "wh100", no: 233, en: "Good night.", ko: "안녕히 주무세요." },
      { contents: "wh100", no: 234, en: "See you later.", ko: "나중에 봐요." },
      { contents: "wh100", no: 235, en: "Take care.", ko: "잘 지내요." },
      { contents: "wh100", no: 236, en: "I love you.", ko: "사랑해요." },
      { contents: "wh100", no: 237, en: "Congratulations!", ko: "축하해요!" },
      { contents: "wh100", no: 238, en: "Happy birthday!", ko: "생일 축하해요!" },
      { contents: "wh100", no: 239, en: "Bless you!", ko: "행운을 빌어요!" },
      { contents: "wh100", no: 240, en: "Good luck!", ko: "행운을 빌어요!" },
      { contents: "wh100", no: 241, en: "That’s great!", ko: "정말 좋아요!" },
      { contents: "wh100", no: 242, en: "I’m tired.", ko: "피곤해요." },
      { contents: "wh100", no: 243, en: "Let’s eat.", ko: "먹자요." },
      { contents: "wh100", no: 244, en: "I’m full.", ko: "배불러요." },
      { contents: "wh100", no: 245, en: "Be careful.", ko: "조심하세요." },
      { contents: "wh100", no: 246, en: "What’s wrong?", ko: "무슨 일이에요?" },
      { contents: "wh100", no: 247, en: "I’m sick.", ko: "아파요." },
      { contents: "wh100", no: 248, en: "Call the police!", ko: "경찰을 불러주세요!" },
      { contents: "wh100", no: 249, en: "I need a doctor.", ko: "의사가 필요해요." },
      { contents: "wh100", no: 250, en: "This is my friend.", ko: "이쪽은 제 친구예요." },
      { contents: "wh100", no: 251, en: "I agree.", ko: "동의해요." },
      { contents: "wh100", no: 252, en: "I disagree.", ko: "동의하지 않아요." },
      { contents: "wh100", no: 253, en: "That's right.", ko: "맞아요." },
      { contents: "wh100", no: 254, en: "That's wrong.", ko: "틀려요." },
      { contents: "wh100", no: 255, en: "Don't worry.", ko: "걱정하지 마세요." },
      { contents: "wh100", no: 256, en: "Everything is okay.", ko: "모든 것이 괜찮아요." },
      { contents: "wh100", no: 257, en: "Can I ask you something?", ko: "질문 하나 해도 될까요?" },
      { contents: "wh100", no: 258, en: "Of course.", ko: "물론이죠." },
      { contents: "wh100", no: 259, en: "I don’t know.", ko: "모르겠어요." },
      { contents: "wh100", no: 260, en: "I know.", ko: "알아요." },
      { contents: "wh100", no: 261, en: "Is it far?", ko: "멀어요?" },
      { contents: "wh100", no: 262, en: "It’s near.", ko: "가까워요." },
      { contents: "wh100", no: 263, en: "Turn right.", ko: "오른쪽으로 도세요." },
      { contents: "wh100", no: 264, en: "Turn left.", ko: "왼쪽으로 도세요." },
      { contents: "wh100", no: 265, en: "Go straight.", ko: "직진하세요." },
      { contents: "wh100", no: 266, en: "Stop here.", ko: "여기서 멈춰 주세요." },
      { contents: "wh100", no: 267, en: "I have a reservation.", ko: "예약했어요." },
      { contents: "wh100", no: 268, en: "One moment, please.", ko: "잠시만요." },
      { contents: "wh100", no: 269, en: "Here you are.", ko: "여기 있어요." },
      { contents: "wh100", no: 270, en: "How many people?", ko: "몇 분이세요?" },
      { contents: "wh100", no: 271, en: "Just me.", ko: "저 혼자예요." },
      { contents: "wh100", no: 272, en: "What would you like?", ko: "무엇을 드릴까요?" },
      { contents: "wh100", no: 273, en: "I’d like this.", ko: "이걸로 주세요." },
      { contents: "wh100", no: 274, en: "Anything else?", ko: "더 필요하신 건 없나요?" },
      { contents: "wh100", no: 275, en: "That’s all.", ko: "그게 전부예요." },
      { contents: "wh100", no: 276, en: "Check, please.", ko: "계산서 주세요." },
      { contents: "wh100", no: 277, en: "Where can I buy a ticket?", ko: "티켓은 어디서 살 수 있나요?" },
      { contents: "wh100", no: 278, en: "How do I get there?", ko: "거기까지 어떻게 가요?" },
      { contents: "wh100", no: 279, en: "I lost my way.", ko: "길을 잃었어요." },
      { contents: "wh100", no: 280, en: "Can I use Wi-Fi?", ko: "와이파이 쓸 수 있나요?" },
      { contents: "wh100", no: 281, en: "What’s your phone number?", ko: "전화번호가 어떻게 되세요?" },
      { contents: "wh100", no: 282, en: "Please call me.", ko: "전화해 주세요." },
      { contents: "wh100", no: 283, en: "Let’s keep in touch.", ko: "계속 연락해요." },
      { contents: "wh100", no: 284, en: "I miss you.", ko: "보고 싶어요." },
      { contents: "wh100", no: 285, en: "Have a nice day!", ko: "좋은 하루 보내세요!" },
      { contents: "wh100", no: 286, en: "See you tomorrow.", ko: "내일 봐요." },
      { contents: "wh100", no: 287, en: "What’s this?", ko: "이게 뭐예요?" },
      { contents: "wh100", no: 288, en: "It’s a gift.", ko: "선물이예요." },
      { contents: "wh100", no: 289, en: "Don’t do that.", ko: "그러지 마세요." },
      { contents: "wh100", no: 290, en: "Please be quiet.", ko: "조용히 해 주세요." },
      { contents: "wh100", no: 291, en: "I’ll be back.", ko: "다녀올게요." },
      { contents: "wh100", no: 292, en: "Come here.", ko: "이리 오세요." },
      { contents: "wh100", no: 293, en: "Go away.", ko: "저리 가세요." },
      { contents: "wh100", no: 294, en: "I’m home.", ko: "집에 왔어요." },
      { contents: "wh100", no: 295, en: "Who is it?", ko: "누구세요?" },
      { contents: "wh100", no: 296, en: "It’s me.", ko: "저예요." },
      { contents: "wh100", no: 297, en: "Long time no see.", ko: "오랜만이에요." },
      { contents: "wh100", no: 298, en: "What’s your hobby?", ko: "취미가 뭐예요?" },
      { contents: "wh100", no: 299, en: "I like reading.", ko: "독서를 좋아해요." },
      { contents: "wh100", no: 300, en: "I like listening to music.", ko: "음악 듣는 걸 좋아해요." },
    ];

    // 데이터 일괄 생성
    const createdSentences = await prisma.sentence.createMany({
      data: basicSentences.map((sentence) => ({
        contents: sentence.contents as "wh100" | "basic100" | "tour100",
        no: sentence.no,
        en: sentence.en,
        ko: sentence.ko,
      })),
      skipDuplicates: true, // 중복된 no 값이 있는 경우 건너뜀
    });

    console.log(`${createdSentences.count}개의 문장이 추가되었습니다.`);
    return createdSentences;
  } catch (error) {
    console.error("문장 데이터 추가 중 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 함수 실행
seedBasicSentences()
  .then(() => console.log("문장 데이터 추가가 완료되었습니다."))
  .catch(console.error);

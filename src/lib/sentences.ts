export const sentences = [
  // 출국 및 입국 (Airport & Immigration)
  { no: 1, en: "Where is the check-in counter for Korean Air?", ko: "대한항공 체크인 카운터가 어디인가요?" },
  { no: 2, en: "Can I have an aisle seat, please?", ko: "통로 좌석으로 주세요." },
  { no: 3, en: "How many bags can I check in?", ko: "부칠 수 있는 가방은 몇 개인가요?" },
  { no: 4, en: "Do I need to take out my laptop for security screening?", ko: "보안 검색대에서 노트북을 꺼내야 하나요?" },
  { no: 5, en: "Where is the immigration counter?", ko: "출입국 심사대가 어디인가요?" },
  { no: 6, en: "I am here for business.", ko: "출장 목적으로 왔습니다." }, // 기존 관광 -> 출장으로 변경
  { no: 7, en: "I will be staying for two weeks.", ko: "저는 2주 동안 머물 예정입니다." }, // 기간 변경
  { no: 8, en: "Here is my hotel reservation.", ko: "여기 제 호텔 예약 확인서입니다." }, // 기존 항공권 -> 호텔 예약으로 변경
  { no: 9, en: "Where can I get a SIM card?", ko: "심카드는 어디에서 살 수 있나요?" }, // 새로운 문장 추가
  { no: 10, en: "How long does it take to get through customs?", ko: "세관 통과하는 데 얼마나 걸리나요?" }, // 새로운 문장 추가

  // 교통 (Transportation)
  { no: 11, en: "Where can I get a taxi?", ko: "택시는 어디에서 탈 수 있나요?" },
  { no: 12, en: "How much is the fare to the city center?", ko: "시내까지 요금이 얼마인가요?" },
  { no: 13, en: "Can you take me to this hotel?", ko: "이 호텔로 가주세요." },
  { no: 14, en: "Does this bus go to the train station?", ko: "이 버스가 기차역으로 가나요?" },
  { no: 15, en: "Where is the nearest bus stop?", ko: "가장 가까운 버스 정류장은 어디인가요?" }, // 기존 지하철역에서 버스로 변경
  { no: 16, en: "How do I use the subway ticket machine?", ko: "지하철 티켓 기계는 어떻게 사용하나요?" }, // 새로운 문장 추가
  { no: 17, en: "What time is the last train?", ko: "마지막 기차는 몇 시인가요?" }, // 새로운 문장 추가
  { no: 18, en: "Can I use my credit card for public transportation?", ko: "대중교통 요금을 신용카드로 결제할 수 있나요?" }, // 새로운 문장 추가
  { no: 19, en: "Do I need a reservation for this train?", ko: "이 기차를 타려면 예약이 필요한가요?" }, // 기존 환승 질문 대신 변경
  { no: 20, en: "Where can I rent a bicycle?", ko: "자전거를 어디에서 빌릴 수 있나요?" }, // 기존 렌터카 대신 자전거로 변경

  // 숙박 (Hotel)
  { no: 21, en: "I have a reservation under the name John Doe.", ko: "John Doe 이름으로 예약했습니다." },
  { no: 22, en: "Do you have any non-smoking rooms?", ko: "금연 객실이 있나요?" }, // 기존 빈 방 -> 금연 객실로 변경
  { no: 23, en: "Can I get an extra pillow?", ko: "베개를 추가로 받을 수 있나요?" }, // 기존 방 보기 -> 베개 추가로 변경
  { no: 24, en: "What time is breakfast served?", ko: "조식은 몇 시부터 제공되나요?" }, // 체크인/체크아웃 질문 대체
  { no: 25, en: "Is there a laundry service available?", ko: "세탁 서비스가 있나요?" }, // 기존 전망 요청 대신 변경
  { no: 26, en: "Can you recommend a nearby restaurant?", ko: "근처에 추천할 만한 식당이 있나요?" }, // 기존 조식 포함 여부 대신 변경
  { no: 27, en: "The air conditioning is not working.", ko: "에어컨이 작동하지 않아요." }, // 기존 와이파이 문제 대신 변경
  { no: 28, en: "Can I get a late check-out?", ko: "늦은 체크아웃이 가능한가요?" }, // 새로운 문장 추가

  // 레저 & 액티비티 (Leisure & Activities)
  { no: 29, en: "Where can I book a tour?", ko: "투어 예약은 어디에서 할 수 있나요?" },
  { no: 30, en: "Are there any local festivals happening now?", ko: "지금 열리는 지역 축제가 있나요?" },
  { no: 31, en: "Can I rent hiking gear here?", ko: "여기서 등산 장비를 빌릴 수 있나요?" },
  { no: 32, en: "Where is the best place for nightlife?", ko: "야간 유흥을 즐기기에 가장 좋은 곳은 어디인가요?" },
  { no: 33, en: "Are there any water sports available?", ko: "수상 스포츠를 즐길 수 있는 곳이 있나요?" },
  { no: 34, en: "Where can I watch a traditional performance?", ko: "전통 공연을 볼 수 있는 곳이 어디인가요?" },
  { no: 35, en: "Can I join a cooking class?", ko: "요리 클래스에 참여할 수 있나요?" },

  // 긴급 상황 (Emergency)
  { no: 36, en: "Help!", ko: "도와주세요!" },
  { no: 37, en: "Call the police!", ko: "경찰을 불러주세요!" },
  { no: 38, en: "I lost my passport.", ko: "여권을 잃어버렸어요." },
  { no: 39, en: "I need to see a doctor.", ko: "병원에 가야 해요." },
  { no: 40, en: "Where is the nearest pharmacy?", ko: "가장 가까운 약국이 어디인가요?" }, // 기존 병원 대신 변경
  { no: 41, en: "My phone has been stolen.", ko: "제 핸드폰이 도난당했어요." }, // 기존 지갑 도난 -> 핸드폰 도난으로 변경
  { no: 42, en: "Can you call an ambulance?", ko: "구급차 불러줄 수 있나요?" },
  { no: 43, en: "Where is the embassy of Korea?", ko: "대한민국 대사관이 어디인가요?" },
  { no: 44, en: "I need help with translation.", ko: "통역 도움이 필요해요." }, // 기존 '통역사가 필요해요' 문장을 자연스럽게 변경

  // 쇼핑
  { no: 45, en: "Can I get a discount?", ko: "할인 가능할까요?" },
  { no: 46, en: "I’ll take this.", ko: "이거 살게요." },
  { no: 47, en: "Can I return this if it doesn’t fit?", ko: "맞지 않으면 환불 가능한가요?" },
  { no: 48, en: "Where is the tax refund counter?", ko: "택스 리펀드 받는 곳이 어디인가요?" },
  { no: 49, en: "Can you gift-wrap this?", ko: "선물 포장해 주실 수 있나요?" },
  { no: 50, en: "Do you have a shopping bag?", ko: "쇼핑백 있나요?" },

  // 식사 (Dining)
  { no: 51, en: "Do you have an English menu?", ko: "영어 메뉴가 있나요?" },
  { no: 52, en: "What do you recommend?", ko: "추천 메뉴는 무엇인가요?" },
  { no: 53, en: "I would like to order a steak.", ko: "스테이크를 주문하고 싶어요." },
  { no: 54, en: "Is this dish spicy?", ko: "이 음식은 매운가요?" },
  { no: 55, en: "Can I have this without onions?", ko: "양파 없이 만들어 주실 수 있나요?" },
  { no: 56, en: "I have a food allergy to onions.", ko: "저는 양파 알레르기가 있어요." },
  { no: 57, en: "Can I get the check, please?", ko: "계산서 주세요." },
  { no: 58, en: "Do you take credit cards?", ko: "신용카드 사용 가능한가요?" },
  { no: 59, en: "Is there a vegetarian option?", ko: "채식 메뉴가 있나요?" },
  { no: 60, en: "This is delicious!", ko: "정말 맛있어요!" },

  // 관광 (Sightseeing)
  { no: 61, en: "Where is the tourist information center?", ko: "관광 안내소가 어디인가요?" },
  { no: 62, en: "What are the must-visit places here?", ko: "여기에서 꼭 가봐야 할 곳은 어디인가요?" },
  { no: 63, en: "How much is the entrance fee?", ko: "입장료가 얼마인가요?" },
  { no: 64, en: "What time does this place open and close?", ko: "이곳은 몇 시에 열고 닫나요?" },
  { no: 65, en: "Is there a guided tour available?", ko: "가이드 투어가 있나요?" },
  { no: 66, en: "Can I take pictures here?", ko: "여기서 사진을 찍어도 되나요?" },
  { no: 67, en: "Where is the best place to take pictures?", ko: "사진 찍기 좋은 장소는 어디인가요?" },
  { no: 68, en: "Are there any special events happening today?", ko: "오늘 특별한 행사가 있나요?" },
  { no: 69, en: "How do I get to the museum?", ko: "박물관으로 가려면 어떻게 해야 하나요?" },
  { no: 70, en: "Is there an audio guide available?", ko: "오디오 가이드가 있나요?" },

  // 커뮤니케이션 (Communication)
  { no: 71, en: "Do you speak English?", ko: "영어를 하실 수 있나요?" },
  { no: 72, en: "Can you speak more slowly, please?", ko: "좀 더 천천히 말씀해 주실 수 있나요?" },
  { no: 73, en: "Can you write it down for me?", ko: "그것을 적어 주실 수 있나요?" },
  { no: 74, en: "How do you say this in English?", ko: "이걸 영어로 어떻게 말하나요?" },
  { no: 75, en: "Could you repeat that, please?", ko: "다시 한 번 말씀해 주시겠어요?" },
  { no: 76, en: "I don’t understand.", ko: "이해하지 못했어요." },
  { no: 77, en: "I’m learning English.", ko: "저는 영어를 배우고 있어요." },
  { no: 78, en: "Can you recommend a good language app?", ko: "좋은 언어 학습 앱을 추천해 주실 수 있나요?" },
  { no: 79, en: "I need a translator.", ko: "통역사가 필요해요." },
  { no: 80, en: "Could you help me with this translation?", ko: "이 번역을 도와주실 수 있나요?" },

  // 은행 & 환전 (Bank & Exchange)
  { no: 81, en: "Where is the nearest ATM?", ko: "가장 가까운 ATM 이 어디인가요?" },
  { no: 82, en: "Can I exchange money here?", ko: "여기서 환전할 수 있나요?" },
  { no: 83, en: "How much local currency will I get for 100 USD?", ko: "100달러를 환전하면 현지 화폐로 얼마를 받을 수 있나요?" },
  { no: 84, en: "Can I withdraw cash with this card?", ko: "이 카드로 현금을 인출할 수 있나요?" },
  { no: 85, en: "Do you accept traveler’s checks?", ko: "여행자 수표를 받나요?" },
  { no: 86, en: "I lost my credit card. Can you help me?", ko: "신용카드를 잃어버렸어요. 도와줄 수 있나요?" },
  { no: 87, en: "I need to report a lost or stolen card.", ko: "분실 또는 도난 신고를 해야 합니다." },
  { no: 88, en: "How long does an international transfer take?", ko: "국제 송금은 얼마나 걸리나요?" },
  { no: 89, en: "Is there a fee for currency exchange?", ko: "환전 수수료가 있나요?" },
  { no: 90, en: "Can I open a bank account as a tourist?", ko: "관광객으로 은행 계좌를 개설할 수 있나요?" },

  // 문화 & 소셜 (Culture & Socializing)
  { no: 91, en: "How do I say 'hello' in the local language?", ko: "현지어로 '안녕하세요'는 어떻게 말하나요?" },
  { no: 92, en: "Is it okay to take photos here?", ko: "여기서 사진을 찍어도 괜찮나요?" },
  { no: 93, en: "What are some local customs I should know?", ko: "알아야 할 현지 문화나 예절이 있나요?" },
  { no: 94, en: "Where can I experience traditional music or dance?", ko: "전통 음악이나 춤을 볼 수 있는 곳이 어디인가요?" },
  { no: 95, en: "Can you recommend a good place to meet locals?", ko: "현지인들을 만날 수 있는 좋은 장소를 추천해 주시겠어요?" },

  // 업무 & 비즈니스 (Work & Business)
  { no: 96, en: "Where can I print or scan documents?", ko: "문서를 인쇄하거나 스캔할 수 있는 곳이 어디인가요?" },
  { no: 97, en: "Can I book a meeting room here?", ko: "여기에서 회의실을 예약할 수 있나요?" },
  { no: 98, en: "What is the dress code for business meetings here?", ko: "이곳의 비즈니스 미팅 복장은 어떻게 되나요?" },
  { no: 99, en: "Can I get an invoice for this purchase?", ko: "이 구매에 대한 영수증(인보이스)을 받을 수 있을까요?" },
  { no: 100, en: "How do I get to the convention center?", ko: "컨벤션 센터로 가려면 어떻게 해야 하나요?" },
];

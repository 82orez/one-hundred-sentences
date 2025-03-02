import { prisma } from "@/lib/prisma";

async function updateAudioUrls() {
  const sentences = await prisma.sentence.findMany();

  for (const sentence of sentences) {
    const fileNumber = String(sentence.no).padStart(3, "0"); // ✅ 3자리 숫자로 변환 (ex: 001, 002, ..., 100)
    const audioUrl = `https://krgsfzhqitjtaasgupsv.supabase.co/storage/v1/object/public/one-hundred-sentences/${fileNumber}.mp3`;

    await prisma.sentence.update({
      where: { id: sentence.id },
      data: { audioUrl },
    });
  }
}

// 실행
updateAudioUrls()
  .then(() => console.log("Audio URLs updated successfully!"))
  .catch((error) => console.error("Error updating audio URLs:", error));

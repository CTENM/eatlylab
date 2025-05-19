
// 📌 여기에 본인의 API 키 입력하세요


function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

async function diagnoseCalorie() {
    const input = document.getElementById("calorieImage");
    const file = input.files[0];
    const resultDiv = document.getElementById("calorieResult");
    resultDiv.innerHTML = "🔄 진단 중입니다...";

    if (!file) {
        resultDiv.innerHTML = "⚠️ 사진을 업로드해주세요.";
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async function () {
        const base64Image = reader.result.split(",")[1];

        try {
            // Vision API 요청
            const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requests: [{
                        image: { content: base64Image },
                        features: [{ type: "LABEL_DETECTION", maxResults: 5 }]
                    }]
                })
            });

            const visionData = await visionResponse.json();
            const labels = visionData.responses[0].labelAnnotations.map(l => l.description).join(", ");

            // GPT 요청
            const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": gptApiKey
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "user",
                        content: `이 음식 조합(${labels})의 칼로리를 대략 계산하고 건강한 식단인지 감정 피드백을 주세요. 점수(100점 만점)도 주세요.`
                    }],
                    temperature: 0.7
                })
            });

            const gptData = await gptResponse.json();
            const gptText = gptData.choices[0].message.content;

            resultDiv.innerHTML = `<p>🍽️ 감지된 음식: <b>${labels}</b></p><p>${gptText}</p>`;
        } catch (error) {
            resultDiv.innerHTML = "❌ 오류 발생: " + error.message;
        }
    };

    reader.readAsDataURL(file);
}

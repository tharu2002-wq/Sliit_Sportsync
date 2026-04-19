/**
 * Calls Google Gemini generateContent (AI Studio API).
 * @param {string} apiKey
 * @param {string} model e.g. gemini-2.5-flash
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
async function generateGeminiText(apiKey, model, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 1200,
      },
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    let detail = raw || `Gemini request failed (${res.status})`;
    try {
      const errJson = JSON.parse(raw);
      const msg = errJson?.error?.message;
      if (msg) detail = msg;
    } catch {
      /* keep raw */
    }
    throw new Error(detail);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from Gemini");
  }

  const block = data.promptFeedback?.blockReason;
  if (block) {
    throw new Error(`Gemini blocked the request: ${block}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    const reason = data.candidates?.[0]?.finishReason;
    throw new Error(reason ? `No summary text (finish: ${reason})` : "No summary text from Gemini");
  }

  return text.trim();
}

module.exports = { generateGeminiText };

import { GoogleGenAI, Type } from '@google/genai';
import type { PatientData, ChatMessage, RiskLevel, WeatherData, WeatherImpactAnalysis, FactorAnalysis } from '../types';
import type { Language } from '../contexts/LanguageContext';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a mock AI service.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const prompts = {
    fr: {
        systemInstruction: (d?: PatientData) => `Vous êtes "Sentinelle IA", un assistant de santé IA amical et empathique pour les patients atteints de BPCO. Votre ton doit toujours être rassurant, simple et encourageant. Vous n'êtes pas un médecin et ne devez jamais donner de diagnostic. Votre rôle est d'aider le patient à suivre son état et à communiquer avec son équipe de soins. Contexte du patient actuel : ${d?.condition || 'N/A'}, Âge : ${d?.age || 'N/A'}.`,
        initialGreeting: "Générez un message d'accueil amical, court et positif pour commencer la journée, en français.",
        proactiveQuestion: (risk: string, vitals: string) => `En vous basant sur les données patient suivantes, générez une question à choix multiples pertinente, empathique et simple en français. La question doit être conversationnelle et facile à comprendre. Évitez le jargon médical. Niveau de risque actuel du patient : ${risk}.\nDonnées:\n${vitals}`,
        analyzeResponse: (q: string, r: string) => `Un patient a reçu la question : "${q}". Le patient a répondu : "${r}". Générez un message de suivi court, empathique et encourageant en français.`,
        weatherImpact: (p: PatientData, w: WeatherData) => `En tant qu'expert médical en IA, analysez l'impact de la météo sur un patient BPCO. Patient : ${p.condition}, Météo : ${w.temperature}°C, ${w.humidity}% humidité, IQA: ${w.airQualityIndex}. Rédigez un résumé concis (max 40 mots, en français) de l'impact potentiel.`,
        predictionAnalysis: (p: PatientData, score: number, level: string) => `En tant qu'IA médicale experte, analysez les données pour un patient BPCO.
Données du patient:
- Âge: ${p.age}
- Condition: ${p.condition}
- Derniers signes vitaux: SpO2=${p.measurements[p.measurements.length - 1]?.spo2 ?? 'N/A'}, FC=${p.measurements[p.measurements.length - 1]?.heartRate ?? 'N/A'}
- Données smartphone récentes: Pas=${p.smartphone.activity.steps}, Sommeil=${p.smartphone.sleep.totalSleepHours}h, Toux/heure=${p.smartphone.cough.coughFrequencyPerHour}
Score de Risque : ${score} (Niveau : ${level}).
Fournissez d'abord un résumé concis (2-3 phrases) expliquant la situation globale du patient. Ensuite, identifiez les 3 facteurs les plus importants contribuant au score. Enfin, proposez 3 recommandations claires et réalisables pour un médecin. La réponse doit être en français.`
    },
    en: {
        systemInstruction: (d?: PatientData) => `You are "Sentinel AI", a friendly and empathetic AI health assistant for COPD patients. Your tone should always be reassuring, simple, and encouraging. You are not a doctor and must never give a diagnosis. Your role is to help the patient monitor their condition and communicate with their care team. Current patient context: ${d?.condition || 'N/A'}, Age: ${d?.age || 'N/A'}.`,
        initialGreeting: "Generate a friendly, short, and positive greeting to start the day, in English.",
        proactiveQuestion: (risk: string, vitals: string) => `Based on the following patient data, generate a relevant, empathetic, and simple multiple-choice question in English. The question should be conversational and easy to understand. Avoid medical jargon. Patient's current risk level: ${risk}.\nData:\n${vitals}`,
        analyzeResponse: (q: string, r: string) => `A patient was asked: "${q}". The patient replied: "${r}". Generate a short, empathetic, and encouraging follow-up message in English.`,
        weatherImpact: (p: PatientData, w: WeatherData) => `As an AI medical expert, analyze the impact of the weather on a COPD patient. Patient: ${p.condition}, Weather: ${w.temperature}°C, ${w.humidity}% humidity, AQI: ${w.airQualityIndex}. Write a concise summary (max 40 words, in English) of the potential impact.`,
        predictionAnalysis: (p: PatientData, score: number, level: string) => `As an expert medical AI, analyze the data for a COPD patient.
Patient data:
- Age: ${p.age}
- Condition: ${p.condition}
- Latest vitals: SpO2=${p.measurements[p.measurements.length - 1]?.spo2 ?? 'N/A'}, HR=${p.measurements[p.measurements.length - 1]?.heartRate ?? 'N/A'}
- Recent smartphone data: Steps=${p.smartphone.activity.steps}, Sleep=${p.smartphone.sleep.totalSleepHours}h, Coughs/hr=${p.smartphone.cough.coughFrequencyPerHour}
Risk Score: ${score} (Level: ${level}).
First, provide a concise summary (2-3 sentences) explaining the patient's overall situation. Then, identify the 3 most important factors contributing to the score. Finally, provide 3 clear, actionable recommendations for a doctor. The response must be in English.`
    },
    ar: {
        systemInstruction: (d?: PatientData) => `أنت "الرقيب AI"، مساعد صحي ذكي وداعم لمرضى الانسداد الرئوي المزمن. يجب أن تكون نبرتك دائمًا مطمئنة وبسيطة ومشجعة. أنت لست طبيبًا ويجب ألا تقدم تشخيصًا أبدًا. دورك هو مساعدة المريض على مراقبة حالته والتواصل مع فريق الرعاية الخاص به. سياق المريض الحالي: ${d?.condition || 'غير متوفر'}, العمر: ${d?.age || 'غير متوفر'}.`,
        initialGreeting: "أنشئ تحية ودية وقصيرة وإيجابية لبدء اليوم، باللغة العربية.",
        proactiveQuestion: (risk: string, vitals: string) => `بناءً على بيانات المريض التالية، قم بإنشاء سؤال مناسب ومتعاطف وبسيط بصيغة الاختيار من متعدد باللغة العربية. يجب أن يكون السؤال حواريًا وسهل الفهم. تجنب المصطلحات الطبية. مستوى الخطورة الحالي للمريض: ${risk}.\nالبيانات:\n${vitals}`,
        analyzeResponse: (q: string, r: string) => `تم طرح السؤال التالي على المريض: "${q}". أجاب المريض: "${r}". قم بإنشاء رسالة متابعة قصيرة وداعمة ومشجعة باللغة العربية.`,
        weatherImpact: (p: PatientData, w: WeatherData) => `كخبير طبي في الذكاء الاصطناعي، قم بتحليل تأثير الطقس على مريض الانسداد الرئوي المزمن. المريض: ${p.condition}، الطقس: ${w.temperature}°م، ${w.humidity}% رطوبة، مؤشر جودة الهواء: ${w.airQualityIndex}. اكتب ملخصًا موجزًا (بحد أقصى 40 كلمة، باللغة العربية) للتأثير المحتمل.`,
        predictionAnalysis: (p: PatientData, score: number, level: string) => `بصفتك ذكاءً اصطناعيًا طبيًا خبيرًا، قم بتحليل بيانات مريض الانسداد الرئوي المزمن.
بيانات المريض:
- العمر: ${p.age}
- الحالة: ${p.condition}
- آخر العلامات الحيوية: تشبع الأكسجين=${p.measurements[p.measurements.length - 1]?.spo2 ?? 'N/A'}, معدل ضربات القلب=${p.measurements[p.measurements.length - 1]?.heartRate ?? 'N/A'}
- بيانات الهاتف الذكي الحديثة: الخطوات=${p.smartphone.activity.steps}, النوم=${p.smartphone.sleep.totalSleepHours} ساعة, السعال/ساعة=${p.smartphone.cough.coughFrequencyPerHour}
درجة الخطورة: ${score} (المستوى: ${level}).
أولاً، قدم ملخصًا موجزًا (2-3 جمل) يشرح الوضع العام للمريض. بعد ذلك، حدد أهم 3 عوامل مساهمة في النتيجة. أخيرًا، قدم 3 توصيات واضحة وقابلة للتنفيذ للطبيب. يجب أن تكون الإجابة باللغة العربية.`
    }
};

const getActiveAI = () => ai || mockAi;

const getSystemInstruction = (lang: Language, patientData?: PatientData) => {
    return prompts[lang].systemInstruction(patientData);
};

// --- Mock Service for development without API Key ---
const mockAi = {
    models: {
        generateContent: async (params: any): Promise<{ text: string }> => {
            await new Promise(res => setTimeout(res, 500));
            const content = params.contents[0]?.parts[0]?.text || "";
            if (content.includes("expert medical AI") || content.includes("خبيرًا")) { // Prediction
                return { text: JSON.stringify({ summary: "Patient shows signs of decline due to reduced mobility (mock).", contributingFactors: [{ name: 'Mobility Drop (mock)', impact: 'high', description: "Steps are 45% below average." }], recommendations: ["Schedule consultation (mock)."] })};
            }
            if (params.config?.responseSchema?.properties?.impactLevel) { // Weather
                return { text: JSON.stringify({ impactLevel: "Medium", summary: "High humidity may increase irritation. Caution advised." })};
            }
            if (params.config?.responseSchema) { // Proactive question
                return { text: JSON.stringify({ question: "I noticed your activity was lower today. How are you feeling?", type: "multiple_choice", options: ["More tired", "I feel fine", "A bit breathless"] })};
            }
            return { text: "Hello! I am your AI Health Assistant. How can I help?" };
        },
        generateContentStream: async function* (params: any) {
            yield { text: "This is a mock response. " };
            yield { text: "Please provide a valid API_KEY to use Gemini. " };
        }
    }
};


export async function getInitialGreeting(lang: Language): Promise<string> {
    try {
        const response = await getActiveAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{role: 'user', parts: [{text: prompts[lang].initialGreeting }]}],
            config: { systemInstruction: getSystemInstruction(lang) }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting initial greeting:", error);
        const fallbacks = { fr: "Bonjour ! Comment vous sentez-vous aujourd'hui ?", en: "Hello! How are you feeling today?", ar: "مرحباً! كيف تشعر اليوم؟" };
        return fallbacks[lang];
    }
}

export async function* getAIResponseStream(
    history: ChatMessage[],
    patientData: PatientData,
    lang: Language
): AsyncGenerator<string, void, undefined> {
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const responseStream = await getActiveAI().models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction: getSystemInstruction(lang, patientData) }
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error getting AI response stream:", error);
        const fallbacks = { fr: "Une erreur est survenue. Veuillez réessayer.", en: "An error occurred. Please try again.", ar: "حدث خطأ. يرجى المحاولة مرة أخرى." };
        yield fallbacks[lang];
    }
}

export async function getProactiveQuestion(patientData: PatientData, riskLevel: RiskLevel, lang: Language): Promise<ChatMessage | null> {
    const latestMeasurement = patientData.measurements.length > 0 ? patientData.measurements[patientData.measurements.length - 1] : null;
    const riskTranslations = { fr: { High: 'Élevé', Medium: 'Moyen', Low: 'Faible' }, en: { High: 'High', Medium: 'Medium', Low: 'Low' }, ar: { High: 'مرتفع', Medium: 'متوسط', Low: 'منخفض' } };
    const translatedRisk = riskTranslations[lang][riskLevel];
    const vitalsPrompt = latestMeasurement ? `- SpO2: ${latestMeasurement.spo2}%, HR: ${latestMeasurement.heartRate} bpm\n` : `- Vitals N/A.\n`;
    const prompt = prompts[lang].proactiveQuestion(translatedRisk, vitalsPrompt);

    try {
        const response = await getActiveAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: getSystemInstruction(lang, patientData),
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, type: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } } } }
            }
        });
        const json = JSON.parse(response.text);
        return { role: 'model', text: json.question, questionType: json.type, options: json.options };
    } catch (error) {
        console.error("Error generating proactive question:", error);
        const fallbacks = { fr: "Comment vous sentez-vous en ce moment ?", en: "How are you feeling right now?", ar: "كيف تشعر الآن؟" };
        return { role: 'model', text: fallbacks[lang] };
    }
}

export async function analyzeUserResponse(originalQuestion: string, userResponse: string, patientData: PatientData, lang: Language): Promise<string> {
    const prompt = prompts[lang].analyzeResponse(originalQuestion, userResponse);
    try {
        const response = await getActiveAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { systemInstruction: getSystemInstruction(lang, patientData) }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing user response:", error);
        const fallbacks = { fr: "Merci pour ce retour.", en: "Thank you for sharing.", ar: "شكرا لمشاركتك." };
        return fallbacks[lang];
    }
}

export async function analyzeWeatherImpact(patient: PatientData, weather: WeatherData, lang: Language): Promise<WeatherImpactAnalysis> {
    const prompt = prompts[lang].weatherImpact(patient, weather);
    try {
        const response = await getActiveAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are an AI assistant specialized in environmental risk analysis for respiratory diseases.",
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { impactLevel: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['impactLevel', 'summary'] }
            }
        });
        return JSON.parse(response.text) as WeatherImpactAnalysis;
    } catch (error) {
        console.error("Error analyzing weather impact:", error);

        const errorDetail = (error as any)?.cause?.error || (error as any)?.error || error;
        let errorMessage: string;

        if (errorDetail?.code === 429 || errorDetail?.status === 'RESOURCE_EXHAUSTED') {
            errorMessage = "API quota has been exceeded. Please check your plan and billing details.";
        } else {
            errorMessage = "The AI impact analysis could not be performed. Please try again later.";
        }

        const fallbacks: { [key in Language]: { impactLevel: 'Medium', summary: string } } = {
            fr: { impactLevel: 'Medium', summary: "Analyse IA indisponible." },
            en: { impactLevel: 'Medium', summary: "AI analysis unavailable." },
            ar: { impactLevel: 'Medium', summary: "تحليل الذكاء الاصطناعي غير متوفر." }
        };
        
        return {
            ...fallbacks[lang],
            error: errorMessage
        };
    }
}

export async function analyzePatientDataForPrediction(patient: PatientData, riskScore: number, level: RiskLevel, lang: Language): Promise<{ summary: string, contributingFactors: FactorAnalysis[], recommendations: string[], error?: string }> {
    const riskTranslations = { fr: { High: 'Élevé', Medium: 'Moyen', Low: 'Faible' }, en: { High: 'High', Medium: 'Medium', Low: 'Low' }, ar: { High: 'مرتفع', Medium: 'متوسط', Low: 'منخفض' } };
    const prompt = prompts[lang].predictionAnalysis(patient, riskScore, riskTranslations[lang][level]);
    try {
        const response = await getActiveAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are an AI assistant for healthcare professionals, specializing in predictive analysis for chronic diseases like COPD.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        contributingFactors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] }, description: { type: Type.STRING } }, required: ['name', 'impact', 'description'] } },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['summary', 'contributingFactors', 'recommendations']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing patient data for prediction:", error);

        const errorDetail = (error as any)?.cause?.error || (error as any)?.error || error;
        let errorMessage: string;
        
        if (errorDetail?.code === 429 || errorDetail?.status === 'RESOURCE_EXHAUSTED') {
            errorMessage = "API quota has been exceeded. Please check your plan and billing details.";
        } else {
            errorMessage = "The AI prediction service failed to generate an analysis. Please try again.";
        }
        
        const fallbacks: { [key in Language]: { summary: string, contributingFactors: FactorAnalysis[], recommendations: string[] } } = {
            fr: { summary: "L'analyse IA n'a pas pu être complétée.", contributingFactors: [{ name: 'Erreur d\'analyse IA', impact: 'high', description: errorMessage }], recommendations: ['Vérifiez manuellement les signes vitaux et les données du smartphone.'] },
            en: { summary: "The AI analysis could not be completed.", contributingFactors: [{ name: 'AI Analysis Error', impact: 'high', description: errorMessage }], recommendations: ['Manually check vitals and smartphone data.'] },
            ar: { summary: "لم يتمكن تحليل الذكاء الاصطناعي من الاكتمال.", contributingFactors: [{ name: 'خطأ في تحليل الذكاء الاصطناعي', impact: 'high', description: errorMessage }], recommendations: ['تحقق يدويًا من العلامات الحيوية وبيانات الهاتف الذكي.'] }
        };

        const fallbackData = fallbacks[lang];

        return { 
            ...fallbackData,
            error: errorMessage
        };
    }
}
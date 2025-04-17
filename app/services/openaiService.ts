import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import OpenAI from "openai-react-native";

import { MODEL_NAME, SYSTEM_PROMPT } from "../constants/chatConstants";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

let openaiClient: OpenAI | null = null;

export const initializeOpenAI = async (): Promise<OpenAI> => {
  if (openaiClient) {
    return openaiClient;
  }

  initializeApp(firebaseConfig);
  const auth = getAuth();
  const creds = await signInAnonymously(auth);

  openaiClient = new OpenAI({
    baseURL: process.env.EXPO_PUBLIC_BACKMESH_URL!,
    apiKey: await creds.user.getIdToken(),
  });

  return openaiClient;
};

export const generateChatResponse = async (
  client: OpenAI,
  userMessage: string,
  patientData: unknown,
): Promise<string> => {
  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + JSON.stringify(patientData),
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      stream: false,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

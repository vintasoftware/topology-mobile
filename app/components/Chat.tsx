import OpenAI from "openai-react-native";
import React, { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  DEFAULT_WELCOME_MESSAGE,
  ERROR_MESSAGE,
  WELCOME_MESSAGE,
} from "../constants/chatConstants";
import { usePatient } from "../context/PatientContext";
import { SmarterFhirContext } from "../context/SmarterFhirContext";
import {
  generateChatResponse,
  initializeOpenAI,
} from "../services/openaiService";
import { Message } from "../types/chat";
import { ChatContainer } from "./ChatContainer";
import { InputArea } from "./InputArea";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [client, setClient] = useState<OpenAI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const patientData = usePatient();
  const { client: fhirClient } = useContext(SmarterFhirContext);

  useEffect(() => {
    // Only initialize chat when user is logged in
    if (fhirClient) {
      const setupChat = async () => {
        try {
          const newClient = await initializeOpenAI();
          setClient(newClient);
          await initializeWithWelcomeMessage(newClient);
        } catch (error) {
          console.error("Error setting up chat:", error);
        }
      };

      setupChat();
    }
  }, [fhirClient]);

  const updateLastAssistantMessage = (
    messages: Message[],
    text: string,
    status: "sending" | "sent" | "error",
  ) => {
    return messages.map((message, index) => {
      if (index === messages.length - 1 && message.sender === "system") {
        return { ...message, text, status };
      }
      return message;
    });
  };

  const initializeWithWelcomeMessage = async (client: OpenAI) => {
    if (!client) return;

    setIsLoading(true);

    const assistantMessage: Message = {
      id: Date.now().toString(),
      text: "",
      sender: "system",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages([assistantMessage]);

    try {
      const content = await generateChatResponse(
        client,
        WELCOME_MESSAGE,
        patientData,
      );

      // Update the assistant message with the response
      setMessages((prev) => updateLastAssistantMessage(prev, content, "sent"));
    } catch (error) {
      console.error("Error initializing welcome message:", error);
      setMessages((prev) =>
        updateLastAssistantMessage(prev, DEFAULT_WELCOME_MESSAGE, "error"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (inputText: string) => {
    if (!client || !inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      sender: "system",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    try {
      const content = await generateChatResponse(
        client,
        inputText,
        patientData,
      );

      // Update the assistant message with the response
      setMessages((prev) => updateLastAssistantMessage(prev, content, "sent"));
    } catch (error) {
      console.error("API Error:", error);
      // Show error in the chat
      setMessages((prev) =>
        updateLastAssistantMessage(prev, ERROR_MESSAGE, "error"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || !client) return;

    setIsRefreshing(true);
    try {
      // Here you could potentially reload history or perform other refresh actions
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
    } finally {
      setIsRefreshing(false);
    }
  };

  // If user is not logged in with Epic, show the Epic integration screen
  if (!fhirClient) {
    return (
      <SafeAreaView style={styles.logoutContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Health Chat Assistant</Text>

          <Text style={styles.description}>
            Connect with your Epic health records to get personalized health
            insights and chat with your AI health assistant.
          </Text>

          <Text style={styles.privacyText}>
            Your health data remains private and secure. We only access the
            information you explicitly authorize.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // User is logged in, show the chat interface
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.contentContainer}>
          <ChatContainer
            messages={messages}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
          <InputArea isLoading={isLoading} onSendMessage={handleSendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  logoutContainer: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  privacyText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 16,
  },
});

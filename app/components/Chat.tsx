import OpenAI from "openai-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  DEFAULT_WELCOME_MESSAGE,
  ERROR_MESSAGE,
  WELCOME_MESSAGE,
} from "../constants/chatConstants";
import { usePatient } from "../context/PatientContext";
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

  useEffect(() => {
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
  }, []);

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
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.sender === "system") {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: content, status: "sent" },
          ];
        }
        return prev;
      });
    } catch (error) {
      console.error("Error initializing welcome message:", error);
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.sender === "system") {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              text: DEFAULT_WELCOME_MESSAGE,
              status: "error",
            },
          ];
        }
        return prev;
      });
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
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.sender === "system") {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: content, status: "sent" },
          ];
        }
        return prev;
      });
    } catch (error) {
      console.error("API Error:", error);
      // Show error in the chat
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.sender === "system") {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: ERROR_MESSAGE, status: "error" },
          ];
        }
        return prev;
      });
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
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  loadingOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 5,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 20,
  },
});

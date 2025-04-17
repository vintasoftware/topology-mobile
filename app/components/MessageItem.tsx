import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Message } from "../types/chat";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = React.memo(({ message }: MessageItemProps) => {
  const isUserMessage = message.sender === "user";

  return (
    <View
      style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessage : styles.systemMessage,
      ]}
    >
      <Text style={styles.messageText}>{message.text}</Text>
      <View style={styles.messageFooter}>
        {message.status === "sending" && !isUserMessage && (
          <Text style={styles.typingIndicator}>typing...</Text>
        )}
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  systemMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#1a1d20",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  typingIndicator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 8,
    fontStyle: "italic",
  },
});

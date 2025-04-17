import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface InputAreaProps {
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export const InputArea = ({ isLoading, onSendMessage }: InputAreaProps) => {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Ask about your health..."
        placeholderTextColor="#666"
        multiline
        editable={!isLoading}
      />
      <TouchableOpacity
        style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={inputText.trim() === "" || isLoading}
        accessibilityLabel="Send message"
        accessibilityHint="Sends your message to the health assistant"
      >
        <Ionicons
          name="send"
          size={24}
          color={inputText.trim() === "" || isLoading ? "#666" : "#007AFF"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#3a3a3a",
    backgroundColor: "#25292e",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1d20",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: "#fff",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

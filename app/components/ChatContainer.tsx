import React, { useRef } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Message } from "../types/chat";
import { MessageItem } from "./MessageItem";

interface ChatContainerProps {
  messages: Message[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const ChatContainer = ({
  messages,
  isRefreshing = false,
  onRefresh,
}: ChatContainerProps) => {
  const flatListRef = useRef<FlatList>(null);

  const renderEmptyChat = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No messages yet</Text>
    </View>
  );

  const renderMessageItem = ({ item }: { item: Message }) => (
    <MessageItem message={item} />
  );

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        renderEmptyChat()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#999"
                colors={["#999"]}
              />
            ) : undefined
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});

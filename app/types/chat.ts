export interface Message {
  id: string;
  text: string;
  sender: "user" | "system";
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

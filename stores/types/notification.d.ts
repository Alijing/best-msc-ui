export type NotificationType = "info" | "warning" | "success";

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createTime: string;
}

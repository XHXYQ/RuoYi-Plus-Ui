/**
 * WebSocket 消息基础结构
 */
export interface WebSocketResponse<T = any> {
    code: number;
    msg: string;
    data?: T;
  }
  
  /**
   * 聊天消息实体
   */
  export interface ChatMessageVO {
    messageId: string | number;
    content: string;
    timestamp: number;
    senderId?: number;
    senderName?: string;
    sessionKey?: number;
  }
  
  /**
   * 消息发送参数
   */
  export interface SendMessageParams {
    sessionKeys: number[];
    message: string;
  }
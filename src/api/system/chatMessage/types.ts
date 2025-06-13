export interface ChatMessageVO {
    /**
     * 主键
     */
    id: string | number;
  
    /**
     * 会话ID
     */
    sessionId: string | number;
  
    /**
     * 发送者ID
     */
    senderId: string | number;
  
    /**
     * 消息内容（支持文本、图片、文件等）
     */
    content: string;
  
    /**
     * 消息类型（1=文本，2=图片，3=文件等）
     */
    messageType: number;
  
  }
  
  export interface ChatMessageForm extends BaseEntity {
    /**
     * 主键
     */
    id?: string | number;
  
    /**
     * 会话ID
     */
    sessionId?: string | number;
  
    /**
     * 发送者ID
     */
    senderId?: string | number;
  
    /**
     * 消息内容（支持文本、图片、文件等）
     */
    content?: string;
  
    /**
     * 消息类型（1=文本，2=图片，3=文件等）
     */
    messageType?: number;
  
  }
  
  export interface ChatMessageQuery extends PageQuery {
  
    /**
     * 会话ID
     */
    sessionId?: string | number;
  
    /**
     * 发送者ID
     */
    senderId?: string | number;
  
    /**
     * 消息内容（支持文本、图片、文件等）
     */
    content?: string;
  
    /**
     * 消息类型（1=文本，2=图片，3=文件等）
     */
    messageType?: number;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
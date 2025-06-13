export interface ChatSessionUserVO {
    /**
     * 主键
     */
    id: string | number;
  
    /**
     * 会话ID
     */
    sessionId: string | number;
  
    /**
     * 用户ID
     */
    userId: string | number;
  
    /**
     * 加入时间
     */
    joinTime: string;
  
    /**
     * 是否被禁言（0否 1是）
     */
    isMuted: number;
  
  }
  
  export interface ChatSessionUserForm extends BaseEntity {
    /**
     * 主键
     */
    id?: string | number;
  
    /**
     * 会话ID
     */
    sessionId?: string | number;
  
    /**
     * 用户ID
     */
    userId?: string | number;
  
    /**
     * 加入时间
     */
    joinTime?: string;
  
    /**
     * 是否被禁言（0否 1是）
     */
    isMuted?: number;
  
  }
  
  export interface ChatSessionUserQuery extends PageQuery {
  
    /**
     * 会话ID
     */
    sessionId?: string | number;
  
    /**
     * 用户ID
     */
    userId?: string | number;
  
    /**
     * 加入时间
     */
    joinTime?: string;
  
    /**
     * 是否被禁言（0否 1是）
     */
    isMuted?: number;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
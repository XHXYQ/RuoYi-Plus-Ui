export interface ChatSessionVO {
    /**
     * 主键
     */
    id: string | number;
  
    /**
     * 会话类型（1=私聊，2=群聊）
     */
    sessionType: number;
  
    /**
     * 创建人用户ID
     */
    creatorId: string | number;
  
  }
  
  export interface ChatSessionForm extends BaseEntity {
    /**
     * 主键
     */
    id?: string | number;
  
    /**
     * 会话类型（1=私聊，2=群聊）
     */
    sessionType?: number;
  
    /**
     * 创建人用户ID
     */
    creatorId?: string | number;
  
  }
  
  export interface ChatSessionQuery extends PageQuery {
  
    /**
     * 会话类型（1=私聊，2=群聊）
     */
    sessionType?: number;
  
    /**
     * 创建人用户ID
     */
    creatorId?: string | number;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
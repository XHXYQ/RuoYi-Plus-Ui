export interface OutgoingVO {
    /**
     * 主键ID
     */
    id: string | number;
  
    /**
     * 申请人
     */
    applicant: string;
  
    /**
     * 开始时间
     */
    startTime: string;
  
    /**
     * 结束时间
     */
    endTime: string;
  
    /**
     * 外出天数
     */
    leaveDay: number;
  
    /**
     * 备注
     */
    remark: string;
  
    /**
     * 状态
     */
    status: string;
  
  }
  
  export interface OutgoingForm extends BaseEntity {
    /**
     * 主键ID
     */
    id?: string | number;
  
    /**
     * 申请人
     */
    applicant?: string;
  
    /**
     * 开始时间
     */
    startTime?: string;
  
    /**
     * 结束时间
     */
    endTime?: string;
  
    /**
     * 外出天数
     */
    leaveDay?: number;
  
    /**
     * 备注
     */
    remark?: string;
  
    /**
     * 状态
     */
    status?: string;
  
  }
  
  export interface OutgoingQuery extends PageQuery {
  
    /**
     * 申请人
     */
    applicant?: string;
  
    /**
     * 开始时间
     */
    startTime?: string;
  
    /**
     * 结束时间
     */
    endTime?: string;
  
    /**
     * 外出天数
     */
    leaveDay?: number;
  
    /**
     * 状态
     */
    status?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
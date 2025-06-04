export interface SolicitudeRuleVO {
    /**
     * 主键ID
     */
    id: string | number;
  
    /**
     * 关怀类型ID（关联 sys_solicitude_category）
     */
    categoryId: string | number;
  
    /**
     * 系统祝福是否启用（1=启用，0=关闭）
     */
    enableSystemRemind: number;
  
    /**
     * 全员祝福是否启用（1=启用，0=关闭）
     */
    enableAllRemind: number;
  
    /**
     * 提醒给同事（1=启用，0=关闭）
     */
    enableColleagueRemind: number;
  
    /**
     * 提前几天提醒（默认0为当天）
     */
    remindDaysBefore: number;
  
    /**
     * 提醒时间点
     */
    remindTime: string;
  
    /**
     * 祝福模板内容
     */
    messageTemplate: string;
  
    /**
     * 创建人
     */
    createdBy: number;
  
    /**
     * 创建时间
     */
    createdAt: string;
  
    /**
     * 更新时间
     */
    updatedAt: string;
  
    /**
     * 删除时间（软删）
     */
    deletedAt: string;
  
  }
  
  export interface SolicitudeRuleForm extends BaseEntity {
    /**
     * 主键ID
     */
    id?: string | number;
  
    /**
     * 关怀类型ID（关联 sys_solicitude_category）
     */
    categoryId?: string | number;
  
    /**
     * 系统祝福是否启用（1=启用，0=关闭）
     */
    enableSystemRemind?: number;
  
    /**
     * 全员祝福是否启用（1=启用，0=关闭）
     */
    enableAllRemind?: number;
  
    /**
     * 提醒给同事（1=启用，0=关闭）
     */
    enableColleagueRemind?: number;
  
    /**
     * 提前几天提醒（默认0为当天）
     */
    remindDaysBefore?: number;
  
    /**
     * 提醒时间点
     */
    remindTime?: string;
  
    /**
     * 祝福模板内容
     */
    messageTemplate?: string;
  
    /**
     * 创建人
     */
    createdBy?: number;
  
    /**
     * 创建时间
     */
    createdAt?: string;
  
    /**
     * 更新时间
     */
    updatedAt?: string;
  
    /**
     * 删除时间（软删）
     */
    deletedAt?: string;
  
  }
  
  export interface SolicitudeRuleQuery extends PageQuery {
  
    /**
     * 关怀类型ID（关联 sys_solicitude_category）
     */
    categoryId?: string | number;
  
    /**
     * 系统祝福是否启用（1=启用，0=关闭）
     */
    enableSystemRemind?: number;
  
    /**
     * 全员祝福是否启用（1=启用，0=关闭）
     */
    enableAllRemind?: number;
  
    /**
     * 提醒给同事（1=启用，0=关闭）
     */
    enableColleagueRemind?: number;
  
    /**
     * 提前几天提醒（默认0为当天）
     */
    remindDaysBefore?: number;
  
    /**
     * 提醒时间点
     */
    remindTime?: string;
  
    /**
     * 祝福模板内容
     */
    messageTemplate?: string;
  
    /**
     * 创建人
     */
    createdBy?: number;
  
    /**
     * 创建时间
     */
    createdAt?: string;
  
    /**
     * 更新时间
     */
    updatedAt?: string;
  
    /**
     * 删除时间（软删）
     */
    deletedAt?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
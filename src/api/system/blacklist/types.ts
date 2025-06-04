export interface BlacklistVO {
    /**
     * 主键ID
     */
    id: string | number;
  
    /**
     * 姓名
     */
    userName: string;
  
    /**
     * 证件号码
     */
    idNumber: string | number;
  
    /**
     * 手机号码
     */
    phonenumber: string;
  
    /**
     * 加黑原因
     */
    reason: string;
  
    /**
     * 加黑时间
     */
    blacklistedAt: string;
  
  }
  
  export interface BlacklistForm extends BaseEntity {
    /**
     * 主键ID
     */
    id?: string | number;
  
    /**
     * 姓名
     */
    userName?: string;
  
    /**
     * 证件号码
     */
    idNumber?: string | number;
  
    /**
     * 手机号码
     */
    phonenumber?: string;
  
    /**
     * 加黑原因
     */
    reason?: string;
  
    /**
     * 加黑时间
     */
    blacklistedAt?: string;
  
  }
  
  export interface BlacklistQuery extends PageQuery {
  
    /**
     * 姓名
     */
    userName?: string;
  
    /**
     * 证件号码
     */
    idNumber?: string | number;
  
    /**
     * 手机号码
     */
    phonenumber?: string;
  
    /**
     * 加黑原因
     */
    reason?: string;
  
    /**
     * 加黑时间
     */
    blacklistedAt?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
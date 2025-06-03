export interface PositionVO {
    /**
     * 自增主键ID
     */
    id: string | number;
  
    /**
     * 职位编号（如POS-001）
     */
    code: string;
  
    /**
     * 职位名称
     */
    name: string;
  
    /**
     * 职位描述
     */
    description: string;
  
    /**
     * 创建时间
     */
    createdAt: string;
  
    /**
     * 更新时间
     */
    updatedAt: string;
  
  }
  
  export interface PositionForm extends BaseEntity {
    /**
     * 自增主键ID
     */
    id?: string | number;
  
    /**
     * 职位编号（如POS-001）
     */
    code?: string;
  
    /**
     * 职位名称
     */
    name?: string;
  
    /**
     * 职位描述
     */
    description?: string;
  
    /**
     * 创建时间
     */
    createdAt?: string;
  
    /**
     * 更新时间
     */
    updatedAt?: string;
  
  }
  
  export interface PositionQuery extends PageQuery {
  
    /**
     * 职位编号（如POS-001）
     */
    code?: string;
  
    /**
     * 职位名称
     */
    name?: string;
  
    /**
     * 职位描述
     */
    description?: string;
  
    /**
     * 创建时间
     */
    createdAt?: string;
  
    /**
     * 更新时间
     */
    updatedAt?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
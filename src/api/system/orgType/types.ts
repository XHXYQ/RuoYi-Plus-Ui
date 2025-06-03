export interface OrgTypeVO {
    /**
     * 主键 ID
     */
    id: string | number;
  
    /**
     * 编号
     */
    code: string;
  
    /**
     * 名称
     */
    name: string;
  
    /**
     * 描述
     */
    description: string;
  
  }
  
  export interface OrgTypeForm extends BaseEntity {
    /**
     * 主键 ID
     */
    id?: string | number;
  
    /**
     * 编号
     */
    code?: string;
  
    /**
     * 名称
     */
    name?: string;
  
    /**
     * 描述
     */
    description?: string;
  
  }
  
  export interface OrgTypeQuery extends PageQuery {
  
    /**
     * 编号
     */
    code?: string;
  
    /**
     * 名称
     */
    name?: string;
  
    /**
     * 描述
     */
    description?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
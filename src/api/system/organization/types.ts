export interface OrganizationVO {
    /**
     * 主键ID
     */
    id: string | number;
  
    /**
     * 唯一业务编号（如COMP-001）
     */
    code: string;
  
    /**
     * 部门/团队名称
     */
    name: string;
  
    /**
     * 成员人数（非负数）
     */
    employeeCount: number;
  
    /**
     * 类型（如：部门/项目组/分公司）
     */
    type: string;
  
    /**
     * 主管姓名
     */
    manager: string;
  
  }
  
  export interface OrganizationForm extends BaseEntity {
    /**
     * 主键ID
     */
    id?: string | number;
  
    /**
     * 唯一业务编号（如COMP-001）
     */
    code?: string;
  
    /**
     * 部门/团队名称
     */
    name?: string;
  
    /**
     * 成员人数（非负数）
     */
    employeeCount?: number;
  
    /**
     * 类型（如：部门/项目组/分公司）
     */
    type?: string;
  
    /**
     * 主管姓名
     */
    manager?: string;
  
  }
  
  export interface OrganizationQuery extends PageQuery {
  
    /**
     * 唯一业务编号（如COMP-001）
     */
    code?: string;
  
    /**
     * 部门/团队名称
     */
    name?: string;
  
    /**
     * 成员人数（非负数）
     */
    employeeCount?: number;
  
    /**
     * 类型（如：部门/项目组/分公司）
     */
    type?: string;
  
    /**
     * 主管姓名
     */
    manager?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
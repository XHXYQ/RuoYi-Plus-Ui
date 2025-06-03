export interface RegularApplicationVO {
    /**
     * 主键ID
     */
    id: string | number;
  
    /**
     * 申请人姓名
     */
    name: string;
  
    /**
     * 所在部门
     */
    department: string;
  
    /**
     * 当前岗位
     */
    position: string;
  
    /**
     * 员工类型
     */
    employeeType: string;
  
    /**
     * 入职日期
     */
    entryDate: string;
  
    /**
     * 试用期
     */
    probationPeriod: string;
  
    /**
     * 计划转正日期
     */
    planRegularDate: string;
  
    /**
     * 实际转正日期
     */
    actualRegularDate: string;
  
    /**
     * 审批状态（draft草稿, waiting待审, pass通过, reject退回）
     */
    approvalStatus: string;
  
    /**
     * 关联的流程实例ID
     */
    flowInstanceId: string | number;
  
    /**
     * 审批意见
     */
    approvalOpinion: string;
  
    /**
     * 附件地址（可为空）
     */
    fileUrl: string;
  
  }
  
  export interface RegularApplicationForm extends BaseEntity {
    /**
     * 主键ID
     */
    id?: string | number;
  
    /**
     * 申请人姓名
     */
    name?: string;
  
    /**
     * 所在部门
     */
    department?: string;
  
    /**
     * 当前岗位
     */
    position?: string;
  
    /**
     * 员工类型
     */
    employeeType?: string;
  
    /**
     * 入职日期
     */
    entryDate?: string;
  
    /**
     * 试用期
     */
    probationPeriod?: string;
  
    /**
     * 计划转正日期
     */
    planRegularDate?: string;
  
    /**
     * 实际转正日期
     */
    actualRegularDate?: string;
  
    /**
     * 审批状态（draft草稿, waiting待审, pass通过, reject退回）
     */
    approvalStatus?: string;
  
    /**
     * 关联的流程实例ID
     */
    flowInstanceId?: string | number;
  
    /**
     * 审批意见
     */
    approvalOpinion?: string;
  
    /**
     * 附件地址（可为空）
     */
    fileUrl?: string;
  
  }
  
  export interface RegularApplicationQuery extends PageQuery {
  
    /**
     * 申请人姓名
     */
    name?: string;
  
    /**
     * 所在部门
     */
    department?: string;
  
    /**
     * 当前岗位
     */
    position?: string;
  
    /**
     * 员工类型
     */
    employeeType?: string;
  
    /**
     * 入职日期
     */
    entryDate?: string;
  
    /**
     * 试用期
     */
    probationPeriod?: string;
  
    /**
     * 计划转正日期
     */
    planRegularDate?: string;
  
    /**
     * 实际转正日期
     */
    actualRegularDate?: string;
  
    /**
     * 审批状态（draft草稿, waiting待审, pass通过, reject退回）
     */
    approvalStatus?: string;
  
    /**
     * 关联的流程实例ID
     */
    flowInstanceId?: string | number;
  
    /**
     * 审批意见
     */
    approvalOpinion?: string;
  
    /**
     * 附件地址（可为空）
     */
    fileUrl?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  
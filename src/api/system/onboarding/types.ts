export interface OnboardingVO {
  /**
   * 入职记录ID
   */
  onboardingId: string | number;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 姓名
   */
  userName: string;

  /**
   * 入职部门ID
   */
  deptId: string | number;

  /**
   * 入职职位ID
   */
  postId: string | number;

  /**
   * 预计入职日期（对应UI字段）
   */
  expectedDate: string;

  /**
   * 实际入职日期
   */
  actualDate: string;

  /**
   * 试用期（月）
   */
  probationMonths: number;

  /**
   * 基本薪资
   */
  salary: number;

  /**
   * 合同开始日期
   */
  contractStart: string;

  /**
   * 合同结束日期
   */
  contractEnd: string;

  /**
   * 招聘来源（对应UI字段）
   */
  source: string;

  /**
   * 状态（0:待处理 1:已入职 2:已取消）
   */
  status: number;

  /**
   * 背调认证状态（0未完成 1已完成）
   */
  certificationFlag: number;

  /**
   * 入职登记表文件路径
   */
  registrationForm: string;

  /**
   * 备注
   */
  remark: string;

}

export interface OnboardingForm extends BaseEntity {
  /**
   * 入职记录ID
   */
  onboardingId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 姓名
   */
  userName?: string;

  /**
   * 入职部门ID
   */
  deptId?: string | number;

  /**
   * 入职职位ID
   */
  postId?: string | number;

  /**
   * 预计入职日期（对应UI字段）
   */
  expectedDate?: string;

  /**
   * 实际入职日期
   */
  actualDate?: string;

  /**
   * 试用期（月）
   */
  probationMonths?: number;

  /**
   * 基本薪资
   */
  salary?: number;

  /**
   * 合同开始日期
   */
  contractStart?: string;

  /**
   * 合同结束日期
   */
  contractEnd?: string;

  /**
   * 招聘来源（对应UI字段）
   */
  source?: string;

  /**
   * 状态（0:待处理 1:已入职 2:已取消）
   */
  status?: number;

  /**
   * 背调认证状态（0未完成 1已完成）
   */
  certificationFlag?: number;

  /**
   * 入职登记表文件路径
   */
  registrationForm?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface OnboardingQuery extends PageQuery {

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 姓名
   */
  userName?: string;

  /**
   * 入职部门ID
   */
  deptId?: string | number;

  /**
   * 入职职位ID
   */
  postId?: string | number;

  /**
   * 预计入职日期（对应UI字段）
   */
  expectedDate?: string;

  /**
   * 实际入职日期
   */
  actualDate?: string;

  /**
   * 试用期（月）
   */
  probationMonths?: number;

  /**
   * 基本薪资
   */
  salary?: number;

  /**
   * 合同开始日期
   */
  contractStart?: string;

  /**
   * 合同结束日期
   */
  contractEnd?: string;

  /**
   * 招聘来源（对应UI字段）
   */
  source?: string;

  /**
   * 状态（0:待处理 1:已入职 2:已取消）
   */
  status?: number;

  /**
   * 背调认证状态（0未完成 1已完成）
   */
  certificationFlag?: number;

  /**
   * 入职登记表文件路径
   */
  registrationForm?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}




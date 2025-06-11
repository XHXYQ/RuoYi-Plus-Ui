/**
 * 假期规则查询参数
 */
export interface SysHolidayQuery extends PageQuery {
  name?: string;
  balanceType?: string;
  scopeType?: string;
  holidayType?: string;
  timeType?: string;
  moneyType?: string;
}

/**
 * 假期规则表单对象
 */
export interface SysHolidayForm {
  holidayId?: number;
  name: string;
  balanceType: string;
  
  // 每月发放相关
  monthlyIssueDate?: number;
  monthlyQuotaRule?: string;
  monthlyQuota?: number;
  monthlyValidity?: string;
  
  // 每年发放相关
  yearlyIssueDate?: string;
  yearlyQuotaRule?: string;
  yearlyQuota?: number;
  yearlyValidity?: string;
  
  // 通用字段
  allowExtendYearly?: boolean;
  retainValue?: number;
  retainUnit?: string;
  
  // 基础规则
  newType: string;
  moneyType: string;
  holidayType: string;
  timeType: string;
  scopeType: string;
  
  // 提醒设置
  expireReminder?: boolean;
  remindTime?: string;
  notifyEmployee?: boolean;
  notifyManager?: boolean;
  
  // 其他
  roundingUnit?: string;
  holidaytimeType?: string;
  
  // 规则配置
  socialAgeRules?: HolidayQuotaRule[];
  companyAgeRules?: HolidayQuotaRule[];
  
  // 适用范围（部门/人员）
  selectedUserIds?: number[];
}

/**
 * 假期配额规则
 */
export interface HolidayQuotaRule {
  condition: number;  // 条件值（年数）
  value: number;      // 配额值
  type: 'lt' | 'gte';  // 条件类型（小于/大于等于）
}

/**
 * 假期规则视图对象
 */
export interface SysHolidayVO {
  holidayId: number;
  name: string;
  balanceType: string;
  
  monthlyIssueDate?: number;
  monthlyQuotaRule?: string;
  monthlyQuota?: number;
  monthlyValidity?: string;
  
  yearlyIssueDate?: string;
  yearlyQuotaRule?: string;
  yearlyQuota?: number;
  yearlyValidity?: string;
  
  allowExtendYearly?: boolean;
  retainValue?: number;
  retainUnit?: string;
  
  newType: string;
  moneyType: string;
  holidayType: string;
  timeType: string;
  scopeType: string;
  
  expireReminder?: boolean;
  remindTime?: string;
  notifyEmployee?: boolean;
  notifyManager?: boolean;
  
  roundingUnit?: string;
  holidaytimeType?: string;
  
  socialAgeRules?: HolidayQuotaRule[];
  companyAgeRules?: HolidayQuotaRule[];
  
  // 前端展示用
  scopeUsers?: Array<{ userId: number; nickName: string }>;
}

/**
 * 分页结果对象
 */
export interface PageResult<T> {
  total: number;
  rows: T[];
  pageNum: number;
  pageSize: number;
  pages: number;
}
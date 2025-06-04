/**
 * 员工查询参数
 */
export interface SysEmployeeQuery extends PageQuery {
  name?: string;
  phonenumber?: string;
  deptId?: number;
  position?: string;
  employeeType?: string;
  statusType?: string;
}

/**
 * 员工表单对象
 */
export interface SysEmployeeForm {
  userid?: number;
  name: string;
  phonenumber: string;
  deptId: number;
  position?: string;
  employeeType?: string;
  statusType?: string;
  startDate?: Date;
  nickName?: string;
  userName?: string;
}

/**
 * 员工视图对象
 */
export interface SysEmployeeVO {
  userid?: number;
  name: string;
  deptId?: number;
  deptName?: string;
  position?: string;
  phonenumber?: string;
  employeeType?: string;
  statusType?: string;
  startDate?: string | Date;
  avatar?: string;
  checked?: boolean;
}

export interface PageResult<T> {
  total: number;       // 总记录数
  rows: T[];           // 当前页数据列表
  pageNum: number;     // 当前页码
  pageSize: number;    // 每页显示条数
  pages: number;       // 总页数
}

export interface EmployeeStatsVo {
  total: number;
  fullTime: number;
  partTime: number;
  intern: number;
  dispatch: number;
  noType: number;
  probation: number;
  formal: number;
  pendingLeave: number;
  noStatus: number;
}
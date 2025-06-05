/**
 * 员工查询参数
 */
export interface SysResignQuery extends PageQuery {
  name?: string;
  deptId?: number;
  position?: string;
  employeeType?: string;
}

/**
 * 员工表单对象
 */
export interface SysResignForm {
  userid?: number;
  name: string;
  deptId: number;
  position?: string;
  employeeType?: string;
  startDate?: Date;
  endDate?: Date;
  remark?: string;
}

/**
 * 员工视图对象
 */
export interface SysResignVO {
  userid?: number;
  name: string;
  deptId?: number;
  deptName?: string;
  position?: string;
  employeeType?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  remark?: string;
}

export interface PageResult<T> {
  total: number;       // 总记录数
  rows: T[];           // 当前页数据列表
  pageNum: number;     // 当前页码
  pageSize: number;    // 每页显示条数
  pages: number;       // 总页数
}
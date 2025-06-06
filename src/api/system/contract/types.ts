/**
 * 合同查询参数
 */
export interface SysContractQuery extends PageQuery {
  name?: string;               
  jobnumber?: string;          
  deptId?: number;             
  employeeType?: string;       
  contractnumber?: string;     
  contractType?: string;       
  statusType?: string;         
  deadlineType?: string;       
  statusxuType?: string;       
  company?: string;            
}

/**
 * 合同表单对象
 */
export interface SysContractForm {
  userId?: number;             
  name: string;          
  jobnumber: string;     
  deptId: number;          
  employeeType?: string;   
  contractnumber?: string; 
  contractType?: string;   
  statusType?: string;     
  deadlineType?: string;   
  startDate?: Date;        
  endDate?: Date;          
  statusxuType?: string;   
  company?: string;        
  signDate?: Date;         
}

/**
 * 合同视图对象
 */
export interface SysContractVO {
  userId?: number;             
  name: string;             
  jobnumber: string;   
  deptId?: number;             
  deptName?: string;           
  employeeType?: string;       
  contractnumber?: string;     
  contractType?: string;       
  statusType?: string;         
  deadlineType?: string;       
  startDate?: string | Date;   
  endDate?: string | Date;     
  statusxuType?: string;       
  company?: string;            
  signDate?: string | Date;
}

/**
 * 分页结果对象
 */
export interface PageResult<T> {
  total: number;       // 总记录数
  rows: T[];          // 当前页数据列表
  pageNum: number;     // 当前页码
  pageSize: number;    // 每页显示条数
  pages: number;       // 总页数
}
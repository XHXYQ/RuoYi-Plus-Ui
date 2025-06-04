import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { 
  SysEmployeeVO, 
  SysEmployeeQuery, 
  SysEmployeeForm,
  PageResult,
  EmployeeStatsVo
} from '@/api/system/employee/types';

/**
 * 查询员工列表
 * @param query 查询参数
 * @returns 员工列表
 */
export const listEmployee = (query?: SysEmployeeQuery): AxiosPromise<SysEmployeeVO[]> => {
  return request({
    url: '/system/employee/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询员工分页列表
 * @param query 查询参数
 * @returns 分页员工列表
 */
export const pageEmployee = (query: SysEmployeeQuery): AxiosPromise<PageResult<SysEmployeeVO[]>> => {
  return request({
    url: '/system/employee/page',
    method: 'get',
    params: query
  });
};

/**
 * 查询员工详细
 * @param id 员工ID
 * @returns 员工详情
 */
export const getEmployee = (id: string | number): AxiosPromise<SysEmployeeVO> => {
  return request({
    url: '/system/employee/' + id,
    method: 'get'
  });
};

/**
 * 新增员工
 * @param data 员工表单数据
 * @returns 操作结果
 */
export const addEmployee = (data: SysEmployeeForm): AxiosPromise<number> => {
  return request({
    url: '/system/employee',
    method: 'post',
    data: data
  });
};

/**
 * 修改员工
 * @param data 员工表单数据
 * @returns 操作结果
 */
export const updateEmployee = (data: SysEmployeeForm): AxiosPromise<number> => {
  return request({
    url: '/system/employee',
    method: 'put',
    data: data
  });
};

/**
 * 删除员工
 * @param ids 员工ID或ID数组
 * @returns 操作结果
 */
export const delEmployee = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/system/employee/' + ids,
    method: 'delete'
  });
};

/**
 * 获取在职员工数量
 * @returns 在职员工数量
 */
export const getActiveEmployeeCount = (): AxiosPromise<number> => {
  return request({
    url: '/system/employee/activeCount',
    method: 'get'
  });
};

/**
 * 校验手机号是否唯一
 * @param phone 手机号
 * @param employeeId 员工ID（可选）
 * @returns 是否唯一
 */
export const checkPhoneUnique = (phone: string, employeeId?: number): AxiosPromise<boolean> => {
  return request({
    url: '/system/employee/checkPhoneUnique',
    method: 'get',
    params: { phone, employeeId }
  });
};

export const getEmployeeStats = (): AxiosPromise<EmployeeStatsVo> => {
  return request({
    url: '/system/employee/stats',
    method: 'get'
  });
};
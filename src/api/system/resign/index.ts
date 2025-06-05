import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { 
  SysResignVO, 
  SysResignQuery, 
  SysResignForm,
  PageResult
} from '@/api/system/resign/types';

/**
 * 查询员工列表
 * @param query 查询参数
 * @returns 员工列表
 */
export const listResign = (query?: SysResignQuery): AxiosPromise<SysResignVO[]> => {
  return request({
    url: '/system/resign/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询员工分页列表
 * @param query 查询参数
 * @returns 分页员工列表
 */
export const pageResign = (query: SysResignQuery): AxiosPromise<PageResult<SysResignVO[]>> => {
  return request({
    url: '/system/resign/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询员工详细
 * @param id 员工ID
 * @returns 员工详情
 */
export const getResign = (id: string | number): AxiosPromise<SysResignVO> => {
  return request({
    url: '/system/resign/' + id,
    method: 'get'
  });
};

/**
 * 新增员工
 * @param data 员工表单数据
 * @returns 操作结果
 */
export const addResign = (data: SysResignForm): AxiosPromise<number> => {
  return request({
    url: '/system/resign',
    method: 'post',
    data: data
  });
};

/**
 * 修改员工
 * @param data 员工表单数据
 * @returns 操作结果
 */
export const updateResign = (data: SysResignForm): AxiosPromise<number> => {
  return request({
    url: '/system/resign',
    method: 'put',
    data: data
  });
};

/**
 * 删除员工
 * @param ids 员工ID或ID数组
 * @returns 操作结果
 */
export const delResign = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/system/resign/' + ids,
    method: 'delete'
  });
};
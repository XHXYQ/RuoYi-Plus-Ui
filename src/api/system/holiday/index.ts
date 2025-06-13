import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { 
  SysHolidayVO, 
  SysHolidayQuery, 
  SysHolidayForm,
  PageResult,
  HolidayQuotaRule
} from './types';

/**
 * 查询假期规则列表
 */
export const listHoliday = (query?: SysHolidayQuery): AxiosPromise<SysHolidayVO[]> => {
  return request({
    url: '/system/holiday/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询假期规则分页列表
 */
export const pageHoliday = (query: SysHolidayQuery): AxiosPromise<PageResult<SysHolidayVO>> => {
  return request({
    url: '/system/holiday/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询假期规则详情
 */
export const getHoliday = (holidayId: number): AxiosPromise<SysHolidayVO> => {
  return request({
    url: `/system/holiday/${holidayId}`,
    method: 'get'
  });
};

/**
 * 新增假期规则
 */
export const addHoliday = (data: SysHolidayForm): AxiosPromise<number> => {
  return request({
    url: '/system/holiday',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 修改假期规则
 */
export const updateHoliday = (data: SysHolidayForm): AxiosPromise<number> => {
  return request({
    url: '/system/holiday',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 删除假期规则
 */
export const deleteHoliday = (holidayIds: number | number[]): AxiosPromise<void> => {
  const ids = Array.isArray(holidayIds) ? holidayIds.join(',') : holidayIds;
  return request({
    url: `/system/holiday/${ids}`,
    method: 'delete'
  });
};

/**
 * 导出假期规则
 */
export const exportHoliday = (query: SysHolidayQuery): AxiosPromise<Blob> => {
  return request({
    url: '/system/holiday/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 获取适用范围的用户列表
 */
export const getHolidayScopeUsers = (holidayId: number): AxiosPromise<Array<{
  userId: number;
  nickName: string;
}>> => {
  return request({
    url: `/system/holiday/${holidayId}/users`,
    method: 'get'
  });
};

export function listHolidayUsers() {
  return request({
    url: '/system/holiday/allHolidayUsers',
    method: 'get'
  })
}
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PositionVO, PositionForm, PositionQuery } from '@/api/system/position/types';

/**
 * 查询系统职位管理列表
 * @param query
 * @returns {*}
 */

export const listPosition = (query?: PositionQuery): AxiosPromise<PositionVO[]> => {
  return request({
    url: '/system/position/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询系统职位管理详细
 * @param id
 */
export const getPosition = (id: string | number): AxiosPromise<PositionVO> => {
  return request({
    url: '/system/position/' + id,
    method: 'get'
  });
};

/**
 * 新增系统职位管理
 * @param data
 */
export const addPosition = (data: PositionForm) => {
  return request({
    url: '/system/position',
    method: 'post',
    data: data
  });
};

/**
 * 修改系统职位管理
 * @param data
 */
export const updatePosition = (data: PositionForm) => {
  return request({
    url: '/system/position',
    method: 'put',
    data: data
  });
};

/**
 * 删除系统职位管理
 * @param id
 */
export const delPosition = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/position/' + id,
    method: 'delete'
  });
};

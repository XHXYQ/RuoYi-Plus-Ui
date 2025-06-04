import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BlacklistVO, BlacklistForm, BlacklistQuery } from './types';

/**
 * 查询系统黑名单列表
 * @param query
 * @returns {*}
 */

export const listBlacklist = (query?: BlacklistQuery): AxiosPromise<BlacklistVO[]> => {
  return request({
    url: '/system/blacklist/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询系统黑名单详细
 * @param id
 */
export const getBlacklist = (id: string | number): AxiosPromise<BlacklistVO> => {
  return request({
    url: '/system/blacklist/' + id,
    method: 'get'
  });
};

/**
 * 新增系统黑名单
 * @param data
 */
export const addBlacklist = (data: BlacklistForm) => {
  return request({
    url: '/system/blacklist',
    method: 'post',
    data: data
  });
};

/**
 * 修改系统黑名单
 * @param data
 */
export const updateBlacklist = (data: BlacklistForm) => {
  return request({
    url: '/system/blacklist',
    method: 'put',
    data: data
  });
};

/**
 * 删除系统黑名单
 * @param id
 */
export const delBlacklist = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/blacklist/' + id,
    method: 'delete'
  });
};

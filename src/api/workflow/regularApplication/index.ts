import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RegularApplicationVO, RegularApplicationForm, RegularApplicationQuery } from '@/api/workflow/application/types';

/**
 * 查询转正申请列表
 * @param query
 * @returns {*}
 */

export const listRegularApplication = (query?: RegularApplicationQuery): AxiosPromise<RegularApplicationVO[]> => {
  return request({
    url: '/workflow/regularApplication/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询转正申请详细
 * @param id
 */
export const getRegularApplication = (id: string | number): AxiosPromise<RegularApplicationVO> => {
  return request({
    url: '/workflow/regularApplication/' + id,
    method: 'get'
  });
};

/**
 * 新增转正申请
 * @param data
 */
export const addRegularApplication = (data: RegularApplicationForm) => {
  return request({
    url: '/workflow/regularApplication',
    method: 'post',
    data: data
  });
};

/**
 * 修改转正申请
 * @param data
 */
export const updateRegularApplication = (data: RegularApplicationForm) => {
  return request({
    url: '/workflow/regularApplication',
    method: 'put',
    data: data
  });
};

/**
 * 删除转正申请
 * @param id
 */
export const delRegularApplication = (id: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/regularApplication/' + id,
    method: 'delete'
  });
};

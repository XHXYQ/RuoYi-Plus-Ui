import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OutgoingVO, OutgoingForm, OutgoingQuery } from './types';

/**
 * 查询外出申请列表
 * @param query
 * @returns {*}
 */

export const listOutgoing = (query?: OutgoingQuery): AxiosPromise<OutgoingVO[]> => {
  return request({
    url: '/workflow/outgoing/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询外出申请详细
 * @param id
 */
export const getOutgoing = (id: string | number): AxiosPromise<OutgoingVO> => {
  return request({
    url: '/workflow/outgoing/' + id,
    method: 'get'
  });
};

/**
 * 新增外出申请
 * @param data
 */
export const addOutgoing = (data: OutgoingForm) => {
  return request({
    url: '/workflow/outgoing',
    method: 'post',
    data: data
  });
};

/**
 * 修改外出申请
 * @param data
 */
export const updateOutgoing = (data: OutgoingForm) => {
  return request({
    url: '/workflow/outgoing',
    method: 'put',
    data: data
  });
};

/**
 * 删除外出申请
 * @param id
 */
export const delOutgoing = (id: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/outgoing/' + id,
    method: 'delete'
  });
};

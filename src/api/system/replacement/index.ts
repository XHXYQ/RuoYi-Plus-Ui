import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ReplacementVO, ReplacementQuery, ReplacementForm } from '@/api/system/replacement/types';

/**
 * 查询请假列表
 * @param query
 * @returns {*}
 */

export const listLeave = (query?: ReplacementQuery): AxiosPromise<ReplacementVO[]> => {
  return request({
    url: '/system/replacement/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询请假详细
 * @param id
 */
export const getLeave = (id: string | number): AxiosPromise<ReplacementVO> => {
  return request({
    url: '/system/replacement/' + id,
    method: 'get'
  });
};

/**
 * 新增请假
 * @param data
 */
export const addLeave = (data: ReplacementForm): AxiosPromise<ReplacementVO> => {
  return request({
    url: '/system/replacement',
    method: 'post',
    data: data
  });
};

/**
 * 修改请假
 * @param data
 */
export const updateLeave = (data: ReplacementForm): AxiosPromise<ReplacementVO> => {
  return request({
    url: '/system/replacement',
    method: 'put',
    data: data
  });
};

/**
 * 删除请假
 * @param id
 */
export const delLeave = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/replacement/' + id,
    method: 'delete'
  });
};

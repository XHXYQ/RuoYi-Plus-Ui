import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TransferVO, TransferQuery, TransferForm } from '@/api/system/transfer/types';

/**
 * 查询请假列表
 * @param query
 * @returns {*}
 */

export const listLeave = (query?: TransferQuery): AxiosPromise<TransferVO[]> => {
  return request({
    url: '/system/transfer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询请假详细
 * @param id
 */
export const getLeave = (id: string | number): AxiosPromise<TransferVO> => {
  return request({
    url: '/system/transfer/' + id,
    method: 'get'
  });
};

/**
 * 新增请假
 * @param data
 */
export const addLeave = (data: TransferForm): AxiosPromise<TransferVO> => {
  return request({
    url: '/system/transfer',
    method: 'post',
    data: data
  });
};

/**
 * 修改请假
 * @param data
 */
export const updateLeave = (data: TransferForm): AxiosPromise<TransferVO> => {
  return request({
    url: '/system/transfer',
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
    url: '/system/transfer/' + id,
    method: 'delete'
  });
};

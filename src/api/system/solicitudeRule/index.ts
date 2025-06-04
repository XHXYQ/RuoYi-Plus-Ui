import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SolicitudeRuleVO, SolicitudeRuleForm, SolicitudeRuleQuery } from './types';

/**
 * 查询员工关怀规则配置列表
 * @param query
 * @returns {*}
 */

export const listSolicitudeRule = (query?: SolicitudeRuleQuery): AxiosPromise<SolicitudeRuleVO[]> => {
  return request({
    url: '/system/solicitudeRule/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询员工关怀规则配置详细
 * @param id
 */
export const getSolicitudeRule = (id: string | number): AxiosPromise<SolicitudeRuleVO> => {
  return request({
    url: '/system/solicitudeRule/' + id,
    method: 'get'
  });
};

/**
 * 新增员工关怀规则配置
 * @param data
 */
export const addSolicitudeRule = (data: SolicitudeRuleForm) => {
  return request({
    url: '/system/solicitudeRule',
    method: 'post',
    data: data
  });
};

/**
 * 修改员工关怀规则配置
 * @param data
 */
export const updateSolicitudeRule = (data: SolicitudeRuleForm) => {
  return request({
    url: '/system/solicitudeRule',
    method: 'put',
    data: data
  });
};

/**
 * 删除员工关怀规则配置
 * @param id
 */
export const delSolicitudeRule = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/solicitudeRule/' + id,
    method: 'delete'
  });
};

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OrgTypeVO, OrgTypeForm, OrgTypeQuery } from '@/api/system/orgType/types';

/**
 * 查询组织类型列表
 * @param query
 * @returns {*}
 */

export const listOrgType = (query?: OrgTypeQuery): AxiosPromise<OrgTypeVO[]> => {
  return request({
    url: '/system/orgType/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询组织类型详细
 * @param id
 */
export const getOrgType = (id: string | number): AxiosPromise<OrgTypeVO> => {
  return request({
    url: '/system/orgType/' + id,
    method: 'get'
  });
};

/**
 * 新增组织类型
 * @param data
 */
export const addOrgType = (data: OrgTypeForm) => {
  return request({
    url: '/system/orgType',
    method: 'post',
    data: data
  });
};

/**
 * 修改组织类型
 * @param data
 */
export const updateOrgType = (data: OrgTypeForm) => {
  return request({
    url: '/system/orgType',
    method: 'put',
    data: data
  });
};

/**
 * 删除组织类型
 * @param id
 */
export const delOrgType = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/orgType/' + id,
    method: 'delete'
  });
};

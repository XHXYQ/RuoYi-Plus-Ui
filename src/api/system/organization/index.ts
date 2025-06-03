import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OrganizationVO, OrganizationForm, OrganizationQuery } from '@/api/system/organization/types';

/**
 * 查询公司组织管理列表
 * @param query
 * @returns {*}
 */

export const listOrganization = (query?: OrganizationQuery): AxiosPromise<OrganizationVO[]> => {
  return request({
    url: '/system/organization/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询公司组织管理详细
 * @param id
 */
export const getOrganization = (id: string | number): AxiosPromise<OrganizationVO> => {
  return request({
    url: '/system/organization/' + id,
    method: 'get'
  });
};

/**
 * 新增公司组织管理
 * @param data
 */
export const addOrganization = (data: OrganizationForm) => {
  return request({
    url: '/system/organization',
    method: 'post',
    data: data
  });
};

/**
 * 修改公司组织管理
 * @param data
 */
export const updateOrganization = (data: OrganizationForm) => {
  return request({
    url: '/system/organization',
    method: 'put',
    data: data
  });
};

/**
 * 删除公司组织管理
 * @param id
 */
export const delOrganization = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/organization/' + id,
    method: 'delete'
  });
};

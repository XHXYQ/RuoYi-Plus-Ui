import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OnboardingVO, OnboardingForm, OnboardingQuery } from '@/api/system/onboarding/types';

/**
 * 查询员工入职申请列表
 * @param query
 * @returns {*}
 */

export const listOnboarding = (query?: OnboardingQuery): AxiosPromise<OnboardingVO[]> => {
  return request({
    url: '/system/onboarding/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询员工入职申请详细
 * @param onboardingId
 */
export const getOnboarding = (onboardingId: string | number): AxiosPromise<OnboardingVO> => {
  return request({
    url: '/system/onboarding/' + onboardingId,
    method: 'get'
  });
};

/**
 * 新增员工入职申请
 * @param data
 */
export const addOnboarding = (data: OnboardingForm) => {
  return request({
    url: '/system/onboarding',
    method: 'post',
    data: data
  });
};

/**
 * 修改员工入职申请
 * @param data
 */
export const updateOnboarding = (data: OnboardingForm) => {
  return request({
    url: '/system/onboarding',
    method: 'put',
    data: data
  });
};

/**
 * 删除员工入职申请
 * @param onboardingId
 */
export const delOnboarding = (onboardingId: string | number | Array<string | number>) => {
  return request({
    url: '/system/onboarding/' + onboardingId,
    method: 'delete'
  });
};

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ChatSessionUserVO, ChatSessionUserForm, ChatSessionUserQuery } from '@/api/system/chatSessionUser/types';

/**
 * 查询会话参与人：记录会话中参与的用户，支持多用户加入群聊列表
 * @param query
 * @returns {*}
 */

export const listChatSessionUser = (query?: ChatSessionUserQuery): AxiosPromise<ChatSessionUserVO[]> => {
  return request({
    url: '/system/chatSessionUser/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询会话参与人：记录会话中参与的用户，支持多用户加入群聊详细
 * @param id
 */
export const getChatSessionUser = (id: string | number): AxiosPromise<ChatSessionUserVO> => {
  return request({
    url: '/system/chatSessionUser/' + id,
    method: 'get'
  });
};

/**
 * 新增会话参与人：记录会话中参与的用户，支持多用户加入群聊
 * @param data
 */
export const addChatSessionUser = (data: ChatSessionUserForm) => {
  return request({
    url: '/system/chatSessionUser',
    method: 'post',
    data: data
  });
};

/**
 * 修改会话参与人：记录会话中参与的用户，支持多用户加入群聊
 * @param data
 */
export const updateChatSessionUser = (data: ChatSessionUserForm) => {
  return request({
    url: '/system/chatSessionUser',
    method: 'put',
    data: data
  });
};

/**
 * 删除会话参与人：记录会话中参与的用户，支持多用户加入群聊
 * @param id
 */
export const delChatSessionUser = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/chatSessionUser/' + id,
    method: 'delete'
  });
};

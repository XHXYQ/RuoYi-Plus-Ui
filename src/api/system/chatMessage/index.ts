import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ChatMessageVO, ChatMessageForm, ChatMessageQuery } from '@/api/system/chatMessage/types';

/**
 * 查询消息：用于记录聊天内容列表
 * @param query
 * @returns {*}
 */

export const listChatMessage = (query?: ChatMessageQuery): AxiosPromise<ChatMessageVO[]> => {
  return request({
    url: '/system/chatMessage/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询消息：用于记录聊天内容详细
 * @param id
 */
export const getChatMessage = (id: string | number): AxiosPromise<ChatMessageVO> => {
  return request({
    url: '/system/chatMessage/' + id,
    method: 'get'
  });
};

/**
 * 新增消息：用于记录聊天内容
 * @param data
 */
export const addChatMessage = (data: ChatMessageForm) => {
  return request({
    url: '/system/chatMessage',
    method: 'post',
    data: data
  });
};

/**
 * 修改消息：用于记录聊天内容
 * @param data
 */
export const updateChatMessage = (data: ChatMessageForm) => {
  return request({
    url: '/system/chatMessage',
    method: 'put',
    data: data
  });
};

/**
 * 删除消息：用于记录聊天内容
 * @param id
 */
export const delChatMessage = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/chatMessage/' + id,
    method: 'delete'
  });
};

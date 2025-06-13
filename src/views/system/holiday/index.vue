<template>
  <div class="employee-management">
    <div class="action-section">
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">+ 新增假期规则</el-button>
      </div>
    </div>

    <div class="employee-table">
      <el-table 
        :data="filteredHolidayData" 
        style="width: 100%"
        stripe
        :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
        v-loading="loading"
      >
        <el-table-column prop="name" label="假期名称" min-width="120" fixed="left" >
          <template #default="{ row }">
            <div class="name-cell">
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="holidayType" label="请假单位" min-width="120" />
        <el-table-column prop="timeType" label="计算请假时长方式" min-width="120" />
        <el-table-column prop="balanceType" label="余额规则" min-width="120">
        <template #default="{ row }">
          {{ row.balanceType === '不限额' ? '不限制余额' : row.balanceType }}
        </template>
      </el-table-column>
        <el-table-column prop="scopeType" label="适用范围" min-width="120" />
        <el-table-column min-width="220" fixed="right" >
          <template #header>
            <span>操作</span>
          </template>
          <template #default="{ row }">
            <el-button type="text" @click="handleEditHoliday(row)">编辑</el-button>
            <el-button type="text" @click="handleDeleteHoliday(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="holidayForm" 
        label-width="115px"
        :rules="formRules"
        ref="holidayFormRef"
      >
        <el-form-item label="假期名称" prop="name">
          <el-input v-model="holidayForm.name" placeholder="请输入假期名称" />
        </el-form-item>
        <el-form-item label="应用范围" prop="scopeType">
            <el-select v-model="holidayForm.scopeType" placeholder="请选择应用范围" style="width: 100%">
              <el-option label="全公司" value="全公司" />
              <el-option label="部门/人员" value="部门/人员" />
            </el-select>
        </el-form-item>
        <el-form-item label="部门/人员" v-if="holidayForm.scopeType === '部门/人员'">
          <el-button type="primary" icon="Plus" circle @click="openUserSelect" />
          <el-tag v-for="user in selectedUserList" :key="user.userId" closable style="margin: 2px" @close="handleCloseTag(user)">
            {{ user.nickName }}
          </el-tag>
        </el-form-item>

        <el-form-item label="新员工请假" prop="newType">
          <el-select v-model="holidayForm.newType" placeholder="请选择新员工请假" style="width: 100%">
            <el-option label="入职即可请假" value="入职即可请假" />
            <el-option label="转正后才可请假" value="转正后才可请假" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否带薪" prop="moneyType">
          <el-select v-model="holidayForm.moneyType" placeholder="请选择是否带薪" style="width: 100%">
            <el-option label="带薪假" value="带薪假" />
            <el-option label="非带薪假" value="非带薪假" />
          </el-select>
            <p style="margin-top: 0px;">若员工请带薪假，将在考勤统计中算出勤</p>
        </el-form-item>
        <div>
            <p style="margin-left: 18px;">请假时长核算规则</p>
            <el-form-item label="最小请假单位" prop="holidayType">
                <el-select v-model="holidayForm.holidayType" placeholder="请选择最小请假单位" style="width: 100%">
                  <el-option label="按天请假" value="按天请假" />
                  <el-option label="按半天请假" value="按半天请假" />
                  <el-option label="按小时请假" value="按小时请假" />
                </el-select>

                <p style="margin-top: 0px; margin-bottom: 0px;" v-if="holidayForm.holidayType === '按天请假'">
                  员工以1天为最小单位选择时间，考勤报表按天统计
                </p>
                <p style="margin-top: 0px; margin-bottom: 0px;" v-if="holidayForm.holidayType === '按半天请假'">
                  员工以半天为最小单位选择时间，考勤报表按天统计
                </p>
                <p style="margin-top: 0px; margin-bottom: 0px;" v-if="holidayForm.holidayType === '按小时请假'">
                  员工以1小时为最小单位选择时间，考勤报表按小时统计
                </p>
            </el-form-item>
            <el-form-item 
                v-if="holidayForm.holidayType === '按小时请假'"
                label="请假时长取整" 
                prop="holidaytimeType"
                style="display: inline-flex; align-items: center; margin-right: 10px;"
            >
                <el-select 
                  v-model="holidayForm.holidaytimeType" 
                  placeholder="请选择取整方式" 
                  style="width: 135px"
                >
                  <el-option label="不取整" value="不取整" />
                  <el-option label="向上取整" value="向上取整" />
                  <el-option label="向下取整" value="向下取整" />
                </el-select>
            </el-form-item>
            <el-form-item 
                v-if="holidayForm.holidaytimeType === '向上取整' || holidayForm.holidaytimeType === '向下取整'"
                prop="roundingUnit"
                style="width: 100%;"
            >
                <el-select 
                  v-model="holidayForm.roundingUnit" 
                  placeholder="请选择取整单位" 
                  style="width: 135px"
                >
                  <el-option label="按小时取整" value="按小时取整" />
                  <el-option label="按半小时取整" value="按半小时取整" />
                </el-select>
            </el-form-item>
            <el-form-item label="请假时长核算" prop="timeType">
              <el-select v-model="holidayForm.timeType" placeholder="请选择请假时长核算" style="width: 100%">
                <el-option label="按自然日计算请假时长" value="按自然日计算请假时长" />
                <el-option label="按工作日计算请假时长" value="按工作日计算请假时长" />
              </el-select>
              <p style="margin-top: 0px; margin-bottom: 0px;" v-if="holidayForm.timeType === '按自然日计算请假时长'">请假时段中包含的休息日，也会计入请假天数</p>
              <p style="margin-top: 0px; margin-bottom: 0px;" v-if="holidayForm.timeType === '按工作日计算请假时长'">请假时段中不包含员工的休息日，例如未排班的双休日、法定节假日</p>
            </el-form-item>
        </div>

        <el-radio-group v-model="radio1" style="margin-left: 18px;">
            <el-radio value="1" size="large">不限额</el-radio>
            <el-radio value="2" size="large">限额</el-radio>
        </el-radio-group>

        <!-- 仅当选择"限额"时显示余额发放方式 -->
        <div v-if="radio1 === '2'">
          <!-- 余额发放方式下拉框 -->
          <el-form-item label="余额发放方式" prop="balanceType">
            <el-select 
              v-model="holidayForm.balanceType" 
              placeholder="请选择余额发放方式" 
              style="width: 100%"
            >
              <el-option label="每月自动发放1次" value="每月自动发放1次" />
              <el-option label="每年自动发放1次" value="每年自动发放1次" />
              <el-option label="手动发放" value="手动发放" />
              <el-option label="加班时长自动计入余额" value="加班时长自动计入余额" />
            </el-select>
          </el-form-item>

          <!-- 情况1：每月自动发放1次 -->
          <div v-if="holidayForm.balanceType === '每月自动发放1次'">
            <el-form-item label="发放日期" prop="monthlyIssueDate">
                <div style="display: flex; align-items: center;">
                    <p style="margin-top: 0px; margin-bottom: 0px;">每</p>
                    <el-input
                      v-model="holidayForm.monthlyIssueDate"
                      style="width: 60px; margin-left: 5px; margin-right: 5px;"
                      type="number"
                    />
                    <p style="margin-top: 0px; margin-bottom: 0px;">日发放</p>
                </div>
            </el-form-item>
            <el-form-item label="额度配置规则" prop="monthlyQuotaRule">
              <el-select 
                v-model="holidayForm.monthlyQuotaRule" 
                placeholder="请选择额度配置规则" 
                style="width: 100%"
              >
                <el-option label="固定额度" value="固定额度" />
              </el-select>
            </el-form-item>
            <el-form-item label="额度" prop="monthlyQuota">
                <div style="display: flex; align-items: center;">
                    <p style="margin-top: 0px; margin-bottom: 0px;">每人每月发放</p>
                    <el-input
                      v-model="holidayForm.monthlyQuota"
                      style="width: 60px; margin-left: 5px; margin-right: 5px;"
                      type="number"
                    />
                    <p style="margin-top: 0px; margin-bottom: 0px;">{{ holidayForm.holidayType === '按小时请假' ? '小时' : '天' }}</p>
                </div>
            </el-form-item>
            <el-form-item label="有效期" prop="monthlyValidity" style="margin-top: 0px; margin-bottom: 0px;">
              <el-select 
                v-model="holidayForm.monthlyValidity" 
                placeholder="请选择有效期" 
                style="width: 100%"
              >
                <el-option label="自发放日起1个月" value="自发放日起1个月" />
              </el-select>
            </el-form-item>
            <el-form-item style="margin-top: 0px; margin-bottom: 0px;">
              <el-checkbox v-model="holidayForm.allowExtendYearly">允许延长有效期</el-checkbox>
            </el-form-item>
            <el-form-item v-if="holidayForm.allowExtendYearly">
                <div style="display: flex; align-items: center;">
                  <span>超过有效期后，余额保留</span>
                  <el-input 
                    v-model="holidayForm.retainValue" 
                    type="number" 
                    min="1" 
                    style="width: 80px; margin-left: 10px; margin-right: 10px;" 
                    placeholder="1" 
                  />
                  <el-select 
                    v-model="holidayForm.retainUnit" 
                    placeholder="单位" 
                    style="width: 100px;"
                  >
                    <el-option label="天" value="day" />
                    <el-option label="月" value="month" />
                  </el-select>
                </div>
            </el-form-item>
             <el-form-item style="margin-top: 10px; margin-bottom: 3px;" label="假期过期提醒">
                <el-switch v-model="holidayForm.expireReminder" style="padding-left: 5px;"/>
            </el-form-item>

            <div v-if="holidayForm.expireReminder">
              <el-form-item label="提醒时间" prop="remindTime" style="margin-bottom: 3px;">
                <div style="display: flex; align-items: center;">
                  <span>余额超过有效期前</span>
                  <el-select 
                    v-model="holidayForm.remindTime" 
                    placeholder="请选择时间"
                    style="width: 120px; margin-left: 10px;"
                  >
                    <el-option label="1个月" value="1" />
                    <el-option label="15天" value="15" />
                    <el-option label="7天" value="7" />
                    <el-option label="3天" value="3" />
                  </el-select>
                </div>
              </el-form-item>

              <el-form-item label="提醒范围">
                <div style="display: flex; flex-direction: column;">
                  <el-checkbox v-model="holidayForm.notifyEmployee">通知员工</el-checkbox>
                
                  <div style="display: flex; align-items: center; margin-top: 5px;">
                    <el-checkbox v-model="holidayForm.notifyManager">通知部门主管</el-checkbox>
                  </div>
                </div>
              </el-form-item>
              </div>
          </div>

          <!-- 情况2：每年自动发放1次 -->
          <div v-if="holidayForm.balanceType === '每年自动发放1次'">
            <el-form-item label="发放日期" prop="yearlyIssueDate">
              <el-select v-model="holidayForm.yearlyIssueDate" style="width: 100%">
                <el-option label="每年员工入职日" value="每年员工入职日" />
                <el-option label="每年1月1日" value="每年1月1日" />
              </el-select>
            </el-form-item>
        
            <el-form-item label="额度配置规则" prop="yearlyQuotaRule">
              <el-select 
                v-model="holidayForm.yearlyQuotaRule" 
                placeholder="请选择额度配置规则" 
                style="width: 100%"
              >
                <el-option label="固定额度" value="固定额度" />
                <el-option label="按社会工龄（参加工作总年限）" value="按社会工龄（参加工作总年限）" />
                <el-option label="按司龄（在本公司服务年限）" value="按司龄（在本公司服务年限）" />
                <el-option label="社会工龄配额与司龄配额相加" value="社会工龄配额与司龄配额相加" />
                <el-option label="取社会工龄配额与司龄配额较大值" value="取社会工龄配额与司龄配额较大值" />
              </el-select>
            </el-form-item>
        
            <el-form-item v-if="holidayForm.yearlyQuotaRule === '固定额度'" label="额度" prop="yearlyQuota">
                <div style="display: flex; align-items: center;">
                  <p style="margin-top: 0px; margin-bottom: 0px;">每人每月发放</p>
                  <el-input
                    v-model="holidayForm.yearlyQuota"
                    style="width: 60px; margin-left: 5px; margin-right: 5px;"
                    type="number"
                  />
                  <p style="margin-top: 0px; margin-bottom: 0px;">{{ holidayForm.holidayType === '按小时请假' ? '小时' : '天' }}</p>
                </div>
            </el-form-item>
        
            <div v-if="holidayForm.yearlyQuotaRule === '按社会工龄（参加工作总年限）'">
                <el-form-item label="工龄配额">
                  <div class="rule-item">
                    <div 
                      v-for="(rule, index) in holidayForm.socialAgeRules" 
                      :key="index"
                      class="condition-row"
                    >
                      <div class="input-group">
                        <span v-if="rule.type === 'lt'">
                          工龄 &lt; 1年，
                        </span>
                        <span v-else>
                          工龄 ≥ {{ rule.condition }}年，
                        </span>

                        <span>享有</span>

                        <el-input 
                          v-model="rule.value" 
                          style="width: 60px" 
                          type="number" 
                        />

                        <span>{{ holidayForm.holidayType === '按小时请假' ? '小时年假' : '天年假' }}</span>

                        <el-button
                          v-if="rule.condition >= 4"
                          type="text"
                          @click="removeRule('socialAgeRules', index)"
                        >
                          移除
                        </el-button>
                      </div>
                    </div>

                    <div class="condition-row">
                      <el-button 
                        type="text" 
                        @click="addRule('socialAgeRules')"
                      >
                        ▪ 新增一条
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
            </div>
        
            <div v-if="holidayForm.yearlyQuotaRule === '按司龄（在本公司服务年限）'">
              <el-form-item label="司龄配额">
                <div class="rule-item">
                  <div 
                    v-for="(rule, index) in holidayForm.companyAgeRules" 
                    :key="index"
                    class="condition-row"
                  >
                    <div class="input-group">
                      <span v-if="rule.type === 'lt'">
                        司龄 &lt; 1年，
                      </span>
                      <span v-else>
                        司龄 ≥ {{ rule.condition }}年，
                      </span>

                      <span>享有</span>

                      <el-input 
                        v-model="rule.value" 
                        style="width: 60px" 
                        type="number" 
                      />

                      <span>{{ holidayForm.holidayType === '按小时请假' ? '小时年假' : '天年假' }}</span>

                      <el-button
                        v-if="rule.condition >= 4"
                        type="text"
                        @click="removeRule('companyAgeRules', index)"
                      >
                        移除
                      </el-button>
                    </div>
                  </div>

                  <div class="condition-row">
                    <el-button 
                      type="text" 
                      @click="addRule('companyAgeRules')"
                    >
                      ▪ 新增一条
                    </el-button>
                  </div>
                </div>
              </el-form-item>
            </div>
        
            <div v-if="holidayForm.yearlyQuotaRule === '社会工龄配额与司龄配额相加' || 
                holidayForm.yearlyQuotaRule === '取社会工龄配额与司龄配额较大值'">
                <el-form-item label="工龄配额">
                  <div class="rule-item">
                    <div 
                      v-for="(rule, index) in holidayForm.socialAgeRules" 
                      :key="index"
                      class="condition-row"
                    >
                      <div class="input-group">
                        <span v-if="rule.type === 'lt'">
                          工龄 &lt; 1年，
                        </span>
                        <span v-else>
                          工龄 ≥ {{ rule.condition }}年，
                        </span>

                        <span>享有</span>

                        <el-input 
                          v-model="rule.value" 
                          style="width: 60px" 
                          type="number" 
                        />

                        <span>{{ holidayForm.holidayType === '按小时请假' ? '小时年假' : '天年假' }}</span>

                        <el-button
                          v-if="rule.condition >= 4"
                          type="text"
                          @click="removeRule('socialAgeRules', index)"
                        >
                          移除
                        </el-button>
                      </div>
                    </div>

                    <div class="condition-row">
                      <el-button 
                        type="text" 
                        @click="addRule('socialAgeRules')"
                      >
                        ▪ 新增一条
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
            
                <el-form-item label="司龄配额">
                  <div class="rule-item">
                    <div 
                      v-for="(rule, index) in holidayForm.companyAgeRules" 
                      :key="index"
                      class="condition-row"
                    >
                      <div class="input-group">
                        <span v-if="rule.type === 'lt'">
                          司龄 &lt; 1年，
                        </span>
                        <span v-else>
                          司龄 ≥ {{ rule.condition }}年，
                        </span>

                        <span>享有</span>

                        <el-input 
                          v-model="rule.value" 
                          style="width: 60px" 
                          type="number" 
                        />

                        <span>{{ holidayForm.holidayType === '按小时请假' ? '小时年假' : '天年假' }}</span>

                        <el-button
                          v-if="rule.condition >= 4"
                          type="text"
                          @click="removeRule('companyAgeRules', index)"
                        >
                          移除
                        </el-button>
                      </div>
                    </div>

                    <div class="condition-row">
                      <el-button 
                        type="text" 
                        @click="addRule('companyAgeRules')"
                      >
                        ▪ 新增一条
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
            </div>

            <el-form-item label="有效期" prop="yearlyValidity" style="margin-top: 0px; margin-bottom: 0px;">
              <el-select 
                v-model="holidayForm.yearlyValidity" 
                placeholder="请选择有效期" 
                style="width: 100%"
              >
                <el-option label="自发放日起1周年" value="自发放日起1周年" />
              </el-select>
            </el-form-item>

            <el-form-item style="margin-top: 0px; margin-bottom: 0px;">
              <el-checkbox v-model="holidayForm.allowExtendYearly">允许延长有效期</el-checkbox>
            </el-form-item>
            <el-form-item v-if="holidayForm.allowExtendYearly">
                <div style="display: flex; align-items: center;">
                  <span>超过有效期后，余额保留</span>
                  <el-input 
                    v-model="holidayForm.retainValue" 
                    type="number" 
                    min="1" 
                    style="width: 80px; margin-left: 10px; margin-right: 10px;" 
                    placeholder="1" 
                  />
                  <el-select 
                    v-model="holidayForm.retainUnit" 
                    placeholder="单位" 
                    style="width: 100px;"
                  >
                    <el-option label="天" value="day" />
                    <el-option label="月" value="month" />
                  </el-select>
                </div>
            </el-form-item>
             <el-form-item style="margin-top: 10px; margin-bottom: 3px;" label="假期过期提醒">
                <el-switch v-model="holidayForm.expireReminder" style="padding-left: 5px;"/>
            </el-form-item>

            <div v-if="holidayForm.expireReminder">
              <el-form-item label="提醒时间" prop="remindTime" style="margin-bottom: 3px;">
                <div style="display: flex; align-items: center;">
                  <span>余额超过有效期前</span>
                  <el-select 
                    v-model="holidayForm.remindTime" 
                    placeholder="请选择时间"
                    style="width: 120px; margin-left: 10px;"
                  >
                    <el-option label="1个月" value="1" />
                    <el-option label="15天" value="15" />
                    <el-option label="7天" value="7" />
                    <el-option label="3天" value="3" />
                  </el-select>
                </div>
              </el-form-item>

              <el-form-item label="提醒范围">
                <div style="display: flex; flex-direction: column;">
                  <el-checkbox v-model="holidayForm.notifyEmployee">通知员工</el-checkbox>
                
                  <div style="display: flex; align-items: center; margin-top: 5px;">
                    <el-checkbox v-model="holidayForm.notifyManager">通知部门主管</el-checkbox>
                  </div>
                </div>
              </el-form-item>
            </div>
          </div>

        <!-- 情况3：手动发放 -->
        <div v-if="holidayForm.balanceType === '手动发放'">
          <el-form-item label="有效期" prop="manualValidity" style="margin-top: 0px; margin-bottom: 0px;">
            <el-select 
              v-model="holidayForm.manualValidity" 
              placeholder="请选择有效期" 
              style="width: 100%;"
            >
              <el-option label="按入职日起12个月" value="按入职日起12个月" />
              <el-option label="按自然年(1月1日-12月31日)" value="按自然年(1月1日-12月31日)" />
            </el-select>
          </el-form-item>
           <el-form-item style="margin-top: 0px; margin-bottom: 0px;">
              <el-checkbox v-model="holidayForm.allowExtendYearly">允许延长有效期</el-checkbox>
            </el-form-item>
            <el-form-item v-if="holidayForm.allowExtendYearly">
                <div style="display: flex; align-items: center;">
                  <span>超过有效期后，余额保留</span>
                  <el-input 
                    v-model="holidayForm.retainValue" 
                    type="number" 
                    min="1" 
                    style="width: 80px; margin-left: 10px; margin-right: 10px;" 
                    placeholder="1" 
                  />
                  <el-select 
                    v-model="holidayForm.retainUnit" 
                    placeholder="单位" 
                    style="width: 100px;"
                  >
                    <el-option label="天" value="day" />
                    <el-option label="月" value="month" />
                  </el-select>
                </div>
            </el-form-item>
            <el-form-item style="margin-top: 10px; margin-bottom: 3px;" label="假期过期提醒">
                <el-switch v-model="holidayForm.expireReminder" style="padding-left: 5px;"/>
            </el-form-item>

            <div v-if="holidayForm.expireReminder">
              <el-form-item label="提醒时间" prop="remindTime" style="margin-bottom: 3px;">
                <div style="display: flex; align-items: center;">
                  <span>余额超过有效期前</span>
                  <el-select 
                    v-model="holidayForm.remindTime" 
                    placeholder="请选择时间"
                    style="width: 120px; margin-left: 10px;"
                  >
                    <el-option label="1个月" value="1" />
                    <el-option label="15天" value="15" />
                    <el-option label="7天" value="7" />
                    <el-option label="3天" value="3" />
                  </el-select>
                </div>
              </el-form-item>

              <el-form-item label="提醒范围">
                <div style="display: flex; flex-direction: column;">
                  <el-checkbox v-model="holidayForm.notifyEmployee">通知员工</el-checkbox>
                
                  <div style="display: flex; align-items: center; margin-top: 5px;">
                    <el-checkbox v-model="holidayForm.notifyManager">通知部门主管</el-checkbox>
                  </div>
                </div>
              </el-form-item>
            </div>
        </div>
       </div>
      </el-form>
      
      <!-- 用户选择组件 -->
      <UserSelect ref="userSelectRef" :multiple="true" :data="selectedUserIds" @confirm-call-back="userSelectCallBack"></UserSelect>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :loading="submitLoading">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import UserSelect from '@/components/UserSelect/index.vue'
import { 
  listHoliday, 
  pageHoliday, 
  addHoliday, 
  updateHoliday, 
  deleteHoliday,
  getHoliday,
  getHolidayScopeUsers
} from '@/api/system/holiday'
import type { 
  SysHolidayVO, 
  SysHolidayQuery, 
  SysHolidayForm,
  HolidayQuotaRule
} from '@/api/system/holiday/types'

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 用户选择相关
const userSelectRef = ref<InstanceType<typeof UserSelect>>()
const selectedUserList = ref<Array<{userId: number, nickName: string}>>([])
const selectedUserIds = ref('')


// 打开用户选择弹窗
const openUserSelect = () => {
  userSelectRef.value?.open()
}


const userSelectCallBack = (data: Array<{userId: number, nickName: string}>) => {
  if (data && data.length > 0) {
    selectedUserList.value = data
    // 同时更新表单中的ID和昵称数组
    holidayForm.selectedUserIds = data.map(user => user.userId)
    holidayForm.selectedUserNickNames = data.map(user => user.nickName)
  }
}

// 删除已选择的用户
const handleCloseTag = (user: {userId: number, nickName: string}) => {
  const index = selectedUserList.value.findIndex(item => item.userId === user.userId)
  if (index !== -1) {
    selectedUserList.value.splice(index, 1)
    // 同步更新表单中的数组
    holidayForm.selectedUserIds = selectedUserList.value.map(u => u.userId)
    holidayForm.selectedUserNickNames = selectedUserList.value.map(u => u.nickName)
  }
}

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增假期规则')
const radio1 = ref('1')

// 搜索条件
const searchQuery = reactive({
  name: ''
})

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 假期数据
const holidayData = ref<SysHolidayVO[]>([])

// 假期表单
const holidayForm = reactive<SysHolidayForm>({
  name: '',
  balanceType: '不限额',
  // 每月发放相关字段
  monthlyIssueDate: undefined,
  monthlyQuotaRule: '',
  monthlyQuota: undefined,
  monthlyValidity: '',
  // 每年发放相关字段
  yearlyIssueDate: '',
  yearlyQuotaRule: '',
  yearlyQuota: undefined,
  yearlyValidity: '',
  allowExtendYearly: false,
  retainValue: 1,
  retainUnit: 'month',
  // 公司工龄规则数组
  companyAgeRules: [
    { condition: 0, value: 0, type: 'lt' },  // <1年
    { condition: 1, value: 0, type: 'gte' }, // ≥1年
    { condition: 2, value: 0, type: 'gte' }, // ≥2年
    { condition: 3, value: 0, type: 'gte' }  // ≥3年
  ],
  // 社会工龄规则数组
  socialAgeRules: [
    { condition: 0, value: 0, type: 'lt' },  // <1年
    { condition: 1, value: 0, type: 'gte' }, // ≥1年
    { condition: 2, value: 0, type: 'gte' }, // ≥2年
    { condition: 3, value: 0, type: 'gte' }  // ≥3年
  ],
  // 基础规则
  newType: '',
  moneyType: '',
  holidayType: '',
  timeType: '',
  scopeType: '',
  // 提醒设置
  expireReminder: false,
  remindTime: '1',      
  notifyEmployee: true, 
  notifyManager: true,  
  // 其他
  roundingUnit: '',
  holidaytimeType: '',
  // 适用范围
  selectedUserIds: [],
  manualValidity: ''
})

// 表单验证规则
const formRules = reactive({
  name: [{ required: true, message: '请输入假期名称', trigger: 'blur' }],
  scopeType: [{ required: true, message: '请选择应用范围', trigger: 'change' }],
  newType: [{ required: true, message: '请选择新员工请假规则', trigger: 'change' }],
  moneyType: [{ required: true, message: '请选择是否带薪', trigger: 'change' }],
  holidayType: [{ required: true, message: '请选择最小请假单位', trigger: 'change' }],
  timeType: [{ required: true, message: '请选择请假时长核算方式', trigger: 'change' }],
  balanceType: [{ required: true, message: '请选择余额发放方式', trigger: 'change' }],
  monthlyIssueDate: [{ 
    required: true, 
    validator: (rule: any, value: any, callback: any) => {
      if (holidayForm.balanceType === '每月自动发放1次' && !value) {
        callback(new Error('请输入发放日期'))
      } else {
        callback()
      }
    },
    trigger: 'blur' 
  }],
  monthlyQuota: [{ 
    required: true, 
    validator: (rule: any, value: any, callback: any) => {
      if (holidayForm.balanceType === '每月自动发放1次' && !value) {
        callback(new Error('请输入额度'))
      } else {
        callback()
      }
    },
    trigger: 'blur' 
  }],
  yearlyQuota: [{ 
    required: true, 
    validator: (rule: any, value: any, callback: any) => {
      if (holidayForm.balanceType === '每年自动发放1次' && 
          holidayForm.yearlyQuotaRule === '固定额度' && 
          !value) {
        callback(new Error('请输入额度'))
      } else {
        callback()
      }
    },
    trigger: 'blur' 
  }]
})

// 添加规则
const addRule = (ruleType: 'socialAgeRules' | 'companyAgeRules') => {
  // 确保数组存在
  holidayForm[ruleType] = holidayForm[ruleType] || []
  
  const rules = holidayForm[ruleType]
  const maxCondition = rules.length > 0 
    ? Math.max(...rules.map(r => r.condition))
    : 0
  
  // 使用Vue.set或直接赋值确保响应式
  holidayForm[ruleType] = [
    ...rules,
    {
      condition: maxCondition + 1,
      value: 0,
      type: 'gte'
    }
  ]
  
  ElMessage.success(`已添加${ruleType === 'socialAgeRules' ? '工龄' : '司龄'}配额规则`)
}
// 移除规则
const removeRule = (ruleType: 'socialAgeRules' | 'companyAgeRules', index: number) => {
  if (holidayForm[ruleType].length <= 1) {
    return ElMessage.warning('至少需要保留一条规则')
  }
  
  holidayForm[ruleType].splice(index, 1)
  ElMessage.success('已移除规则')
}

// 筛选后的假期数据
const filteredHolidayData = computed(() => {
  let data = [...holidayData.value]
  
  // 应用搜索条件
  if (searchQuery.name) {
    data = data.filter(item => item.name?.includes(searchQuery.name))
  }
  
  return data
})

// 获取假期列表
const getHolidayList = async () => {
  loading.value = true
  try {
    const res = await pageHoliday({
      ...searchQuery,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    })

    // 检查返回的数据结构
    console.log('API返回数据:', res)
    
    // 根据实际返回结构调整
    holidayData.value = res.data?.rows || res.rows || []
    pagination.total = res.data?.total || res.total || 0
    
  } catch (error) {
    console.error('获取假期列表失败:', error)
    ElMessage.error('获取假期列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNum = 1 // 重置到第一页
  getHolidayList()
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  getHolidayList()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  getHolidayList()
}

// 打开新增假期对话框
const handleAdd = () => {
  dialogTitle.value = '新增假期规则'
  Object.assign(holidayForm, {
    name: '',
    balanceType: '',
    monthlyIssueDate: undefined,
    monthlyQuotaRule: '',
    monthlyQuota: undefined,
    monthlyValidity: '',
    yearlyIssueDate: '',
    yearlyQuotaRule: '',
    yearlyQuota: undefined,
    yearlyValidity: '',
    allowExtendYearly: false,
    retainValue: 1,
    retainUnit: 'month',
    companyAgeRules: [
      { condition: 0, value: 0, type: 'lt' },
      { condition: 1, value: 0, type: 'gte' },
      { condition: 2, value: 0, type: 'gte' },
      { condition: 3, value: 0, type: 'gte' }
    ],
    socialAgeRules: [
      { condition: 0, value: 0, type: 'lt' },
      { condition: 1, value: 0, type: 'gte' },
      { condition: 2, value: 0, type: 'gte' },
      { condition: 3, value: 0, type: 'gte' }
    ],
    newType: '',
    moneyType: '',
    holidayType: '',
    timeType: '',
    scopeType: '',
    expireReminder: false,
    remindTime: '1',
    notifyEmployee: true,
    notifyManager: true,
    roundingUnit: '',
    holidaytimeType: '',
    selectedUserIds: [],
    manualValidity: ''
  })
  // 清空已选择的用户
  selectedUserList.value = []
  selectedUserIds.value = ''
  dialogVisible.value = true
}

// 打开编辑假期对话框
const handleEditHoliday = async (row: SysHolidayVO) => {
  dialogTitle.value = '编辑假期规则'
  try {
    loading.value = true
    const res = await getHoliday(row.holidayId)
    Object.assign(holidayForm, res.data)
    
    if (res.data.scopeType === '部门/人员') {
      const usersRes = await getHolidayScopeUsers(row.holidayId)
      console.log('用户数据:', usersRes.data) // 添加这行调试代码
      
      // 确保正确处理返回数据
      selectedUserList.value = usersRes.data.map(user => ({
        userId: user.userId,
        nickName: user.nickName
      }))
      
      // 同时更新表单中的ID和昵称数组
      holidayForm.selectedUserIds = selectedUserList.value.map(u => u.userId)
      holidayForm.selectedUserNickNames = selectedUserList.value.map(u => u.nickName)
    } else {
      selectedUserList.value = []
      holidayForm.selectedUserIds = []
      holidayForm.selectedUserNickNames = []
    }
    
    dialogVisible.value = true
  } catch (error) {
    console.error('获取假期详情失败:', error)
    ElMessage.error('获取假期详情失败')
  } finally {
    loading.value = false
  }
}

// 删除假期
const handleDeleteHoliday = (row: SysHolidayVO) => {
  ElMessageBox.confirm('确认删除该假期规则吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteHoliday(row.holidayId)
      ElMessage.success('删除成功')
      getHolidayList()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 确认保存假期
const handleConfirm = async () => {
  try {
    // 将选择的用户ID列表和昵称赋值给表单
    if (holidayForm.scopeType === '部门/人员') {
      holidayForm.selectedUserIds = selectedUserList.value.map(user => user.userId);
      holidayForm.selectedUserNickNames = selectedUserList.value.map(user => user.nickName);
    } else {
      holidayForm.selectedUserIds = [];
      holidayForm.selectedUserNickNames = [];
    }
    
    // 根据radio1的值设置balanceType
    holidayForm.balanceType = radio1.value === '1' ? '不限额' : holidayForm.balanceType
    
    await holidayFormRef.value?.validate()
    submitLoading.value = true
    
    const apiCall = dialogTitle.value === '新增假期规则' 
      ? addHoliday(holidayForm) 
      : updateHoliday(holidayForm)
    
    await apiCall
    ElMessage.success('操作成功')
    
    dialogVisible.value = false
    await getHolidayList()
    window.dispatchEvent(new CustomEvent('holidayRulesUpdated'))
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.response?.data?.msg || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

const displayedHolidayData = computed(() => {
  return holidayData.value.map(item => ({
    ...item,
    balanceType: item.balanceType === '不限额' ? '不限制余额' : item.balanceType
  }))
})

const handleList = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/system/holidayEdit/index`,
    query: {
      type: 'add'
    }
  });
};

// 初始化数据
onMounted(() => {
  getHolidayList()
})

const holidayFormRef = ref<FormInstance>()
</script>

<style scoped>
.employee-management {
  padding: 20px;
  background-color: #f5f7fa;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-table {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.el-table {
  flex: 1;
  overflow: auto;
}

.el-table::before {
  height: 0;
}

.el-table th.el-table__cell {
  background-color: #f5f7fa !important;
}

.el-table--border::after, .el-table--group::after {
  width: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 规则项样式 */
.rule-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.condition-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.input-group span {
  white-space: nowrap;
}
</style>
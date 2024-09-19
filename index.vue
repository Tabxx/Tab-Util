<template>
    <div class="home">
      <div v-if="!noLogin">
        <xtz-error-loading
          errorText="接口开小差了"
          :showStatus="showStatus"
          @onClickTryAgainBtn="onClickTryAgainBtn"
          v-if="showStatus !== 0"
        />
        <div v-else class="home-page">
          <TaskPopup
            :showPopup="showTaskMorePopup"
            :taskList="taskList"
            @closeBottomPopup="showTaskMorePopup = false"
            @completeTask="completeTask"
          />
          <div>
            <HomeHeader :userLevel="userLevel" @showMiniProgram="showMiniProgram"></HomeHeader>
            <MyBenefit :userLevel="userLevel" :currentTime="currentTime"></MyBenefit>
          </div>
          <div class="content" :class="isMiniApp ? 'mini-content' : ''">
            <ShareGuideMask v-if="showShareGuide" @closeMask="closeMask" />
            <div class="coin-task">
              <MyCoin :decisionCoinBalance="decisionCoinBalance"></MyCoin>
              <TaskCenter @showTaskMore="showTaskMorePopup = true" :signTask="signTask"></TaskCenter>
            </div>
            <GameCenter @jumpToGameCenter="completeTaskApi('game_wechat')"></GameCenter>
            <BenefitCenter :currentTime="currentTime"></BenefitCenter>
          </div>
        </div>
      </div>
      <div v-else class="empty-container">
        <Empty :text="'登录失败'" :showLogin="true"></Empty>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import HomeHeader from './components/HomeHeader.vue';
  import MyBenefit from './components/MyBenefit.vue';
  import MyCoin from './components/MyCoin.vue';
  import TaskCenter from './components/TaskCenter.vue';
  import TaskPopup from './components/TaskPopup.vue';
  import GameCenter from './components/GameCenter.vue';
  import BenefitCenter from './components/BenefitCenter.vue';
  import ShareGuideMask from './components/ShareGuideMask.vue';
  import Empty from '@/pages/index/views/DecisionCoin/components/Empty.vue';
  import { Toast } from '@atom/atom-ui';
  
  import { ref, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
  import { homePage } from '@/utils/stat';
  import {
    LOADING_STATUS,
    NORMAL_STATUS,
    ERROR_STATUS,
    EQUITY_PARAM_ID,
    PROD_SCENE_ID,
    TEST_SCENE_ID,
    REFRESH_TASK_STATUS_TIME,
    GAME_URL,
    DIAGNOSIS_URL,
    JUMP_SETTIMEOUT
  } from '@/utils/constant';
  import {
    getHomeData,
    getTaskStatus,
    getLiveUrl,
    getPlaybackUrl,
    finishTask,
    getIntegralInfo,
    getUserLevel,
    getCurrentTime
  } from '../../apis/index';
  import { getCurrentEnvMode, lockOrUnlockBg, redirectToHttps } from '@/utils/tools';
  import { jumpPage, postWxMessage } from '@/pages/index/utils/wxTool';
  
  // 页面状态
  const showStatus = ref(0);
  // 用户等级
  const userLevel = ref(1);
  // 决策币余额
  const decisionCoinBalance = ref(0);
  // 分享引导蒙层是否可见
  const showShareGuide = ref(false);
  // 任务弹窗是否可见
  // TODO AI建议：showTaskMorePopup可以更改为showMoreTaskPopup
  const showTaskMorePopup = ref(false);
  // 任务列表
  const taskList = ref([]);
  // 任务状态列表
  const taskStatusList = ref([]);
  // 是否发送滚动埋点
  // TODO AI建议：ifSendScrollStat应更改为hasSentScrollStat以表示它是一个布尔值且与发送埋点统计相关
  const ifSendScrollStat = ref(true);
  // 任务id字符串
  const taskIdStr = ref('');
  // 完成任务接口锁
  const completeTaskApiLock = ref(false);
  // 完成任务后刷新任务状态的定时器
  const completeTaskTimeout = ref(0 || null);
  // 服务器时间
  const currentTime = ref('');
  // 是否登录
  const noLogin = ref(false);
  // 签到任务状态
  const signTask = ref({});
  // 端内还是小程序
  const isMiniApp = ref(false);
  // 判断是小程序还是端内
  function showMiniProgram(isMini) {
    isMiniApp.value = isMini;
  }
  // 滚动监听(埋点)
  function scrollListener() {
    // 滚动埋点仅发一次，发送一次后就不再发
    if (ifSendScrollStat.value) {
      homePage('.kcmk.slide');
      ifSendScrollStat.value = false;
    }
  }
  // 把任务id拼成字符串用于请求任务状态接口
  function getTaskIdStr(list) {
    list.forEach((item, index) => {
      // 是否需要加逗号
      const isNeedComma = index === list.length - 1 ? '' : ',';
      taskIdStr.value += item.extendId + isNeedComma;
    });
  }
  // 获取任务状态
  function getTaskStatusList() {
    const param = {
      task_id: taskIdStr.value,
      scene_id: getCurrentEnvMode() === 'release' ? PROD_SCENE_ID : TEST_SCENE_ID
    };
    // 获取任务状态列表
    getTaskStatus(param)
      .then(res => {
        if (res.statusCode === 0) {
          taskStatusList.value = res.data;
          // 组合任务列表和状态列表
          mergeTaskList();
          // 页面状态置为正常状态
          showStatus.value = NORMAL_STATUS;
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        showStatus.value = ERROR_STATUS;
      });
  }
  // 获取回放地址，没有做兜底，因为已经在获取直播地址接口里做过兜底了
  function getPlaybackUrlAndInsertTask() {
    getPlaybackUrl({}).then(res => {
      if (res.statusCode === 0) {
        taskList.value.forEach(item => {
          // 直播任务且不为回放任务
          if (item.userAction === 'watch_replays_live') {
            Reflect.set(item, 'liveUrl', res.data.url);
          }
        });
      }
    });
  }
  // 获取直播间地址并插入任务列表
  function getLiveUrlAndInsertTask() {
    getLiveUrl({})
      .then(res => {
        if (res.statusCode === 0) {
          taskList.value.forEach(item => {
            // 直播任务且不为回放任务
            if (item.taskType === '4' && item.userAction !== 'watch_replays_live') {
              Reflect.set(item, 'liveUrl', res.data.url);
            } else {
              // 其他任务直播地址置为空，这里同时也是给回放接口做兜底，回放接口报错时确保回放地址是空字符串
              Reflect.set(item, 'liveUrl', '');
            }
          });
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        // 接口报错时所有直播地址都是空
        taskList.value.forEach(item => {
          Reflect.set(item, 'liveUrl', '');
        });
      })
      .finally(() => {
        // 获取回放地址(放在finally里是防止直播地址接口比回放接口慢时处理数据会把回放地址盖掉)
        getPlaybackUrlAndInsertTask();
      });
  }
  // 合并任务列表和任务状态列表
  function mergeTaskList() {
    for (let i = 0; i < taskList.value.length; i++) {
      for (let j = 0; j < taskStatusList.value.length; j++) {
        if (Number(taskList.value[i].extendId) === taskStatusList.value[j].taskId) {
          // 添加状态（给对象添加属性，相当于vue2的$set）
          Reflect.set(taskList.value[i], 'status', taskStatusList.value[j].taskStatus);
          // 添加总次数
          Reflect.set(taskList.value[i], 'totalCount', taskStatusList.value[j].threshold);
          // 添加已完成次数
          Reflect.set(taskList.value[i], 'finishCount', taskStatusList.value[j].finishCount);
        }
      }
    }
    // 有定时器的话清除定时器
    if (completeTaskTimeout.value) {
      clearTimeout(completeTaskTimeout.value);
      completeTaskTimeout.value = null;
    }
    // 签到任务
    taskList.value = JSON.parse(JSON.stringify(taskList.value));
    signTask.value = taskList.value.find(item => item.userAction === 'sign_in_wechat');
  }
  // 用户回到页面需要请求任务状态接口更新任务状态
  function pageOnshow() {
    if (document.visibilityState === 'visible') {
      getTaskStatusList();
    }
  }
  function initData() {
    const params = {
      project_id: EQUITY_PARAM_ID
    };
    const [homeDataPromise, userLevelPromise, currentTimePromise] = [
      getHomeData(params),
      getUserLevel(),
      getCurrentTime()
    ];
    Promise.all([homeDataPromise, userLevelPromise, currentTimePromise])
      .then(([homeRes, userLevelRes, currentTimeRes]) => {
        if (homeRes.statusCode === 0) {
          const data = homeRes.data;
          // 获取决策币余额
          decisionCoinBalance.value = data.userIntegral;
          // 获取任务列表
          taskList.value = data.taskManagementList;
          // 拼接任务id字符串
          getTaskIdStr(data.taskManagementList);
          // 获取任务状态列表
          getTaskStatusList();
          // 获取直播间地址
          getLiveUrlAndInsertTask();
        } else {
          throw new Error('首页数据获取失败');
        }
  
        if (userLevelRes.statusCode === 0) {
          userLevel.value = userLevelRes.data.userLevel;
        } else {
          throw new Error('用户等级获取失败');
        }
  
        if (currentTimeRes.statusCode === 0) {
          currentTime.value = currentTimeRes.data.currentTime;
        } else {
          throw new Error('用户等级获取失败');
        }
        // 页面状态置为正常状态
        showStatus.value = NORMAL_STATUS;
      })
      .catch(() => {
        showStatus.value = ERROR_STATUS;
      });
  }
  async function initPage() {
    // 页面状态置为加载状态
    showStatus.value = LOADING_STATUS;
    // 首页曝光埋点
    homePage('');
    await nextTick();
    // 添加滚动监听
    document.addEventListener('scroll', scrollListener);
    // 添加页面可见性监听为了及时更新任务状态
    document.addEventListener('visibilitychange', pageOnshow);
    // 获取数据
    initData();
  }
  // 点击刷新按钮
  // TODO: AI建议retryFetchData
  function onClickTryAgainBtn() {
    // 置为加载中状态
    showStatus.value = LOADING_STATUS;
    // 刷新时要把任务id置为空防止拼接异常
    taskIdStr.value = '';
    initData();
  }
  // 关闭蒙层
  function closeMask() {
    showShareGuide.value = false;
  }
  // 监听蒙层变量，蒙层出现时固定页面，消失时解除固定。同时保持页面还在原滚动位置
  watch(showShareGuide, newVal => {
    lockOrUnlockBg(newVal);
  });
  // 兑换完权益之后刷新积分
  function refreshScore() {
    let getScoreTimeout = setTimeout(() => {
      const params = {
        userId: window.getUserid(),
        project_id: EQUITY_PARAM_ID
      };
      getIntegralInfo(params)
        .then(res => {
          if (res.statusCode === 0) {
            decisionCoinBalance.value = res.data.userIntegral;
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Toast('数据获取失败，请刷新页面重试');
        });
      clearTimeout(getScoreTimeout);
      getScoreTimeout = null;
    }, REFRESH_TASK_STATUS_TIME);
  }
  // 完成任务后更新任务状态（只有签到和分享走这里，因为这两个任务完成后不跳走）
  function updateStatusAfterCompleteTask() {
    // 因为完成任务接口有1s左右的延时，所以防止任务状态更新失败需要加一个定时器
    completeTaskTimeout.value = setTimeout(() => {
      getTaskStatusList();
    }, REFRESH_TASK_STATUS_TIME);
  }
  // 完成任务接口
  function completeTaskApi(userAction: string, liveUrl: string = '') {
    const params = {
      user_action: userAction,
      scene_id: getCurrentEnvMode() === 'release' ? PROD_SCENE_ID : TEST_SCENE_ID
    };
    // 没锁时调接口
    if (!completeTaskApiLock.value) {
      // 加锁
      completeTaskApiLock.value = true;
      finishTask(params)
        .then(res => {
          if (res.statusCode === 0) {
            // 刷新积分
            refreshScore();
            switch (userAction) {
              // 小游戏
              case 'game_wechat':
                showTaskMorePopup.value = false;
                jumpPage({ url: GAME_URL, title: '猜涨跌' });
                break;
              // 诊股
              case 'stock_wechat':
                showTaskMorePopup.value = false;
                redirectToHttps(DIAGNOSIS_URL);
                break;
              // 签到
              case 'sign_in_wechat':
                Toast('签到成功');
                updateStatusAfterCompleteTask();
                signTask.value.status = true;
                break;
              // 分享
              case 'share_wechat':
                updateStatusAfterCompleteTask();
                break;
              // 回放任务
              case 'watch_replays_live':
                showTaskMorePopup.value = false;
                redirectToHttps(liveUrl);
                break;
              default:
                break;
            }
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Toast('接口开小差了');
        })
        .finally(() => {
          // 解开锁
          completeTaskApiLock.value = false;
        });
    }
  }
  // 给小程序发消息并跳转相应页面
  function sendMessageAndGo(url, title = '直播') {
    postWxMessage({
      shareTitle: title,
      shareUrl: `/pages/index/other?to_url=${encodeURIComponent(url)}`
    });
    redirectToHttps(url);
  }
  // 完成任务
  function completeTask(item: object) {
    if (item.userAction === 'share_wechat') {
      // 分享任务需要弹出分享引导蒙层，完成二次分享后再调完成任务接口
      showShareGuide.value = true;
      try {
        completeTaskApi(item.userAction);
        //wxSdk为微信sdk
        postWxMessage({
          shareTitle: '决策学习社',
          shareUrl: `/pages/index/index`
        });
        setTimeout(() => {
          showShareGuide.value = false;
        }, REFRESH_TASK_STATUS_TIME);
      } catch (error) {
        // nothing
      }
    } else if (item.taskType === '0' && item.userAction !== 'share_wechat') {
      // 社群类任务点击就算完成
      completeTaskApi(item.userAction);
    } else {
      // 直播/回放任务处理
      if (item.liveUrl === '') {
        // 直播或回放接口报错时跳课程页决策训练营，跳转前把页面回到顶部防止课程tab被盖住
        document.body.style.top = '0';
      } else if (!item.liveUrl) {
        // 直播和回放任务需要跳相应直播/回放页面，返回为null时需要toast提示
        Toast(`当前无${item.userAction === 'watch_replays_live' ? '回放' : '直播'}`);
      } else {
        // 回放任务有链接时点按钮就算完成，直播任务直接跳走
        if (item.userAction === 'watch_replays_live') {
          completeTaskApi(item.userAction, item.liveUrl);
        } else {
          showTaskMorePopup.value = false;
          // 进直播间听课: enter_live，直播间签到：sign_in_morn_live/sign_in_after_live，直播间点赞：thumbs_up_live
          const liveIgnoreOperate = ['enter_live', 'sign_in_morn_live', 'sign_in_after_live', 'thumbs_up_live'];
          if (liveIgnoreOperate.includes(item.userAction)) {
            completeTaskApi(item.userAction, item.liveUrl);
            setTimeout(() => {
              sendMessageAndGo(item.liveUrl);
            }, JUMP_SETTIMEOUT);
          } else {
            sendMessageAndGo(item.liveUrl);
          }
        }
      }
    }
  }
  
  onMounted(() => {
    document.title = '';
    // 获取用户cookie信息中的userid字段
    const cookieMap = new Map();
    document.cookie.split('; ').forEach(cookie => {
      const [key, value] = cookie.split('=');
      cookieMap.set(key, value);
    });
    const userId = cookieMap.get('userid');
    if (userId) {
      initPage();
    } else {
      noLogin.value = true;
    }
  });
  
  onBeforeUnmount(() => {
    // 清除滚动监听
    document.removeEventListener('scroll', scrollListener);
    // 移除页面可见性监听
    document.removeEventListener('visibilitychange', pageOnshow);
  });
  </script>
  <style lang="less" scoped>
  .home {
    width: 100%;
    min-height: 100vh;
    .home-page {
      .content {
        border-radius: 8px 8px 0 0;
        position: absolute;
        top: 244px;
        background-color: #f5f5f5;
        width: 100vw;
        .coin-task {
          display: flex;
          margin: 0px 12px 8px;
        }
      }
      .mini-content {
        top: 156px;
      }
    }
  }
  .empty-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
  
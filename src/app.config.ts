export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/record/index',
    'pages/plan/index',
    'pages/training/index',
    'pages/mine/index',
    'pages/sleep/index',
    'pages/report/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '健康管理',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F0FDF4'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#22C55E',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/record/index',
        text: '记录'
      },
      {
        pagePath: 'pages/plan/index',
        text: '计划'
      },
      {
        pagePath: 'pages/training/index',
        text: '训练'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})

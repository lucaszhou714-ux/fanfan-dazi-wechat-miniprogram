const config = require('./config');
App({
  globalData: { cloudReady: false },
  onLaunch() {
    const configured = config.envId && !/^X+$/.test(config.envId);
    if (wx.cloud && configured) {
      wx.cloud.init({ env: config.envId, traceUser: true });
      this.globalData.cloudReady = true;
    }
  }
});

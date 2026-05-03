const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    name: 'CCTVViewer',
    executableName: 'CCTVViewer',
    appBundleId: 'com.eanyatonic.cctvviewer',
    icon: './src/assets/icons/icon',
    asar: true,
    win32metadata: {
      CompanyName: 'Eanya-Tonic',
      FileDescription: '电视浏览器 - Windows版',
      OriginalFilename: 'CCTVViewer.exe',
      ProductName: '电视浏览器',
      InternalName: 'CCTVViewer'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'CCTVViewer',
        setupIcon: './src/assets/icons/icon.ico',
        loadingGif: './src/assets/icons/loading.gif'
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

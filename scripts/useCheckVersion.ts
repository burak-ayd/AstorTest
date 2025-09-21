import React from 'react';
import { Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import hotUpdate from 'react-native-ota-hot-update';
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
const apiVersion =
  'https://api.burakaydogan.tk/output/version.json';
export const useCheckVersion = () => {
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [version, setVersion] = React.useState("0");
  const startUpdate = async (url: string, version: number) => {
    hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, version, {
      updateSuccess: () => {
        console.log('update success!');
      },
      updateFail(message?: string) {
        Alert.alert('Update failed!', message, [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ]);
      },
      progress(received: string, total: string) {
        const percent = (+received / +total) * 100;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setProgress(percent);
      },
      restartAfterInstall: true,
    });
  };
  const onCheckVersion = () => {
    console.log('Checking version from', apiVersion);
    fetch(`${apiVersion}?v=${Date.now()}`, { cache: "no-store",headers: { "Accept": "application/json" }, }).then(async (data) => {
      let text = await data.text();
      // BOM varsa temizle
      text = text.replace(/^\uFEFF/, "");
      const result = JSON.parse(text);
      const currentVersion = await hotUpdate.getCurrentVersion();
      console.log(result,currentVersion)
      if (result?.version > currentVersion && result?.timestamp > result?.last_update) {
        Alert.alert(
          'Yeni Versiyon!',
          'Yeni Versiyon yayınlandı, lütfen yükleyin.',
          [
            {
              text: 'İptal',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Güncelle',
              onPress: () =>
                startUpdate(
                  Platform.OS === 'ios'
                    ? result?.downloadIosUrl
                    : result?.downloadAndroidUrl,
                  result.version
                ),
            },
          ]
        );
      }
      else
      {Alert.alert('Güncelleme', 'Yeni Güncelleme Bulunamadı.', [
      
      {text: 'Tamam', onPress: () => console.log('OK Pressed')},
    ]);}
    }).catch((error) => {
      Alert.alert('Hata', 'Güncelleme kontrolü başarısız: ' + error.message, [  
        {
          text: 'Tamam',
          onPress: () => console.log('OK Pressed'),
        },
      ]); 
      console.error('Güncelleme kontrolü başarısız:', error);
    });
  };

  const rollBack = async () => {
    const rs = await hotUpdate.rollbackToPreviousBundle();
    if (rs) {
      Alert.alert('Rollback success', 'Restart to apply', [
        {
          text: 'Tamam',
          onPress: () => hotUpdate.resetApp(),
          style: 'cancel',
        },
      ]);
    } else {
      Alert.alert('Oops', 'No bundle to rollback', [
        {
          text: 'İptal',
          onPress: () => {},
          style: 'cancel',
        },
      ]);
    }
  };

  const onCheckGitVersion = () => {
    setProgress(0);
    setLoading(true);
    hotUpdate.git.checkForGitUpdate({
      branch: Platform.OS === 'ios' ? 'iOS' : 'android',
      bundlePath:
        Platform.OS === 'ios'
          ? 'output/main.jsbundle'
          : 'output/index.android.bundle',
      url: 'https://github.com/vantuan88291/OTA-demo-bundle.git',
      onCloneFailed(msg: string) {
        Alert.alert('Clone project failed!', msg, [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]);
      },
      onCloneSuccess() {
        Alert.alert('Clone project success!', 'Restart to apply the changing', [
          {
            text: 'ok',
            onPress: () => hotUpdate.resetApp(),
          },
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]);
      },
      onPullFailed(msg: string) {
        Alert.alert('Pull project failed!', msg, [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]);
      },
      onPullSuccess() {
        Alert.alert('Pull project success!', 'Restart to apply the changing', [
          {
            text: 'ok',
            onPress: () => hotUpdate.resetApp(),
          },
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]);
      },
      onProgress(received: number, total: number) {
        const percent = (+received / +total) * 100;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setProgress(percent);
      },
      onFinishProgress() {
        setLoading(false);
      },
    });
  };
  const removeGitUpdate = () => {
    hotUpdate.git.removeGitUpdate();
  };
  const setMeta = (data: any) => {
    hotUpdate.setUpdateMetadata(data);
  };
  const getMeta = async () => {
    return hotUpdate.getUpdateMetadata();
  };
  React.useEffect(() => {
    hotUpdate.getCurrentVersion().then((data) => {
      setVersion(`${data}`);
    });
  }, []);
  return {
    version: {
      getMeta,
      setMeta,
      onCheckVersion,
      onCheckGitVersion,
      removeGitUpdate,
      rollBack,
      state: {
        progress,
        loading,
        version,
      },
    },
  };
};
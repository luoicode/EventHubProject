import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {
  ButtonComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../../components';
import {appColors} from '../../../constants/appColors';
import {fontFamilies} from '../../../constants/fontFamilies';
import {Facebook, Google} from '../../../assets/svgs';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import authenticationAPI from '../../../apis/authApi';
import {useDispatch} from 'react-redux';
import {addAuth} from '../../../redux/reducers/authReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Settings,
  LoginManager,
  Profile,
  LoginButton,
} from 'react-native-fbsdk-next';
import {LoadingModal} from '../../../modals';

GoogleSignin.configure({
  webClientId:
    '830049979019-v34rbcmkm2c0gtrl1v5bkcmm82jr4den.apps.googleusercontent.com',
});

Settings.setAppID('3832591553635448');

const SocialLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const api = `/google-signin`;
  const dispatch = useDispatch();
  const handlerLoginWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const api = `/google-signin`;

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const user = userInfo.user;

      const res: any = await authenticationAPI.HandlerAuthentication(
        api,
        user,
        'post',
      );

      dispatch(addAuth(res.data));

      await AsyncStorage.setItem('auth', JSON.stringify(res.data));
    } catch (error) {
      console.log(error);
    }
  };

  const handlerLoginWithFacebook = async () => {
    setIsLoading(true);
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
      ]);

      if (!result.isCancelled) {
        const profile = await Profile.getCurrentProfile();

        if (profile) {
          const userInfo = {
            name: profile.name,
            givenName: profile.firstName,
            familyName: profile.lastName,
            email: profile.email ?? '',
            photo: profile.imageURL,
          };

          const res: any = await authenticationAPI.HandlerAuthentication(
            api,
            userInfo,
            'post',
          );
          setIsLoading(false);
          dispatch(addAuth(res.data));

          await AsyncStorage.setItem('auth', JSON.stringify(res.data));
        }
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <SectionComponent>
      <TextComponent
        styles={{textAlign: 'center'}}
        text="OR"
        color={appColors.gray4}
        size={16}
        font={fontFamilies.medium}
      />
      <SpaceComponent height={16} />
      <ButtonComponent
        type="primary"
        onPress={handlerLoginWithGoogle}
        color={appColors.white}
        textColor={appColors.text}
        text="Login with Google"
        textFont={fontFamilies.regular}
        icon={<Google />}
        iconFlex="left"
      />

      <ButtonComponent
        type="primary"
        color={appColors.white}
        textColor={appColors.text}
        text="Login with Facebook"
        textFont={fontFamilies.regular}
        onPress={handlerLoginWithFacebook}
        icon={<Facebook />}
        iconFlex="left"
      />
      <LoadingModal visible={isLoading} />
    </SectionComponent>
  );
};

export default SocialLogin;

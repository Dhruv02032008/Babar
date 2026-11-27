import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Pressable,
  Text,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {colors, styles} from '../../themes';
import CHeader from '../../components/common/CHeader';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import CText from '../../components/common/CText';
import strings from '../../i18n/strings';
import {moderateScale} from '../../common/constants';
import typography from '../../themes/typography';
import CButton from '../../components/common/CButton';
import {AuthNav, StackNav} from '../../navigation/NavigationKeys';
import {setAuthToken} from '../../utils/asyncstorage';

export default function OtpVerificationScreen(props) {
  let {navigation, route} = props;
  let come_from = route?.params?.come_from;
  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Auto focus on screen open
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const onPressResend = () => {
    console.log('on press resend');
  };

  const onPressConfirm = async () => {
    if (come_from === 'forgot_password') {
      navigation.navigate(AuthNav.CreatePasswordScreen);
    } else {
      await setAuthToken(true);
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.TabNavigation}],
      });
    }
  };

  const handlePressOtp = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.mainContainerSurface}>
      <CHeader
        title={
          come_from === 'forgot_password'
            ? strings.ForgotPassword
            : strings.Verification
        }
      />
      <KeyBoardAvoidWrapper contentContainerStyle={styles.flexGrow1}>
        <View style={styles.mainContainerWithRadius}>
          <View style={localStyles.topContainer}>
            <CText color={colors.white} type={'R16'} align={'center'}>
              {come_from === 'forgot_password'
                ? strings.forgotPasswordVerificationText
                : strings.sendCodeText}
            </CText>
          </View>
          <View style={localStyles.mainContainerWithRadius}>
            <View style={styles.flex}>
              <Pressable
                onPress={handlePressOtp}
                style={localStyles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map(index => {
                  const digit = otp[index] || '';
                  const isCurrent =
                    isFocused &&
                    (index === otp.length ||
                      (index === 5 && otp.length === 6));
                  return (
                    <View
                      key={index}
                      style={[
                        localStyles.underlineStyleBase,
                        isCurrent && localStyles.underlineStyleHighLighted,
                      ]}>
                      <Text style={localStyles.otpText}>{digit}</Text>
                    </View>
                  );
                })}
                <TextInput
                  ref={inputRef}
                  value={otp}
                  onChangeText={text => {
                    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setOtp(cleaned);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={6}
                  autoFocus={true}
                  style={localStyles.hiddenInput}
                  caretHidden={true}
                />
              </Pressable>

              <View style={localStyles.resendContainer}>
                <CText type={'R14'} color={colors.grayText}>
                  {strings.dontReciveCode}
                </CText>
                <TouchableOpacity onPress={onPressResend}>
                  <CText style={styles.ml5} type={'B16'} color={colors.primary}>
                    {strings.resendCode}
                  </CText>
                </TouchableOpacity>
              </View>
            </View>
            <CButton
              title={strings.send}
              type={'m18'}
              color={colors.white}
              onPress={onPressConfirm}
              containerStyle={styles.mb10}
            />
          </View>
        </View>
      </KeyBoardAvoidWrapper>
    </View>
  );
}

const localStyles = StyleSheet.create({
  mainContainerWithRadius: {
    ...styles.mainContainerWithRadius,
    backgroundColor: colors.white,
    ...styles.ph25,
    ...styles.pt10,
  },
  topContainer: {
    ...styles.mv25,
    width: '80%',
    ...styles.selfCenter,
  },
  resendContainer: {
    ...styles.mb20,
    ...styles.mt40,
    ...styles.rowCenter,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: moderateScale(50),
    ...styles.mt20,
    position: 'relative',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
    color: 'transparent',
  },
  underlineStyleBase: {
    width: moderateScale(48),
    height: moderateScale(50),
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(12),
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  underlineStyleHighLighted: {
    borderColor: colors.primary,
  },
  otpText: {
    ...typography.fontWeights.Regular,
    ...typography.fontSizes.f20,
    color: colors.textColor,
    textAlign: 'center',
  },
});
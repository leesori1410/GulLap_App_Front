import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StatusBar,
    Image,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent
} from 'react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from '../styles/MyPageStyles';
import BookRead from '../assets/svg/bookRead';
import WordsLearned from '../assets/svg/wordsLearned';
import WordsReview from '../assets/svg/wordsReview';

interface MyPageProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const MyPage: React.FC<MyPageProps> = ({ setIsLoggedIn }) => {

    const [statusBarColor, setStatusBarColor] = useState('#FFE400');

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        
        if (scrollY < 222) {
            setStatusBarColor('#FFE400');
        } else {
            setStatusBarColor('#F6F5FA');
        } 
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userToken"); // 저장된 로그인 정보 삭제
            setIsLoggedIn(false); // 로그인 상태 해제
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    return (
        <View style={styles.body}>
        <View style={{ width: '100%', height: StatusBar.currentHeight, backgroundColor: statusBarColor, position: 'absolute', top: 0, zIndex: 10 }}/>
        <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode='never'
            onScroll={handleScroll}>
            <View style={[styles.header, {marginTop: StatusBar.currentHeight}]}>
                <Image style={styles.headerImg} source={require('../assets/images/headerImg.png')} />
                <Text style={styles.mypageText}>마이페이지</Text>
                <Text style={styles.dateText}>GUILAP과 함께한지</Text>
                <Text style={styles.date}>50일</Text>
            </View>
            <View style={styles.ContainerView}>
                <Text style={styles.containerText}>계정</Text>
                <View style={styles.accountContainer}>
                    <View style={styles.profileView}>
                        <Image style={{width: 20, height: 30}} source={require('../assets/images/profileImg.png')}/>
                    </View>
                    <Text style={styles.name}>이희진</Text>
                    <View style={styles.accountInfoContainer}>
                        <View style={{width: '20%'}}>
                            <Text style={styles.infoText}>나이</Text>
                            <Text style={styles.info}>20세</Text>
                        </View>
                        <View style={{height: '90%', width: 1, borderRadius: 5, backgroundColor: '#DDDDDD', marginRight: 34}} />
                        <View>
                            <Text style={styles.infoText}>이메일</Text>
                            <Text style={styles.info}>d2329@e-mirim.hs.kr</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.containerText}>활동 기록</Text>
                <View style={{flexDirection: 'row', columnGap: 12, marginTop: 23, height: 441}}>
                    <View style={{rowGap: 13, flex: 1}}>
                        <View style={styles.activityContainer}>
                            <Text style={styles.activityText}>배운 단어</Text>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityNumber}>190</Text>
                                <Text style={styles.activityNumberText}>개</Text>
                            </View>
                            <WordsLearned style={{width: 36, height: 52, marginTop: 27}}/>
                        </View>
                        <View style={styles.activityContainer}>
                            <Text style={[styles.activityText, {lineHeight: 27, marginTop: -4}]}>복습해야 하는{'\n'}단어</Text>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityNumber}>10</Text>
                                <Text style={styles.activityNumberText}>개</Text>
                            </View>
                            <WordsReview style={{width: 16, height: 29, marginTop: 20, marginLeft: 2, marginBottom: 6}}/>
                        </View>
                    </View>
                    <View style={{rowGap: 13, flex: 1}}>
                        <View style={styles.activityContainer}>
                            <Text style={styles.activityText}>맞은 단어</Text>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityNumber}>170</Text>
                                <Text style={styles.activityNumberText}>개</Text>
                            </View>
                        </View>
                        <View style={styles.activityContainer}>
                            <Text style={styles.activityText}>읽은 책</Text>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityNumber}>49</Text>
                                <Text style={styles.activityNumberText}>개</Text>
                            </View>
                            <BookRead style={{width: 61, height: 47, marginTop: 31, marginBottom: 17}}/>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={{marginTop: 62, marginBottom: 162, alignSelf: 'center'}} onPress={handleLogout}>
                <Text style={styles.logout}>로그아웃</Text>
            </TouchableOpacity>
        </ScrollView>
        </View>
    );
}

export default MyPage;
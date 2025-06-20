import { CLIENT_ID, CLIENT_SECRET } from '@env';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  StatusBar,
  View,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Linking,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {NewsItem} from './types';

import Logo from '../assets/svg/logo';
import Book from '../assets/svg/book';
import Write from '../assets/svg/write';

import CustomScrollView from '../components/CustomScrollView';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import he from 'he';

import styles from '../styles/HomeStyles';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDailyLearn } from '../api/learnApi';
import { Words, TextType, LearnRes } from '../types/learnType';
import { getDate } from '../api/calendarApi';

function Home() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [userId, setUserId] = useState<string>()
  const [learnWord, setLearnWord] = useState()
  const [reading, setReading] = useState()
  const [words, setWords] = useState<Words[]>([])
  const [text, setText] = useState<TextType>()
  const [news, setNews] = useState<NewsItem[]>([]);
  const getSourceName = (link: string) => {
    try {
      // 정규식으로 URL에서 도메인 추출
      const matches = link.replace(/^(https?:\/\/)?(?:www\.)?([^\/]+)\..*$/, '$2');
      if (matches) {
        return matches; // 도메인 추출
      } else {
        return '알 수 없음'; // 도메인이 없으면 "알 수 없음"
      }
    } catch (error) {
      console.error('URL 파싱 오류:', error);
      return '알 수 없음'; // 오류 발생 시 "알 수 없음" 반환
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      const searchKeyword = '우리나라문학도서';

      try {
        const response = await axios.get<{items: NewsItem[]}>(
          `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(
            searchKeyword,
          )}&start=1&display=3`,
          {
            headers: {
              'X-Naver-Client-Id': CLIENT_ID,
              'X-Naver-Client-Secret': CLIENT_SECRET,
            },
          },
        );

        const newsList: NewsItem[] = response.data.items.map(item => ({
          title: he.decode(item.title).replace(/<b>|<\/b>/g, ''),
          link: item.link,
          description: he.decode(item.description).replace(/<b>|<\/b>/g, ''),
          source: getSourceName(item.link),
        }));

        setNews(newsList);
      } catch (error) {
        console.error('API 호출 오류:', error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const fetch = async() => {
      try {
        const userId = await AsyncStorage.getItem('userId')
        if(userId===null) throw new Error('userId가 존재하지 않음')
        const today = new Date()
        const offset = today.getTimezoneOffset()
        const koreaTime = new Date(today.getTime() - offset * 60 * 1000)
        const day = koreaTime.toISOString().split('T')[0]
        console.log(day);
        console.log(userId, today.toISOString().split('T')[0]);
        const res = await axios.get(`http://192.168.45.135:3000/api/daily/todays?user_id=${userId}&date=${day}`)
        const data = res.data;
        setWords(data.words)
        setText(data.text)
      } catch (error) {
        console.log(error);
      }
    }
    fetch();
  }, [])

  const fetchDone = async() => {
    try {
      if(userId===undefined) throw new Error('userId가 존재하지 않음')
      const date = new Date()
      const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
      const res = await getDate({
        userId,
        date: koreaDate
      })
      console.log(res);
      setLearnWord(res.status.word_count)
      setReading(res.status.read_done)
    } catch (error) {
      console.log(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchDone()
      return;
    }, [])
  );

  useEffect(() => {
    fetchDone()
  }, [userId])

  useEffect(() => {
    const getId = async() => {
      try {
        const id = await AsyncStorage.getItem('userId')
        setUserId(id??'')
      } catch (error) {
        console.log(error);
      }
    }
    getId()
  }, [])

  const linkPress = (url: string) => {
    setTimeout(() => {
      Linking.openURL(url);
    }, 100);
  };

  return (
    <View style={styles.body}>
      <StatusBar barStyle={'dark-content'} backgroundColor='transparent' translucent={true} />
      <View style={{ width: '100%', height: StatusBar.currentHeight, backgroundColor: '#F6F5FA', position: 'absolute', top: 0, zIndex: 10 }}/>
      <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never">
        <View style={{ width: '100%', height: StatusBar.currentHeight, backgroundColor: '#F6F5FA' }}/>
        <Logo style={styles.logo} />
        <Text style={styles.issuesText}>요즘 문학이슈</Text>
        <CustomScrollView>
          {news.map((item, index) => (
            <TouchableOpacity
              onPress={() => linkPress(item.link)}
              key={index}
              activeOpacity={1}>
              <View style={styles.issuesContainer}>
                <TouchableOpacity
                  onPress={() => linkPress(item.link)}
                  activeOpacity={1}>
                  <Text
                    style={styles.newsTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.title}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={styles.newsDetail}
                  numberOfLines={3}
                  ellipsizeMode="tail">
                  {item.description}
                </Text>
                <Text style={styles.newsSource}>{item.source}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </CustomScrollView>
        <Text style={styles.learningText}>학습</Text>
        <TouchableOpacity
          style={styles.learningContainer}
          activeOpacity={1}
          onPress={() => navigation.navigate('Learning', {words})}>
          <View style={[styles.learningItem, learnWord !== undefined && learnWord >= 4 && {backgroundColor: '#FFE400'}]}>
            <Book />
            <Text style={styles.learningActivity}>책 문장 단어학습</Text>
            <Text style={styles.learningIng}>
              {learnWord !== undefined && learnWord < 4
                ?`${learnWord}/4 진행 중` 
                :'완료!'
              }
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.learningContainer, {marginBottom: 107}]}
          activeOpacity={1}
          onPress={() => navigation.navigate('Reading', {text})}>
          <View style={[styles.learningItem, reading&&{backgroundColor: '#FFE400'}]}>
            <Write />
            <Text style={styles.learningActivity}>글 읽기 연습</Text>
            <Text style={styles.learningIng}>{reading?'완료!':'미완료'}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default Home;

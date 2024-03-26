import React, {useState} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ImageBackground,
  Keyboard,
  Platform,
  StatusBar,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {GiftedChat} from 'react-native-gifted-chat';
import {globalStyles, giftedChatStyles} from '../../styles/globalStyles';
import {apiKey} from './secret';
export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [outputMessage, setOutputMessage] = useState(
    'Results to be shown here:',
  );
  const handleKeyPress = ({nativeEvent}: {nativeEvent: any}) => {
    if (nativeEvent.key === 'Enter') {
      handleButtonClick();
      Keyboard.dismiss();
    }
  };

  const handleButtonClick = () => {
    if (inputMessage.toLowerCase().startsWith('Tạo ảnh')) {
      generateImage();
    } else {
      generateText();
    }
    setInputMessage('');
  };

  const generateText = () => {
    console.log(inputMessage);
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: {_id: 1},
    };
    setMessages(previousMessages => {
      return GiftedChat.append(previousMessages, [message]);
    });
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
        `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: inputMessage,
          },
        ],
        model: 'gpt-3.5-turbo',
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.choices[0].message.content);
        setInputMessage('');
        setOutputMessage(data.choices[0].message.content.trim());
        const message = {
          _id: Math.random().toString(36).substring(7),
          text: data.choices[0].message.content.trim(),
          createdAt: new Date(),
          user: {_id: 2, name: 'Event Hub'},
        };
        setMessages(previousMessages => {
          return GiftedChat.append(previousMessages, [message]);
        });
      });
  };

 const generateImage = () => {
    const newMessage: Message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage, // Nếu không có text, bạn có thể đặt giá trị mặc định hoặc để trống tùy thuộc vào logic của ứng dụng
      createdAt: new Date(),
      user: {_id: 1},
      image: null, // Đảm bảo có thuộc tính image
    };
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [newMessage]),
    );

    fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: inputMessage,
        n: 2,
        size: '1024x1024',
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.data[0].url);
        setOutputMessage(data.data[0].url);
        setInputMessage('');
        data.data
          .forEach((item: any) => {
            if (data.data && data.data[0] && data.data[0].url) {
              const message = {
                _id: Math.random().toString(36).substring(7),
                createdAt: new Date(),
                user: {_id: 2, name: 'Event Hub'},
                text: '', // Nếu không có text, bạn có thể đặt giá trị mặc định hoặc để trống tùy thuộc vào logic của ứng dụng
                image: item.url,
              };
              setMessages(previousMessages => {
                return GiftedChat.append(previousMessages, [message]);
              });
            } else {
              console.error('No image URL found in API response.');
            }
          })
          .catch((error: any) => {
            console.error('Error fetching image generation:', error);
          });
      });
  };

  const handleTextInput = (text: string) => {
    setInputMessage(text);
    console.log(text);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/splash-img.png')}
      resizeMode="cover"
      style={globalStyles.backgroundImage}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={{flex: 1}}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <GiftedChat
              messages={messages}
              user={{_id: 1}}
              minInputToolbarHeight={0}
              renderInputToolbar={() => null}
              {...giftedChatStyles}
            />
          </View>
          <View style={{flexDirection: 'row'}}>
            <View style={globalStyles.inputContainer}>
              <TextInput
                style={globalStyles.textInput}
                placeholder="Click here"
                onChangeText={handleTextInput}
                value={inputMessage}
                onKeyPress={handleKeyPress}
              />
            </View>
            <TouchableOpacity onPress={handleButtonClick}>
              <View style={globalStyles.sendButton}>
                <FontAwesome name="send-o" size={16} color="#DFF5FF" />
              </View>
            </TouchableOpacity>
          </View>
          <StatusBar hidden />
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: number;
  };
}

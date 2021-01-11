# 2020-2-OSSP1-CampusMeeting-8

## Campus Meeting  
webRTC 기술을 활용한 원격 수업 플랫폼 '캠퍼스미팅'  
  
## 프로젝트 소개  
- 코로나 19로 인해 비대면 온라인 수업이 요구되는 현 상황에서 학교 수업을 진행하기 위한 수업 플랫폼  
- 온라인 수업 용으로 개발되지 않아 수업에 애로사항이 있는 화상회의 프로그램들을 대체하기 위한 webRTC 기반 플랫폼  
> AWS 호스팅 주소
[폐쇄]
  
## 팀원  
> [2016110426 오지훈](https://github.com/Ohzzi) : 팀장, 서버구축, 영상 송출 기능  
[2016112161 강건우](https://github.com/Kang-Geonu) : 텍스트 채팅 및 파일 업/다운로드 기능  
[2016110441 김건오](https://github.com/guno-kim) : 마이크 컨트롤, 화자지정, 책갈피 등 유틸리티  
[2014112614 송영창](https://github.com/ssong7389) : 로그인 및 세션 관리, 채팅방 라우팅  
[2012112006 이동건](https://github.com/dkadh) : 프로젝트 전체 UI 구현  

  
## 사용 기술 스택  
- ![html/css/javscript](https://img.shields.io/badge/frontend-html/css/javascript-red)
- ![node.js](https://img.shields.io/badge/backend-node.js-blue)
- ![mediaserver](https://img.shields.io/badge/media_server-kurento-yellow)
  
## 실행 방법 (Local 환경에서)
* 우선적으로 node.js, npm, docker, MySQL을 설치해 주세요  
> 프로젝트 클론
```
$ git clone https://github.com/CSID-DGU/2020-2-OSSP1-CampusMeeting-8.git  
$ cd 2020-2-OSSP1-CampusMeeting-8  
$ npm install  
```
  
> Kurento 서버 설치(docker)  
```
$ docker pull kurento/kurento-media-server:latest  
$ docker run -d -p 8888:8888 kurento/kurento-media-server:latest  
```

> DB 설치
```
MySQL 설치 후 config.js 파일의 다음 부분의 user와 password를 계정 정보로 수정  
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'userinfo',
});

MySQL 접속 후 다음 쿼리를 작성
create database userinfo;
use userinfo;
create table Users (
    userid int primary key auto_increment,
    id varchar(50) unique not null,
    pw varchar(255) not null,
    name varchar(50) not null,
    email varchar(100) unique not null,
    phone varchar(11) not null,
    bdate varchar(6) not null
);
```

> 서버 실행
```
$ node server.js
nodemon을 통한 실행도 가능합니다.
```
  
> localhost 접속
```
https://localhost:3000/으로 접속
```

## 참고 자료  
> <https://github.com/agilityfeat/webrtc-video-conference-tutorial/tree/kurento>

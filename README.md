# 2020-2-OSSP1-CampusMeeting-8

## Campus Meeting  
webRTC 기술을 활용한 원격 수업 플랫폼 '캠퍼스미팅'  
  
## 프로젝트 소개  
- 코로나 19로 인해 비대면 온라인 수업이 요구되는 현 상황에서 학교 수업을 진행하기 위한 수업 플랫폼  
- 온라인 수업 용으로 개발되지 않아 수업에 애로사항이 있는 화상회의 프로그램들을 대체하기 위한 webRTC 기반 플랫폼  
  
## 팀원  
```
2016110426 오지훈: 팀장, 서버구축, 영상 송출 기능  
2016112161 강건우: 텍스트 채팅 및 파일 업/다운로드 기능  
2016110441 김건오: 마이크 컨트롤, 화자지정, 책갈피 등 유틸리티  
2014112614 송영창: 로그인 및 세션 관리, 채팅방 라우팅  
2012112006 이동건: 프로젝트 전체 UI 구현  
```
  
## 사용 기술 스택  
- 프론트엔드: HTML/CSS/Javascript, Node.js  
- 백엔드: Node.js  
- webRTC 중계 서버: Kurento (https://www.kurento.org/)  
  
## 실행 방법
> 우선적으로 Node.js를 설치해 주세요  
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

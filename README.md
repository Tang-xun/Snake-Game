## snake_server 

````
desc: wechat game snake war server , technique is 
technique: game: cocos-creator / server: node.js
date: 2018-7-19 20:00:00
mail: tangxun_123@163.com
````
	
### project description

1. wechat auth server
2. game user info save 
3. game ranks info 
4. game wechat group ranks info 
5. game shopping service 
6. game orders service 
	and so on ...


### service introduce



**uri** 		/user/add

**method** 		POST

**params**

|name|type|desc|**|
|---|---|---|---|
|openId|string|wx openId||
|nickName|string|wx nickName||
|headUri|string|wx head uri||


**uri**			/user/query

**method**		POST

**params**

|name|type|desc|**|
|---|---|---|---|
|openId|string|wx openId||

	


   

### Works Records

1. use mysql with the db technique
2. use redis for distributed db storage

### history add logic


### Time Plans
	
1. project frame setup about [2days]
2. design db for /user/order/ranks/gourp-ranks/pay-server/ structs [3 days]
3. devlop ... about [7days]
4. debug with apps about [7days] 
5. test ...	[unknow]

### Task List

- [ ] project frame setup 
- [ ] db design:
	- [x] user
	- [x] history 
	- [x] person ranks
	- [x] order
	- [x] history
	- [ ] grade
	- [ ] group ranks
	- [ ] payment server
	- [ ] auth
- [ ] dev:
	- [x] user
	- [x] history 
	- [x] order
	- [x] person ranks
	- [ ] grade
	- [ ] group ranks
	- [ ] payment server
	- [ ] auth
- [ ] debug:

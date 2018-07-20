### mysql opts

````shell
    cd /usr/local/mysql/bin/

    # login
    /mysql -u $user_name$ -p

    # create user
    mysql> CREATE USER 'name'@'%' IDENTIFIED by 'pwd';

    # grant
    mysql> GRANT ALL PRIVILEGES ON *.* TO 'name'@'%' WITH GRANT OPTION;

    # databases
    mysql> show databases;

    # tables
    mysql> use database_name;
    mysql> show tables;

    # table structs
    mysql> describe table_name;
````

### tables 

#### userInfo

|name               |type           |not null       |comment                |
|:-                 |:-             |:-             |:-                     |
|openId             |int            |true           |wx_id                  |
|nickName           |varchar(256)   |true           |name                   |
|honor              |varchar(256)   |true           |user honor             |
|honorNum           |int            |true           |gain honor num         |
|skin               |int            |true           |current skin           |
|curExp             |int            |true           |current expires        |
|nextGradeExp       |int            |true           |next grade expires     |
|t_bestLen          |int            |true           |best body length       |
|t_mostKill         |int            |true           |most kill number       |
|t_linkKill         |int            |true           |best link kill number  |
|e_bestLen          |int            |true           |best body length       |
|e_mostKill         |int            |true           |most kill number       |
|e_linkKill         |int            |true           |best link kill number  |
|latestLogin        |TIMESTAMP      |false          |latest                 |
|createTime         |TIMESTAMP      |false          |create date            |
|updateTime         |TIMESTAMP      |false          |update date            |


```sql
    /**
    *  create user table 
    */
    create table user (
        _id int NOT NULL AUTO_INCREMENT,
        openId  varchar(256) NOT NULL COMMENT 'wechat open id',
        nickName  varchar(256) NOT NULL ,
        honor  varchar(256) NOT NULL COMMENT 'player current honor',
        honorNum  int NOT NULL COMMENT 'gain honor number',
        skin  int NOT NULL COMMENT 'player current skin id',
        curExp  int NOT NULL COMMENT 'player current exp num',
        nextGradeExp  int NOT NULL COMMENT 'next grade exp',
        t_bestLen int NOT NULL default 0 COMMENT 'best body length',
        t_mostKill int NOT NULL default 0 COMMENT 'most kill number',
        t_linkKill int NOT NULL default 0 COMMENT 'best link kill number',
        e_bestLen int NOT NULL default 0 COMMENT 'best body length',
        e_mostKill int NOT NULL default 0 COMMENT 'most kill number',
        e_linkKill int NOT NULL default 0 COMMENT 'best link kill number',
        latestLogin  TIMESTAMP COMMENT 'latest login time',
        createTime  TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        updateTime  TIMESTAMP on update CURRENT_TIMESTAMP,
        PRIMARY KEY ( _id ),
        INDEX (openId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

    /**
    *   insert user info 
    */
    insert into user (openID, nickName, honor, honorNum, skin, curExp, nextGradeExp, latestLogin)  
        values(
            'openid', 
            'wechat_game_user', 
            '小青蛇', 
            10, 
            3, 
            288, 
            500, 
            CURRENT_TIMESTAMP
        );

    /**
    *   update user info
    */
    update user set honorNum=11 where openID=openid;
```

    
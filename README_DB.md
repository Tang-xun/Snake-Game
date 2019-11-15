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

----
|name           |type           |not null   |key    |DEFAULT             |Extra                      |comment                 |
|:-             |:-             |:-         |:-     |:-                  |:-                         |:-                      |
|openId         |int            |true       |PRI    |NULL                |auto_increment             |wx_id                   |
|nickName       |varchar(256)   |true       |UNI    |NULL                |                           |name                    |
|honor          |varchar(256)   |true       |       |NULL                |                           |user honor              |
|honorNum       |int            |true       |       |NULL                |                           |gain honor num          |
|skin           |int            |true       |       |NULL                |                           |current skin            |
|curExp         |int            |true       |       |NULL                |                           |current expires         |
|nextGradeExp   |int            |true       |       |NULL                |                           |next grade expires      |
|t_bestLen      |int            |true       |       |0                   |                           |best body length        |
|t_mostKill     |int            |true       |       |0                   |                           |most kill number        |
|t_linkKill     |int            |true       |       |0                   |                           |best link kill number   |
|e_bestLen      |int            |true       |       |0                   |                           |best body length        |
|e_mostKill     |int            |true       |       |0                   |                           |most kill number        |
|e_linkKill     |int            |true       |       |0                   |                           |best link kill number   |
|latestLogin    |TIMESTAMP      |false      |       |NULL                |                           |latest                  |
|createTime     |TIMESTAMP      |false      |       |CURRENT_TIMESTAMP   |                           |create date             |
|updateTime     |TIMESTAMP      |false      |       |NULL                |on update CURRENT_TIMESTAMP |update date            |
----

```sql
    /**
    *  create user table 
    */
    create table if not exists user (
        _id int NOT NULL AUTO_INCREMENT,
        openId  varchar(256) NOT NULL COMMENT 'wechat open id',
        nickName  varchar(256) NOT NULL ,
        honor  varchar(256) NOT NULL COMMENT 'player current honor',
        honorNum  int NOT NULL COMMENT 'gain honor number',
        skin  int NOT NULL COMMENT 'player current skin id',
        skinNum int NOT NULL COMMENT 'user own skin num',
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
        INDEX (openId),
        unique (openId)
    )COMMENT = 'snake user info', 
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;

    /**
    *   insert user info 
    */
    insert into user (openID, nickName, honor, honorNum, skin, curExp, nextGradeExp, latestLogin)  
        values(
            'openId', 
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
    update user set honorNum=11 where openID=openId;
```


#### grade config

````sql
    CREATE TABLE snake.grade (
    id INT NOT NULL AUTO_INCREMENT,
    grade INT NOT NULL COMMENT 'user grade',
    name VARCHAR(128) NOT NULL COMMENT 'grade name ',
    preExp INT NOT NULL COMMENT 'grade start exp.',
    nextExp INT NOT NULL COMMENT 'user grade next exp.',
    PRIMARY KEY (id, grade, name)),
    INDEX (grade, name),
    COMMENT = 'user grade config sys',
    ENGINE=InnoDB DEFAULT CHARSET=utf8;

````



// 用户数
let UserCount = 0;
// 所有的分数
let userScore = [];
// 每个分数段上限
let perScore = [];

// 分段个数
const splitCount = 10;

function sortUserScore () {
    var perCount = userCount / splitCount;
    for (var i = 0; i < splitCount; i++) {
        perScore.push(userScore[perCount * (i + 1)]);
    }
    
    


}


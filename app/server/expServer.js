const rx = require('rx');
const logger = require('../logger').logger('exp-server', 'info');

const skinType = {
    1: { name: '普通皮肤' },
    2: { name: '勇者体验皮肤' },
    3: { name: '勇者皮肤' },
    4: { name: '稀有皮肤体验卡' },
    5: { name: '稀有皮肤' },
    6: { name: '传说皮肤体验卡' },
    7: { name: '传说皮肤' }
}

const expConfig = {
    level_1: [10, [100, 50, 40, 30, 20, 10, 5, 3, 2, 1]],
    level_2: [10, -20],
    level_3: [10, -30],
    level_4: [10, -40],
    level_5: [10, -50],
    default: -50,
    kill: [1, 1],
    linkKill: [1, 1],
    time: [600000, 1],
    deadTimes: [1, -10],
}

const expDiffCycle = [0, 199, 499, 999, 1499, 1999, 2999, 3999, 4999, 5999, 6999, 7999, 8999, 9999, 11999, 13999, 15999, 17999, 19999, 24999, 29999, 39999, 49999, 59999, 69999, 89999, 109999, 129999, 149999, 200000];
const gradeName = ['四脚蛇', '小草蛇', '小青蛇', '小头蛇', '绿锦蛇', '玉米蛇', '黑霉蛇', '玉斑锦', '三素锦', '赤练蛇', '银环蛇', '金环蛇', '老虎蛇', '黑头海', '竹叶青', '短尾蝮', '尖吻蝮', '响尾蛇', '绿曼巴', '五步蛇', '眼镜蛇', '眼镜王', '黑曼巴', '烙铁头', '太攀蛇', '勾鼻海', '细鲮攀', '白娘子', '嘿嘿嘿'];
const rewardExp = {
    1: { rdExp: null, rdSkin: [skinType["2"]], rdutils: null },
    2: { rdExp: 100, rdSkin: [skinType["1"]], rdutils: null },
    6: { rdExp: null, rdSkin: [skinType["2"]], rdutils: null },
    7: { rdExp: 300, rdSkin: [skinType["1"]], rdutils: null },
    11: { rdExp: null, rdSkin: [skinType["4"]], rdutils: 1 },
    12: { rdExp: 500, rdSkin: [skinType["2"]], rdutils: null },
    16: { rdExp: null, rdSkin: [skinType["4"]], rdutils: 1 },
    17: { rdExp: 500, rdSkin: [skinType["5"]], rdutils: null },
    24: { rdExp: 1000, rdSkin: [skinType["5"], skinType["6"]], rdutils: null },
    28: { rdExp: null, rdSkin: [skinType["6"]], rdutils: null },
}
let expRoute = [];

function initExpRoute() {
    let grade = 0;
    rx.Observable.from(expDiffCycle).pairwise().subscribe(
        it => {
            expRoute.push({
                grade: grade,
                name: gradeName[grade],
                exps: [it[0] + 1, it[1]],
                rewrd: rewardExp[grade]
            });
            grade++;
        }
    );
}

function calculGrade(exp) {
    console.log(`cal Grade ${exp}`);

    let expInt = Math.floor(exp);
    if (expInt > expDiffCycle[expDiffCycle.length - 1] || expInt < expDiffCycle[0]) {
        return rx.Observable.create(observer => {
            observer.error(`exp is not legal value ${exp}`);
        });
    }

    return rx.Observable.from(expRoute).first(it =>
        it.exps[0] <= expInt && it.exps[1] >= expInt
    )
}

function calculExp(roudRank, kill, linkKill, time, deadTimes) {
    let totalExp = 0;
    // rank exp
    if (roudRank < 11) {
        totalExp += expConfig.level_1[roudRank];
    } else if (roudRank < 21) {
        totalExp += -expConfig.level_2[1];
    } else if (roudRank < 31) {
        totalExp += -expConfig.level_3[1];
    } else if (roudRank < 41) {
        totalExp += -expConfig.level_3[1];
    } else {
        totalExp += expConfig.default;
    }
    // kill exp
    totalExp += kill * expConfig.kill[1];

    // linkKill exp
    totalExp += linkKill * expConfig.linkKill[1];

    // time exp
    totalExp += time / expConfig.time[0] * expConfig.time[1];

    // deadTimes exp
    totalExp += deadTimes / expConfig.deadTimes[0] * expConfig.deadTimes[1];

    return totalExp;
}

initExpRoute();

module.exports = {
    calculExp,
    calculGrade,
    skinType,
    gradeName,
    rewardExp,
}
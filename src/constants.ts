export interface Station {
    x: number;
    y: number;
}

export interface StationEvent {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    reward: number;
}

export interface StationEvents {
    positive: StationEvent;
    negative: StationEvent;
    neutral: StationEvent;
    special?: string;
}

export const STATIONS: Record<string, Station> = {
    "广州火车站": { x: 285, y: 202 },
    "越秀公园": { x: 285, y: 291 },
    "纪念堂": { x: 285, y: 367 },
    "公园前": { x: 285, y: 478 },
    "海珠广场": { x: 286, y: 611 },
    "市二宫": { x: 286, y: 675 },
    "江南西": { x: 286, y: 740 },
    "昌岗": { x: 285, y: 845 },
    "晓港": { x: 398, y: 845 },
    "中大": { x: 525, y: 845 },
    "鹭江": { x: 691, y: 841 },
    "客村": { x: 977, y: 844 },
    "赤岗": { x: 1042, y: 791 },
    "磨碟沙": { x: 1147, y: 743 },
    "新港东": { x: 1331, y: 743 },
    "琶洲": { x: 1442, y: 743 },
    "万胜围": { x: 1616, y: 744 },
    "官洲": { x: 1602, y: 875 },
    "大学城北": { x: 1641, y: 911 },
    "大学城南": { x: 1671, y: 951 },
    "北山": { x: 1489, y: 844 },
    "赤沙": { x: 1318, y: 842 },
    "赤沙北": { x: 1171, y: 846 },
    "赤岗塔": { x: 919, y: 755 },
    "二沙岛": { x: 535, y: 651 },
    "小北": { x: 342, y: 256 },
    "淘金": { x: 497, y: 294 },
    "区庄": { x: 649, y: 289 },
    "东山口": { x: 650, y: 479 },
    "动物园": { x: 753, y: 337 },
    "杨箕": { x: 752, y: 479 },
    "五羊邨": { x: 809, y: 614 },
    "珠江新城": { x: 978, y: 610 },
    "猎德": { x: 1229, y: 615 },
    "潭村": { x: 1355, y: 613 },
    "员村": { x: 1442, y: 615 },
    "科韵路": { x: 1545, y: 613 },
    "车陂南": { x: 1615, y: 613 },
    "车陂": { x: 1615, y: 477 },
    "黄村": { x: 1530, y: 282 },
    "棠东": { x: 1459, y: 375 },
    "天河公园": { x: 1442, y: 482 },
    "棠下": { x: 1529, y: 479 },
    "华景路": { x: 1445, y: 333 },
    "华师": { x: 1369, y: 202 },
    "岗顶": { x: 1329, y: 247 },
    "石牌桥": { x: 1251, y: 295 },
    "龙口西": { x: 1169, y: 118 },
    "广州东站": { x: 971, y: 113 },
    "沙河": { x: 744, y: 117 },
    "云台花园": { x: 660, y: 119 },
    "大金钟路": { x: 602, y: 119 },
    "梓元岗": { x: 372, y: 139 },
    "黄花岗": { x: 665, y: 206 },
    "沙河顶": { x: 707, y: 160 },
    "冼村": { x: 1147, y: 481 },
    "农讲所": { x: 394, y: 479 },
    "烈士陵园": { x: 496, y: 480 },
    "体育西路": { x: 976, y: 367 },
    "体育中心": { x: 1121, y: 241 },
    "林和西": { x: 972, y: 209 },
    "北京路": { x: 361, y: 614 },
    "团一大广场": { x: 433, y: 614 },
    "东湖": { x: 594, y: 613 },
    "广州塔": { x: 977, y: 718 },
};

export const LINE_1_EVENTS: Record<string, StationEvents> = {
    "广州东站": {
        positive: {
            type: "positive", title: "锦鲤进站", description: "在高铁广州东站捡到贵重物品，联系失主后获得感谢与报酬", reward: 150 },
        negative: { type: "negative", title: "美食诱惑", description: "在东方宝泰的寿司郎大吃一顿", reward: -100 },
        neutral: { type: "neutral", title: "天河飘绢", description: "走出站口就能看到巨大的“天河飘绢”水景瀑布，这里是新世纪羊城八景之一。", reward: 0 }
    },
    "体育中心": {
        positive: { type: "positive", title: "运动达人", description: "在天河体育中心帮人顶替一场业余足球赛，获得奖金。", reward: 90 },
        negative: { type: "negative", title: "文创剁手", description: "来到广州购书中心，购买了书籍与衍生文创。", reward: -65 },
        neutral: { type: "neutral", title: "竞技地标", description: "广东奥林匹克体育中心是广州重要的体育地标，外形像一朵盛开的木棉花。", reward: 0 }
    },
    "体育西路": {
        positive: {
            type: "positive", title: "天河奇遇", description: "在5A级景区正佳广场中的海洋公园做讲解员", reward: 180 },
        negative: { type: "negative", title: "地狱换乘", description: "你来到了天河商圈：正佳广场、天环广场、时尚天河、六运小区逛一圈钱包都快空了", reward: -100 },
        neutral: { type: "neutral", title: "六运小区", description: "穿过繁华的商场，藏着充满生活气息的六运小区，咖啡店与杂货铺错落有致。", reward: 0 },
        special: "地狱换乘：原地停止脚步。"
    },
    "杨箕": {
        positive: { type: "positive", title: "祠堂文化", description: "参与了杨箕村的大型宗祠重修落成典礼，作为外宾获得了一份利是", reward: 50 },
        negative: { type: "negative", title: "换乘噩梦", description: "你在杨箕的换乘长廊里走得天荒地老，甚至开始怀疑人生。为了补充体力，你不得不扫码买了一瓶最贵的运动饮料。", reward: -50 },
        neutral: { type: "neutral", title: "杨箕回迁", description: "这里的握手楼已消失，取而代之的是现代化豪宅，见证了广州城中村的变迁。", reward: 0 }
    },
    "东山口": {
        positive: { type: "positive", title: "洋楼建筑", description: "东华东路的建筑很有特色，一整面骑楼建筑，你帮忙摄影赚了点外快", reward: 100 },
        negative: { type: "negative", title: "网红店排队", description: "为了吃一口网红甜品，排队两小时还花了高价。", reward: -80 },
        neutral: { type: "neutral", title: "东山新河浦", description: "“权贵东山”，这里有中国最大规模的红砖洋楼群，著名的“五大侨园”便坐落于此。", reward: 0 }
    },
    "烈士陵园": {
        positive: { type: "positive", title: "红色讲解员", description: "为小学生团队义务讲解革命历史，学校送来感谢金", reward: 70 },
        negative: { type: "negative", title: "花圈购买", description: "出于敬意，你购买了一个精美的花圈敬献烈士", reward: -50 },
        neutral: { type: "neutral", title: "红花岗", description: "这里曾是红花岗刑场，如今绿树成荫，随处可见参天古木。在纪念碑下散散步，感受那份庄严肃穆。从陵园出来步行5分钟就到近代史博物馆。", reward: 0 },
        special: "沉稳Buff: 观看近代史博物馆，心境平和。接下来的3轮内，若踩中负面扣钱事件，扣费减半"
    },
    "农讲所": {
        positive: { type: "positive", title: "红墙影记", description: "你在番禺学宫的红墙绿瓦下拍了一组绝美的双人感大片，由于构图出色，发到小红书后瞬间爆火，获得了当地生活博主的推广邀请约。", reward: 120 },
        negative: {
            type: "negative", title: "街边小吃", description: "被路边的马蹄爽、双皮奶吸引，必须停下买一碗", reward: -80 },
        neutral: { type: "neutral", title: "红墙绿瓦", description: "这里曾是明清两代的最高学府。标志性的红墙黄瓦，让你一秒穿越回古代。农讲所前身是明清时期的“番禺学宫”。", reward: 0 },
        special: "获得【农讲所奖学金】Buff，下一轮步数+1"
    },
    "公园前": {
        positive: { type: "positive", title: "北京路锦鲤", description: "抽中了动漫星城的幸运大奖。", reward: 180 },
        negative: { type: "negative", title: "商圈黑洞", description: "你被动漫星城的Coser游行队伍和北京路步行街的爆炸大肠香气彻底淹没，在“买个盲盒”还是“吃份牛杂”之间，你的钱包彻底失守。", reward: -100 },
        neutral: { type: "neutral", title: "千年史迹", description: "玻璃罩下层层叠叠的历代路面，记录了广州两千多年来从未更迭的城市中心。", reward: 0 }
    }
};

export const LINE_2_EVENTS: Record<string, StationEvents> = {
    "广州火车站": {
        positive: { type: "positive", title: "初心寻梦", description: "帮一位初到广州的老人找到了去省汽车站的路，老人硬塞给你感谢费", reward: 150 },
        negative: { type: "negative", title: "出站购买", description: "面对广州火车站复杂的地下通道 and 人流量，你额外购买了一张羊城通一日卡离场。", reward: -20 },
        neutral: { type: "neutral", title: "枢纽记忆", description: "站前的大钟和“广州站”三个大字，是无数打工人来到这座城市的第一印象。", reward: 0 }
    },
    "越秀公园": {
        positive: { type: "positive", title: "五羊石像摄影", description: "在越秀公园五羊石像前帮外地游客拍合家福，获赠下午茶钱。", reward: 40 },
        negative: { type: "negative", title: "湖心意外", description: "在东秀湖划船时不小心把手机掉进水里，打捞和维修费惊人。", reward: -100 },
        neutral: { type: "neutral", title: "五羊传说", description: "爬上木壳岗看五羊衔谷的石像，这里流传着广州“羊城”和“穗城”名字的起源。", reward: 0 },
        special: "强身健体: 爬了一趟越秀山，体力充沛。下一轮步数上限临时+1。"
    },
    "纪念堂": {
        positive: { type: "positive", title: "文化讲解员", description: "在中山纪念堂研学活动中兼职做讲解员，获得劳务补助。", reward: 80 },
        negative: { type: "negative", title: "情怀消费", description: "入门处的纪念邮票摊太诱人，没能忍住买了几套绝版邮票。", reward: -100 },
        neutral: { type: "neutral", title: "木棉王", description: "纪念堂后侧有一棵300多年历史的“木棉王”，每年春天大红的色彩是广州的英雄魂。", reward: 0 }
    },
    "海珠广场": {
        positive: { type: "positive", title: "万菱砍价", description: "在万菱广场通过硬核砍价拿到了低价潮玩，转手卖获利。", reward: 120 },
        negative: { type: "negative", title: "德辅路骗局", description: "临时起意想去南华路买文玩结果买到了假货。", reward: -100 },
        neutral: { type: "neutral", title: "广州第一跨江大桥", description: "桥上正上方就是海珠桥，它作为广州第一座连接江北江南的钢铁跨江大桥。", reward: 0 }
    },
    "市二宫": {
        positive: { type: "positive", title: "婚庆街道", description: "在婚庆前街帮一对新人拍了5分钟视频，新婚夫妇送了酬金。", reward: 60 },
        negative: { type: "negative", title: "婚宴随礼", description: "正好碰见以前的同事在此结婚办酒席，虽然没去坐席但也包了红包。", reward: -100 },
        neutral: { type: "neutral", title: "波浪建筑", description: "曾经是著名的海珠区第一高楼，洁白的墙面与连绵的窗户，充满了二代海珠人的城市记忆。", reward: 0 },
        special: "喜洋洋Buff: 下一轮奖励增加30%。"
    },
    "江南西": {
        positive: { type: "positive", title: "地下淘金", description: "帮人代购运动鞋赚了点代购费。", reward: 80 },
        negative: { type: "negative", title: "潮流陷阱", description: "被新开的潮流买手店吸引，忍不住买下了一套贵得离谱的设计师服装。", reward: -100 },
        neutral: { type: "neutral", title: "后街生活", description: "江南西不仅有繁华的地下商圈，周围居住区也有着无数开了十几年的老字号店。", reward: 0 }
    },
    "昌岗": {
        positive: { type: "positive", title: "广美模特", description: "在广美校门口遇到一位急需写生的艺术系学生，你充当了两小时模特，获得了辛苦费。", reward: 150 },
        negative: { type: "negative", title: "画材超支", description: "在旁边的专业画材店看中了进口颜料，你一不小心就买了一堆画材。", reward: -100 },
        neutral: { type: "neutral", title: "美术摇篮", description: "附近的广州美术学院孕育了无数艺术家，校园里的雕塑和涂鸦充满了先锋气息。", reward: 0 },
        special: "艺术之星: 判定必中。"
    }
};

export const LINE_3_EVENTS: Record<string, StationEvents> = {
    "林和西": {
        positive: { type: "positive", title: "劳务报酬", description: "写字楼下的路演活动急需一名临场协助，你帮忙搬运器材并客串了背景板，领到了丰厚的现金劳务。", reward: 120 },
        negative: { type: "negative", title: "下午茶超支", description: "为了融入写字楼的精英氛围，你请潜在的合作伙伴喝了一顿人均 80 的网红手冲咖啡，结果对方只是来推销保险的。", reward: -80 },
        neutral: { type: "neutral", title: "中信广场", description: "曾经的广州第一高楼，是进入CBD的标志性门户，连接着APM线的起点。", reward: 0 }
    },
    "石牌桥": {
        positive: { type: "positive", title: "代购帮手", description: "万菱汇正好有快闪活动，帮人在万菱汇购买特定商品，获得跑腿费。。", reward: 50 },
        negative: { type: "negative", title: "格调错位", description: "你望着太古汇那闪瞎眼的奢侈品Logo，摸了摸口袋，理智地走向了路边那家散发着花生酱香味的沙县小吃。", reward: -30 },
        neutral: { type: "neutral", title: "太古汇", description: "这里是广州最高档的商圈，橱窗里的顶级奢侈品展示着这个城市最繁华的一面。", reward: 0 },
        special: "优雅慢行: 下3轮步数固定为1"
    },
    "岗顶": {
        positive: { type: "positive", title: "电脑城捡漏", description: "在百脑汇低价淘到高性能硬盘。", reward: 100 },
        negative: { type: "negative", title: "维修陷阱", description: "修手机被黑心商家坑了钱。", reward: -100 },
        neutral: { type: "neutral", title: "IT中心", description: "曾经的电脑城集中地。", reward: 0 }
    },
    "珠江新城": {
        positive: { type: "positive", title: "精英下午茶", description: "职场表现出色获得奖励金。", reward: 80 },
        negative: { type: "negative", title: "职场焦虑", description: "为了缓解压力疯狂购物。", reward: -80 },
        neutral: { type: "neutral", title: "花城之巅", description: "广州最繁华的商务区。", reward: 0 },
        special: "精英幻觉: 下一轮步数增加1步"
    },
    "客村": {
        positive: { type: "positive", title: "创意兼职", description: "在TIT创意园工作获得报酬。", reward: 100 },
        negative: { type: "negative", title: "大限流", description: "被迫改打网约车。", reward: -40 },
        neutral: { type: "neutral", title: "光影时尚", description: "摩登与传统的交汇。", reward: 0 }
    }
};

export const LINE_5_EVENTS: Record<string, StationEvents> = {
    "小北": {
        positive: { type: "positive", title: "异域翻译", description: "帮外籍商人翻译获得补贴。", reward: 60 },
        negative: { type: "negative", title: "民族服饰", description: "购买了特色服饰花费不菲。", reward: -50 },
        neutral: { type: "neutral", title: "风情万种", description: "异域特色街区。", reward: 0 },
        special: "步数跃迁: 下一轮步数可选1-3"
    },
    "淘金": {
        positive: { type: "positive", title: "友谊商店", description: "中了大奖礼品。", reward: 70 },
        negative: { type: "negative", title: "花园餐饮", description: "高级酒店消费过多。", reward: -100 },
        neutral: { type: "neutral", title: "黄金之路", description: "繁华的淘金路。", reward: 0 }
    },
    "区庄": {
        positive: { type: "positive", title: "转车达人", description: "在复杂的立交桥下没走错路，剩下打车钱。", reward: 20 },
        negative: { type: "negative", title: "换乘迷航", description: "在三层叠合立交的区庄站迷失了方向，额外购买了路牌指南。", reward: -40 },
        neutral: { type: "neutral", title: "立体枢纽", description: "这里不仅是两线的交汇点，也是知名的商业枢纽。", reward: 0 }
    },
    "动物园": {
        positive: { type: "positive", title: "快乐熊猫", description: "在动物园看到了可爱的熊猫！大大的黑眼圈太萌了，心情大好获得探索奖励。", reward: 30 },
        negative: { type: "negative", title: "投喂禁令", description: "忍不住想给长颈鹿买点树叶吃，结果买了才发现禁带外食。", reward: -20 },
        neutral: { type: "neutral", title: "城市森林", description: "广州动物园成立于1958年，是一代代老广州人的童年回忆。", reward: 0 }
    },
    "五羊邨": {
        positive: { type: "positive", title: "南方报社", description: "你的投稿被采纳，获得了一笔稿费。", reward: 90 },
        negative: { type: "negative", title: "停车罚款", description: "在路边共享单车违停补交调度费。", reward: -30 },
        neutral: { type: "neutral", title: "新老交替", description: "这里承载了广州传媒业的半壁江山。", reward: 0 }
    },
    "猎德": {
        positive: { type: "positive", title: "博主探店", description: "作为美食博主免费体验高阶西餐并获赠礼品。", reward: 120 },
        negative: { type: "negative", title: "高额溢价", description: "在igc消费，发现这里的物价比外面贵了不少。", reward: -100 },
        neutral: { type: "neutral", title: "猎德人家", description: "从古老渔村到CBD豪宅的华丽转身。", reward: 0 }
    },
    "潭村": {
        positive: { type: "positive", title: "宜居生活", description: "帮邻居看管宠物获得感谢红包。", reward: 50 },
        negative: { type: "negative", title: "装修滋扰", description: "由于楼上装修导致你被迫去住了一晚酒店。", reward: -100 },
        neutral: { type: "neutral", title: "宁静内环", description: "闹中取静的高端住宅区。", reward: 0 }
    },
    "员村": {
        positive: { type: "positive", title: "摄影奖金", description: "在红砖厂拍摄的照片获奖。", reward: 80 },
        negative: { type: "negative", title: "临江高消费", description: "在江边吃了一大餐。", reward: -100 },
        neutral: { type: "neutral", title: "怀旧印记", description: "江边旧仓库。", reward: 0 },
        special: "慢生活: 下一轮步数可选1-2"
    },
    "科韵路": {
        positive: { type: "positive", title: "代码改BUG", description: "在科韵路园区帮一位程序员改出了致命BUG，获赠大奶茶和感谢金。", reward: 80 },
        negative: { type: "negative", title: "宵夜诱惑", description: "被园区密集的宵夜档吸引，忍不住吃了一顿豪横的烧烤。", reward: -60 },
        neutral: { type: "neutral", title: "互联网之都", description: "科韵路是广州互联网公司的摇篮之一。", reward: 0 }
    },
    "车陂南": {
        positive: { type: "positive", title: "换乘顺畅", description: "精准找到换乘口，省下了由于赶路购买的功能饮料费。", reward: 30 },
        negative: { type: "negative", title: "限流噩梦", description: "由于早高峰限流，被迫迟到被扣了工资。", reward: -80 },
        neutral: { type: "neutral", title: "交通动脉", description: "四号线与五号线的重要交汇点。", reward: 0 }
    }
};

export const LINE_6_EVENTS: Record<string, StationEvents> = {
    "北京路": {
        positive: { type: "positive", title: "古道写生", description: "对古街景观写生获得奖励。", reward: 110 },
        negative: { type: "negative", title: "盲盒天坑", description: "抽了一堆不想要的盲盒。", reward: -100 },
        neutral: { type: "neutral", title: "千年史迹", description: "见证广州千年历史。", reward: 0 }
    },
    "团一大广场": {
        positive: { type: "positive", title: "青年志愿者", description: "参加团一大纪念馆讲解活动获得补贴。", reward: 30 },
        negative: { type: "negative", title: "情怀消费", description: "购买了革命题材文创产品。", reward: -20 },
        neutral: { type: "neutral", title: "红色地标", description: "广州红色文化核心点。", reward: 0 },
        special: "朝气蓬勃: 下一轮步数固定为2"
    },
    "东湖": {
        positive: { type: "positive", title: "湖边摄影", description: "在东湖边拍出绝美照片获奖。", reward: 50 },
        negative: { type: "negative", title: "划船意外", description: "租船费用昂贵且超时扣费。", reward: -40 },
        neutral: { type: "neutral", title: "市民休闲", description: "东山湖公园环境优美。", reward: 0 }
    },
    "区庄": {
        positive: { type: "positive", title: "转车达人", description: "在复杂的立交桥下没走错路，剩下打车钱。", reward: 20 },
        negative: { type: "negative", title: "较场口限流", description: "在复杂的区间桥下走错路导致由于时间过长多花了交通费。", reward: -40 },
        neutral: { type: "neutral", title: "立体枢纽", description: "这里不仅是两线的交汇点，也是知名的商业枢纽。", reward: 0 }
    },
    "黄花岗": {
        positive: { type: "positive", title: "庄严祭扫", description: "感悟先烈精神获得校方补助。", reward: 40 },
        negative: { type: "negative", title: "鲜花购买", description: "祭扫仪式购买了高价鲜花。", reward: -30 },
        neutral: { type: "neutral", title: "浩气长存", description: "英雄长眠之地。", reward: 0 },
        special: "静心Buff: 3轮内扣钱事件金额减半"
    },
    "沙河顶": {
        positive: { type: "positive", title: "服装搬运", description: "在沙河顶路过一个大型服装批发市场，你顺便帮一位忙得不可开交的档口老板搬了一段货，老板大方地给了你一笔辛苦费。", reward: 100 },
        negative: { type: "negative", title: "暴力物流", description: "路过卸货区时，你的私人物品不幸被忙碌的搬运工撞翻受损，由于现场秩序极度混乱且不支持暴力损坏赔偿，你只能自认倒霉支付了修理费。", reward: -80 },
        neutral: { type: "neutral", title: "十九路军陵园", description: "隐藏在繁华商界旁的园林陵园，这是一座为了纪念著名的淞沪抗战英雄而建的宁静园林，闹中取静。", reward: 0 }
    },
    "沙河": {
        positive: { type: "positive", title: "档口捡漏", description: "你在沙河服装城最底层的地摊区疯狂砍价，竟然以极低的价格捡漏到了几件当季最火的潮牌样版，转手在咸鱼上卖出了双倍价格。", reward: 150 },
        negative: { type: "negative", title: "批货陷阱", description: "由于不懂沙河批发市场的潜规则，你误以为买到了所谓的“高端原单”，结果拿回家才发现全是一堆无法外穿的劣质库存货，钱包大出血。", reward: -100 },
        neutral: { type: "neutral", title: "南国服装城", description: "这里是全国甚至是全球最大的服装分销中心之一，每天凌晨四点开始，这里就是全国潮流的原始发生地。", reward: 0 }
    }
};

export const LINE_8_EVENTS: Record<string, StationEvents> = {
    "晓港": {
        positive: { type: "positive", title: "布匹加工", description: "利用碎布制作文创获奖。", reward: 50 },
        negative: { type: "negative", title: "仓储费用", description: "临时存放画材导致费用支出。", reward: -20 },
        neutral: { type: "neutral", title: "美术摇篮", description: "毗邻广美。", reward: 0 }
    },
    "中大": {
        positive: { type: "positive", title: "学术咨询", description: "由于你在校内的杰出表现，获邀参与项目咨询活动并获得报酬。", reward: 80 },
        negative: { type: "negative", title: "图书超支", description: "在学而优书店买了一大堆精装书，余额告急。", reward: -100 },
        neutral: { type: "neutral", title: "学府悠悠", description: "康乐园内的古朴宁静，是喧嚣城市中的净土。", reward: 0 }
    },
    "鹭江": {
        positive: { type: "positive", title: "布匹商机", description: "在轻纺城幸运淘到特价布料，倒卖后小赚一笔。", reward: 60 },
        negative: { type: "negative", title: "物流误工", description: "由于档口搬运车太多，你的电动车被撞坏，支付了修理费。", reward: -40 },
        neutral: { type: "neutral", title: "中大布市", description: "这里不仅有布，还有无数逐梦的制衣人。", reward: 0 }
    },
    "赤岗": {
        positive: { type: "positive", title: "临江漫步", description: "捡到了遗落的相机交还失主获得报酬。", reward: 120 },
        negative: { type: "negative", title: "信号掉线", description: "在地铁隧道内信号中断导致支付失败，因违规补票受罚。", reward: -20 },
        neutral: { type: "neutral", title: "核心生活", description: "在这里可以远眺广州塔的宏伟身姿。", reward: 0 }
    },
    "新港东": {
        positive: { type: "positive", title: "展会志愿者", description: "在展会做翻译获得大额报酬。", reward: 150 },
        negative: { type: "negative", title: "高价午餐", description: "展馆周边快餐极其昂贵且分量不足。", reward: -50 },
        neutral: { type: "neutral", title: "极简商务", description: "开阔的视野，预示着商机的无限可能。", reward: 0 }
    },
    "官洲": {
        positive: { type: "positive", title: "生态补贴", description: "参与生物岛生态活动获得补贴。", reward: 50 },
        negative: { type: "negative", title: "单车坏了", description: "骑行过程中损坏了共享单车。", reward: -20 },
        neutral: { type: "neutral", title: "世外桃源", description: "宁静的生命之岛。", reward: 0 },
        special: "天然氧吧: 消除1个负面Buff"
    },
    "琶洲": {
        positive: { type: "positive", title: "广交会翻译", description: "在广交会期间提供翻译服务获利。", reward: 150 },
        negative: { type: "negative", title: "展馆餐饮", description: "在展馆内吃了一顿极其昂贵的简餐。", reward: -100 },
        neutral: { type: "neutral", title: "展会之都", description: "繁华的会展核心区。", reward: 0 },
        special: "电车之旅: 往前移动2格"
    },
    "磨碟沙": {
        positive: { type: "positive", title: "数字媒体兼职", description: "为高新科技区录制宣传片获得奖金。", reward: 200 },
        negative: { type: "negative", title: "职场午茶", description: "被职场内卷氛围裹挟，请客下午茶支出。", reward: -100 },
        neutral: { type: "neutral", title: "科技绿洲", description: "环境优美的临江景观。", reward: 0 },
        special: "效率Buff: 获得一次额外行动机会"
    }
};

export const LINE_12_EVENTS: Record<string, StationEvents> = {
    "天河公园": {
        positive: { type: "positive", title: "环湖跑达人", description: "在翠湖边参加慢跑挑战赛获得名次及奖励。", reward: 50 },
        negative: { type: "negative", title: "蚊虫叮咬", description: "公园蚊虫密集，购买高价驱蚊水。", reward: -20 },
        neutral: { type: "neutral", title: "城市绿肺", description: "天河公园森林覆盖率极高。", reward: 0 }
    },
    "赤岗塔": {
        positive: { type: "positive", title: "古塔摄影", description: "拍摄赤岗塔倒影，获得摄影周刊头条。", reward: 80 },
        negative: { type: "negative", title: "夜间盲行", description: "塔下光线较暗，不小心摔倒擦伤，处理费不少。", reward: -40 },
        neutral: { type: "neutral", title: "古塔巍峨", description: "古老的赤岗塔与现代的广州塔在这里跨时空对话。", reward: 0 }
    },
    "赤岗": {
        positive: { type: "positive", title: "临江漫步", description: "捡到了遗落的相机交还失主获得报酬。", reward: 120 },
        negative: { type: "negative", title: "信号掉线", description: "在地铁隧道内信号中断导致支付失败，因违规补票受罚。", reward: -20 },
        neutral: { type: "neutral", title: "核心生活", description: "在这里可以远眺广州塔的宏伟身姿。", reward: 0 }
    },
    "赤沙北": {
        positive: { type: "positive", title: "湿地拍客", description: "在赤沙湿地拍到珍稀鸟类，作品被杂志录用。", reward: 100 },
        negative: { type: "negative", title: "雨后泥泞", description: "鞋子在泥泞路上严重损坏，购买了新鞋。", reward: -60 },
        neutral: { type: "neutral", title: "水乡遗珠", description: "这里的宁静，仿佛带你回到了几十年前的广州。", reward: 0 }
    },
    "赤沙": {
        positive: { type: "positive", title: "果园采摘", description: "帮果农采摘获得果篮及报酬。", reward: 50 },
        negative: { type: "negative", title: "装备损耗", description: "采摘过程中个人装备损耗。", reward: -40 },
        neutral: { type: "neutral", title: "天然氧吧", description: "万亩果园中心。", reward: 0 }
    },
    "北山": {
        positive: { type: "positive", title: "岭南写生", description: "在此创作水乡题材画作获奖。", reward: 60 },
        negative: { type: "negative", title: "共享单车违停", description: "误入共享单车禁停区被收调度费。", reward: -35 },
        neutral: { type: "neutral", title: "岭南祠堂", description: "传统的岭南水乡人家。", reward: 0 }
    },
    "官洲": {
        positive: { type: "positive", title: "生态补贴", description: "参与生物岛生态活动获得补贴。", reward: 50 },
        negative: { type: "negative", title: "单车坏了", description: "骑行过程中损坏了共享单车。", reward: -20 },
        neutral: { type: "neutral", title: "世外桃源", description: "宁静的生命之岛。", reward: 0 },
        special: "天然氧吧: 消除1个负面Buff"
    },
    "大学城北": {
        positive: { type: "positive", title: "双创奖励", description: "在大学城创业基地获得优秀项目奖金。", reward: 120 },
        negative: { type: "negative", title: "外卖超支", description: "深夜复习功课，点了一份极其昂贵的夜宵。", reward: -50 },
        neutral: { type: "neutral", title: "梦想启航", description: "无数学子的梦想在这里交汇、升华。", reward: 0 }
    },
    "大学城南": {
        positive: { type: "positive", title: "校园宣讲", description: "在地图右下角的【大学城南】参加宣讲获得补贴。这里是绿线、深蓝线与棕线的汇合处。", reward: 40 },
        negative: { type: "negative", title: "体育中心门票", description: "观看高校联赛门票支出。", reward: -30 },
        neutral: { type: "neutral", title: "科教高地", description: "学术氛围极其浓厚。", reward: 0 }
    }
};

export const LINE_13_EVENTS: Record<string, StationEvents> = {
    "天河公园": {
        positive: { type: "positive", title: "环湖跑达人", description: "在翠湖边参加慢跑挑战赛获得名次及奖励。", reward: 50 },
        negative: { type: "negative", title: "蚊虫叮咬", description: "公园蚊虫密集，购买高价驱蚊水。", reward: -20 },
        neutral: { type: "neutral", title: "城市绿肺", description: "天河公园森林覆盖率极高。", reward: 0 }
    },
    "棠下": {
        positive: { type: "positive", title: "创意街拍", description: "在棠下拍摄的民俗照片被购买。", reward: 80 },
        negative: { type: "negative", title: "火热排队", description: "为了网红店排队损失了时间。", reward: -100 },
        neutral: { type: "neutral", title: "潮流圣地", description: "年轻人聚会的首选地。", reward: 0 }
    }
};

export const LINE_18_EVENTS: Record<string, StationEvents> = {
    "冼村": {
        positive: { type: "positive", title: "商圈锦鲤", description: "在冼村高档商场抽中锦鲤奖金。", reward: 150 },
        negative: { type: "negative", title: "高额停车", description: "在此地段停车费支出极其惊人。", reward: -100 },
        neutral: { type: "neutral", title: "新城中轴", description: "广州最现代化的商务区之一。", reward: 0 },
        special: "快线狂魔: 下一轮步数+2"
    }
};

export const LINE_21_EVENTS: Record<string, StationEvents> = {
    "棠东": {
        positive: { type: "positive", title: "幸运兼职", description: "在城中村接到了一份高薪翻译任务。", reward: 120 },
        negative: { type: "negative", title: "排队噩梦", description: "早高峰排队损失了大量时间与精力。", reward: -80 },
        neutral: { type: "neutral", title: "租房大中转", description: "年轻人奋斗的起点。", reward: 0 }
    }
};

export const LINE_11_EVENTS: Record<string, StationEvents> = {
    "梓元岗": {
        positive: { type: "positive", title: "皮具城商机", description: "在皮具城淘到高品质皮具并卖出获利。", reward: 80 },
        negative: { type: "negative", title: "拥堵费", description: "周边道路极其拥堵，支付了额外运输费。", reward: -30 },
        neutral: { type: "neutral", title: "皮具之都", description: "全国知名的皮具贸易集散地。", reward: 0 }
    },
    "大金钟路": {
        positive: { type: "positive", title: "登山捷径", description: "找到通往白云山的快捷山路，获赠导游小费。", reward: 40 },
        negative: { type: "negative", title: "绕路迷航", description: "在白云山脚下迷路，多花了时间与路费。", reward: -50 },
        neutral: { type: "neutral", title: "山脚人家", description: "通往羊城绿肺的必经之路。", reward: 0 }
    },
    "云台花园": {
        positive: { type: "positive", title: "花海漫步", description: "参加摄影大赛拍得繁花盛景获得奖励。", reward: 60 },
        negative: { type: "negative", title: "花粉过敏", description: "由于花粉过敏购买了昂贵的应急药物。", reward: -40 },
        neutral: { type: "neutral", title: "羊城花园", description: "广州最美的园林景观之一。", reward: 0 }
    },
    "龙口西": {
        positive: { type: "positive", title: "学生辅导", description: "在学区内帮人辅导功课获得酬劳。", reward: 70 },
        negative: { type: "negative", title: "学区溢价", description: "由于在学区用餐支付了高额餐饮费。", reward: -60 },
        neutral: { type: "neutral", title: "科教地带", description: "充满学习氛围的成熟社区。", reward: 0 }
    },
    "华师": {
        positive: { type: "positive", title: "校园宣讲", description: "在师大参加宣讲活动获得补贴。", reward: 50 },
        negative: { type: "negative", title: "考试焦虑", description: "围观大学考场导致心力憔悴买饮料回血。", reward: -20 },
        neutral: { type: "neutral", title: "高等学府", description: "人文气息浓厚的石牌高校区。", reward: 0 }
    },
    "华景路": {
        positive: { type: "positive", title: "午后阳光", description: "在社区小店幸运刮奖中奖。", reward: 30 },
        negative: { type: "negative", title: "临停罚款", description: "共享单车停放不当被收调度费。", reward: -25 },
        neutral: { type: "neutral", title: "宜居社区", description: "生活氛围极佳的大型社区。", reward: 0 }
    }
};

export const OTHER_EVENTS: Record<string, StationEvents> = {
    "万胜围": {
        positive: { type: "positive", title: "电车锦鲤", description: "在万胜围站口，你幸运地抽中了电车联名盲盒。在视觉图上，这里是地图右侧绿线与黄线的交接点，也是前往生物岛的必经之路。", reward: 70 },
        negative: { type: "negative", title: "超时费", description: "在万胜中心逗留过久导致停车超时扣费。", reward: -60 },
        neutral: { type: "neutral", title: "江边的终点", description: "万胜围位于地图右下区域。这里是四号线与八号线的枢纽，也是有轨电车THZ1的起点。", reward: 0 }
    },
    "车陂": {
        positive: { type: "positive", title: "龙舟竞渡", description: "参与车陂村龙舟节活动，获得意头金。", reward: 100 },
        negative: { type: "negative", title: "窄路塞车", description: "由于村内路况复杂，不得不花费高价乘坐摩的赶路。", reward: -40 },
        neutral: { type: "neutral", title: "龙舟之乡", description: "车陂涌每年都有精彩的龙舟赛事。", reward: 0 }
    },
    "黄村": {
        positive: { type: "positive", title: "奥体奇遇", description: "在广东奥林匹克体育中心捡到体育明星的训练表，归还后获赠签名球并卖出。", reward: 180 },
        negative: { type: "negative", title: "演唱会黄牛", description: "由于在奥体看演唱会买到了高价假票，损失惨重。", reward: -100 },
        neutral: { type: "neutral", title: "奥体雄姿", description: "这里是大型体育赛事和明星演唱会的集中地。", reward: 0 }
    },
    "二沙岛": {
        positive: { type: "positive", title: "艺海拾珍", description: "在星海音乐厅旁写生获奖。", reward: 100 },
        negative: { type: "negative", title: "昂贵下午茶", description: "享受了艺术之旅但也付出了高昂代价。", reward: -80 },
        neutral: { type: "neutral", title: "艺术之岛", description: "充满艺术气息。", reward: 0 }
    },
    "广州塔": {
        positive: { type: "positive", title: "幸运游客", description: "恭喜！你抵达了地图正下方的【广州塔】。在这里俯瞰江景，被选为锦鲤获得现金奖励。", reward: 200 },
        negative: { type: "negative", title: "云顶餐厅", description: "在塔顶餐厅消费极其高昂。", reward: -100 },
        neutral: { type: "neutral", title: "羊城之巅", description: "恭喜抵达终点！小蛮腰矗立江边，你是今天最快完成挑战的人吗？", reward: 0 }
    }
};

export const ALL_STATION_EVENTS: Record<string, StationEvents> = {
    ...LINE_1_EVENTS,
    ...LINE_2_EVENTS,
    ...LINE_3_EVENTS,
    ...LINE_5_EVENTS,
    ...LINE_6_EVENTS,
    ...LINE_8_EVENTS,
    ...LINE_11_EVENTS,
    ...LINE_12_EVENTS,
    ...LINE_13_EVENTS,
    ...LINE_18_EVENTS,
    ...LINE_21_EVENTS,
    ...OTHER_EVENTS
};

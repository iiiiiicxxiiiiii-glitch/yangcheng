import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Wallet, Dice5, Dice1, Eye, X, ChevronRight, ScrollText, Trophy, TrainFront, Pause, Play, LogOut, Volume2, VolumeX, Settings, Sliders, Map as MapIcon, Zap, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 导入音效资源
import moveWav from './assets/sounds/move.wav';
import daozhanWav from './assets/sounds/daozhan.wav';
import fanyeWav from './assets/sounds/fanye.wav';
import diceRollWav from './assets/sounds/dice_roll.wav';
import jinbiWav from './assets/sounds/jinbi.wav';
import buttonWav from './assets/sounds/button.wav';
import bgmWav from './assets/sounds/bgm.wav';
import winMp3 from './assets/sounds/win.mp3';
import loseMp3 from './assets/sounds/lose.mp3';

// 1. 绝对忠实于你提供的广州地铁线路物理数据（已补齐5号线科韵路）
const METRO_LINES = [
    {
        id: "1号线",
        stations: ["广州东站", "体育中心", "体育西路", "杨箕", "东山口", "烈士陵园", "农讲所", "公园前"]
    },
    {
        id: "2号线",
        stations: ["广州火车站", "越秀公园", "纪念堂", "公园前", "海珠广场", "市二宫", "江南西", "昌岗"]
    },
    {
        id: "3号线",
        stations: ["客村", "广州塔", "珠江新城", "体育西路", "林和西", "广州东站"]
    },
    {
        id: "3号线(支线)",
        stations: ["体育西路", "石牌桥", "岗顶", "华师"]
    },
    {
        id: "5号线",
        stations: ["广州火车站", "小北", "淘金", "区庄", "动物园", "杨箕", "五羊邨", "珠江新城", "猎德", "潭村", "员村", "科韵路", "车陂南"]
    },
    {
        id: "6号线",
        stations: ["海珠广场", "北京路", "团一大广场", "东湖", "东山口", "区庄", "黄花岗", "沙河顶", "沙河"]
    },
    {
        id: "7号线",
        stations: ["大学城南", "大学城北", "官洲", "万胜围", "车陂南", "车陂", "黄村"]
    },
    {
        id: "8号线",
        stations: ["昌岗", "晓港", "中大", "鹭江", "客村", "赤岗", "磨碟沙", "新港东", "琶洲", "万胜围"]
    },
    {
        id: "11号线",
        stations: ["广州火车站", "梓元岗", "大金钟路", "云台花园", "沙河", "广州东站", "龙口西", "华师", "华景路", "天河公园", "员村", "琶洲"]
    },
    {
        id: "12号线",
        stations: ["二沙岛", "赤岗塔", "赤岗", "赤沙北", "赤沙", "北山", "官洲", "大学城北", "大学城南"]
    },
    {
        id: "13号线",
        stations: ["天河公园", "棠下", "车陂"]
    },
    {
        id: "18号线",
        stations: ["冼村", "磨碟沙"]
    },
    {
        id: "21号线",
        stations: ["天河公园", "棠东", "黄村"]
    }
];

// 2. 站点坐标信息及事件数据
import { STATIONS, ALL_STATION_EVENTS, StationEvent } from './constants';

export default function App() {
    const [money, setMoney] = useState(200);
    const [pos, setPos] = useState("");
    const [currentLine, setCurrentLine] = useState("");
    const [direction, setDirection] = useState<1 | -1>(1); // 1: FORWARD, -1: BACKWARD
    const directionRef = useRef<1 | -1>(1);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);
    const [stage, setStage] = useState('INTRO'); // INTRO -> LEVEL_SELECT -> MODE_SELECT -> RULES -> SELECT_START -> PLAYING -> JUDGE -> SETTLEMENT

    // 新增：经济保护状态
    const [economyStats, setEconomyStats] = useState({
        consecutiveNeg: 0,
        consecutivePosHigh: 0
    });

    const [stats, setStats] = useState({
        totalSteps: 0,
        eventCount: 0,
        posCount: 0,
        negCount: 0,
        neuCount: 0,
        linesUsed: new Set<string>()
    });

    const [isRolling, setIsRolling] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [lastRoll, setLastRoll] = useState<number | null>(null);
    const [eventPopup, setEventPopup] = useState<any>(null);
    const [failPopup, setFailPopup] = useState<boolean>(false);
    const [isWin, setIsWin] = useState<boolean>(false);
    const [showTowerChoice, setShowTowerChoice] = useState<boolean>(false);
    const [startStation, setStartStation] = useState("");

    // 换乘弹窗
    const [transferPopup, setTransferPopup] = useState<{ remainingSteps: number; stationName: string } | null>(null);
    const [isMapPreview, setIsMapPreview] = useState(false);
    const [logs, setLogs] = useState<string[]>(["欢迎进站，请刷卡开启你的羊城之旅！"]);
    const [activeBuffs, setActiveBuffs] = useState<Record<string, number>>({});
    const [isChoosingTransfer, setIsChoosingTransfer] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const lastMovePlayRef = useRef<number>(0);

    // --- 设置系统 & 持久化 ---
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('metro_monopoly_settings');
        const defaults = {
            soundEnabled: true,
            soundVolume: 0.5,
            bgmEnabled: true,
            animationSpeed: 'standard', // slow, standard, fast
            cameraSpeed: 'standard',    // slow, standard, fast
            mapPreviewScale: 1.05,
            hasSeenGuide: false
        };
        if (saved) {
            try {
                return { ...defaults, ...JSON.parse(saved) };
            } catch (e) { }
        }
        return defaults;
    });

    useEffect(() => {
        localStorage.setItem('metro_monopoly_settings', JSON.stringify(settings));
    }, [settings]);

    // --- 音效系统 ---
    const soundAssets = useMemo(() => ({
        move: new Audio(moveWav),
        daozhan: new Audio(daozhanWav),
        fanye: new Audio(fanyeWav),
        dice: new Audio(diceRollWav),
        jinbi: new Audio(jinbiWav),
        button: new Audio(buttonWav),
        bgm: new Audio(bgmWav),
        win: new Audio(winMp3),
        lose: new Audio(loseMp3)
    }), []);

    // --- 新手引导系统状态 ---
    interface OnboardingStep {
        id: string;
        title: string;
        description: string;
        position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
        selector: string;
    }

    const ONBOARDING_STEPS: OnboardingStep[] = [
        {
            id: 'money',
            title: '资产余额',
            description: '这是你在广州探索的经费。通过站点事件赚取经费。累积达到 398G 即可达到“羊城旅游”结算标准！',
            position: 'top-left',
            selector: '#hud-money'
        },
        {
            id: 'buffs',
            title: '状态增益',
            description: '这里显示你获得的持续状态。步数加成或奖励增幅会实时影响你的探索效率，状态栏会随 Buff 获取自动更新。',
            position: 'top-left',
            selector: '#hud-buffs'
        },
        {
            id: 'items',
            title: '探索背包',
            description: '这是你的道具袋，用于存放获得的奖励道具（如极速卡等）。点击图标即可即时使用，不同道具有独特效果助你渡过难关，使用后状态会实时在此更新！',
            position: 'bottom-right',
            selector: '#hud-items'
        },
        {
            id: 'logs',
            title: '探索手账',
            description: '记录你每一步的奇遇。向上滚动可以查看历史记录，所有获得的奖励详情和探索心得都会在这里公示。',
            position: 'bottom-left',
            selector: '#hud-logs'
        },
        {
            id: 'actions',
            title: '功能菜单',
            description: '通过齿轮图标可以进入设置调节音量；点击问号图标能随时再次查看这段新手引导，防止迷路。',
            position: 'top-right',
            selector: '#hud-actions'
        },
        {
            id: 'dice',
            title: '掷骰子',
            description: '点击骰子开始一轮行动！这是你游览羊城的主要推进方式，步数由点数和当前 Buff 共同决定。',
            position: 'bottom-right',
            selector: '#hud-dice'
        }
    ];

    const [guideActive, setGuideActive] = useState(false);
    const [currentGuideStep, setCurrentGuideStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

    // 监控引导步骤变化，更新高亮区域位置
    useEffect(() => {
        if (guideActive) {
            const step = ONBOARDING_STEPS[currentGuideStep];
            const updateRect = () => {
                const el = document.querySelector(step.selector);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setHighlightRect({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    });
                }
            };

            updateRect();
            window.addEventListener('resize', updateRect);
            // 某些 UI 可能会有动画，额外延迟检查一次
            const timer = setTimeout(updateRect, 300);
            return () => {
                window.removeEventListener('resize', updateRect);
                clearTimeout(timer);
            };
        } else {
            setHighlightRect(null);
        }
    }, [guideActive, currentGuideStep]);

    // 首次进入游戏强制自动触发引导
    useEffect(() => {
        if (stage === 'PLAYING' && !settings.hasSeenGuide) {
            // 确保在主界面准备好后立即弹出
            const timer = setTimeout(() => {
                setGuideActive(true);
                setCurrentGuideStep(0);
                setSettings((s: any) => ({ ...s, hasSeenGuide: true }));
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [stage, settings.hasSeenGuide]);

    const nextGuide = () => {
        if (currentGuideStep < ONBOARDING_STEPS.length - 1) {
            setCurrentGuideStep(prev => prev + 1);
            playSound('fanye');
        } else {
            setGuideActive(false);
            setCurrentGuideStep(0);
            playSound('button');
        }
    };

    const skipGuide = () => {
        setGuideActive(false);
        setCurrentGuideStep(0);
        playSound('button');
    };

    // 自动循环播放 BGM 并处理渐弱逻辑
    useEffect(() => {
        const bgm = soundAssets.bgm;
        bgm.loop = true;

        if (settings.bgmEnabled) {
            // 在菜单阶段（INTRO, LEVEL_SELECT, MODE_SELECT, RULES）音效较大
            // 在开始游戏后（SELECT_START, PLAYING, JUDGE, SETTLEMENT）音效渐弱/变小
            const isMenu = ['INTRO', 'LEVEL_SELECT', 'MODE_SELECT', 'RULES'].includes(stage);
            const fadeScale = isMenu ? 1.0 : 0.3; // 非菜单阶段音量降为 30%

            bgm.volume = settings.soundVolume * fadeScale;
            bgm.muted = false;

            // 如果还没播放且不是静音状态，尝试播放
            if (bgm.paused) {
                bgm.play().catch(() => console.log('BGM background play blocked'));
            }
        } else {
            bgm.pause();
        }
    }, [settings.bgmEnabled, settings.soundVolume, stage, soundAssets]);

    const playSound = useCallback((name: keyof typeof soundAssets) => {
        if (!settings.soundEnabled) return;

        // 如果 AudioContext 没激活，尝试激活 (针对按钮等交互)
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(() => { });
        }

        // move.wav 特殊处理：防止高频叠加爆音 (方案A: 80ms 间隔)
        if (name === 'move') {
            const now = Date.now();
            if (now - lastMovePlayRef.current < 80) return;
            lastMovePlayRef.current = now;
        }

        const audio = soundAssets[name];
        if (audio) {
            // 针对 move 稍微调低音量
            const volumeScale = name === 'move' ? 0.6 : 1.0;

            // 克隆方式支持高频重复触发 (方案B 的混合思路)
            // 虽然 reset currentTime 也能行，但克隆更稳健，这里先用 reset
            audio.currentTime = 0;
            audio.volume = settings.soundVolume * volumeScale;
            audio.muted = false;
            audio.play().catch((e) => {
                console.log(`Audio [${String(name)}] blocked:`, e.message);
            });
        }
    }, [settings.soundEnabled, settings.soundVolume, soundAssets]);

    const unlockAudio = useCallback(async (exclude?: keyof typeof soundAssets) => {
        // 激活 AudioContext
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        // 解绑所有音频对象（静音播放以满足浏览器解锁政策）
        (Object.entries(soundAssets) as [keyof typeof soundAssets, HTMLAudioElement][]).forEach(([name, audio]) => {
            // 如果是排除项或者已经处于播放状态的音频（主要是BGM），就不需要再次重置解锁了
            if (name === exclude || !audio.paused) return;

            audio.muted = true;
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;
            }).catch(() => { });
        });
        console.log("Audio Context & Assets Unlocked");
    }, [soundAssets]);

    // --- 主动道具系统 ---
    const [items, setItems] = useState([
        {
            id: "chooseDice",
            name: "羊城通极速卡",
            icon: "🎫",
            count: 1,
            price: 50,
            originalPrice: 60,
            displayPrice: 50,
            description: "本回合可自选 1~3 点"
        },
        {
            id: "positiveEvent",
            name: "正点通行证",
            icon: "✨",
            count: 1,
            price: 100,
            originalPrice: 150,
            displayPrice: 100,
            description: "下一次事件必定触发正向事件"
        },
        {
            id: "reverseDirection",
            name: "临时折返票",
            icon: "↩",
            count: 1,
            price: 40,
            originalPrice: 80,
            displayPrice: 40,
            description: "立即反转当前移动方向"
        }
    ]);
    const [isShopOpen, setIsShopOpen] = useState(false);

    // 计算折扣价格 (10%~30%)
    const refreshDiscounts = useCallback(() => {
        setItems(prev => prev.map(item => {
            const discount = 0.7 + Math.random() * 0.2; // 0.7 to 0.9 (10%-30% OFF)
            const newPrice = Math.floor(item.originalPrice * discount);
            return { ...item, price: newPrice, displayPrice: newPrice };
        }));
    }, []);

    const buyItem = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item && money >= item.price) {
            setMoney(prev => prev - item.price);
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, count: i.count + 1 } : i));
            playSound('jinbi');
            setLogs(prev => [`购买了【${item.name}】，花费 ${item.price} G`, ...prev]);
        } else {
            setLogs(prev => [`金币支付失败，请继续探索赚取经费吧！`, ...prev]);
        }
    };

    const watchAdForItem = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            // 模拟观看广告逻辑
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, count: i.count + 1 } : i));
            playSound('jinbi');
            setLogs(prev => [`观看广告获得了【${item.name}】`, ...prev]);
        }
    };
    const [isChoosingDice, setIsChoosingDice] = useState(false);
    const [forcePositiveEvent, setForcePositiveEvent] = useState(false);
    const [showMapGuide, setShowMapGuide] = useState(true);

    const useItem = (itemId: string) => {
        if (isPaused || transferPopup || failPopup || stage !== 'PLAYING') return;

        setItems(prev => prev.map(item => {
            if (item.id === itemId && item.count > 0) {
                if (itemId === "chooseDice") {
                    if (isMoving) return item; // 选数卡不能在移动中触发
                    setIsChoosingDice(true);
                    setLogs(prevLogs => ["使用了【羊城通极速卡】，请选择步数", ...prevLogs]);
                } else if (itemId === "positiveEvent") {
                    setForcePositiveEvent(true);
                    setLogs(prevLogs => ["使用了【正点通行证】，下次事件必定好运", ...prevLogs]);
                } else if (itemId === "reverseDirection") {
                    setDirection(prev => {
                        const newDir = directionRef.current === 1 ? -1 : 1;
                        directionRef.current = newDir; // 这一步是给逻辑看的，决定下一步往哪走
                        setDirection(newDir);         // 这一步是给 UI 看的，决定小火车头朝哪

                        setLogs(prev => ["使用了【临时折返票】，下一格将调转方向！", ...prev]);
                    });
                }
                return { ...item, count: item.count - 1 };
            }
            return item;
        }));
    };

    const togglePause = () => {
        isPausedRef.current = !isPausedRef.current;
        setIsPaused(isPausedRef.current);
    };

    // --- 摄像机系统 (智能跟随棋子并限制边界) ---
    const cameraStyle = useMemo(() => {
        const baseW = 1920;
        const baseH = 1080;

        const duration = settings.cameraSpeed === 'fast' ? '0.4s' : settings.cameraSpeed === 'slow' ? '1.2s' : '0.8s';

        if (isMapPreview) {
            return {
                transition: `all ${duration} cubic-bezier(0.4, 0, 0.2, 1)`,
                transform: `scale(${settings.mapPreviewScale})`,
                transformOrigin: 'center center',
                zIndex: 50
            };
        }

        // 正常游玩模式：缩放并跟随
        const scale = 2.4; // 进一步增加缩放，使地图填满更多空间，减少背景占比
        const activePos = (pos && STATIONS[pos as keyof typeof STATIONS]) ? pos : (startStation && STATIONS[startStation as keyof typeof STATIONS]) ? startStation : "广州火车站";
        const s = STATIONS[activePos as keyof typeof STATIONS] || { x: 960, y: 540 };

        // 计算视野尺寸 (逻辑像素)
        const vW = baseW / scale;
        const vH = baseH / scale;

        // 核心约束逻辑：确保视野区域尽可能不超出 1920x1080 边界
        const cx = Math.max(vW / 2, Math.min(baseW - vW / 2, s.x));
        const cy = Math.max(vH / 2, Math.min(baseH - vH / 2, s.y));

        return {
            transition: `all ${duration} cubic-bezier(0.4, 0, 0.2, 1)`,
            // 使用更稳健的位移计算
            transform: `scale(${scale}) translate(${-cx + vW / 2}px, ${-cy + vH / 2}px)`,
            transformOrigin: '0 0',
            zIndex: 0
        };
    }, [isMapPreview, pos, startStation, settings.cameraSpeed, settings.mapPreviewScale]);

    // 获取车站所属的所有地铁线
    const getLinesOfStation = (stationName: string): string[] => {
        if (!stationName) return [];
        // 确保严格匹配本地定义的 METRO_LINES
        return METRO_LINES.filter(line => line.stations.includes(stationName)).map(line => line.id);
    };

    // 智能方向判定：寻找前往广州塔的最佳路径
    const getDirectionToTarget = (lineId: string, currentPos: string): 1 | -1 => {
        const line = METRO_LINES.find(l => l.id === lineId);
        if (!line) return 1;
        const idx = line.stations.indexOf(currentPos);
        if (idx === -1) return 1;

        const towerPos = STATIONS["广州塔"];

        // 1. 如果该线路包含“广州塔”，直接根据索引确定方向
        const targetIdxInLine = line.stations.indexOf("广州塔");
        if (targetIdxInLine !== -1 && targetIdxInLine !== idx) {
            return targetIdxInLine > idx ? 1 : -1;
        }

        // 2. 否则，判断线路哪个端点离广州塔 Euclidean 距离更近
        // 这是一种简化的启发式寻找“大概方向”
        const startStationName = line.stations[0];
        const endStationName = line.stations[line.stations.length - 1];

        const startTerminal = STATIONS[startStationName as keyof typeof STATIONS];
        const endTerminal = STATIONS[endStationName as keyof typeof STATIONS];

        if (startTerminal && endTerminal) {
            const distToStart = Math.sqrt(Math.pow(startTerminal.x - towerPos.x, 2) + Math.pow(startTerminal.y - towerPos.y, 2));
            const distToEnd = Math.sqrt(Math.pow(endTerminal.x - towerPos.x, 2) + Math.pow(endTerminal.y - towerPos.y, 2));

            // 如果起点终端离目标更近，索引减小的方向（BACKWARD）更好
            if (distToStart < distToEnd) {
                return -1;
            }
        }

        return 1;
    };

    // 选择起点：初始方向默认设定
    const handleSelectStart = (stationName: string) => {
        setStartStation(stationName);
        setPos(stationName);
        // 初始化时不设线，由 transferPopup 触发选线
        setTransferPopup({ remainingSteps: 0, stationName: stationName });
        setIsChoosingTransfer(true);
    };

    // --- 核心移动逻辑 ---
    const moveSteps = (rolled: number, remaining?: number, overrideLine?: string) => {
        if (isMoving && typeof remaining !== 'number') return;

        let stepsLeft = typeof remaining === 'number' ? remaining : rolled;
        const isSpecialMovement = typeof remaining === 'number';

        if (!isSpecialMovement) {
            if (activeBuffs['stepBonus']) stepsLeft += activeBuffs['stepBonus'];
            if (activeBuffs['fixedSteps']) stepsLeft = activeBuffs['fixedVal'] ?? 1;
        }

        if (stepsLeft <= 0) {
            // 如果是因为 buff 导致原地不动，不应该再次触发同样的事件造成死循环
            finalizeTurn(pos, overrideLine || currentLine, false);
            return;
        }

        setIsMoving(true);
        let current = pos;

        const activeLine = overrideLine || currentLine;
        const lineData = METRO_LINES.find(l => l.id === activeLine);
        const lineStations = lineData ? lineData.stations : [];

        // 统计路线
        if (activeLine) {
            setStats(prev => {
                const newLines = new Set(prev.linesUsed);
                newLines.add(activeLine);
                return { ...prev, linesUsed: newLines };
            });
        }

        // 保持方向同步：使用 Ref 保证即便在异步过程中也能获取最新方向
        let currentDir = directionRef.current;

        // 在 moveSteps 内部找到 step
        const step = () => {
            // 🟢 必须加这一行！强行把外部的 Ref 指针同步给当前的移动循环
            currentDir = directionRef.current;

            if (isPausedRef.current) {
                setTimeout(step, 200);
                return;
            }
            // ... 下面的逻辑不变

            // 实时检查方向（支持移动中途使用折返卡）
            currentDir = directionRef.current;

            const currentIdx = lineStations.indexOf(current);
            if (currentIdx === -1) {
                setIsMoving(false);
                finalizeTurn(current, activeLine, true);
                return;
            }

            let nextName: string | undefined;

            // 1. Calculate next index strictly using direction
            const nextIdx = currentIdx + currentDir;
            if (nextIdx >= 0 && nextIdx < lineStations.length) {
                nextName = lineStations[nextIdx];
            }

            // 2. Only flip direction if we hit a terminus boundary with steps remaining
            if (!nextName && stepsLeft > 0) {
                currentDir = (currentDir * -1) as 1 | -1;
                setDirection(currentDir);
                directionRef.current = currentDir;
                const retryIdx = currentIdx + currentDir;
                if (retryIdx >= 0 && retryIdx < lineStations.length) {
                    nextName = lineStations[retryIdx];
                }
            }

            // 3. 平滑滑行
            if (nextName && stepsLeft > 0) {
                current = nextName;
                playSound('move');
                setPos(current);
                setStats(prev => ({ ...prev, totalSteps: prev.totalSteps + 1 }));
                stepsLeft--;

                if (stepsLeft === 0) {
                    setIsMoving(false);
                    finalizeTurn(current, activeLine, true);
                } else {
                    const speedMap = { slow: 800, standard: 500, fast: 250 };
                    setTimeout(step, speedMap[settings.animationSpeed as keyof typeof speedMap]);
                }
            } else {
                setIsMoving(false);
                finalizeTurn(current, activeLine, true);
            }
        };

        step();
    };

    // 移动完毕判定
    const finalizeTurn = (finalPos: string, activeLine: string, didMove: boolean = true) => {
        playSound('daozhan');
        setActiveBuffs(prev => {
            const next = { ...prev };
            // 只有真正发生了位移，才消耗这些持久型（按轮数算）的 Buff
            if (didMove) {
                ['fixedSteps', 'rewardBoost', 'lossReduce'].forEach(k => { if (next[k]) next[k] -= 1; });
            } else {
                // 如果没位移（停留在原地），也要消耗掉 fixedSteps，否则会永久卡死
                if (next['fixedSteps']) next['fixedSteps'] -= 1;
            }

            // 清理单回合生效的 Buff
            ['stepBonus', 'capSteps', 'canRollAgain', 'moveExtra'].forEach(k => delete next[k]);

            Object.keys(next).forEach(k => { if (typeof next[k] === 'number' && next[k] <= 0) delete next[k]; });
            return next;
        });

        if (finalPos === "广州塔") {
            // 弹出选择框，而非直接进入结算
            setShowTowerChoice(true);
            return;
        }

        // 🟢 正常逻辑：非终点站必须执行事件触发逻辑
        if (!didMove) return;

        const availableLines = getLinesOfStation(finalPos);
        const isRealTransfer = availableLines.length > 1 && finalPos !== "广州塔";

        setTimeout(() => {
            triggerEvent(finalPos, isRealTransfer);
        }, 400);
    };

    const triggerEvent = (name: string, isTransferAtEnd: boolean = false) => {
        let eventData = ALL_STATION_EVENTS[name as keyof typeof ALL_STATION_EVENTS];
        if (!eventData) {
            // 数据容错处理：若缺失站点数据，使用通用非奖励事件，严禁使用“广州塔”作为回退，防止阶段混淆
            eventData = {
                positive: { type: "positive", title: "羊城探索", description: "在繁华的街头漫步，感受广州的独特脉动。", reward: 10 },
                negative: { type: "negative", title: "行程波折", description: "由于路途拥挤，你为了赶路多付出了点力气。", reward: -5 },
                neutral: { type: "neutral", title: "平稳通关", description: "列车在一片宁静中驶过，暂无新的发现。", reward: 0 }
            };
        }

        const rand = Math.random();
        let selected: StationEvent;
        let eventType: 'positive' | 'negative' | 'neutral' = 'neutral';

        // 动态概率平衡系统
        let posChance = 0.25;
        let negChance = 0.25;

        if (money < 50) {
            posChance = 0.50; // 极低资金：大幅提高好运
            negChance = 0.05; // 几乎不扣钱
        } else if (money < 150) {
            posChance = 0.35; // 较低资金：适度倾斜
            negChance = 0.15;
        } else if (money > 450) {
            posChance = 0.05; // 极高资金：压制暴富
            negChance = 0.60; // 强制消费/损失倾向
        } else if (money > 300) {
            posChance = 0.15; // 偏高资金：温和平衡
            negChance = 0.40;
        }

        if (forcePositiveEvent) {
            selected = eventData.positive || eventData.neutral;
            setForcePositiveEvent(false);
        } else if (rand < posChance) {
            selected = eventData.positive || eventData.neutral;
        } else if (rand < (posChance + negChance)) {
            selected = eventData.negative || eventData.neutral;
        } else {
            selected = eventData.neutral;
        }

        eventType = selected.type;
        let baseReward = selected.reward || 0;
        let finalVal = baseReward;

        if (eventType === 'positive') {
            // 连续高收益保护
            if (economyStats.consecutivePosHigh >= 1) {
                finalVal = Math.floor(finalVal * 0.8);
            }

            // 正向奖励提升 +10% ~ +30% (削减暴涨可能性)
            const boostMultiplier = 1.1 + Math.random() * 0.2;
            finalVal = Math.floor(finalVal * boostMultiplier);

            // 小概率暴击 x1.5 (从 x2 降低)
            const luckyEvent = Math.random() < 0.1;
            if (luckyEvent) {
                finalVal = Math.floor(finalVal * 1.5);
                setLogs(prev => ["【幸运加倍】触发小额额外奖励！", ...prev]);
                playSound('jinbi');
            }

            if (activeBuffs['rewardBoost']) {
                finalVal = Math.floor(finalVal * 1.3);
            }

            // 更新经济统计
            setEconomyStats(prev => ({
                consecutiveNeg: 0,
                consecutivePosHigh: baseReward >= 120 ? prev.consecutivePosHigh + 1 : 0
            }));
        } else if (eventType === 'negative') {
            // 连续负面保护
            if (economyStats.consecutiveNeg >= 2) {
                finalVal = Math.floor(finalVal * 0.5);
                setLogs(prev => ["【连续负面保护】开启：损失金额已减半。", ...prev]);
            }

            if (activeBuffs['lossReduce']) {
                finalVal = Math.floor(finalVal * 0.5);
            }

            setEconomyStats(prev => ({
                consecutivePosHigh: 0,
                consecutiveNeg: prev.consecutiveNeg + 1
            }));
        } else {
            finalVal = 0;
            setEconomyStats(prev => ({ ...prev, consecutiveNeg: 0, consecutivePosHigh: 0 }));
        }

        // 统计事件
        setStats(prev => ({
            ...prev,
            eventCount: prev.eventCount + 1,
            posCount: eventType === 'positive' ? prev.posCount + 1 : prev.posCount,
            negCount: eventType === 'negative' ? prev.negCount + 1 : prev.negCount,
            neuCount: eventType === 'neutral' ? prev.neuCount + 1 : prev.neuCount
        }));

        if (eventData.special) {
            applySpecialBuff(eventData.special);
        }

        setEventPopup({
            ...selected,
            reward: finalVal,
            station: name,
            special: eventData.special,
            neuInfo: eventData.neutral,
            isTransfer: isTransferAtEnd,
            moveExtra: eventData.special?.includes('往前移动2格') ? 2 : undefined
        });

        setMoney(prev => prev + finalVal);
        setLogs(prev => [`抵达 ${name}: ${selected.description}${eventData.special ? ` [${eventData.special}]` : ''}`, ...prev]);
    };

    const applySpecialBuff = (specialMsg: string) => {
        setActiveBuffs(prev => {
            const next = { ...prev };

            if (specialMsg.includes('步数+1')) {
                next.stepBonus = 1;
            } else if (specialMsg.includes('步数+2')) {
                next.stepBonus = 2;
            } else if (specialMsg.includes('上限临时+1')) {
                next.rollLimitBonus = 1;
            } else if (specialMsg.includes('固定为1') || specialMsg.includes('步数固定为1')) {
                next.fixedSteps = specialMsg.includes('3轮') ? 3 : 1;
                next.fixedVal = 1;
            } else if (specialMsg.includes('停止脚步')) {
                next.fixedSteps = 1;
                next.fixedVal = 0;
            } else if (specialMsg.includes('固定为2')) {
                next.fixedSteps = 1;
                next.fixedVal = 2;
            } else if (specialMsg.includes('1-2') || specialMsg.includes('可选1-2')) {
                next.capSteps = 2;
            } else if (specialMsg.includes('1-3') || specialMsg.includes('可选1-3')) {
                next.capSteps = 3;
            } else if (specialMsg.includes('减半') || specialMsg.includes('慢生活')) {
                next.lossReduce = specialMsg.includes('3轮') ? 3 : 1;
            } else if (specialMsg.includes('增加30%')) {
                next.rewardBoost = 1;
            } else if (specialMsg.includes('消除1个负面Buff')) {
                delete next.fixedSteps;
                delete next.capSteps;
                delete next.fixedVal;
            } else if (specialMsg.includes('额外再行动') || specialMsg.includes('效率')) {
                next.canRollAgain = true;
            } else if (specialMsg.includes('往前移动2格')) {
                next.moveExtra = 2;
            } else if (specialMsg.includes('判定必中')) {
                next.judgeAutoWin = true;
            }

            return next;
        });
    };

    const startJudgment = () => {
        const win = money >= 398 || activeBuffs['judgeAutoWin'];
        setIsWin(win);
        setStage('SETTLEMENT');
        if (win) {
            playSound('win');
        } else {
            playSound('lose');
        }
    };

    const resetGame = () => {
        const nextStart = startStation === "广州火车站" ? "大学城南" : "广州火车站";
        setStartStation(nextStart);
        setPos(nextStart);
        setMoney(200);
        setCurrentLine("");
        setDirection(1);
        directionRef.current = 1;
        setActiveBuffs({});
        setLogs(["判定失败，检票员阿叔把你送回了另一个起点。"]);
        setTransferPopup({ remainingSteps: 0, stationName: nextStart });
        setStage('PLAYING');
    };

    const fullExit = () => {
        setMoney(200);
        setPos("");
        setCurrentLine("");
        setDirection(1);
        directionRef.current = 1;
        setStage('INTRO');
        setLogs(["欢迎进站，请刷卡开启你的羊城之旅！"]);
        setActiveBuffs({});
        setEconomyStats({ consecutiveNeg: 0, consecutivePosHigh: 0 });
        setItems([
            { id: "chooseDice", name: "羊城通极速卡", icon: "🎫", count: 1, price: 50, originalPrice: 60, displayPrice: 50, description: "本回合可自选 1~3 点" },
            { id: "positiveEvent", name: "正点通行证", icon: "✨", count: 1, price: 100, originalPrice: 150, displayPrice: 100, description: "下一次事件必定触发正向事件" },
            { id: "reverseDirection", name: "临时折返票", icon: "↩", count: 1, price: 40, originalPrice: 80, displayPrice: 40, description: "立即反转当前移动方向" }
        ]);
        setIsChoosingDice(false);
        setForcePositiveEvent(false);
        setStats({
            totalSteps: 0,
            eventCount: 0,
            posCount: 0,
            negCount: 0,
            neuCount: 0,
            linesUsed: new Set<string>()
        });
        setTransferPopup(null);
        setIsPaused(false);
        isPausedRef.current = false;
        setShowEndConfirm(false);
    };

    // 获取当前待换乘车站的可选线路
    const currentTransferLines = useMemo(() => {
        if (!transferPopup) return [];
        return getLinesOfStation(transferPopup.stationName);
    }, [transferPopup]);

    const failBg = startStation === "广州火车站"
        ? "https://pic1.imgdb.cn/item/6a05a8fd57da1d412e13ed66.png"
        : "https://pic1.imgdb.cn/item/6a05a93957da1d412e13ee4c.png";

    const victoryBg = "https://pic1.imgdb.cn/item/6a05a86857da1d412e13ea63.png";

    return (
        <div className="h-screen w-screen bg-[#FDFCF8] overflow-hidden relative font-sans text-slate-800">

            {/* 1. 固定比例地图底座容器 */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#FDFCF8] overflow-hidden">
                <div
                    className="relative w-full h-full max-w-[177.78vh] aspect-video shadow-2xl transition-all duration-700 bg-[#FDFCF8]"
                    style={{
                        ...cameraStyle,
                        maxHeight: '56.25vw',
                        maxWidth: '177.78vh'
                    }}
                >
                    {/* 2. 地图内容层 (使用 SVG image 确保棋子坐标与地图背景绝对同步) */}
                    <div className="absolute inset-0 w-full h-full">
                        <svg
                            viewBox="0 0 1920 1080"
                            className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-sm"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <image
                                href="https://pic1.imgdb.cn/item/6a0451cdff1caee4b5ccdefd.png"
                                x="0" y="0" width="1920" height="1080"
                                preserveAspectRatio="xMidYMid meet"
                            />
                            {/* 终点渲染 */}
                            {Object.entries(STATIONS).map(([name, s]) => {
                                if (!s || s.x === undefined || name !== "广州塔") return null;

                                return (
                                    <g key={name} transform={`translate(${s.x}, ${s.y})`}>
                                        <motion.circle
                                            r="40"
                                            fill="none"
                                            stroke="#BC3E34"
                                            strokeWidth="3"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: [0.8, 1.4], opacity: [0.6, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <circle r="20" fill="#BC3E34" stroke="white" strokeWidth="4" />
                                        <text y="-50" textAnchor="middle" className="text-[32px] font-black fill-[#BC3E34]" style={{ paintOrder: 'stroke', stroke: '#FDFCF8', strokeWidth: '8px' }}>
                                            🚩 终点: {name}
                                        </text>
                                    </g>
                                );
                            })}
                            {/* 棋子渲染 */}
                            {pos && STATIONS[pos as keyof typeof STATIONS] && (
                                <motion.g
                                    initial={false}
                                    animate={{
                                        x: STATIONS[pos as keyof typeof STATIONS].x,
                                        y: STATIONS[pos as keyof typeof STATIONS].y
                                    }}
                                    transition={{
                                        type: "tween",
                                        ease: "easeInOut",
                                        duration: 0.5
                                    }}
                                >
                                    <motion.g
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <motion.circle
                                            r="26"
                                            fill="#BC3E34"
                                            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    </motion.g>

                                    <motion.g
                                        animate={{
                                            scaleX: direction === 1 ? 1 : -1,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    >
                                        <circle r="26" fill="#BC3E34" stroke="white" strokeWidth="6" className="shadow-2xl" />
                                        <TrainFront size={24} className="text-white -translate-x-3 -translate-y-3 pointer-events-none" />
                                    </motion.g>

                                    {/* 状态指示器 */}
                                    {Object.keys(activeBuffs).length > 0 && (
                                        <g transform="translate(0, -60)">
                                            {activeBuffs['fixedSteps'] && activeBuffs['fixedVal'] === 0 && (
                                                <motion.g initial={{ y: 5 }} animate={{ y: 0 }} transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}>
                                                    <text textAnchor="middle" className="text-[20px] font-black fill-[#BC3E34]" style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: '6px' }}>
                                                        😵 眩晕中...
                                                    </text>
                                                </motion.g>
                                            )}
                                            {activeBuffs['stepBonus'] && (
                                                <motion.g initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="pointer-events-none">
                                                    <text textAnchor="middle" className="text-[18px] font-black fill-emerald-600" style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: '6px' }}>
                                                        ⚡ 移动加速
                                                    </text>
                                                </motion.g>
                                            )}
                                        </g>
                                    )}
                                </motion.g>
                            )}
                        </svg>
                    </div>
                </div>
            </div>

            {/* 3. 全局 HUD UI */}
            {!isMapPreview && (
                <>
                    {(stage === 'PLAYING' || stage === 'JUDGE' || stage === 'SETTLEMENT') && (
                        <div className="fixed top-4 sm:top-8 left-4 sm:left-8 z-[1000] flex flex-col gap-4 max-h-[40vh] overflow-y-auto scrollbar-none pr-4">
                            <div id="hud-money" className="flex items-center gap-4 bg-white/90 p-4 rounded-3xl shadow-lg border border-red-50 font-black backdrop-blur-md">
                                <div className="bg-[#BC3E34] p-2 rounded-xl text-white shadow-md shadow-red-200"><Wallet size={24} /></div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter leading-none mb-1">资产余额</p>
                                    <span className="text-2xl tracking-tighter">{money} G</span>
                                </div>
                            </div>

                            {/* Buff 状态 */}
                            <div id="hud-buffs" className="flex flex-wrap gap-2 max-w-[200px]">
                                {Object.entries(activeBuffs).map(([key, val]) => (
                                    <motion.div
                                        key={key}
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="px-3 py-1 bg-[#BC3E34] text-white text-[10px] font-black rounded-full shadow-sm flex items-center gap-1"
                                    >
                                        {key === 'stepBonus' && `步数+${val}`}
                                        {key === 'fixedSteps' && `优雅慢行(${val})`}
                                        {key === 'capSteps' && `慢生活(步数≤${val})`}
                                        {key === 'lossReduce' && `损失减免(${val})`}
                                        {key === 'rewardBoost' && `奖励增幅(${val})`}
                                        {key === 'canRollAgain' && `额外行动`}
                                        {key === 'judgeAutoWin' && `判定必中`}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 全局控制 UI (设置与辅助) - 确保在任何 stage 都置顶 */}
                    {!['INTRO', 'LEVEL_SELECT', 'MODE_SELECT', 'RULES'].includes(stage) && (
                        <div id="hud-actions" className="fixed top-8 right-8 z-[2000] flex flex-wrap justify-end gap-2 sm:gap-4 max-w-[50vw]">
                            <button
                                onClick={() => {
                                    setShowSettings(true);
                                    playSound('button');
                                }}
                                className="p-4 bg-white/90 rounded-3xl shadow-lg border border-slate-100 text-slate-600 hover:text-[#BC3E34] hover:border-red-100 transition-all active:scale-90 backdrop-blur-md"
                                title="设置"
                            >
                                <Settings size={28} />
                            </button>

                            <button
                                onClick={() => {
                                    setGuideActive(true);
                                    setCurrentGuideStep(0);
                                    playSound('button');
                                }}
                                className="p-4 bg-white/90 rounded-3xl shadow-lg border border-slate-100 text-slate-600 hover:text-[#BC3E34] hover:border-red-100 transition-all active:scale-90 backdrop-blur-md"
                                title="新手引导"
                            >
                                <HelpCircle size={28} />
                            </button>

                            {/* 仅在游戏中显示暂停和退出按钮 */}
                            {stage === 'PLAYING' && (
                                <>
                                    <button
                                        onClick={() => {
                                            togglePause();
                                            playSound('button');
                                        }}
                                        className="p-4 bg-white/90 rounded-3xl shadow-lg border border-slate-100 text-slate-600 hover:text-[#BC3E34] hover:border-red-100 transition-all active:scale-90 backdrop-blur-md"
                                    >
                                        {isPaused ? <Play size={28} className="fill-current" /> : <Pause size={28} className="fill-current" />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowEndConfirm(true);
                                            playSound('button');
                                        }}
                                        className="p-4 bg-white/90 rounded-3xl shadow-lg border border-slate-100 text-slate-600 hover:text-red-500 hover:border-red-100 transition-all active:scale-90 backdrop-blur-md"
                                    >
                                        <LogOut size={28} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {(stage === 'PLAYING' || stage === 'JUDGE' || stage === 'SETTLEMENT') && (
                        <div id="hud-logs" className="fixed bottom-8 left-8 z-[1000] max-w-[80vw] sm:max-w-sm bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xl max-h-[30vh] flex flex-col">
                            <div className="flex items-center gap-2 mb-3 text-slate-400 font-bold text-xs uppercase tracking-wider shrink-0">
                                <ScrollText size={16} />
                                <span>羊城探索手账</span>
                            </div>
                            <div className="overflow-y-auto space-y-2 pr-2 text-xs font-bold text-slate-600 scrollbar-none flex-1">
                                {logs.map((log, i) => (
                                    <p key={i} className={i === 0 ? "text-[#BC3E34]" : "opacity-60"}>{log}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* 新手引导 Mask & Tooltip */}
            <AnimatePresence>
                {guideActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[5000] pointer-events-none"
                    >
                        {/* 统一遮罩系统 (Spotlight Overlay) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={skipGuide}>
                            <defs>
                                <mask id="spotlight-mask">
                                    <rect width="100%" height="100%" fill="white" />
                                    {highlightRect && (
                                        <motion.rect
                                            initial={false}
                                            animate={{
                                                x: highlightRect.left - 8,
                                                y: highlightRect.top - 8,
                                                width: highlightRect.width + 16,
                                                height: highlightRect.height + 16
                                            }}
                                            rx="24" ry="24" fill="black"
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#spotlight-mask)" />
                        </svg>

                        {/* 高亮外圈发光 (Glow Effect) */}
                        {highlightRect && (
                            <motion.div
                                initial={false}
                                animate={{
                                    top: highlightRect.top - 8,
                                    left: highlightRect.left - 8,
                                    width: highlightRect.width + 16,
                                    height: highlightRect.height + 16
                                }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute rounded-[24px] border-4 border-[#BC3E34] shadow-[0_0_40px_rgba(188,62,52,0.6)] pointer-events-none"
                                style={{ zIndex: 5010 }}
                            />
                        )}

                        <div className="absolute inset-0 pointer-events-none">
                            {(() => {
                                const step = ONBOARDING_STEPS[currentGuideStep];

                                // 动态计算 Tooltip 位置与箭头指向
                                const getTooltipConfig = () => {
                                    if (!highlightRect) return {
                                        style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                                        arrowStyle: { display: 'none' }
                                    };

                                    const margin = 32;
                                    const tooltipWidth = 320;
                                    const tooltipHeight = 240; // 预估高度

                                    let top, left;
                                    let arrowPos: any = { top: 'auto', bottom: 'auto', left: '50%', transform: 'translateX(-50%) rotate(45deg)', border: 'none' };

                                    const targetCenterX = highlightRect.left + highlightRect.width / 2;
                                    const targetCenterY = highlightRect.top + highlightRect.height / 2;

                                    // 决定放在目标上方还是下方
                                    if (highlightRect.top + highlightRect.height + tooltipHeight + margin < window.innerHeight) {
                                        // 放在下面
                                        top = highlightRect.top + highlightRect.height + margin;
                                        arrowPos = { ...arrowPos, top: '-10px', borderLeft: '1px solid rgba(188,62,52,0.1)', borderTop: '1px solid rgba(188,62,52,0.1)' };
                                    } else {
                                        // 放在上面
                                        top = highlightRect.top - tooltipHeight - margin;
                                        arrowPos = { ...arrowPos, bottom: '-10px', borderRight: '1px solid rgba(188,62,52,0.1)', borderBottom: '1px solid rgba(188,62,52,0.1)' };
                                    }

                                    left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, targetCenterX - tooltipWidth / 2));

                                    // 修正箭头水平位置，使其始终对准目标中心
                                    const arrowLeft = targetCenterX - left;
                                    arrowPos.left = `${Math.max(20, Math.min(tooltipWidth - 20, arrowLeft))}px`;

                                    return {
                                        style: { top, left, width: tooltipWidth },
                                        arrowStyle: arrowPos
                                    };
                                };

                                const config = getTooltipConfig();

                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="fixed bg-white rounded-3xl p-7 shadow-2xl border border-[#BC3E34]/20 pointer-events-auto z-[5100]"
                                        style={config.style}
                                    >
                                        <div
                                            className="absolute w-5 h-5 bg-white rotate-45"
                                            style={config.arrowStyle}
                                        />

                                        <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-[#BC3E34] rounded-full" />
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-500 font-bold leading-snug mb-6 text-sm">
                                            {step.description}
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={skipGuide}
                                                className="flex-1 py-3 text-slate-400 font-black text-sm hover:text-slate-600 transition-colors"
                                            >
                                                跳过
                                            </button>
                                            <button
                                                onClick={nextGuide}
                                                className="flex-[3] py-3 bg-[#BC3E34] text-white rounded-2xl font-black text-sm hover:bg-[#A3352C] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {currentGuideStep === ONBOARDING_STEPS.length - 1 ? '开始探索' : '下一步'}
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>

                                        <div className="mt-5 flex gap-1.5 justify-center">
                                            {ONBOARDING_STEPS.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 rounded-full transition-all duration-300 ${i === currentGuideStep ? 'w-8 bg-[#BC3E34]' : 'w-1.5 bg-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- 游戏流程屏幕 --- */}

            {/* INTRO 封面 */}
            {stage === 'INTRO' && (
                <div className="fixed inset-0 z-[800] bg-[#FDFCF8] flex items-center justify-center p-4 lg:p-8 overflow-hidden pointer-events-auto">
                    <div className="relative w-full h-full max-w-[177.78vh] aspect-video bg-[#FDFCF8] overflow-hidden">
                        <img
                            src="https://pic1.imgdb.cn/item/6a0416f1ff1caee4b5cc74c6.png"
                            className="w-full h-full object-contain"
                            alt="Metro Monopoly Background"
                            referrerPolicy="no-referrer"
                        />
                        {/* 封面设置按钮交互 - 右上角 */}
                        <button
                            onClick={() => {
                                setShowSettings(true);
                                playSound('button');
                            }}
                            className="absolute right-[1%] top-[3%] w-[12%] h-[12%] hover:bg-white/10 transition-all cursor-pointer rounded-full z-[1200] pointer-events-auto"
                            title="设置"
                        />
                        {/* 开始游戏点击区 - 扩大点击范围 */}
                        <button
                            onClick={() => {
                                playSound('jinbi');
                                unlockAudio('jinbi');
                                setStage('LEVEL_SELECT');
                            }}
                            className="absolute left-[30%] right-[30%] bottom-[8%] h-[20%] hover:bg-white/10 transition-all cursor-pointer rounded-[3vw] z-[100] pointer-events-auto"
                            title="开始游戏"
                        />
                    </div>
                </div>
            )}

            {/* LEVEL_SELECT 关卡选择 */}
            {stage === 'LEVEL_SELECT' && (
                <div className="fixed inset-0 z-[810] bg-[#FDFCF8] flex items-center justify-center p-4 lg:p-8 overflow-hidden pointer-events-auto">
                    <div className="relative w-full h-full max-w-[177.78vh] aspect-video bg-[#FDFCF8] overflow-hidden">
                        <img
                            src="https://pic1.imgdb.cn/item/6a0416ffff1caee4b5cc74d5.png"
                            className="w-full h-full object-contain"
                            alt="Level Select"
                            referrerPolicy="no-referrer"
                        />
                        {/* 返回按钮 */}
                        <button
                            onClick={() => {
                                setStage('INTRO');
                                playSound('button');
                            }}
                            className="absolute left-[0%] bottom-[0%] w-[15%] h-[15%] hover:bg-white/5 transition-all cursor-pointer z-[100] pointer-events-auto"
                            title="返回"
                        />
                        {/* 关卡页设置按钮 - 右上角同步 */}
                        <button
                            onClick={() => {
                                setShowSettings(true);
                                playSound('button');
                            }}
                            className="absolute right-[1%] top-[3%] w-[12%] h-[12%] hover:bg-white/10 transition-all cursor-pointer rounded-full z-[1200] pointer-events-auto"
                            title="设置"
                        />
                        {/* 主关卡点击区 */}
                        <button
                            onClick={() => {
                                setStage('MODE_SELECT');
                                playSound('button');
                            }}
                            className="absolute left-[5%] top-[15%] w-[40%] h-[70%] hover:bg-white/10 transition-all cursor-pointer rounded-[5vw] z-[100] pointer-events-auto"
                            title="主关卡"
                        />
                    </div>
                </div>
            )}

            {/* MODE_SELECT 单双人模式选择 */}
            {stage === 'MODE_SELECT' && (
                <div className="fixed inset-0 z-[820] bg-[#FDFCF8] flex items-center justify-center p-4 lg:p-8 overflow-hidden pointer-events-auto">
                    <div className="relative w-full h-full max-w-[177.78vh] aspect-video bg-[#FDFCF8] overflow-hidden">
                        <img
                            src="https://pic1.imgdb.cn/item/6a041704ff1caee4b5cc74dc.png"
                            className="w-full h-full object-contain"
                            alt="Mode Select"
                            referrerPolicy="no-referrer"
                        />
                        {/* 返回按钮 */}
                        <button
                            onClick={() => {
                                setStage('LEVEL_SELECT');
                                playSound('button');
                            }}
                            className="absolute left-[0%] bottom-[0%] w-[15%] h-[15%] hover:bg-white/5 transition-all cursor-pointer z-[100] pointer-events-auto"
                            title="返回"
                        />
                        {/* 模式页设置按钮 - 右上角同步 */}
                        <button
                            onClick={() => {
                                setShowSettings(true);
                                playSound('button');
                            }}
                            className="absolute right-[1%] top-[3%] w-[12%] h-[12%] hover:bg-white/10 transition-all cursor-pointer rounded-full z-[1200] pointer-events-auto"
                            title="设置"
                        />
                        {/* 单人模式点击区 */}
                        <button
                            onClick={() => {
                                setStage('RULES');
                                playSound('button');
                            }}
                            className="absolute left-[10%] top-[20%] w-[42%] h-[60%] hover:bg-white/10 transition-all cursor-pointer rounded-[5vw] z-[100] pointer-events-auto"
                            title="单人模式"
                        />
                    </div>
                </div>
            )}

            {/* RULES 规则说明 */}
            {stage === 'RULES' && (
                <div className="fixed inset-0 z-[830] bg-[#FDFCF8] flex items-center justify-center p-4 lg:p-8 overflow-hidden pointer-events-auto">
                    <div className="relative w-full h-full max-w-[177.78vh] aspect-video bg-[#FDFCF8] overflow-hidden">
                        <img
                            src="https://pic1.imgdb.cn/item/6a041d9eff1caee4b5cc847e.png"
                            className="w-full h-full object-contain"
                            alt="Game Rules"
                            referrerPolicy="no-referrer"
                        />
                        {/* 返回按钮 */}
                        <button
                            onClick={() => {
                                setStage('MODE_SELECT');
                                playSound('button');
                            }}
                            className="absolute left-[0%] bottom-[0%] w-[15%] h-[15%] hover:bg-white/5 transition-all cursor-pointer z-[100] pointer-events-auto"
                            title="返回"
                        />
                        {/* 规则页设置按钮 - 右上角同步 */}
                        <button
                            onClick={() => {
                                setShowSettings(true);
                                playSound('button');
                            }}
                            className="absolute right-[1%] top-[3%] w-[12%] h-[12%] hover:bg-white/10 transition-all cursor-pointer rounded-full z-[1200] pointer-events-auto"
                            title="设置"
                        />
                        {/* 我知道了点击区 - 移至右下角 */}
                        <button
                            onClick={() => {
                                setStage('SELECT_START');
                                playSound('button');
                            }}
                            className="absolute right-[5%] bottom-[5%] w-[25%] h-[15%] hover:bg-white/10 transition-all cursor-pointer rounded-[2vw] z-[200] pointer-events-auto"
                            title="我知道了"
                        />
                    </div>
                </div>
            )}


            {/* SELECT_START 选起点 */}
            {stage === 'SELECT_START' && !transferPopup && (
                <div className="fixed inset-0 z-[850] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FDFCF8] p-12 rounded-[4rem] border-t-[20px] border-[#BC3E34] text-center max-w-2xl shadow-2xl relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setStage('RULES');
                                playSound('button');
                            }}
                            className="absolute top-8 left-8 text-slate-400 hover:text-[#BC3E34] transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <h2 className="text-4xl font-black mb-12 text-slate-800 italic tracking-tighter">请选择始发车站</h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button onClick={() => {
                                handleSelectStart("广州火车站");
                                playSound('button');
                            }} className="flex-1 min-w-[200px] p-8 bg-white border-2 border-slate-100 rounded-[3rem] font-black text-2xl sm:text-3xl hover:border-[#BC3E34] hover:text-[#BC3E34] transition-all active:scale-95 shadow-sm">广州火车站</button>
                            <button onClick={() => {
                                handleSelectStart("大学城南");
                                playSound('button');
                            }} className="flex-1 min-w-[200px] p-8 bg-white border-2 border-slate-100 rounded-[3rem] font-black text-2xl sm:text-3xl hover:border-[#BC3E34] hover:text-[#BC3E34] transition-all active:scale-95 shadow-sm">大学城南</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 线路换乘 / 起点选线 面板 */}
            {transferPopup && !isMapPreview && (
                <div
                    onClick={() => setShowMapGuide(false)}
                    className="fixed inset-0 z-[550] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white p-8 rounded-[3.5rem] shadow-2xl w-[22rem] border-t-[16px] border-[#BC3E34]"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black italic text-slate-800">选择前进线路</h2>
                                <p className="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">Canton Pulse · Dispatch</p>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsMapPreview(true);
                                        setShowMapGuide(false);
                                        playSound('fanye');
                                    }}
                                    className="p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-all group active:scale-90 shadow-sm"
                                >
                                    <Eye size={28} className="text-[#BC3E34]" />
                                </button>

                                {/* 地图预览指引气泡 */}
                                <AnimatePresence>
                                    {showMapGuide && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                x: '-50%',
                                                translateY: [0, -5, 0]
                                            }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{
                                                opacity: { duration: 0.3 },
                                                translateY: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMapGuide(false);
                                            }}
                                            className="absolute bottom-full left-1/2 mb-4 w-40 bg-[#FDFCF8] text-[#BC3E34] p-3 rounded-2xl shadow-xl text-sm font-black text-center cursor-pointer pointer-events-auto border border-[#BC3E34]/10 z-[600]"
                                        >
                                            点击可查看全局地铁地图
                                            {/* 小箭头 */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[8px] border-transparent border-t-[#FDFCF8]"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-none">
                            {currentTransferLines.map(lineId => (
                                <button
                                    key={lineId}
                                    onClick={() => {
                                        setShowMapGuide(false);
                                        const remaining = transferPopup.remainingSteps;
                                        playSound('button');

                                        // 智能计算新线路的方向：如果选择同一条线则保持方向，否则根据目标重新判定
                                        const newDir = lineId === currentLine ? directionRef.current : getDirectionToTarget(lineId, pos);
                                        setCurrentLine(lineId);
                                        setDirection(newDir);
                                        directionRef.current = newDir;
                                        setTransferPopup(null);
                                        setIsChoosingTransfer(false);
                                        setStage('PLAYING');

                                        if (remaining > 0) {
                                            setTimeout(() => moveSteps(0, remaining, lineId), 300);
                                        } else {
                                            // 换乘站只切换线路，不触发事件，等待下一轮掷骰子
                                        }
                                    }}
                                    className="w-full py-6 bg-slate-50 rounded-[2rem] font-black hover:bg-slate-100 border border-transparent hover:border-[#BC3E34]/20 flex items-center justify-between px-10 transition-all active:translate-y-1 shadow-sm group"
                                >
                                    <span className="text-xl text-slate-700">{lineId}</span>
                                    <ChevronRight size={24} className="text-[#BC3E34]" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 地图全局预览遮罩 */}
            {isMapPreview && (
                <div className="fixed inset-0 z-[800] pointer-events-none flex flex-col items-start justify-end p-12">
                    <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full mb-6 border border-[#BC3E34]/20 shadow-xl ml-4">
                        <span className="text-[#BC3E34] font-black italic tracking-[0.2em] text-lg uppercase">全 局 脉 动 视 角</span>
                    </div>
                    <button onClick={() => {
                        setIsMapPreview(false);
                        playSound('fanye');
                    }} className="pointer-events-auto bg-[#BC3E34] text-white px-12 py-5 rounded-full flex items-center gap-3 font-black text-2xl shadow-2xl active:scale-95 transition-all ml-4">
                        <X size={28} /> 退出预览模式
                    </button>
                </div>
            )}

            {/* 掷骰子按钮 */}
            {stage === 'PLAYING' && !eventPopup && !transferPopup && !isMapPreview && !isChoosingTransfer && (
                <div className="fixed bottom-6 sm:bottom-12 right-6 sm:right-12 z-[400] flex flex-col items-center gap-4 sm:gap-6 max-h-[80vh] justify-end">
                    {/* 换乘提示 */}
                    {isChoosingTransfer && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#BC3E34] text-white px-6 py-3 rounded-2xl font-black shadow-xl"
                        >
                            请点击车站气泡或下方按钮选择换乘线路
                        </motion.div>
                    )}
                    {/* 道具栏 */}
                    <div id="hud-items" className="flex flex-col gap-3 items-end max-w-[90vw]">
                        <div className="flex flex-wrap gap-2 sm:gap-3 bg-white/80 backdrop-blur-md p-2 sm:p-3 rounded-3xl border border-slate-100 shadow-xl justify-center sm:justify-end">
                            {items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.count > 0) {
                                            useItem(item.id);
                                            playSound('button');
                                        } else {
                                            setIsShopOpen(true);
                                            playSound('button');
                                        }
                                    }}
                                    disabled={isChoosingDice}
                                    className={`relative group p-3 rounded-2xl transition-all ${item.count > 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 opacity-40 hover:opacity-100'}`}
                                    title={`${item.name}: ${item.description}`}
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    {item.count > 0 ? (
                                        <span className="absolute -top-1 -right-1 bg-[#BC3E34] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                                            {item.count}
                                        </span>
                                    ) : (
                                        <span className="absolute -top-1 -right-1 bg-slate-400 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                                            +
                                        </span>
                                    )}
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-48 bg-slate-900 text-white p-3 rounded-2xl pointer-events-none text-center shadow-2xl z-[500]">
                                        <div className="font-black text-sm">{item.name}</div>
                                        <div className="text-xs opacity-80 mt-1 leading-relaxed">{item.count > 0 ? item.description : '点击前往商店购买'}</div>
                                    </div>
                                </button>
                            ))}
                            <div className="w-px h-10 bg-slate-200 mx-1 self-center" />
                            <button
                                onClick={() => {
                                    setIsShopOpen(!isShopOpen);
                                    if (!isShopOpen) refreshDiscounts();
                                    playSound('button');
                                }}
                                className={`p-3 rounded-2xl transition-all ${isShopOpen ? 'bg-[#BC3E34] text-white' : 'bg-white text-slate-400 hover:text-[#BC3E34]'}`}
                                title="道具商店"
                            >
                                <ScrollText size={24} />
                            </button>
                        </div>

                        {/* 嵌入式商店逻辑面板 */}
                        <AnimatePresence>
                            {isShopOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl w-80 max-h-[80vh] flex flex-col overflow-hidden"
                                >
                                    <div className="flex justify-between items-center mb-4 shrink-0">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 italic">羊城通商店</h3>
                                            <p className="text-[10px] font-bold text-[#BC3E34] uppercase tracking-wider">Flash Sale · 10%~30% OFF</p>
                                        </div>
                                        <button onClick={() => setIsShopOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
                                    </div>

                                    <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-none">
                                        {items.map(item => (
                                            <div key={item.id} className="p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-red-100 transition-all shadow-sm">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-3xl">{item.icon}</span>
                                                        <div>
                                                            <div className="font-black text-lg text-slate-800">{item.name}</div>
                                                            <div className="text-sm text-slate-500 font-bold leading-relaxed">{item.description}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-4">
                                                        <div className="text-xs text-slate-300 line-through font-black">{item.originalPrice} G</div>
                                                        <div className="text-lg text-[#BC3E34] font-black">{item.price} G</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => buyItem(item.id)}
                                                        disabled={money < item.price}
                                                        className="flex-2 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-[#BC3E34] disabled:opacity-30 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <Wallet size={16} />
                                                        {item.count > 0 ? `${item.price}G 续购 (${item.count})` : `${item.price}G 直接购买`}
                                                    </button>
                                                    <button
                                                        onClick={() => watchAdForItem(item.id)}
                                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <Eye size={16} /> 免费
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {lastRoll !== null && !isRolling && !isChoosingDice && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                className="bg-[#BC3E34] text-white px-6 py-2 rounded-full font-black text-xl shadow-xl italic"
                            >
                                {activeBuffs['fixedSteps'] ? '优雅慢行: 固定 1 步' :
                                    activeBuffs['stepBonus'] ? `掷得 ${lastRoll} + ${activeBuffs['stepBonus']} 步！` :
                                        `掷得 ${lastRoll} 步！`}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isChoosingDice ? (
                        <div className="flex gap-4 bg-slate-900/5 backdrop-blur-sm p-4 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            {[1, 2, 3].map(val => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        setIsChoosingDice(false);
                                        playSound('button');
                                        setLastRoll(val);
                                        moveSteps(val);
                                    }}
                                    className="bg-slate-900 text-white w-20 h-20 rounded-[2rem] shadow-xl hover:bg-[#BC3E34] active:scale-90 transition-all font-black text-3xl flex items-center justify-center"
                                >
                                    {val}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    setIsChoosingDice(false);
                                    playSound('button');
                                }}
                                className="absolute -top-4 -right-4 bg-white text-slate-400 p-2 rounded-full shadow-md hover:text-red-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : activeBuffs['capSteps'] ? (
                        <div className="flex gap-4">
                            {[...Array(activeBuffs['capSteps'])].map((_, i) => (
                                <button
                                    key={i}
                                    disabled={isPaused}
                                    onClick={() => {
                                        const steps = i + 1;
                                        setLastRoll(steps);
                                        playSound('dice');

                                        setActiveBuffs(prev => {
                                            const next = { ...prev };
                                            delete next['capSteps'];
                                            return next;
                                        });

                                        moveSteps(steps);
                                    }}
                                    className="bg-slate-900 text-white w-20 h-20 rounded-2xl shadow-xl hover:bg-[#BC3E34] active:scale-90 transition-all font-black text-3xl disabled:opacity-30"
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                if (isRolling || isMoving || isPaused) return;
                                setIsRolling(true);
                                playSound('dice');
                                const limit = 3 + (activeBuffs['rollLimitBonus'] || 0);
                                const rolled = Math.floor(Math.random() * limit) + 1;
                                setLastRoll(rolled);

                                if (activeBuffs['canRollAgain']) {
                                    setActiveBuffs(prev => {
                                        const next = { ...prev };
                                        delete next['canRollAgain'];
                                        return next;
                                    });
                                }

                                if (activeBuffs['rollLimitBonus'] || activeBuffs['stepBonus']) {
                                    setActiveBuffs(prev => {
                                        const next = { ...prev };
                                        delete next['rollLimitBonus'];
                                        delete next['stepBonus'];
                                        return next;
                                    });
                                }

                                setTimeout(() => { setIsRolling(false); moveSteps(rolled); }, 800);
                            }}
                            id="hud-dice"
                            disabled={isRolling || isMoving || isPaused || isChoosingTransfer}
                            className="bg-slate-900 text-white p-12 rounded-[2.5rem] shadow-2xl hover:bg-[#BC3E34] active:scale-90 transition-all disabled:opacity-50 relative"
                        >
                            {isRolling ? <Dice1 className="animate-spin" size={60} /> : <Dice5 size={60} />}
                        </button>
                    )}
                </div>
            )}

            {/* 事件奇遇弹窗 */}
            <AnimatePresence>
                {eventPopup && (
                    <div className="fixed inset-0 z-[650] bg-black/50 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] text-center max-w-2xl w-full border-t-[12px] sm:border-t-[20px] border-[#BC3E34] shadow-3xl flex flex-col items-center max-h-[90vh] overflow-y-auto scrollbar-none"
                        >
                            <h2 className="text-2xl sm:text-4xl font-black mb-4 italic text-slate-800 leading-tight">{eventPopup.title}</h2>
                            <p className="text-base sm:text-lg text-[#BC3E34] font-black mb-6 sm:mb-8 tracking-widest uppercase">{eventPopup.station}</p>
                            <p className="text-lg sm:text-xl font-bold text-slate-600 leading-relaxed mb-6 sm:mb-8">{eventPopup.description}</p>

                            <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8">
                                {eventPopup.reward !== 0 && (
                                    <div className={`text-3xl sm:text-4xl font-black ${eventPopup.reward > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {eventPopup.reward > 0 ? `+${eventPopup.reward}` : eventPopup.reward} G
                                    </div>
                                )}
                                {eventPopup.special && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{
                                            scale: [0.9, 1.1, 1],
                                            opacity: 1,
                                            rotate: [0, -2, 2, 0]
                                        }}
                                        transition={{ duration: 0.4 }}
                                        className="bg-[#BC3E34] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl font-black shadow-xl shadow-red-200 flex flex-col items-center gap-1"
                                    >
                                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                                            <Zap size={20} className="fill-yellow-400 text-yellow-400" />
                                            <span className="opacity-80 uppercase tracking-tighter">获得特殊状态</span>
                                        </div>
                                        <span className="text-lg sm:text-xl">{eventPopup.special}</span>
                                    </motion.div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    const { isTransfer, station, moveExtra } = eventPopup;
                                    setEventPopup(null);
                                    playSound('button');

                                    if (moveExtra) {
                                        setTimeout(() => moveSteps(moveExtra), 600);
                                    } else if (isTransfer) {
                                        // 立即标记为正在选择换乘，防止骰子 UI 出现或可点
                                        setIsChoosingTransfer(true);
                                        // 换乘站逻辑：事件关闭后，再弹出换乘窗口
                                        setTimeout(() => {
                                            setTransferPopup({ remainingSteps: 0, stationName: station });
                                        }, 400); // 缩短延迟，让节奏更紧凑
                                    }
                                }}
                                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-[#BC3E34] transition-all"
                            >
                                收下手账
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 判定开始 */}
            <AnimatePresence>
                {stage === 'JUDGE' && (
                    <div className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[4rem] border-t-[24px] border-[#BC3E34] max-w-md text-center shadow-3xl">
                            <Trophy size={80} className="text-[#BC3E34] mx-auto mb-6" />
                            <h2 className="text-3xl font-black mb-4">登顶判定</h2>
                            <p className="text-lg text-slate-600 font-bold mb-8">登顶广州塔需要 398G 金币买门票，你目前拥有 <span className="text-[#BC3E34] font-black">{money} G</span>。</p>
                            <button onClick={() => {
                                startJudgment();
                                playSound('button');
                            }} className="w-full py-6 bg-[#BC3E34] text-white rounded-3xl font-black text-2xl shadow-xl active:scale-95">提交车卡判定</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 广州塔停留选择 */}
            <AnimatePresence>
                {showTowerChoice && (
                    <div className="fixed inset-0 z-[680] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-12 rounded-[4rem] border-t-[24px] border-[#BC3E34] max-w-md text-center shadow-3xl">
                            <div className="w-20 h-20 bg-red-50 text-[#BC3E34] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy size={40} />
                            </div>
                            <h2 className="text-3xl font-black mb-4 italic">广州塔到了！</h2>
                            <p className="text-lg text-slate-600 font-bold mb-8 leading-relaxed">
                                英雄，你已抵达最终的巅峰。<br />
                                是深藏功与名立即结算，<br />
                                还是继续在羊城脉络中探索？
                            </p>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        setShowTowerChoice(false);
                                        playSound('button');
                                        setTimeout(() => setStage('JUDGE'), 400);
                                    }}
                                    className="w-full py-5 bg-[#BC3E34] text-white rounded-3xl font-black text-xl shadow-xl active:scale-95"
                                >
                                    立即结算
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTowerChoice(false);
                                        playSound('button');
                                        // 触发广州塔事件
                                        triggerEvent("广州塔", false);
                                    }}
                                    className="w-full py-5 bg-slate-100 text-slate-700 rounded-3xl font-black text-xl hover:bg-slate-200 active:scale-95 transition-all"
                                >
                                    继续探索
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 判定结算页面 */}
            <AnimatePresence>
                {stage === 'SETTLEMENT' && (
                    <div className="fixed inset-0 z-[860] bg-[#FDFCF8] flex items-center justify-center p-4 lg:p-8 overflow-hidden pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full h-full max-w-[177.78vh] aspect-video bg-[#FDFCF8] overflow-hidden shadow-2xl"
                        >
                            <img
                                src={isWin ? victoryBg : failBg}
                                className="w-full h-full object-contain"
                                alt="Settlement Screen"
                                referrerPolicy="no-referrer"
                            />

                            {/* 统一操作按钮 - 位于下方中间 */}
                            {isWin ? (
                                <button
                                    onClick={() => {
                                        fullExit();
                                        playSound('button');
                                    }}
                                    className="absolute left-[35%] bottom-[8%] w-[30%] h-[15%] opacity-0 hover:bg-white/10 transition-all cursor-pointer rounded-[3vw] z-[100] pointer-events-auto"
                                    title="返回主页"
                                />
                            ) : (
                                <button
                                    onClick={() => {
                                        resetGame();
                                        playSound('button');
                                    }}
                                    className="absolute left-[35%] bottom-[8%] w-[30%] h-[15%] opacity-0 hover:bg-white/10 transition-all cursor-pointer rounded-[3vw] z-[100] pointer-events-auto"
                                    title="重新出发"
                                />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 退出确认 */}
            <AnimatePresence>
                {showEndConfirm && (
                    <div className="fixed inset-0 z-[900] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-[3rem] max-w-sm text-center shadow-3xl">
                            <h3 className="text-2xl font-black text-slate-800 mb-4">确定要中途出站吗？</h3>
                            <p className="text-sm text-slate-500 font-bold mb-8">退出后你当前的资产余额和路线进度将会丢失。</p>
                            <div className="flex gap-4">
                                <button onClick={() => {
                                    setShowEndConfirm(false);
                                    playSound('button');
                                }} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all">继续探索</button>
                                <button onClick={() => {
                                    fullExit();
                                    playSound('button');
                                }} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg shadow-red-200">确认退卡</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 设置菜单 */}
            <AnimatePresence>
                {showSettings && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
                    >
                        {/* 背景遮罩 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        />

                        {/* 设置面板 */}
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="relative bg-[#FDFCF8] w-[24rem] max-h-[85vh] rounded-[3.5rem] shadow-3xl border border-slate-100 overflow-hidden pointer-events-auto flex flex-col"
                        >
                            <div className="bg-[#BC3E34] p-8 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black italic">系统设置</h2>
                                    <p className="text-[10px] font-bold opacity-70 tracking-widest uppercase mt-1">Canton Pulse · Settings</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowSettings(false);
                                        playSound('button');
                                    }}
                                    className="p-3 bg-black/10 rounded-2xl hover:bg-black/20 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto scrollbar-none">
                                {/* 音效设置 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-[#BC3E34] font-black text-xs uppercase tracking-wider">
                                        <Volume2 size={16} />
                                        <span>音频与音效</span>
                                    </div>

                                    <div className="space-y-4 bg-white/60 p-5 rounded-3xl border border-red-50">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-700">主音效</span>
                                            <button
                                                onClick={() => setSettings((s: any) => ({ ...s, soundEnabled: !s.soundEnabled }))}
                                                className={`w-12 h-6 rounded-full transition-all relative ${settings.soundEnabled ? 'bg-[#BC3E34]' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-700">背景音乐 (BGM)</span>
                                            <button
                                                onClick={() => setSettings((s: any) => ({ ...s, bgmEnabled: !s.bgmEnabled }))}
                                                className={`w-12 h-6 rounded-full transition-all relative ${settings.bgmEnabled ? 'bg-[#BC3E34]' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.bgmEnabled ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                <span>音量调节</span>
                                                <span className="text-[#BC3E34]">{Math.round(settings.soundVolume * 100)}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="1" step="0.05"
                                                value={settings.soundVolume}
                                                onChange={(e) => setSettings((s: any) => ({ ...s, soundVolume: parseFloat(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#BC3E34]"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* 游戏速度 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-[#BC3E34] font-black text-xs uppercase tracking-wider">
                                        <Zap size={16} />
                                        <span>运行速度控制</span>
                                    </div>

                                    <div className="space-y-6 bg-white/60 p-5 rounded-3xl border border-red-50">
                                        <div className="space-y-3">
                                            <span className="text-xs font-bold text-slate-500 block">地铁行进速度</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['slow', 'standard', 'fast'].map(speed => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => setSettings((s: any) => ({ ...s, animationSpeed: speed }))}
                                                        className={`py-2 rounded-xl text-[10px] font-black transition-all ${settings.animationSpeed === speed ? 'bg-[#BC3E34] text-white shadow-md' : 'bg-white text-slate-400 hover:bg-red-50'}`}
                                                    >
                                                        {speed === 'slow' ? '悠闲' : speed === 'standard' ? '标准' : '极速'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <span className="text-xs font-bold text-slate-500 block">镜头切换感应</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['slow', 'standard', 'fast'].map(speed => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => setSettings((s: any) => ({ ...s, cameraSpeed: speed }))}
                                                        className={`py-2 rounded-xl text-[10px] font-black transition-all ${settings.cameraSpeed === speed ? 'bg-[#BC3E34] text-white shadow-md' : 'bg-white text-slate-400 hover:bg-red-50'}`}
                                                    >
                                                        {speed === 'slow' ? '柔和' : speed === 'standard' ? '标准' : '敏锐'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* 地图设置 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-[#BC3E34] font-black text-xs uppercase tracking-wider">
                                        <MapIcon size={16} />
                                        <span>地图偏好</span>
                                    </div>

                                    <div className="bg-white/60 p-5 rounded-3xl border border-red-50 space-y-2">
                                        <div className="flex justify-between text-[10px] font-black text-slate-400">
                                            <span>全局映射缩放</span>
                                            <span className="text-[#BC3E34]">{settings.mapPreviewScale.toFixed(2)}x</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="1.3" step="0.01"
                                            value={settings.mapPreviewScale}
                                            onChange={(e) => setSettings((s: any) => ({ ...s, mapPreviewScale: parseFloat(e.target.value) }))}
                                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#BC3E34]"
                                        />
                                    </div>
                                </section>

                                <button
                                    onClick={fullExit}
                                    className="w-full py-4 mt-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs hover:bg-red-50 hover:text-[#BC3E34] transition-all flex items-center justify-center gap-2"
                                >
                                    <LogOut size={14} /> 返回主菜单并结算
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

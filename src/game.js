// 게임 요소들
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const playAgainButton = document.getElementById('playAgainButton');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');

// 게임 변수들
let player;
let obstacles = [];
let missiles = []; // 미사일 배열 추가
let score = 0;
let gameRunning = false;
let animationId;
let obstacleSpeed = 3;
let obstacleFrequency = 100; // 숫자가 작을수록 장애물이 더 자주 생성됩니다.
let frameCount = 0;
let missileCount = 3; // 사용 가능한 미사일 수 (선택 사항)

// 플레이어 객체 수정
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.color = '#3498db';
        this.leftPressed = false;
        this.rightPressed = false;
        
        // SVG 요소 참조
        this.svgElement = document.getElementById('playerSvg');
        if (this.svgElement) {
            this.svgElement.style.display = 'block';
        }
    }
    
    draw() {
        if (this.svgElement) {
            // SVG 요소 위치 업데이트
            this.svgElement.style.left = `${this.x}px`;
            this.svgElement.style.top = `${this.y}px`;
        } else {
            // SVG가 없으면 기본 사각형으로 대체
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    update() {
        if (this.leftPressed && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.rightPressed && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }
}

// 미사일 객체 추가
class Missile {
    constructor(x) {
        this.width = 10;
        this.height = 20;
        this.x = x;
        this.y = canvas.height - 70; // 플레이어 위에서 시작
        this.speed = 7; // 미사일 속도
        this.color = '#e74c3c'; // 빨간색 미사일
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update() {
        this.y -= this.speed; // 위로 움직입니다
    }
}

// 장애물 객체
class Obstacle {
    constructor() {
        this.width = Math.random() * 80 + 20; // 20에서 100 사이의 너비
        this.height = 20;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.color = '#e74c3c';
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update() {
        this.y += obstacleSpeed;
    }
}

// 게임 초기화
function init() {
    player = new Player();
    obstacles = [];
    missiles = []; // 미사일 배열 초기화
    score = 0;
    obstacleSpeed = 3;
    frameCount = 0;
    missileCount = 3; // 미사일 수 초기화 (선택 사항)
    scoreDisplay.textContent = `점수: ${score}`;
    gameOverScreen.style.display = 'none';
    
    // 키보드 이벤트 설정
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
}

// 키보드 핸들러
function keyDownHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.leftPressed = true;
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.rightPressed = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        // 스페이스바를 누르면 미사일 발사
        if (gameRunning) {
            fireMissile();
        }
    }
}

function keyUpHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.leftPressed = false;
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.rightPressed = false;
    }
}

// 미사일 발사 함수
function fireMissile() {
    // 미사일 수 제한을 원한다면 아래 주석을 해제하세요
    /*
    if (missileCount <= 0) return;
    missileCount--;
    */
    
    // 플레이어 중앙에서 미사일 발사
    const missileX = player.x + player.width / 2 - 5; // 미사일 중앙 정렬 (미사일 너비의 절반)
    missiles.push(new Missile(missileX));
}

// 충돌 감지
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    player.update();
    player.draw();
    
    // 장애물 생성
    frameCount++;
    if (frameCount % obstacleFrequency === 0) {
        obstacles.push(new Obstacle());
    }
    
    // 난이도 증가
    if (frameCount % 1000 === 0) {
        obstacleSpeed += 0.5;
        obstacleFrequency = Math.max(obstacleFrequency - 5, 30);
    }
    
    // 미사일 업데이트 및 그리기
    for (let i = 0; i < missiles.length; i++) {
        missiles[i].update();
        missiles[i].draw();
        
        // 미사일이 화면 위로 나가면 제거
        if (missiles[i].y + missiles[i].height < 0) {
            missiles.splice(i, 1);
            i--;
            continue;
        }
        
        // 미사일과 장애물 충돌 검사
        for (let j = 0; j < obstacles.length; j++) {
            if (checkCollision(missiles[i], obstacles[j])) {
                // 충돌 시 미사일과 장애물 모두 제거
                missiles.splice(i, 1);
                obstacles.splice(j, 1);
                // 점수 증가
                score++;
                scoreDisplay.textContent = `점수: ${score}`;
                i--;
                break;
            }
        }
    }
    
    // 장애물 업데이트 및 그리기
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        obstacles[i].draw();
        
        // 충돌 검사 (플레이어와 장애물)
        if (checkCollision(player, obstacles[i])) {
            gameOver();
            return;
        }
        
        // 장애물이 화면 밖으로 나가면 제거
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
        }
    }
    
    // 미사일 수 표시 (선택 사항)
    /*
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`미사일: ${missileCount}`, 10, 30);
    */
    
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 게임 시작 시 SVG 표시
function startGame() {
    init();
    gameRunning = true;
    startButton.style.display = 'none';
    restartButton.style.display = 'inline-block';
    
    // SVG 요소 표시
    const playerSvg = document.getElementById('playerSvg');
    if (playerSvg) {
        playerSvg.style.display = 'block';
    }
    
    gameLoop();
}
// 게임 오버 시 SVG 숨기기
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
    
    // SVG 요소 숨기기
    const playerSvg = document.getElementById('playerSvg');
    if (playerSvg) {
        playerSvg.style.display = 'none';
    }
}

// DOM이 로드된 후 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
    // 이벤트 리스너
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
    
    console.log('게임 스크립트가 로드되었습니다!');
});

// 페이지가 이미 로드되었다면 이벤트 리스너 즉시 추가
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
}
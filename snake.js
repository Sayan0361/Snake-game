let Snake = (function () {

    const INITIAL_TAIL = 4;
    let fixedTail = true;
  
    let intervalID;
  
    let tileCount = 10;
    let gridSize = 400 / tileCount;
  
    const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };
  
    let velocity = { x: 0, y: 0 };
    let player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };
  
    let walls = false;
  
    let fruit = { x: 1, y: 1 };
  
    let trail = [];
    let tail = INITIAL_TAIL;
  
    let reward = 0;
    let points = 0;
    let pointsMax = 0;
  
    const ActionEnum = { 'none': 0, 'up': 1, 'down': 2, 'left': 3, 'right': 4 };
    Object.freeze(ActionEnum);
    let lastAction = ActionEnum.none;
  
    function setup() {
      const canvas = document.getElementById('game-canvas');
      const ctx = canvas.getContext('2d');
  
      game.reset();
  
      function keyPush(evt) {
        switch (evt.keyCode) {
          case 37: // left
            game.action.left();
            evt.preventDefault();
            break;
          case 38: // up
            game.action.up();
            evt.preventDefault();
            break;
          case 39: // right
            game.action.right();
            evt.preventDefault();
            break;
          case 40: // down
            game.action.down();
            evt.preventDefault();
            break;
          case 32: // space
            Snake.pause();
            evt.preventDefault();
            break;
          case 27: // esc
            game.reset();
            evt.preventDefault();
            break;
        }
      }
  
      document.addEventListener('keydown', keyPush);
    }
  
    const game = {
  
      reset() {
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
  
        ctx.fillStyle = 'grey';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        tail = INITIAL_TAIL;
        points = 0;
        velocity.x = 0;
        velocity.y = 0;
        player.x = INITIAL_PLAYER.x;
        player.y = INITIAL_PLAYER.y;
        reward = -1;
  
        lastAction = ActionEnum.none;
  
        trail = [];
        trail.push({ x: player.x, y: player.y });
  
        document.getElementById('score').innerText = points;
        document.getElementById('high-score').innerText = pointsMax;
      },
  
      action: {
        up() {
          if (lastAction !== ActionEnum.down) {
            velocity.x = 0;
            velocity.y = -1;
          }
        },
        down() {
          if (lastAction !== ActionEnum.up) {
            velocity.x = 0;
            velocity.y = 1;
          }
        },
        left() {
          if (lastAction !== ActionEnum.right) {
            velocity.x = -1;
            velocity.y = 0;
          }
        },
        right() {
          if (lastAction !== ActionEnum.left) {
            velocity.x = 1;
            velocity.y = 0;
          }
        }
      },
  
      RandomFruit() {
        if (walls) {
          fruit.x = 1 + Math.floor(Math.random() * (tileCount - 2));
          fruit.y = 1 + Math.floor(Math.random() * (tileCount - 2));
        } else {
          fruit.x = Math.floor(Math.random() * tileCount);
          fruit.y = Math.floor(Math.random() * tileCount);
        }
      },
  
      loop() {
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
  
        reward = -0.1;
  
        function DontHitWall() {
          if (player.x < 0) player.x = tileCount - 1;
          if (player.x >= tileCount) player.x = 0;
          if (player.y < 0) player.y = tileCount - 1;
          if (player.y >= tileCount) player.y = 0;
        }
  
        function HitWall() {
          if (player.x < 1 || player.x > tileCount - 2 || player.y < 1 || player.y > tileCount - 2) {
            game.reset();
          }
  
          ctx.fillStyle = 'grey';
          ctx.fillRect(0, 0, gridSize - 1, canvas.height);
          ctx.fillRect(0, 0, canvas.width, gridSize - 1);
          ctx.fillRect(canvas.width - gridSize + 1, 0, gridSize, canvas.height);
          ctx.fillRect(0, canvas.height - gridSize + 1, canvas.width, gridSize);
        }
  
        const stopped = velocity.x === 0 && velocity.y === 0;
  
        player.x += velocity.x;
        player.y += velocity.y;
  
        if (velocity.x === 0 && velocity.y === -1) lastAction = ActionEnum.up;
        if (velocity.x === 0 && velocity.y === 1) lastAction = ActionEnum.down;
        if (velocity.x === -1 && velocity.y === 0) lastAction = ActionEnum.left;
        if (velocity.x === 1 && velocity.y === 0) lastAction = ActionEnum.right;
  
        ctx.fillStyle = 'rgba(40,40,40,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        if (walls) HitWall();
        else DontHitWall();
  
        if (!stopped) {
          trail.push({ x: player.x, y: player.y });
          while (trail.length > tail) {
            trail.shift();
          }
        } else {
          ctx.fillStyle = 'rgba(200,200,200,0.2)';
          ctx.font = "small-caps 14px Helvetica";
          ctx.fillText("(esc) reset", 24, 356);
          ctx.fillText("(space) pause", 24, 374);
        }
  
        ctx.fillStyle = 'green';
        for (let i = 0; i < trail.length - 1; i++) {
          ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
          if (!stopped && trail[i].x === player.x && trail[i].y === player.y) {
            game.reset();
          }
        }
  
        ctx.fillStyle = 'red';
        ctx.fillRect(fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 2);
  
        if (player.x === fruit.x && player.y === fruit.y) {
          tail++;
          points++;
          if (points > pointsMax) pointsMax = points;
          reward = 1;
          game.RandomFruit();
        }
  
        document.getElementById('score').innerText = points;
        document.getElementById('high-score').innerText = pointsMax;
      }
    };
  
    return {
      setup,
      pause() {
        if (intervalID) {
          clearInterval(intervalID);
          intervalID = null;
        } else {
          intervalID = setInterval(game.loop, 100);
        }
      },
      action: game.action
    };
  
  })();
  
  window.onload = function () {
    Snake.setup();
    Snake.pause();
  };
  
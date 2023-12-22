import io from "socket.io-client";

const socket = io("http://localhost:3000");

const canvas = document.getElementById("aimingCanvas");
const ctx = canvas.getContext("2d");
let aimingLineLength = Math.max(canvas.width, canvas.height);
let isMouseMoveListenerAdded = false;
let mouseX,
  mouseY = 0;

function handleResize() {
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  canvas.width = logicalWidth * window.devicePixelRatio;
  canvas.height = logicalHeight * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  animate();
}

document.addEventListener("resize", handleResize);
let playersArray = [];

socket.on("connect", () => {
  console.log("client connected: ", socket.id);

  const player = {
    x: Math.floor(Math.random() * canvas.width),
    y: Math.floor(Math.random() * canvas.height),
    bullets: [],
    mouseX: 500,
    mouseY: 500,
  };
  socket.emit("playerConnected", player);
});

socket.on("updatedPlayer", (updatedPlayer) => {
  const index = playersArray.findIndex(
    (player) => player.id === updatedPlayer.id
  );
  playersArray[index].x = updatedPlayer.x;
  playersArray[index].y = updatedPlayer.y;
  playersArray[index].bullets = updatedPlayer.bullets;
  playersArray[index].mouseX = updatedPlayer.mouseX;
  playersArray[index].mouseY = updatedPlayer.mouseY;
});

socket.on('shotPlayer', (shotPlayer) => {
  shotPlayer.id === socket.id ? alert("you are shot") : {};
  const shotPlayerIndex = playersArray.findIndex(player => player.id === shotPlayer.id);
  playersArray.splice(shotPlayerIndex, 1);
})

socket.on("playerConnected", (newPlayers) => {
  playersArray.length = 0;
  newPlayers.forEach((player) => {
    playersArray.push(player);
  });
});

socket.on("playerDisconnected", (playerId) => {
  // Handle a player disconnection
  const index = playersArray.findIndex((player) => player.id === playerId);
  if (index !== -1) {
    playersArray.splice(index, 1);
  }
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  playersArray.forEach((player) => {
    drawPlayer(player.x, player.y);
    if(player.id === socket.id){
      drawAimingLine(player.mouseX, player.mouseY, player.x, player.y);
      handleBulletCollision(player);
    }
    drawBullets(player.bullets);
  });

  requestAnimationFrame(animate);
}

// Function to draw a player
function drawPlayer(x, y) {
  ctx.fillStyle = "white"; // Choose a color for the player
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
}

function drawBullets(bulletsArray) {
  bulletsArray.forEach((bullet, index) => {
    const newBullet_X = bullet.x + 5 * Math.cos(bullet.angle);
    const newBullet_Y = bullet.y + 5 * Math.sin(bullet.angle);

    ctx.beginPath();
    ctx.arc(newBullet_X, newBullet_Y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    bullet.x = newBullet_X;
    bullet.y = newBullet_Y;
  });
}

function handleBulletCollision(player){
  player.bullets.forEach(bullet => {
    playersArray.forEach((player, index) => {
      const distance = Math.sqrt((bullet.x - player.x) ** 2 + (bullet.y - player.y) **2)
      if(distance < 15){
       playersArray.splice(index, 1);
       socket.emit('removePlayer', player);
       return;
      } 
    })
  })
}


window.addEventListener("keydown", (event) => {
  console.log("inside keydown event");
  const currentPlayer = playersArray.find((player) => player.id === socket.id);
  if (currentPlayer) {
    switch (event.key) {
      case "ArrowUp":
        currentPlayer.y -= 5;
        break;

      case "ArrowDown":
        currentPlayer.y += 5;
        break;

      case "ArrowLeft":
        currentPlayer.x -= 5;
        break;

      case "ArrowRight":
        currentPlayer.x += 5;
        break;

      default:
    }

    socket.emit("updatePlayer", currentPlayer);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  handleResize();
  animate();
});

function drawAimingLine(mouseX, mouseY, playerX, playerY) {
  const angle = Math.atan2(mouseY - playerY, mouseX - playerX);

  const startX = playerX + 10 * Math.cos(angle);
  const startY = playerY + 10 * Math.sin(angle);

  const endX = playerX + aimingLineLength * Math.cos(angle);
  const endY = playerY + aimingLineLength * Math.sin(angle);

  const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
  gradient.addColorStop(0, "rgb(255,255,255,0.5)");
  gradient.addColorStop(1, "rgb(255,255,255,0)");

  ctx.beginPath();
  ctx.setLineDash([4, 6]);
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = gradient;
  ctx.stroke();
  ctx.closePath();
}

function handleAddBullet(event) {
  const currentPlayer = playersArray.find((player) => player.id === socket.id);
  const bulletAngle = Math.atan2(
    currentPlayer.mouseY - currentPlayer.y,
    currentPlayer.mouseX - currentPlayer.x
  );
  const bulletX = currentPlayer.x + 20 * Math.cos(bulletAngle);
  const bulletY = currentPlayer.y + 20 * Math.sin(bulletAngle);
  const bullet = {
    x: bulletX,
    y: bulletY,
    angle: bulletAngle,
  };
  currentPlayer.bullets.push(bullet);
  socket.emit("updatePlayer", currentPlayer);
}

document.addEventListener("mousemove", (event) => {
  const currentPlayer = playersArray.find((player) => player.id === socket.id);
  if (currentPlayer) {
    currentPlayer.mouseX = event.clientX;
    currentPlayer.mouseY = event.clientY;

    socket.emit("updatePlayer", currentPlayer);
  }
});

document.addEventListener("click", (event) => {
  handleAddBullet(event);
});

// const aimingLineLength = canvas.width / 2;

// let planetRadius = 20;
// let mouseX = 0;
// let mouseY = 0;
// let angle = 0;
// const planetX =  Math.random() * canvas.width;;
// const planetY = Math.random() * canvas.height;
// let bulletSpeed = 10;
// let bulletRadius = 5;
// let bullets = [];
// let stars = [];
// let starSpeed = 1;
// let intervalId;

// let gamePaused = false;

// function drawPlanet() {

//   // Create a radial gradient for the black hole effect
//   const gradient = ctx.createRadialGradient(
//     planetX,
//     planetY,
//     planetRadius,
//     planetX,
//     planetY,
//     planetRadius + 35
//   );

//   const start = 0.2 + Math.random() * 0.7;

//   gradient.addColorStop(0, "black");
//   gradient.addColorStop(0.4, "rgb(0,0,0,0.7)");
//   gradient.addColorStop(start, "rgb(0,0,0,0.5)");
//   gradient.addColorStop(1, "rgb(255,255,255,1)");

//   // Draw the black hole

//   ctx.beginPath();
//   ctx.arc(planetX, planetY, planetRadius + 30, 0, 2 * Math.PI);
//   ctx.fillStyle = gradient;
//   ctx.fill();
//   ctx.closePath();
// }

// function drawAimingLine() {
//   // planetX = canvas.width / 2;
//   // planetY = canvas.height / 2;

//   angle = Math.atan2(mouseY - planetY, mouseX - planetX);

//   const startX = planetX + (planetRadius + 27) * Math.cos(angle);
//   const startY = planetY + (planetRadius + 27) * Math.sin(angle);

//   const endX = planetX + aimingLineLength * Math.cos(angle);
//   const endY = planetY + aimingLineLength * Math.sin(angle);

//   const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
//   gradient.addColorStop(0, "rgb(255,255,255,0.5)");
//   gradient.addColorStop(1, "rgb(255,255,255,0)");

//   ctx.beginPath();
//   ctx.setLineDash([4, 6]);
//   ctx.moveTo(startX, startY);
//   ctx.lineTo(endX, endY);
//   ctx.strokeStyle = gradient;
//   ctx.stroke();
//   ctx.closePath();
// }

// // function
// function handleMouseMove(event) {
//   const rect = canvas.getBoundingClientRect();
//   mouseX = event.clientX - rect.left;
//   mouseY = event.clientY - rect.top;
// }

// function fix_dpi() {
//   const devicePixelRatio = window.devicePixelRatio || 1;
//   canvas.width = window.innerWidth * devicePixelRatio;
//   canvas.height = window.innerHeight * devicePixelRatio;
//   ctx.scale(devicePixelRatio, devicePixelRatio);
// }

// function handleGenerateStars() {
//   intervalId = setInterval(function () {
//     const x = Math.random() * canvas.width;
//     const direction = Math.random() > 0.5 ? "bottom" : "top";
//     const y = direction === "top" ? 0 : canvas.height;
//     const angle =
//       direction === "top"
//         ? Math.atan2(y - planetY, x - planetX)
//         : Math.atan2(planetY - y, planetX - x);
//     const radius = 5 + Math.random() * 15;

//     const star = {
//       x,
//       y,
//       angle,
//       radius,
//       direction,
//     };

//     stars.push(star);
//   }, 1000);
// }

// function checkStarPlanet_Collision(starX, starY, starRadius) {
//   const distance = Math.sqrt((starX - planetX) ** 2 + (starY - planetY) ** 2);
//   if (distance < starRadius + planetRadius) {
//     return true;
//   }
// }

// function handleDrawStars() {
//   stars.forEach((star, index) => {
//     if (checkStarPlanet_Collision(star.x, star.y, star.radius)) {
//       stars.splice(index, 1);
//       planetRadius += star.radius;
//       starSpeed += 0.1;
//       return;
//     }

//     if (star.direction == "top") {
//       star.x = star.x - starSpeed * Math.cos(star.angle);
//       star.y = star.y - starSpeed * Math.sin(star.angle);
//     } else {
//       star.x = star.x + starSpeed * Math.cos(star.angle);
//       star.y = star.y + starSpeed * Math.sin(star.angle);
//     }

//     ctx.beginPath();
//     ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
//     ctx.fillStyle = "green";
//     ctx.fill();
//     ctx.closePath();

//     // star.x = newStarPosition_X;
//     // star.y = newStarPosition_Y;
//   });

//   stars = stars.filter((star) => {
//     return (
//       star.x >= 0 &&
//       star.x < canvas.width &&
//       star.y >= 0 &&
//       star.y < canvas.height
//     );
//   });
// }

// function checkBulletStar_Collision(bulletX, bulletY) {

//   let bulletStar_Collided = false;
//   stars.forEach((star, starIndex) => {
//     const distance = Math.sqrt(
//       (star.x - bulletX) ** 2 + (star.y - bulletY) ** 2
//     );
//     if (distance < bulletRadius + star.radius) {
//       stars.splice(starIndex, 1);
//       bulletStar_Collided = true;
//       playerScore.textContent = Math.floor(Number(playerScore.textContent) + Number(star.radius));
//       return true;
//     }
//   });

//   return bulletStar_Collided;
// }

// function handleAddBullet(e) {
//   const bulletX = planetX + (planetRadius + 30) * Math.cos(angle);
//   const bulletY = planetY + (planetRadius + 30) * Math.sin(angle);
//   const bulletAngle = angle;
//   bullets.push({
//     x: bulletX,
//     y: bulletY,
//     angle: bulletAngle,
//   });
// }

// function handleDrawBullets() {
//   bullets.forEach((bullet, index) => {
//     if (checkBulletStar_Collision(bullet.x, bullet.y)) {
//       bullets.splice(index, 1);
//     } else {
//       const newBullet_X = bullet.x + bulletSpeed * Math.cos(bullet.angle);
//       const newBullet_Y = bullet.y + bulletSpeed * Math.sin(bullet.angle);

//       const trail_X = newBullet_X + bulletSpeed * Math.cos(bullet.angle);
//       const trail_Y = newBullet_Y + bulletSpeed * Math.cos(bullet.angle);

//       ctx.beginPath();
//       ctx.arc(newBullet_X, newBullet_Y, bulletRadius, 0, 2 * Math.PI);
//       ctx.fillStyle = "red";
//       ctx.fill();
//       ctx.closePath();

//       bullet.x = newBullet_X;
//       bullet.y = newBullet_Y;
//     }
//   });

//   bullets = bullets.filter((bullet) => {
//     return (
//       bullet.x > 0 &&
//       bullet.x < canvas.width &&
//       bullet.y > 0 &&
//       bullet.y < canvas.height
//     );
//   });
// }

// function handleIsPlanetInside_Canvas(){
//   if(planetRadius > canvas.width / 2 || planetRadius > canvas.height / 2){
//     confirm("Game Over. Click OK to start again") ? resetGame() : resetGame();
//   }
// }

// function animate() {
//  if(!gamePaused){
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   fix_dpi();
//   handleDrawStars();
//   handleIsPlanetInside_Canvas();
//   drawPlanet();
//   // drawAimingLine() should be called here instead of handleMouseMove
//   drawAimingLine();
//   handleDrawBullets();

//   requestAnimationFrame(animate);
//  }
// }

// document.addEventListener("DOMContentLoaded", function () {
//   animate();
//   handleGenerateStars();
// });

// canvas.addEventListener("mousemove", handleMouseMove);
// canvas.addEventListener("click", (event) => {
//   handleAddBullet(event);
//   const fireSound = new Audio('../Assets/fire_sound.mp3');
//   fireSound.playbackRate = 2;
//   fireSound.play();
// });
// document.addEventListener('keydown', (event) => {
// if(event.code === 'Space'){
//   event.preventDefault();
//   gamePaused = !gamePaused;
//   if(!gamePaused) animate();
// }
// })
// window.addEventListener("resize", function () {
//   fix_dpi();
//   drawPlanet();
// });
// document.addEventListener('visibilitychange', () => {
//   if(document.visibilityState === 'visible') resetGame();
// })

// function resetGame() {
//   bullets = [];
//   stars = [];
//   planetRadius = 20;
//   starSpeed = 1;
//   gamePaused = false;
// }

// addEventListener("resize", handleResize);

// addEventListener("keydown", (event) => {
//     console.log("inside keydown event");
//     const currentPlayer = frontendPlayers[socket.id];
//     if (!currentPlayer) return;
//     switch (event.key) {
//       case "ArrowUp":
//         socket.emit("keydown", "ArrowUp");
//         break;
  
//       case "ArrowDown":
//         socket.emit("keydown", "ArrowDown");
//         break;
  
//       case "ArrowLeft":
//         socket.emit("keydown", "ArrowLeft");
//         break;
  
//       case "ArrowRight":
//         socket.emit("keydown", "ArrowRight");
//         break;
  
//       default:
//     }
//   });

// addEventListener("click", (event) => {
//   const playerPosition = {
//     x: frontendPlayers[socket.io].x,
//     y: frontendPlayers[socket.io].y,
//   };

//   const angle = Math.atan2(
//     event.clientY - playerPosition.y,
//     event.clientX - playerPosition.x
//   );

//   socket.emit('fire', {
//     x: playerPosition.x,
//     y: playerPosition.y,
//     bulletAngle: angle,
//   })
// });

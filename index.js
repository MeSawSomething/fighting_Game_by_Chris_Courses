const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
	position : {
		x: 0,
		y: 0
	},
	imageSrc: './img/background.gif'
})

const shop = new Sprite({
	position : {
		x: 600,
		y: 180
	},
	imageSrc : './img/shop_anim.png',
	scale : 2.7,
	framesMax : 6
})

//Create player & Enemy
	const player = new Fighter({
		position: {
			x: 0,
			y: 0
	},
		velocity: {
			x: 0,
			y: 10
		},
		offset : {
			x: 0,
			y: 0
		},
		imageSrc : './img/samurai/Idle.png',
		framesMax : 8,
		scale: 2.5,
		offset: {
			x: 215,
			y: 150
		},
		sprites: {
			idle: {
				imageSrc : './img/samurai/Idle.png',
				framesMax: 8
			},
			run: {
				imageSrc : './img/samurai/Run.png',
				framesMax: 8
			},
			jump: {
				imageSrc : './img/samurai/Jump.png',
				framesMax: 2
			},
			fall: {
				imageSrc : './img/samurai/Fall.png',
				framesMax: 2
			},
			attack1: {
				imageSrc : './img/samurai/Attack1.png',
				framesMax: 6
			},
			takeHit: {
				imageSrc : './img/samurai/Take Hit - white silhouette.png',
				framesMax: 4
			},
			death: {
				imageSrc : './img/samurai/Death.png',
				framesMax: 6
			}
		},
		attackBox: {
			offset: {
				x: 100,
				y: 50
			},
			width : 160,
			height: 50
		}
	})

	const enemy = new Fighter({
		position: {
			x: 400,
			y: 100
	},
		velocity: {
			x: 0,
			y: 0
		},
		color : 'blue',
		offset : {
			x: -50,
			y: 0
		},
		imageSrc : './img/kenji/Idle.png',
		framesMax : 4,
		scale: 2.5,
		offset: {
			x: 215,
			y: 165
		},
		sprites: {
			idle: {
				imageSrc : './img/kenji/Idle.png',
				framesMax: 4
			},
			run: {
				imageSrc : './img/kenji/Run.png',
				framesMax: 8
			},
			jump: {
				imageSrc : './img/kenji/Jump.png',
				framesMax: 2
			},
			fall: {
				imageSrc : './img/kenji/Fall.png',
				framesMax: 2
			},
			attack1: {
				imageSrc : './img/kenji/Attack1.png',
				framesMax: 4
			},
			takeHit: {
				imageSrc : './img/kenji/Take hit.png',
				framesMax: 3
			},
			death: {
				imageSrc : './img/kenji/Death.png',
				framesMax: 7
			}
		},
		attackBox: {
			offset: {
				x: -170,
				y: 50
			},
			width : 160,
			height: 50
		}
	})



//아래가 keys가 없으면 d 누른상태로 a 누르고, 다시 a를 떼면 d가 눌린 상태여도 동작X
//player=객체? 아무튼 여기다 바로 velocity를 주면
//d->a&d->d 키 눌렀을때 동작하지 않음. 
	const keys = {
		a: {
			pressed : false
		},
		d: {
			pressed : false
		},
		ArrowLeft : {
			pressed : false
		},
		ArrowRight : {
			pressed : false
		}
	}


decreaseTimer()

//오브젝트 아래로 내리기. put object to the bottom. Gravity!
function animate() {
	window.requestAnimationFrame(animate)
	c.fillStyle = 'black'
	c.fillRect(0, 0, canvas.width, canvas.height)
	background.update()
	shop.update()
	c.fillStyle = 'rgba(255, 255, 255, 0.15)' //화면 뿌옇게 만들어 캐릭터들 잘보이게 하기
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.update()
	enemy.update()

	player.velocity.x = 0 //기본값 초기화
	enemy.velocity.x = 0

//player movement
	if(keys.a.pressed && player.lastKey === 'a') {
		player.velocity.x = -5
		player.switchSprite('run')
	}
	else if (keys.d.pressed && player.lastKey === 'd') {
		player.velocity.x = 5
		player.switchSprite('run')
	}
	else{
		player.switchSprite('idle')
	}

//jumping
if (player.velocity.y < 0) {
	player.switchSprite('jump')
}
else if(player.velocity.y > 0) {
	player.switchSprite('fall')
}

// Enemy movement
	if(keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
		enemy.velocity.x = -5
		enemy.switchSprite('run')
	}
	else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
		enemy.velocity.x = 5
		enemy.switchSprite('run')
	}
	else{
		enemy.switchSprite('idle')
	}

//jumping
if (enemy.velocity.y < 0) {
	enemy.switchSprite('jump')
}
else if(enemy.velocity.y > 0) {
	enemy.switchSprite('fall')
}

	// detect for collision 플레이어가 공격범위를 벗어나서 에너미를 지나 오른쪽으로 갔을때.
	// 공중에서도 어택포인트 올라가지않게 조치
	if (
		rectagularCollision({
			rectangle1 : player,
			rectangle2 : enemy
		})
		&&
		player.isAttacking 
		&& player.framesCurrent === 4 // 써는 프레임에서 상대 게이지가 깎이도록
		) {
		enemy.takeHit()
		player.isAttacking = false // 한번 스페이스 프레스로 여러번 공격되지 않게.
		gsap.to('#enemyHealth', {
			width: enemy.health + '%'
		})
	}

	//if player misses 박스 외부에서 공격이 행해졌을 떄 무효화
	if(player.isAttacking && player.framesCurrent === 4) {
		player.isAttacking = false
	}

	if (
		rectagularCollision({
			rectangle1 : enemy,
			rectangle2 : player
		})
		&&
		enemy.isAttacking &&
		enemy.framesCurrent === 2
		) {
		enemy.isAttacking = false // 한번 스페이스 프레스로 여러번 공격되지 않게.
		player.takeHit()
		gsap.to('#playerHealth', {
			width: player.health + '%'
		})
	}
	
if(enemy.isAttacking && enemy.framesCurrent === 2) {
	enemy.isAttacking = false
}

	if(enemy.health <= 0 || player.health <= 0 ){
		determinWinner({ player, enemy })
	}
}


animate()

//Move object with keyboard
window.addEventListener('keydown', (event) => {
	if(!player.dead){
	switch (event.key) {
		case 'd':
			keys.d.pressed = true 
			player.lastKey = 'd'
			break
		case 'a':
			keys.a.pressed = true //라고 써야 2 key down 에서 1key 만 남았을때 동작한다.
			//player.velocity.x = -1
			player.lastKey = 'a'
			break
		case 'w':
			player.velocity.y = -20
			break
		case ' ':
			player.attack()
			break
	}
	if(!enemy.dead){
		switch (event.key){
			case 'ArrowRight':
				keys.ArrowRight.pressed = true 
				enemy.lastKey = 'ArrowRight'
				break
			case 'ArrowLeft':
				keys.ArrowLeft.pressed = true 
				enemy.lastKey = 'ArrowLeft'
				break
			case 'ArrowUp':
				enemy.velocity.y = -20
				break
			case 'ArrowDown':
				enemy.attack()
				break
		}
	}
	}
})

window.addEventListener('keyup', (event) => {
	switch (event.key) {
		case 'd':
			keys.d.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			//player.velocity.x = 0
			break
		case 'w':
			break
	}

	//enemy keys
	switch (event.key) {
		case 'ArrowRight':
			keys.ArrowRight.pressed = false
			break
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = false
			break
	
	}

})

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/background/background/background.png'
})

const shop = new Sprite({
    position: {
        x: 550,
        y: 150
    },
    imageSrc: './assets/background/decorations/shop_anim.png',
    scale: 2.75,
    framesMax: 6
})

const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 10
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/player/Sprites/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: {
        x: 180,
        y: 156
    },
    sprites: {
        idle: {
            imageSrc: './assets/player/Sprites/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './assets/player/Sprites/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './assets/player/Sprites/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './assets/player/Sprites/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './assets/player/Sprites/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './assets/player/Sprites/Take hit.png',
            framesMax: 4
        }
    },
    attackBox: {
        offset: {
            x: 145,
            y: 50
        },
        width: 145,
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
        y: 10
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './assets/enemy/Sprites/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
        x: 180,
        y: 169
    },
    sprites: {
        idle: {
            imageSrc: './assets/enemy/Sprites/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './assets/enemy/Sprites/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './assets/enemy/Sprites/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './assets/enemy/Sprites/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './assets/enemy/Sprites/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './assets/enemy/Sprites/Take hit.png',
            framesMax: 3
        }
    },
    attackBox: {
        offset: {
            x: -135,
            y: 50
        },
        width: 135,
        height: 50
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    // Player movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // Player jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')        
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')        
    }

    // Enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // Enemy jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')        
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')        
    }

    // Detect for collision && enemy gets hit
    // Player attacking
    if (rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) && player.isAttacking && player.framesCurrent === 4
    ) {
        enemy.takeHit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
        console.log('Player HIT')
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    // Enemy attacking
    if (rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) && enemy.isAttacking && enemy.framesCurrent === 2
    ) {
        player.takeHit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
        console.log('Enemy HIT')
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    // End game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy, timerId})
    }
}

animate()

window.addEventListener('keydown', () => {
    switch(event.key) {
        case 'a':
            keys.a.pressed = true
            player.lastKey = 'a'
            break
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
            break
        case 'w':
            player.velocity.y = -20
            break
        case ' ':
            player.attack()
            break

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break
        case 'ArrowUp':
            enemy.velocity.y = -20
            break
        case 'ArrowDown':
            enemy.attack()
            break
    }

    console.log(event.key)
})

window.addEventListener('keyup', () => {
    switch(event.key) {
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false 
            break

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = false 
            break    
    }
})

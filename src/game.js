const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let platforms;
let camera;

function preload() {
    // Assets will be loaded here
}

function create() {
    // Create platforms
    platforms = this.physics.add.staticGroup();
    
    // Ground
    platforms.create(512, 750, null).setScale(2).refreshBody();
    
    // Create player
    player = this.add.rectangle(100, 650, 40, 40, 0x00ff00);
    this.physics.add.existing(player);
    player.body.setBounce(0.1);
    player.body.setCollideWorldBounds(true);
    
    // Store game context on player for later use
    player.scene = this;
    
    // Collision between player and platforms
    this.physics.add.collider(player, platforms);
    
    // Input
    cursors = this.input.keyboard.createCursorKeys();
    
    // Camera follows player
    this.cameras.main.setBounds(0, 0, 2048, 768);
    this.cameras.main.startFollow(player);
}

function update() {
    if (cursors.left.isDown) {
        player.body.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(160);
    } else {
        player.body.setVelocityX(0);
    }
    
    if (cursors.space.isDown && player.body.touching.down) {
        player.body.setVelocityY(-330);
    }
}

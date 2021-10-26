const CANVAS_WIDTH = 500,
CANVAS_HEIGHT = 600,
PLAYER_WIDTH=100,
PLAYER_HEIGHT=20,
PLAYER_POSITION_FROM_BOTTOM=10,
BALL_WIDTH=20,
BALL_HEIGHT=20,
BRICK_WIDTH=70,
BRICK_HEIGHT=30,
BRICK_BORDER_WIDTH=2,
BRICK_OFFSET_Y=60,
BRICK_OFFSET_X=30,
IMAGES_DIRECTORY="./assets/images/";
MAPS=[
[[0,"blue","red","red","blue",0],["grey","green","red","red","green","grey"],["grey","green","red","red","green","grey"],[0,"blue","red","red","blue",0]],
//[[0,0,0,1,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]],
[[0,0,0,0,0,0],[0,"green",0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]],
//[[1,0,1,1,0,1],[0,1,1,1,1,0],[1,1,1,1,1,1],[1,0,1,1,0,1]]
];

class GameArea {
	constructor(width,height) {
		this.canvas = document.createElement("canvas");
		this.canvas.width=width;
		this.canvas.height=height;
		this.context = this.canvas.getContext("2d");
		this.backgroundOffsetY=0;
		this.img = new Image();
		this.img.src=IMAGES_DIRECTORY+"background.jpg";
		document.body.appendChild(this.canvas);
	}

	move(){
		this.backgroundOffsetY+=0.3;
		if (this.backgroundOffsetY>450) {
			this.backgroundOffsetY=0;
		}
	}

	clear(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.context.globalAlpha=0.5;
		this.context.drawImage(this.img,0,0-this.backgroundOffsetY,this.canvas.width,450);
		this.context.drawImage(this.img,0,450-this.backgroundOffsetY,this.canvas.width,450);
		this.context.drawImage(this.img,0,900-this.backgroundOffsetY,this.canvas.width,450);
		this.context.globalAlpha=1;
	}
}

class GameObject {
	constructor(context,x,y,width,height,color) {
		this.context=context;
		this.startPositionX=x;
		this.startPositionY=y;
		this.x=x;
		this.y=y;
		this.width=width;
		this.height=height;
		this.color=color;
		this.top=this.y;
		this.bottom=this.y+this.height;
		this.left=this.x;
		this.right=this.x+this.width;
		this.img=new Image();
	}

	recalculateHitbox(){
		this.top=this.y;
		this.bottom=this.y+this.height;
		this.left=this.x;
		this.right=this.x+this.width;
	}

	move(xOffset,yOffset){
		this.x+=xOffset;
		this.y+=yOffset;
		this.recalculateHitbox();
	}

	reset() {
		this.x=this.startPositionX;
		this.y=this.startPositionY;
		this.recalculateHitbox();
	}

	draw(){
		this.context.fillStyle=this.color;
		this.context.fillRect(this.x,this.y,this.width,this.height);
	}
}

class Player extends GameObject{
	constructor(context,x,y,width,height,color) {
		super(context,x,y,width,height,color)

		this.img.src=IMAGES_DIRECTORY+"player.png";
	}

	draw(){
		this.context.drawImage(this.img,this.x,this.y,this.width,this.height);
	}
}

class Ball extends GameObject{
	constructor(context,x,y,width,height,color) {
		super(context,x,y,width,height,color)
		this.vx=0;
		this.vy=-5;
	}

	move(xOffset=this.vx,yOffset=this.vy){
		this.x+=xOffset;
		this.y+=yOffset;
		this.recalculateHitbox();
	}

	draw(){
		var grad = this.context.createRadialGradient(this.x+BALL_WIDTH/2,this.y+BALL_HEIGHT/2,0,this.x+BALL_WIDTH/2,this.y+BALL_HEIGHT/2,this.width/2);
		grad.addColorStop(0, "yellow");
		grad.addColorStop(1, '#959500');
		this.context.beginPath();
		this.context.arc(this.x+BALL_WIDTH/2,this.y+BALL_HEIGHT/2,this.width/2,0,2*Math.PI);
		this.context.fillStyle=grad;
		this.context.fill();
	}

	followPlayer(player){
		this.x=player.x+(player.width/2)-(this.width/2);
		if (this.x<((player.width/2)-(this.width/2))){
			this.x=(player.width/2)-(this.width/2);
		} else if (this.x>(CANVAS_WIDTH-(player.width/2)-(this.width/2))) {
			this.x=(CANVAS_WIDTH-(player.width/2)-(this.width/2));
		}
		this.recalculateHitbox();
	}
}

class Brick extends GameObject{
	constructor(context,x,y,width,height,color) {
		super(context,x,y,width,height,color)
		
		this.hits=0;
		this.img.src=IMAGES_DIRECTORY+"brick_"+this.color+".png";
		if (this.color==="grey") {
			this.layerImg = new Image();
			this.layerImg.src=IMAGES_DIRECTORY+"broken_brick_layer.png";
		}
	}

	draw(){
		this.context.drawImage(this.img,this.x,this.y,this.width,this.height);
		if (this.color==="grey" && this.hits===1) {
			this.context.drawImage(this.layerImg,this.x,this.y,this.width,this.height);
		}
	}
}

class BrickShard extends GameObject {
	constructor(context,x,y,width,height,color,angle,speed) {
		super(context,x,y,width,height,color)

		this.angle=angle;
		this.vx=0;
		this.vy=speed;
	}

	move(xOffset=this.vx,yOffset=this.vy){
		this.x+=xOffset;
		this.y+=yOffset;
		this.width=this.width*0.95;
		this.height=this.height*0.95;
		this.recalculateHitbox();
	}

	draw(){
		//this.context.rotate(this.angle);
		this.context.save();
		this.context.translate(this.x,this.y);
		this.context.rotate(this.angle);
		this.context.fillStyle=this.color;
		this.context.fillRect(0,0,this.width,this.height);
		this.context.restore();
	}
}

class Text {
	constructor(context,x,y,text) {
		this.context=context;
		this.x=x;
		this.y=y;
		this.text=text;
	}

	update(text){
		this.text=text;
	}

	draw(){
		this.context.font="16px arial";
		this.context.fillStyle="white";
		this.context.textBaseline="middle";
		this.context.textAlign="left";
		this.context.fillText(this.text,this.x,this.y);
	}
}

class InfoBox extends Text {
	constructor(context,x,y,width,height,text) {
		super(context,x,y,text)

		this.width=width;
		this.height=height;
		this.show=true;
	}

	draw(){
		if (this.show) {
			this.context.fillStyle="white";
			this.context.fillRect(this.x,this.y,this.width,this.height);
			this.context.fillStyle="black";
			this.context.fillRect(this.x+2,this.y+2,this.width-4,this.height-4);
			this.context.font="24px arial";
			this.context.fillStyle="white";
			this.context.textBaseline="middle";
			this.context.textAlign="center";
			this.context.fillText(this.text,this.x+this.width/2,this.y+this.height/2);
		}
	}

	setText(text){
		this.text=text;
	}

	showBox(){
		this.show=true;
	}

	hideBox(){
		this.show=false;
	}
}

class CollisionDetector {
	constructor(){}

	checkPlayerWallCollision(player){
		if (player.left<0) {
			player.x=0;
			player.recalculateHitbox();
			return true;
		} else if (player.right>CANVAS_WIDTH) {
			player.x=CANVAS_WIDTH-player.width;
			player.recalculateHitbox();
			return true;
		}
		return false;
	}

	checkPlayerBallCollision(player,ball){
		if (player.top>ball.bottom || player.bottom<ball.top || player.left>ball.right || player.right<ball.left) {
			return false;
		} else {
			ball.vy*=-1;
			ball.vx=5*((ball.left+ball.width/2)-(player.left+player.width/2))/(player.width/2);
			return true;
		}
	}

	checkBallWallCollision(ball){
		if (ball.bottom>CANVAS_HEIGHT) {
			if (--lives>0) {
				livesText.update("Lives: "+lives);
				state="beforeStart";
			} else {
				infoBox.update("Game Over\nPress SPACE to restart");
				infoBox.showBox();
				state="stopped";
			}
			player.reset();
			ball.reset();
		} else if (ball.left<0 || ball.right>CANVAS_WIDTH) {
			ball.vx*=-1;
		} else if (ball.top<0 || ball.bottom>CANVAS_HEIGHT) {
			ball.vy*=-1;
		}
	}

	checkBallBrickCollision(ball,bricks){
		let indexOfHitBrick=bricks.findIndex(brick=>!(ball.top>brick.bottom || ball.bottom<brick.top || ball.left>brick.right || ball.right<brick.left));

		if (indexOfHitBrick>=0) {
			ball.vy*=-1;
			if (bricks[indexOfHitBrick].color!=="grey" || ++bricks[indexOfHitBrick].hits===2) {
				score+=50;
				scoreText.update("Score: "+score);
				makeBrickShards(bricks[indexOfHitBrick].left+BRICK_WIDTH/2,bricks[indexOfHitBrick].top+BRICK_HEIGHT/2,bricks[indexOfHitBrick].color);
				bricks.splice(indexOfHitBrick,1);

				if (bricks.length===0) {
					if (++level<=2) {
						player.reset();
						ball.reset();
						levelText.update("Level: "+level);
						buildMap(level);
						state="beforeStart";
					} else {
						state="stopped";
						infoBox.update("Congratulations! You've completed the game! Press SPACE to restart.");
						infoBox.showBox();
					}
				}
			}
		}
	}
}

function initGame(){
	state="stopped";
	level=1;
	score=0;
	lives=3;
	animationFrameID=undefined;
	gameArea = new GameArea(CANVAS_WIDTH,CANVAS_HEIGHT);
	collisionDetector = new CollisionDetector();
	levelText = new Text(gameArea.context,20,20,"Level: "+level);
	livesText = new Text(gameArea.context,100,20,"Lives: "+lives);
	scoreText = new Text(gameArea.context,180,20,"Score: "+score);
	player=new Player(gameArea.context,CANVAS_WIDTH/2-PLAYER_WIDTH/2,CANVAS_HEIGHT-PLAYER_POSITION_FROM_BOTTOM-PLAYER_HEIGHT,PLAYER_WIDTH,PLAYER_HEIGHT,"cyan");
	ball=new Ball(gameArea.context,CANVAS_WIDTH/2-BALL_WIDTH/2,player.y-BALL_HEIGHT-1,BALL_WIDTH,BALL_HEIGHT,"yellow");
	infoBox = new InfoBox(gameArea.context,0,CANVAS_HEIGHT/2-35,CANVAS_WIDTH,70,"Press SPACE to start.");
	previousMouseX=null;
	bricks=[];
	brickShards=[];
	buildMap(level);
	update();

	window.addEventListener("mousemove",e=>{
		if (state==="running" || state==="beforeStart") {
			if (previousMouseX) {
				player.move(e.pageX-previousMouseX,0);
				if (state==="beforeStart") {
					ball.followPlayer(player);
				}
			}

			previousMouseX=e.pageX;
		}
	})

	window.addEventListener("keydown",e=>{
		switch(e.key) {
			case " " : {
				if (state==="stopped"){
					state="beforeStart";
					startGame();
				} else if (state==="beforeStart"){
					state="running";
				}
				break;
			};
			case "Escape" : {
				if (state==="running") {
					state="paused";
					infoBox.setText("Paused. Press ESC to continue.");
					infoBox.showBox();
				} else if (state==="paused") {
					state="running";
					infoBox.hideBox();
				}
				break;
			}
		}
	})
}

function update(){
	gameArea.move();
	gameArea.clear();

	if (state!=="stopped") {
		collisionDetector.checkPlayerWallCollision(player);
		collisionDetector.checkPlayerBallCollision(player,ball);
		collisionDetector.checkBallWallCollision(ball);
		collisionDetector.checkBallBrickCollision(ball,bricks);
	}

	bricks.forEach(brick=>brick.draw());
	brickShards.forEach(shard=>{shard.move();shard.draw()});
	player.draw();

	state==="running"?ball.move():"";
	ball.draw();
	infoBox.draw();
	levelText.draw();
	scoreText.draw();
	livesText.draw();

	animationFrameID=window.requestAnimationFrame(update);
}

function buildMap(level) {
	bricks=[];
	for(let y=0;y<4;y++){
		for(let x=0;x<6;x++){
			if (MAPS[level-1][y][x]) {
				bricks.push(new Brick(gameArea.context,x*BRICK_WIDTH+BRICK_OFFSET_X,y*BRICK_HEIGHT+BRICK_OFFSET_Y,BRICK_WIDTH,BRICK_HEIGHT,MAPS[level-1][y][x]));
			}
		}
	}
}

function makeBrickShards(x,y,color) {
	for(let i=0;i<10;i++){
		let angle = Math.floor(Math.random()*5)+2;
		let offsetX = Math.floor(Math.random()*BRICK_WIDTH)-(BRICK_WIDTH/2);
		let offsetY = Math.floor(Math.random()*BRICK_HEIGHT)-(BRICK_HEIGHT/2);
		let speed = Math.floor(Math.random()*5)+1;
		brickShards.push(new BrickShard(gameArea.context,x+offsetX,y+offsetY,20,20,color,Math.PI/angle,speed));
	}
}

function startGame() {
	level=1;
	score=0;
	lives=3;
	levelText.update("Level: "+level);
	livesText.update("Lives: "+lives);
	scoreText.update("Score: "+score);
	//timeLeftText.update("Time left: "+timeLeft);
	brickShards=[];
	infoBox.hideBox();
	previousMouseX=null;
	buildMap(level);
	player.reset();
	ball.reset();

	if (animationFrameID) cancelAnimationFrame(animationFrameID);
	animationFrameID=window.requestAnimationFrame(update);
}

initGame();

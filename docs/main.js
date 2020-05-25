    (self.Board = function(width,height){ //self es igual a windows.
        this.width= width;
        this.height=height;
        this.playing=false;
        this.score1=0;
        this.score2=0;
        this.game_over=false;
        this.bars = [];
        this.ball= null;    

    self.Board.prototype = {
        get elements(){
            var elements = this.bars.map(function(bar){return bar;});
            /*usamos map para iterar cada uno de los elements,
            modificarlos y a partir de eso,construir un nuevo arreglo.
            De esta forma se pasa como referencia el arreglo y el gestor 
            de memoria va eliminando la basura del método clear*/
            elements.push(this.ball);
            //console.log(elements);
            return elements;
        }    
    }
})(); //funcion  que se llamará a si misma para no contaminar el scope del script

(function(){
    self.Ball=function(x,y,radius,board){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.salto_x=3;
        this.salto_y=1;
        this.velocidad_maxima=30;
        this.board=board;
        this.bounce_angle=0;
        this.max_bounce_angle= Math.PI /12;
        board.ball=this;
        this.kind="circulo";
        this.saque; //barra[i] que realiza el saque
        this.detenida=false;
        this.sentido=1;
        this.direccion=1;  //cuando direction sea -1 se mueve al otro sentido
    
    }

    self.Ball.prototype={
        move:function(){
            var pelota=board.ball;
            
            if(pelota.detenida){               
               // this.salto_x*=Math.random()+1;
                //this.salto_y*=Math.random();
                this.y=pelota.saque.y+pelota.saque.height/2;
                document.getElementById("saque").style.backgroundColor="yellow";
            }    
            else{    
                this.x += this.salto_x*this.sentido;
                this.y += this.salto_y*this.direccion;
                document.getElementById("saque").style.backgroundColor="rgb(171, 130, 238)";
            }
        },
        get width(){
            return this.radius;
        },
        get height(){
            return this.radius;            
        },
        detener:function(){
            this.detenida=true;
            this.salto_x=Math.random()*10+1;
            this.salto_y=Math.random()*10+1;
        },
        sacar: function(){
            board.ball.detenida=false;
        },        
        collision:function(bar){
            //Reacciona a la colision con una barra que recibe como parámetro
            var relative_intersect_y = ( bar.y + (bar.height / 2) ) - (this.y+this.radius);
            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);
            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            if(this.salto_x<this.velocidad_maxima)
                this.salto_x += Math.cos(this.bounce_angle)+Math.random()*4;//console.log(this.salto);
            this.salto_y += Math.sin(this.bounce_angle)*Math.random();//console.log("salto y:",this.salto_y);
           
           if(this.x > (this.board.width/2))//si paso la mitad, al golpear cambia sentido
                this.sentido =-1;
            else this.sentido =1;

            if(this.y > (this.board.height/2))//misma logica pero con altura.
                this.direccion=-1;
            else this.direccion=1;                
        }
    }

})();

(function(){
    self.Bar = function(x,y,width,height,board){
        this.x=x;
        this.y=y;
        this.board=board;
        this.width=width;
        this.height=height;
        this.salto = this.board.ball.radius;
        this.y_minimo=-(this.height-this.salto);
        this.y_máximo=this.board.height-this.salto;
        this.board.bars.push(this);
        this.kind="rectangle";
        this.presionada=false;
    }
    self.Bar.prototype= {

        upLargo: function () {
            while(this.presionada){setTimeout(() => console.log("entre"),1000);
                if(this.y>this.y_minimo)this.y -= this.salto;            }
        },
        up: function () {
            this.presionada=true;  
            
            //this.upLargo();
            if(this.y>this.y_minimo)this.y -= this.salto;

        },
        soltarClick: function(){
            this.presionada=false;
        },
        downLargo: function(){
            while(this.presionada)
                if(this.y<this.y_máximo)this.y += this.salto;            
        },    
        down: function(){
           // this.presionada=true;
            //downLargo();
            if(this.y<this.y_máximo)this.y += this.salto;
        },    
        toString: function(){
            return "x: "+this.x +" y: "+ this.y;
        }
    }
})();


(function(){ //es otra función anónima
    self.BoardView = function(canvas,board){
        this.canvas = canvas;
        this.board= board;
        this.canvas.width = board.width;
        this.canvas.height=board.height;
        this.contexto=canvas.getContext("2d");
    }

    self.BoardView.prototype ={
        clear: function(){
            this.contexto.clearRect(0,0,this.board.width,this.board.height)
        },
        draw: function() {
            for (var index = this.board.elements.length-1; index >=0; index--) {
               // console.log("Index draw elements= ",index);
                var elemento_a_dibujar=this.board.elements[index];
               // console.log(elemento_a_dibujar);
                draw(this.contexto,elemento_a_dibujar);

            };
        },
        pausa: function(){
            if(board.playing){
                document.getElementById("vel").innerHTML=" JUEGO PAUSADO <br> [P]= Play/Pausa";
                document.getElementById("vel").style.backgroundColor="yellow";
                document.getElementById("saque").style.backgroundColor="rgb(171, 130, 238)";
            }
            else document.getElementById("vel").style.backgroundColor="rgb(171, 130, 238)";
            board.playing= !board.playing;//inicia y pausa
        },
        play: function(){
            if(this.board.playing){
                this.clear();//este método play tiene que encargarse de todo para que el juego funcione
                this.board.ball.move();  
                this.check_collisions();
                this.draw();
                if(this.board.ball.detenida)
                    document.getElementById("vel").innerHTML="Realice Saque<br>[Barra Espaciadora]";
                else  document.getElementById("vel").innerHTML="Velocidad <br>"+Math.round(this.board.ball.salto_x);    
            }    
        },
        check_collisions: function(){       
            //console.log("ball y=",this.board.ball.y," board Y= ",this.board.width);
            var pelota=this.board.ball;
            var barra1=this.board.bars[0];
            var barra2=this.board.bars[1];

            if(pelota.y+pelota.radius>=this.board.height)
                pelota.direccion=-1;

            else if(pelota.y-pelota.radius<=0)//si la pelota golpea arriba
                pelota.direccion=1; // se reacciona a la colisión con la barra de esta forma

            else if(pelota.x+pelota.radius>=this.board.width){//Gol Player 1
                this.board.score1++;
                document.getElementById('P1').innerHTML=this.board.score1;
                pelota.x=barra1.x+pelota.radius+barra1.width;
                pelota.saque=barra1;
                pelota.detener();
            }        
                
            else if(pelota.x-pelota.radius<=0){//Gol Player 2
                this.board.score2++;
                document.getElementById('P2').innerHTML=this.board.score2;
                pelota.x=barra2.x-pelota.radius;
                pelota.saque=barra2;
                pelota.detener();
            }    

            else {
                for (let index = this.board.bars.length-1; index >=0; index--) {
                    var bar = this.board.bars[index];

                    // console.log(index,bar);   
                    if(hit(bar,pelota)){ //si la barra golpea a la pelota                   
                        //console.log("hit barra");
                        pelota.collision(bar);// se reacciona a la colisión con la barra de esta forma                    
                    }    
                }               
            }
        }              
    }
    //Aquí afuera del prototype van las funciones Helper
    function draw(contexto,element) {
        //console.log(element);
       // if(element !== null && element.hasOwnProperty("kind")){
            switch(element.kind){
                case "rectangle":
                    contexto.fillStyle="black";
                    contexto.fillRect(element.x,element.y,element.width,element.height);                    
                    break;                
                case "circulo":
                    contexto.beginPath();
                    contexto.arc(element.x,element.y,element.radius,0,7);                    
                    contexto.fillStyle="yellow";
                    contexto.fill();
                    contexto.closePath();
                    break;                                                          
        }
        //}        
    }

    function hit(a,b){
        //revisa si colisiona a con b. Se requiere que a y b tengan atributos height y width
        var hit = false;

        //colisiones horizontales 
        if(b.x + b.width > a.x && b.x < a.x + a.width){
            //colisiones verticales            
            if(b.y + b.height >= a.y && b.y < a.y + a.height)
                hit=true;
        }
        //colisión de a con b
        if(b.x <= a.x && b.x + b.width >= a.x + a.width)
            if(b.y <= a.y && b.y + b.height  >= a.y + a.height)
                hit=true;
          
        //colisión de b con a
        if(a.x <= b.x && a.x + a.width >= b.x + b.width)
            if(a.y <= b.y && a.y + a.height  >= b.y + b.height)
                hit=true;

        return hit;        
    }

})();

var board = new Board(750,337);//No está visible fuera de la función
var ball = new Ball(350,50,10,board);
var bar= new Bar(10,20,20,80,board);
var bar2= new Bar(720,100,20,80,board);
var canvas=document.getElementById('canvas');
var boardView= new BoardView(canvas,board);


document.addEventListener("keydown",function(ev){
    //console.log(ev.keyCode); //para ver el codigo ascii de las teclas presionadas
    //ev.preventDefault();
    if(ev.keyCode == 87)
        bar.up();
    else if(ev.keyCode == 83)
        bar.down();
    else if(ev.keyCode == 38)
        bar2.up();
    else if(ev.keyCode == 40)
        bar2.down();
     
   else if(ev.keyCode ==32){// Barra espaciadora
        ev.preventDefault();
        ball.sacar();
    }   
   else if(ev.keyCode ==80){// letra P
        ev.preventDefault();
        boardView.pausa();
    }   
});

//window.addEventListener("load",main); -> se reemplaza por requestAnimationFrame
window.requestAnimationFrame(controller);
/*setTimeout(function(){ //cambia el sentido a los 2 segundos
    ball.sentido = -1;
},2000);*/
boardView.draw();// Para que inicie el juego con los elementos dibujados

function controller(){
    //boardView.clear();
    //boardView.draw();
    boardView.play();
    window.requestAnimationFrame(controller);
}

/* Otra versión
(function(){
	self.Board = function(width,height){
		this.width = width;
		this.height = height;
		this.playing = false;
		this.game_over = false;
		this.bars = [];
		this.ball = null;
		this.playing = false;
	}

	self.Board.prototype = {
		get elements(){
			var elements = this.bars.map(function(bar){ return bar; });
			elements.push(this.ball);
			return elements;
		}
	}
})();


//Bola
(function(){
	self.Ball = function(x,y,radius,board){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.speed_y = 0;
		this.speed_x = 3;
		this.board = board;
		this.direction = 1;
		this.bounce_angle = 0;
		this.max_bounce_angle = Math.PI / 12;
		this.speed = 3;
		this.rebote = 1;

		board.ball = this;
		this.kind = "circle";	
	}
	self.Ball.prototype = {
		move: function(){
			if (this.y >= 399 || this.y <= 1){
				this.rebote = this.direction;
			}
			
			this.x += (this.speed_x * this.direction);
			this.y += (this.speed_y * this.rebote);
		},
		get width(){
			return this.radius * 2;
		},
		get height(){
			return this.radius * 2;
		},
		collision: function(bar){

			//Reacciona a la colisión con una barra que recibe como parámetro
			var relative_intersect_y = ( bar.y + (bar.height / 2) ) - this.y;

			var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

			this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;
			
			this.speed_y = this.speed * -Math.sin(this.bounce_angle);
			this.speed_x = this.speed * Math.cos(this.bounce_angle);

			if(this.x > (this.board.width / 2)) this.direction = -1;
			else this.direction = 1;
		}
	}
})();

//Barras
(function(){
	self.Bar = function(x,y,width,height,board){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.board = board;
		this.board.bars.push(this);
		this.kind = "rectangle";
		this.speed = 5;
	}

	self.Bar.prototype = {
		down: function(){
			this.y += this.speed;
		},
		up: function(){
			this.y -= this.speed;
		},
		toString: function(){
			return "x: "+ this.x +" y: "+ this.y ;
		}
	}
})();

(function(){
	self.BoardView = function(canvas,board){

		this.canvas = canvas;
		this.canvas.width = board.width;
		this.canvas.height = board.height;
		this.board = board;
		this.ctx = canvas.getContext("2d");
		this.marcador_a = 0;
		this.marcador_b = 0;
	}

	self.BoardView.prototype = {
		clean: function(){
			this.ctx.clearRect(0,0,this.board.width,this.board.height);
		},
		draw: function(){

			for (var i = this.board.elements.length - 1; i >= 0; i--) {
				var el = this.board.elements[i];

				draw(this.ctx,el);
			};
		},
		check_collisions: function(){

			for (var i = this.board.bars.length - 1; i >= 0; i--) {
				var bar = this.board.bars[i];
				if(hit(bar, this.board.ball)){

					this.board.ball.collision(bar);
				}
			};
		},
		check_goal: function(){
			var goal = false;
			if (this.board.ball.x >= 800){
				this.marcador_a++;
				console.log("Goal A "+this.marcador_a);
				this.board.playing = false;
				goal = true;
			}else if(this.board.ball.x <= 0){
				this.marcador_b++;
				console.log("Goal B "+this.marcador_b);
				this.board.playing = false;
				goal = true;
			}
			return goal;
		},
		refresh_scoreboard: function(){
			var sbA = document.getElementById('teamA').innerHTML = this.marcador_a.toString();
			var sbB = document.getElementById('teamB').innerHTML = this.marcador_b.toString();
		},
		play: function(){
			if(this.board.playing){
				this.clean();
				this.draw();
				this.check_collisions();
				if (this.check_goal()=== true){
					this.refresh_scoreboard();
					this.board.ball.x = 400;
					this.board.ball.y = 200;
					this.clean();
					this.draw();
					this.board.playing = false;
				}
				this.board.ball.move();	
			}
			
		}
	}

	function hit(a,b){
		//Revisa si a colisiona con b
		var hit = false;
		//Colsiones horizontales
		if(b.x + b.width >= a.x && b.x < a.x + a.width)
		{
			//Colisiones verticales
			if(b.y + b.height >= a.y && b.y < a.y + a.height)
				hit = true;
		}
		//Colisión de a con b
		if(b.x <= a.x && b.x + b.width >= a.x + a.width)
		{
			if(b.y <= a.y && b.y + b.height >= a.y + a.height)
				hit = true;
		}
		//Colisión b con a
		if(a.x <= b.x && a.x + a.width >= b.x + b.width)
		{
			if(a.y <= b.y && a.y + a.height >= b.y + b.height)
				hit = true;
		}
		
		return hit;
	}

	function draw(ctx,element){
		
		switch(element.kind){
			case "rectangle":

				ctx.fillRect(element.x,element.y,element.width,element.height);
				break;
			case "circle": 
				ctx.beginPath();
				ctx.arc(element.x,element.y,element.radius,0,7);
				ctx.fill();
				ctx.closePath();
				break;
		}	
		
		
	}
})();

var board = new Board(800,400);
var bar = new Bar(20,150,40,100,board);
var bar_2 = new Bar(735,150,40,100,board);
var canvas = document.getElementById('canvas');
var board_view = new BoardView(canvas,board);
var ball = new Ball(400, 200, 10,board);


document.addEventListener("keydown",function(ev){
	
	if(ev.keyCode == 38){
		ev.preventDefault();
		bar.up();
	}
	else if(ev.keyCode == 40){
		ev.preventDefault();
		bar.down();
	}else if(ev.keyCode === 87){
		ev.preventDefault();
		//W
		bar_2.up();
	}else if(ev.keyCode === 83){
		ev.preventDefault();
		//S
		bar_2.down();
	}else if(ev.keyCode === 32){
		ev.preventDefault();
		board.playing = !board.playing;
	}
});

board_view.draw();

window.requestAnimationFrame(controller);

function controller(){
	board_view.play();
	requestAnimationFrame(controller);
}*/
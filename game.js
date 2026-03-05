const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let money = 100
let factories = []
let soldiers = []

let startTime = Date.now()
let peaceTime = 60000

let year = 0
let lastYearTick = Date.now()

/* ===== WORLD MAP ===== */

function makeCountry(name,owner,color,x,y){

let states=[]

for(let i=0;i<6;i++){

states.push({
name:name+" State "+(i+1),
owner:owner,
troops:20+Math.floor(Math.random()*20),

points:[
[x+Math.random()*80,y+Math.random()*60],
[x+120+Math.random()*80,y+Math.random()*60],
[x+120+Math.random()*80,y+120+Math.random()*60],
[x+Math.random()*80,y+120+Math.random()*60]
]
})

}

return {name,color,states}
}

let world=[

makeCountry("United Nations of Paragon","player","#cc0000",150,250),
makeCountry("USSR","enemy","#00aa44",600,220),
makeCountry("Evil Germany","enemy","#aaaa00",1000,260)

]

function centerOf(state){
let x=0,y=0
state.points.forEach(p=>{
x+=p[0]
y+=p[1]
})
return {x:x/state.points.length,y:y/state.points.length}
}

/* ===== UI ===== */

function updateUI(){

document.getElementById("money").textContent=Math.floor(money)
document.getElementById("factories").textContent=
factories.filter(f=>f.owner==="player").length
document.getElementById("soldiers").textContent=
soldiers.filter(s=>s.owner==="player").length

}

/* ===== BUILD ===== */

function buildFactory(){

if(money<100) return

let ownedStates=[]

world.forEach(c=>{
c.states.forEach(s=>{
if(s.owner==="player") ownedStates.push(s)
})
})

if(ownedStates.length===0) return

let state=ownedStates[Math.floor(Math.random()*ownedStates.length)]
let center=centerOf(state)

money-=100

factories.push({
x:center.x+Math.random()*40-20,
y:center.y+Math.random()*40-20,
owner:"player"
})

}

/* ===== SOLDIER ===== */

function trainSoldier(){

if(money<10) return

let nation=world[0]

let state=nation.states[0]
let center=centerOf(state)

money-=10

soldiers.push({
x:center.x,
y:center.y,
owner:"player",
target:null,
boat:false
})

}

/* ===== MAP DRAW ===== */

function drawWorld(){

world.forEach(country=>{

country.states.forEach(state=>{

ctx.beginPath()
ctx.moveTo(state.points[0][0],state.points[0][1])

for(let i=1;i<state.points.length;i++){
ctx.lineTo(state.points[i][0],state.points[i][1])
}

ctx.closePath()

ctx.fillStyle=country.color
ctx.fill()

ctx.strokeStyle="#111"
ctx.stroke()

let center=centerOf(state)

ctx.fillStyle="white"
ctx.font="13px Arial"
ctx.fillText(state.name,center.x-20,center.y)

ctx.fillStyle="yellow"
ctx.font="12px Arial"
ctx.fillText("👥"+state.troops,center.x-18,center.y-15)

})

})

}

/* ===== FACTORIES ===== */

function drawFactories(){

factories.forEach(f=>{

ctx.fillStyle="#777"
ctx.fillRect(f.x-10,f.y-10,20,20)

ctx.fillStyle="#333"
ctx.fillRect(f.x-3,f.y-18,6,8)

ctx.fillStyle="#aaa"
ctx.fillRect(f.x-8,f.y-5,16,5)

})

}

/* ===== SOLDIERS + BOATS ===== */

function drawSoldiers(){

soldiers.forEach(s=>{

if(s.boat){
ctx.fillStyle="#004488"
ctx.fillRect(s.x-6,s.y-3,12,6)
}else{

ctx.beginPath()
ctx.arc(s.x,s.y,5,0,Math.PI*2)
ctx.fillStyle="#00ff88"
ctx.fill()

ctx.fillStyle="#003322"
ctx.fillRect(s.x-4,s.y-2,8,3)

}

})

}

function moveSoldiers(){

soldiers.forEach((s,i)=>{

if(!s.target) return

let center=centerOf(s.target)

let dx=center.x-s.x
let dy=center.y-s.y
let dist=Math.hypot(dx,dy)

/* ocean travel effect */

if(dist>150){
s.boat=true
}else{
s.boat=false
}

if(dist>3){

s.x+=dx/dist*0.4
s.y+=dy/dist*0.4

}else{

let attack = soldiers.filter(x=>x.target===s.target).length

let result = attack - s.target.troops

if(result>0){
s.target.owner=s.owner
s.target.troops=result
}else{
s.target.troops=Math.abs(result)
}

soldiers.splice(i,1)

}

})

}

/* ===== ECONOMY ===== */

function economy(){

factories.forEach(f=>{
if(f.owner==="player") money+=0.005
})

}

/* ===== ENEMY AI ===== */

function enemyAI(){

if(Date.now()-startTime<peaceTime) return

world.forEach(country=>{

country.states.forEach(state=>{

if(state.owner==="enemy" && Math.random()<0.0015){

let center=centerOf(state)

soldiers.push({
x:center.x,
y:center.y,
owner:"enemy",
target:world[Math.floor(Math.random()*world.length)]
.states[Math.floor(Math.random()*6)]
})

}

})

})

}

/* ===== YEAR TIMER ===== */

function updateYear(){

if(Date.now()-lastYearTick>60000){
year++
lastYearTick=Date.now()
}

ctx.fillStyle="white"
ctx.font="20px Arial"
ctx.fillText("Year: "+year,canvas.width/2-40,30)

}

/* ===== GAME LOOP ===== */

function gameLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height)

economy()
enemyAI()
moveSoldiers()

drawWorld()
drawFactories()
drawSoldiers()
updateYear()

updateUI()

requestAnimationFrame(gameLoop)

}

gameLoop()

-----------------------
-- NO: A game of numbers
-- Created: 23.08.08 by Michael Enger
-- Version: 0.2
-- Website: http://www.facemeandscream.com
-- Licence: ZLIB
-----------------------
-- This is the main file where we enter the game.
-----------------------

require("lua/button.lua")
require("lua/states.lua")

function love.load()

	-- Resources
	color =	 {	background = {240,243,247},
				main = {63,193,245},
				text = {76,77,78},
				overlay = {255,255,255,235} }
	font = {	default = love.graphics.newFont(24),
				large = love.graphics.newFont(32),
				huge = love.graphics.newFont(72),
				small = love.graphics.newFont(22) }
	graphics = {logo = love.graphics.newImage("media/logo.png"),
				fmas = love.graphics.newImage("media/fmas.png"),
				set = love.graphics.newImage("media/set.png"),
				notset = love.graphics.newImage("media/notset.png") }
	music =	{	default = love.audio.newSource("media/sawng.ogg") }
	sound =	{	click = love.audio.newSource("media/click.ogg", "static"),
				shush = love.audio.newSource("media/shh.ogg", "static"),
				pling = love.audio.newSource("media/pling.ogg", "static") }
	
	-- Variables
	size = 6				-- size of the grid
	audio = true			-- whether audio should be on or off
	state = Menu.create()	-- current game state
	
	-- Setup
	love.graphics.setBackgroundColor(unpack(color["background"]))
	love.audio.play(music["default"], 0)

end

function love.draw()
	
	state:draw()
	
	love.graphics.draw(graphics["fmas"], 700, 590, 0, 1, 1, 100, 10)
	
end

function love.update(dt)

	state:update(dt)

end

function love.mousepressed(x, y, button)

	state:mousepressed(x,y,button)

end

function love.keypressed(key)
	
	if key == "f4" and (love.keyboard.isDown("ralt") or love.keyboard.isDown("lalt")) then
		love.event.push("q")
	end
	
	state:keypressed(key)

end
